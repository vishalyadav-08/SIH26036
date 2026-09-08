"""Notifications: who is told what, and that an inbox is private.

The event tests drive the real domain services end to end, so a change in
who gets told about a workflow step shows up here rather than in a screen.
"""

from datetime import timedelta

from django.core.cache import cache
from django.core.management import call_command
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from applications import services as app_svc
from authentication.models import User
from businesses.models import Business
from certificates import services as cert_svc
from inspections import services as insp_svc
from instruments.models import Instrument
from notifications.models import Notification
from notifications.services import expiry_warnings
from scheduling.services import book_visit, reschedule_visit

PASSWORD = "synthetic-password-123"


# Evidence is exercised in its own module; here the subject is who gets told.
@override_settings(INSPECTION_REQUIRE_EVIDENCE=False)
class NotificationTestCase(APITestCase):
    def setUp(self):
        cache.clear()

        self.business = Business.objects.create(
            legal_name="Alpha Retail Ltd", contact_name="Alpha Owner",
            email="alpha@example.test", address="Synthetic address A",
        )
        self.other_business = Business.objects.create(
            legal_name="Beta Traders Ltd", contact_name="Beta Owner",
            email="beta@example.test", address="Synthetic address B",
        )

        self.owner = self._user("owner@example.test", User.Role.BUSINESS, self.business)
        self.owner_two = self._user("owner2@example.test", User.Role.BUSINESS, self.business)
        self.other_owner = self._user("beta@example.test", User.Role.BUSINESS, self.other_business)
        self.admin = self._user("admin@example.test", User.Role.ADMIN)
        self.admin_two = self._user("admin2@example.test", User.Role.ADMIN)
        self.inactive_admin = self._user("gone@example.test", User.Role.ADMIN)
        self.inactive_admin.is_active = False
        self.inactive_admin.save(update_fields=["is_active"])
        self.officer = self._user("officer@example.test", User.Role.LMO)
        self.other_officer = self._user("gatc@example.test", User.Role.GATC)

        self.instrument = Instrument.objects.create(
            business=self.business, instrument_number="INS-A-001", serial_number="SN-A-001",
            instrument_type="ELECTRONIC_SCALE", manufacturer="M", model="X",
            capacity="10.000", capacity_unit="kg", location="Shop floor",
        )

    def _user(self, email, role, business=None):
        return User.objects.create_user(
            email=email, password=PASSWORD, display_name=email.split("@")[0],
            role=role, business=business,
        )

    def auth(self, user):
        response = self.client.post(
            reverse("auth-login"), {"email": user.email, "password": PASSWORD}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['accessToken']}")

    def inbox(self, user, **filters):
        return Notification.objects.filter(recipient=user, **filters)

    def submitted(self):
        return app_svc.create_application(
            user=self.owner, instrument_id=self.instrument.id, reason="Periodic", submit=True
        )

    def scheduled(self, officer=None, by=None):
        application = self.submitted()
        application = app_svc.assign_officer(
            user=self.admin, application=application, officer_id=(officer or self.officer).id
        )
        schedule = book_visit(
            user=by or self.admin, application=application,
            scheduled_at=timezone.now() + timedelta(days=2), note="Ask for the manager",
        )
        return application, schedule

    def completed(self, result="PASS"):
        application, _ = self.scheduled()
        inspection = insp_svc.start_inspection(user=self.officer, application=application)
        insp_svc.add_measurement(
            user=self.officer, inspection=inspection, label="Zero",
            nominal_value=0, observed_value=0, unit="kg",
        )
        return insp_svc.complete_inspection(user=self.officer, inspection=inspection, result=result)

    # -- events ----------------------------------------------------------

    def test_submission_tells_every_active_admin_and_nobody_else(self):
        application = self.submitted()

        for admin in (self.admin, self.admin_two):
            note = self.inbox(admin, type="APPLICATION_UPDATE").get()
            self.assertIn(application.application_number, note.message)
            self.assertIn("Alpha Retail Ltd", note.message)
            self.assertEqual(note.link, f"/admin/applications/{application.id}")
            self.assertEqual(note.related_entity_id, application.id)
            self.assertEqual(note.business, self.business)

        self.assertFalse(self.inbox(self.inactive_admin).exists())
        self.assertFalse(self.inbox(self.owner).exists())
        self.assertFalse(self.inbox(self.officer).exists())

    def test_assignment_tells_officer_and_owners_with_role_links(self):
        application = self.submitted()
        app_svc.assign_officer(user=self.admin, application=application, officer_id=self.officer.id)

        officer_note = self.inbox(self.officer).get()
        self.assertEqual(officer_note.title, "Case assigned to you")
        self.assertIn("Shop floor", officer_note.message)
        self.assertEqual(officer_note.link, f"/field/inspections/{application.id}")

        for owner in (self.owner, self.owner_two):
            owner_note = self.inbox(owner).get()
            self.assertIn(self.officer.display_name, owner_note.message)
            self.assertEqual(owner_note.link, f"/app/applications/{application.id}")

        self.assertFalse(self.inbox(self.other_owner).exists())
        self.assertFalse(self.inbox(self.other_officer).exists())

    def test_schedule_by_admin_tells_owner_and_officer(self):
        application, schedule = self.scheduled()

        owner_note = self.inbox(self.owner, type="SCHEDULE_UPDATE").get()
        self.assertIn("Ask for the manager", owner_note.message)
        self.assertIn(self.officer.display_name, owner_note.message)

        officer_note = self.inbox(self.officer, type="SCHEDULE_UPDATE").get()
        self.assertEqual(officer_note.title, "Visit booked on your calendar")

    def test_schedule_by_officer_does_not_notify_themselves(self):
        application = self.submitted()
        application = app_svc.assign_officer(
            user=self.admin, application=application, officer_id=self.officer.id
        )
        book_visit(
            user=self.officer, application=application,
            scheduled_at=timezone.now() + timedelta(days=2),
        )

        self.assertTrue(self.inbox(self.owner, type="SCHEDULE_UPDATE").exists())
        self.assertFalse(self.inbox(self.officer, type="SCHEDULE_UPDATE").exists())

    def test_reschedule_mentions_both_times(self):
        application, schedule = self.scheduled()
        Notification.objects.all().delete()

        moved = timezone.now() + timedelta(days=5)
        reschedule_visit(user=self.admin, schedule=schedule, scheduled_at=moved)

        note = self.inbox(self.owner).get()
        self.assertEqual(note.title, "Inspection visit moved")
        self.assertIn("moved from", note.message)
        self.assertIn(timezone.localtime(moved).strftime("%d %b %Y"), note.message)

    def test_rejection_and_cancellation_reach_the_right_people(self):
        application = self.submitted()
        app_svc.reject_application(user=self.admin, application=application, reason="Duplicate")

        note = self.inbox(self.owner).get()
        self.assertEqual(note.title, "Verification request rejected")
        self.assertIn("Duplicate", note.message)

        # A cancellation by the owner tells the admins and the officer, not
        # the owner who did it.
        application, _ = self.scheduled()
        Notification.objects.all().delete()
        app_svc.cancel_application(user=self.admin, application=application, reason="Shop closed")

        self.assertTrue(self.inbox(self.owner).exists())
        self.assertTrue(self.inbox(self.officer).exists())
        self.assertTrue(self.inbox(self.admin_two).exists())
        self.assertFalse(self.inbox(self.admin).exists())

    def test_inspection_lifecycle_tells_owner_and_admins(self):
        inspection = self.completed(result="FAIL")

        started = self.inbox(self.owner, title="Inspection in progress").get()
        self.assertIn(self.officer.display_name, started.message)

        result = self.inbox(self.owner, type="INSPECTION_RESULT").get()
        self.assertEqual(result.title, "Inspection result: Fail")
        self.assertIn("did not pass", result.message)

        admin_result = self.inbox(self.admin, type="INSPECTION_RESULT").get()
        self.assertIn("FAIL", admin_result.message)

        # The officer performed it; they are not told about their own act.
        self.assertFalse(self.inbox(self.officer, type="INSPECTION_RESULT").exists())

    def test_certificate_issue_and_revoke(self):
        inspection = self.completed()
        certificate = cert_svc.issue_certificate(user=self.officer, inspection=inspection)

        issued = self.inbox(self.owner, type="CERTIFICATE_ISSUED").get()
        self.assertIn(certificate.certificate_number, issued.message)
        self.assertEqual(issued.link, f"/app/certificates/{certificate.id}")
        self.assertEqual(issued.related_entity_type, "CERTIFICATE")

        cert_svc.revoke_certificate(user=self.admin, certificate=certificate, reason="Tampered seal")

        revoked = self.inbox(self.owner, type="CERTIFICATE_REVOKED").get()
        self.assertIn("Tampered seal", revoked.message)
        self.assertTrue(self.inbox(self.officer, type="CERTIFICATE_REVOKED").exists())

    def test_expiry_warnings_are_idempotent_and_scoped(self):
        inspection = self.completed()
        certificate = cert_svc.issue_certificate(user=self.officer, inspection=inspection)
        certificate.valid_until = timezone.now() + timedelta(days=10)
        certificate.save(update_fields=["valid_until"])

        self.assertEqual(len(expiry_warnings(within_days=30)), 2)   # both owners
        self.assertEqual(len(expiry_warnings(within_days=30)), 0)   # already warned
        self.assertEqual(len(expiry_warnings(within_days=5)), 0)    # outside horizon

        note = self.inbox(self.owner, type="EXPIRY_WARNING").get()
        self.assertIn("10 days", note.message)
        self.assertEqual(note.link, f"/app/instruments/{self.instrument.id}")
        self.assertFalse(self.inbox(self.other_owner, type="EXPIRY_WARNING").exists())

        call_command("send_expiry_warnings", "--days", "30")
        self.assertEqual(self.inbox(self.owner, type="EXPIRY_WARNING").count(), 1)

    # -- inbox API -------------------------------------------------------

    def test_inbox_is_private_and_newest_first(self):
        self.submitted()
        self.submitted()

        self.auth(self.admin)
        response = self.client.get(reverse("notification-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["totalItems"], 2)
        items = response.data["items"]
        self.assertGreaterEqual(items[0]["createdAt"], items[1]["createdAt"])
        self.assertTrue(all(i["userId"] == str(self.admin.id) for i in items))
        self.assertFalse(items[0]["read"])
        self.assertIsNone(items[0]["readAt"])

        self.auth(self.officer)
        self.assertEqual(self.client.get(reverse("notification-list")).data["totalItems"], 0)

    def test_filters_unread_only_and_type(self):
        inspection = self.completed()
        cert_svc.issue_certificate(user=self.officer, inspection=inspection)

        self.auth(self.owner)
        all_items = self.client.get(reverse("notification-list")).data["totalItems"]
        self.assertGreater(all_items, 1)

        only_certs = self.client.get(
            reverse("notification-list"), {"type": "CERTIFICATE_ISSUED"}
        ).data
        self.assertEqual(only_certs["totalItems"], 1)

        first = only_certs["items"][0]["id"]
        self.client.post(reverse("notification-read", args=[first]))

        unread = self.client.get(reverse("notification-list"), {"unreadOnly": "true"}).data
        self.assertEqual(unread["totalItems"], all_items - 1)

    def test_mark_read_is_idempotent_and_recipient_only(self):
        self.submitted()
        note = self.inbox(self.admin).get()

        self.auth(self.admin)
        first = self.client.post(reverse("notification-read", args=[note.id]))
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertTrue(first.data["read"])

        second = self.client.post(reverse("notification-read", args=[note.id]))
        self.assertEqual(second.data["readAt"], first.data["readAt"])

        self.auth(self.admin_two)
        response = self.client.post(reverse("notification-read", args=[note.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_client_read_at_cannot_be_in_the_future(self):
        self.submitted()
        note = self.inbox(self.admin).get()
        future = (timezone.now() + timedelta(days=3)).isoformat()

        self.auth(self.admin)
        response = self.client.post(
            reverse("notification-read", args=[note.id]), {"readAt": future}, format="json"
        )

        note.refresh_from_db()
        self.assertLessEqual(note.read_at, timezone.now())

    def test_read_all_and_unread_count(self):
        self.submitted()
        self.submitted()
        self.submitted()

        self.auth(self.admin)
        self.assertEqual(
            self.client.get(reverse("notification-unread-count")).data["unreadCount"], 3
        )

        response = self.client.post(reverse("notification-read-all"))
        self.assertEqual(response.data["markedRead"], 3)
        self.assertEqual(
            self.client.get(reverse("notification-unread-count")).data["unreadCount"], 0
        )

        # Another admin's inbox is untouched.
        self.assertEqual(self.inbox(self.admin_two, read_at__isnull=True).count(), 3)

    def test_unauthenticated_is_refused(self):
        self.assertEqual(
            self.client.get(reverse("notification-list")).status_code,
            status.HTTP_401_UNAUTHORIZED,
        )
