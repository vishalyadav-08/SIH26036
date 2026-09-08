"""Site-visit booking: history, double-booking policy, and calendar visibility.

Booking goes through POST /applications/{id}/schedule/ (it is a state
transition); the calendar and rescheduling live under /schedules/.
"""

from datetime import datetime, time, timedelta

from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from applications import services as app_svc
from applications.models import Application
from audit.models import AuditLog
from authentication.models import User
from businesses.models import Business
from instruments.models import Instrument
from scheduling.models import Schedule
from scheduling.services import VISIT_SLOT_MINUTES, book_visit

PASSWORD = "synthetic-password-123"


def in_days(days, hours=0):
    return timezone.now() + timedelta(days=days, hours=hours)


class SchedulingTestCase(APITestCase):
    def setUp(self):
        cache.clear()

        self.business_a = Business.objects.create(
            legal_name="Alpha Retail Ltd", contact_name="Alpha Owner",
            email="alpha@example.test", address="Synthetic address A",
        )
        self.business_b = Business.objects.create(
            legal_name="Beta Traders Ltd", contact_name="Beta Owner",
            email="beta@example.test", address="Synthetic address B",
        )

        self.owner_a = self._user("a@example.test", User.Role.BUSINESS, self.business_a)
        self.owner_b = self._user("b@example.test", User.Role.BUSINESS, self.business_b)
        self.admin = self._user("admin@example.test", User.Role.ADMIN)
        self.officer = self._user("officer@example.test", User.Role.LMO)
        self.other_officer = self._user("gatc@example.test", User.Role.GATC)

        self.instrument_a = self._instrument(self.business_a, "INS-A-001", "SN-A-001")
        self.instrument_a2 = self._instrument(self.business_a, "INS-A-002", "SN-A-002")
        self.instrument_b = self._instrument(self.business_b, "INS-B-001", "SN-B-001")

    # -- helpers ---------------------------------------------------------

    def _user(self, email, role, business=None):
        return User.objects.create_user(
            email=email, password=PASSWORD, display_name=email.split("@")[0],
            role=role, business=business,
        )

    def _instrument(self, business, number, serial):
        return Instrument.objects.create(
            business=business, instrument_number=number, serial_number=serial,
            instrument_type="ELECTRONIC_SCALE", manufacturer="M", model="X",
            capacity="10.000", capacity_unit="kg", location="Shop",
        )

    def auth(self, user):
        response = self.client.post(
            reverse("auth-login"), {"email": user.email, "password": PASSWORD}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['accessToken']}")

    def assigned_application(self, owner, instrument, officer=None):
        application = app_svc.create_application(
            user=owner, instrument_id=instrument.id, reason="Periodic", submit=True
        )
        return app_svc.assign_officer(
            user=self.admin, application=application,
            officer_id=(officer or self.officer).id,
        )

    def book(self, application, when, user=None, note="Gate 2"):
        """Book through the service and return the Schedule row."""
        return book_visit(
            user=user or self.admin, application=application, scheduled_at=when, note=note
        )

    def schedule_url(self, application):
        return reverse("application-schedule", args=[application.id])

    # -- booking ---------------------------------------------------------

    def test_booking_creates_confirmed_schedule_and_moves_state(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)
        when = in_days(2)

        self.auth(self.admin)
        response = self.client.post(
            self.schedule_url(application),
            {"scheduledAt": when.isoformat(), "scheduleNote": "Ask for the manager"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data["state"], "SCHEDULED")
        self.assertEqual(response.data["schedule"]["scheduleNote"], "Ask for the manager")
        self.assertEqual(response.data["schedule"]["officerUserId"], str(self.officer.id))

        schedule = Schedule.objects.get(application=application)
        self.assertEqual(schedule.status, Schedule.Status.CONFIRMED)
        self.assertEqual(schedule.officer, self.officer)
        self.assertEqual(schedule.scheduled_by, self.admin)

        application.refresh_from_db()
        self.assertEqual(application.scheduled_at, schedule.scheduled_at)

        event = AuditLog.objects.get(action="APPLICATION_SCHEDULED")
        self.assertEqual(event.metadata["scheduleId"], str(schedule.id))

    def test_assigned_officer_can_book_their_own_visit(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)

        self.auth(self.officer)
        response = self.client.post(
            self.schedule_url(application), {"scheduledAt": in_days(1).isoformat()}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(Schedule.objects.get().scheduled_by, self.officer)

    def test_other_officer_cannot_book_someone_elses_work(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)

        self.auth(self.other_officer)
        response = self.client.post(
            self.schedule_url(application), {"scheduledAt": in_days(1).isoformat()}, format="json"
        )

        # Not visible to them at all: 404 rather than 403, so an officer
        # cannot enumerate applications they were not assigned.
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(Schedule.objects.exists())

    def test_business_cannot_book(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)

        self.auth(self.owner_a)
        response = self.client.post(
            self.schedule_url(application), {"scheduledAt": in_days(1).isoformat()}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_past_slot_is_refused(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)

        self.auth(self.admin)
        response = self.client.post(
            self.schedule_url(application), {"scheduledAt": in_days(-1).isoformat()}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        application.refresh_from_db()
        self.assertEqual(application.state, Application.State.ASSIGNED)

    def test_officer_cannot_be_double_booked(self):
        first = self.assigned_application(self.owner_a, self.instrument_a)
        second = self.assigned_application(self.owner_a, self.instrument_a2)
        when = in_days(3)

        self.book(first, when)

        self.auth(self.admin)
        response = self.client.post(
            self.schedule_url(second),
            {"scheduledAt": (when + timedelta(minutes=VISIT_SLOT_MINUTES - 1)).isoformat()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn(first.application_number, response.data["message"])
        second.refresh_from_db()
        self.assertEqual(second.state, Application.State.ASSIGNED)

    def test_adjacent_slot_is_allowed(self):
        first = self.assigned_application(self.owner_a, self.instrument_a)
        second = self.assigned_application(self.owner_a, self.instrument_a2)
        when = in_days(3)

        self.book(first, when)
        self.book(second, when + timedelta(minutes=VISIT_SLOT_MINUTES))

        self.assertEqual(Schedule.objects.filter(status="CONFIRMED").count(), 2)

    def test_different_officers_can_share_a_slot(self):
        first = self.assigned_application(self.owner_a, self.instrument_a)
        second = self.assigned_application(self.owner_b, self.instrument_b, self.other_officer)
        when = in_days(3)

        self.book(first, when)
        self.book(second, when)

        self.assertEqual(Schedule.objects.filter(status="CONFIRMED").count(), 2)

    # -- rescheduling ----------------------------------------------------

    def test_reschedule_supersedes_and_keeps_history(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)
        original = self.book(application, in_days(2))
        moved_to = in_days(4)

        self.auth(self.admin)
        response = self.client.post(
            reverse("schedule-reschedule", args=[original.id]),
            {"scheduledAt": moved_to.isoformat(), "scheduleNote": "Owner asked to move"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data["status"], "CONFIRMED")
        self.assertEqual(response.data["scheduleNote"], "Owner asked to move")
        self.assertNotEqual(response.data["id"], str(original.id))

        original.refresh_from_db()
        self.assertEqual(original.status, Schedule.Status.RESCHEDULED)
        self.assertIsNotNone(original.ended_at)

        application.refresh_from_db()
        self.assertEqual(application.state, Application.State.SCHEDULED)
        self.assertEqual(application.scheduled_at, moved_to)

        self.assertEqual(application.schedules.count(), 2)
        self.assertTrue(AuditLog.objects.filter(action="APPLICATION_RESCHEDULED").exists())

    def test_reschedule_by_assigned_officer(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)
        original = self.book(application, in_days(2))

        self.auth(self.officer)
        response = self.client.post(
            reverse("schedule-reschedule", args=[original.id]),
            {"scheduledAt": in_days(5).isoformat()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

    def test_reschedule_by_unrelated_officer_is_not_found(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)
        original = self.book(application, in_days(2))

        self.auth(self.other_officer)
        response = self.client.post(
            reverse("schedule-reschedule", args=[original.id]),
            {"scheduledAt": in_days(5).isoformat()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_business_cannot_reschedule(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)
        original = self.book(application, in_days(2))

        self.auth(self.owner_a)
        response = self.client.post(
            reverse("schedule-reschedule", args=[original.id]),
            {"scheduledAt": in_days(5).isoformat()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_superseded_schedule_cannot_be_rescheduled_again(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)
        original = self.book(application, in_days(2))

        self.auth(self.admin)
        self.client.post(
            reverse("schedule-reschedule", args=[original.id]),
            {"scheduledAt": in_days(4).isoformat()}, format="json",
        )
        response = self.client.post(
            reverse("schedule-reschedule", args=[original.id]),
            {"scheduledAt": in_days(6).isoformat()}, format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_reschedule_respects_double_booking(self):
        first = self.assigned_application(self.owner_a, self.instrument_a)
        second = self.assigned_application(self.owner_a, self.instrument_a2)
        when = in_days(3)

        self.book(first, when)
        booked = self.book(second, when + timedelta(hours=3))

        self.auth(self.admin)
        response = self.client.post(
            reverse("schedule-reschedule", args=[booked.id]),
            {"scheduledAt": (when + timedelta(minutes=10)).isoformat()}, format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        booked.refresh_from_db()
        self.assertEqual(booked.status, Schedule.Status.CONFIRMED)

    # -- cancellation ----------------------------------------------------

    def test_cancelling_scheduled_application_frees_the_slot(self):
        first = self.assigned_application(self.owner_a, self.instrument_a)
        second = self.assigned_application(self.owner_a, self.instrument_a2)
        when = in_days(3)

        schedule = self.book(first, when)
        app_svc.cancel_application(user=self.admin, application=first, reason="Shop closed")

        schedule.refresh_from_db()
        self.assertEqual(schedule.status, Schedule.Status.CANCELLED)
        self.assertEqual(schedule.end_reason, "Shop closed")

        # The officer's slot is free again.
        self.book(second, when)

    # -- calendar --------------------------------------------------------

    def test_admin_sees_every_confirmed_visit(self):
        first = self.assigned_application(self.owner_a, self.instrument_a)
        second = self.assigned_application(self.owner_b, self.instrument_b, self.other_officer)
        self.book(first, in_days(1))
        self.book(second, in_days(2))

        self.auth(self.admin)
        response = self.client.get(reverse("schedule-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["totalItems"], 2)
        # Ordered by visit time.
        self.assertEqual(response.data["items"][0]["applicationNumber"], first.application_number)

    def test_officer_sees_only_their_own_visits(self):
        first = self.assigned_application(self.owner_a, self.instrument_a)
        second = self.assigned_application(self.owner_b, self.instrument_b, self.other_officer)
        self.book(first, in_days(1))
        self.book(second, in_days(2))

        self.auth(self.officer)
        response = self.client.get(reverse("schedule-list"))

        self.assertEqual(response.data["totalItems"], 1)
        self.assertEqual(response.data["items"][0]["officerUserId"], str(self.officer.id))

    def test_business_sees_only_visits_to_their_premises(self):
        first = self.assigned_application(self.owner_a, self.instrument_a)
        second = self.assigned_application(self.owner_b, self.instrument_b, self.other_officer)
        self.book(first, in_days(1))
        booked_b = self.book(second, in_days(2))

        self.auth(self.owner_a)
        response = self.client.get(reverse("schedule-list"))

        self.assertEqual(response.data["totalItems"], 1)
        self.assertEqual(response.data["items"][0]["businessName"], "Alpha Retail Ltd")

        response = self.client.get(reverse("schedule-detail", args=[booked_b.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_calendar_filters_by_date_range_and_officer(self):
        first = self.assigned_application(self.owner_a, self.instrument_a)
        second = self.assigned_application(self.owner_a, self.instrument_a2)
        third = self.assigned_application(self.owner_b, self.instrument_b, self.other_officer)

        # Pin both visits to fixed hours of the same local day so the test does
        # not depend on what time of day it runs.
        day = timezone.localdate() + timedelta(days=1)
        at = lambda hour: timezone.make_aware(datetime.combine(day, time(hour, 0)))

        self.book(first, at(10))
        self.book(second, in_days(10))
        self.book(third, at(14))

        self.auth(self.admin)

        response = self.client.get(
            reverse("schedule-list"), {"from": day.isoformat(), "to": day.isoformat()}
        )
        numbers = {item["applicationNumber"] for item in response.data["items"]}
        self.assertEqual(numbers, {first.application_number, third.application_number})

        response = self.client.get(
            reverse("schedule-list"), {"officerUserId": str(self.other_officer.id)}
        )
        self.assertEqual(response.data["totalItems"], 1)

        response = self.client.get(reverse("schedule-list"), {"from": "not-a-date"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_history_is_hidden_by_default_and_available_on_request(self):
        application = self.assigned_application(self.owner_a, self.instrument_a)
        original = self.book(application, in_days(2))

        self.auth(self.admin)
        self.client.post(
            reverse("schedule-reschedule", args=[original.id]),
            {"scheduledAt": in_days(4).isoformat()}, format="json",
        )

        self.assertEqual(self.client.get(reverse("schedule-list")).data["totalItems"], 1)
        self.assertEqual(
            self.client.get(reverse("schedule-list"), {"status": "ALL"}).data["totalItems"], 2
        )
        self.assertEqual(
            self.client.get(reverse("schedule-list"), {"status": "RESCHEDULED"}).data["totalItems"], 1
        )

    def test_unauthenticated_calendar_is_refused(self):
        response = self.client.get(reverse("schedule-list"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
