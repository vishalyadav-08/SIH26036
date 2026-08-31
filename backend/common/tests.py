"""Role permission matrix.

Asserts both halves of every cell: what a role may do, and what it must be
refused. TESTING_SECURITY.md critical tests 1-4 live here.
"""

from datetime import timedelta

from django.core.cache import cache
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from applications import services as app_svc
from authentication.models import User
from businesses.models import Business
from certificates.models import Certificate
from inspections import services as insp_svc
from instruments.models import Instrument

PASSWORD = "synthetic-password-123"


class MatrixTestCase(APITestCase):
    def setUp(self):
        cache.clear()

        self.biz = Business.objects.create(
            legal_name="Alpha Ltd", contact_name="A", email="a@x.test", address="addr"
        )
        self.owner = self._user("owner@x.test", User.Role.BUSINESS, self.biz)
        self.officer = self._user("officer@x.test", User.Role.OFFICER)
        self.other_officer = self._user("officer2@x.test", User.Role.OFFICER)
        self.admin = self._user("admin@x.test", User.Role.ADMIN)

        self.instrument = Instrument.objects.create(
            business=self.biz, instrument_number="INS-1", serial_number="SN-1",
            instrument_type="ELECTRONIC_SCALE", manufacturer="M", model="X",
            capacity="10.000", capacity_unit="kg", location="Shop",
        )

    def _user(self, email, role, business=None):
        return User.objects.create_user(
            email=email, password=PASSWORD, display_name="D", role=role, business=business
        )

    def auth(self, user):
        r = self.client.post(reverse("auth-login"), {"email": user.email, "password": PASSWORD})
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['accessToken']}")

    def make_completed_inspection(self):
        a = app_svc.create_application(
            user=self.owner, instrument_id=self.instrument.id, reason="r", submit=True
        )
        a = app_svc.assign_officer(user=self.admin, application=a, officer_id=self.officer.id)
        a = app_svc.schedule_application(
            user=self.admin, application=a, scheduled_at=timezone.now() + timedelta(days=1)
        )
        i = insp_svc.start_inspection(user=self.officer, application=a)
        insp_svc.add_measurement(
            user=self.officer, inspection=i, label="L", nominal_value=10,
            observed_value="10.010", unit="kg",
        )

        return insp_svc.complete_inspection(user=self.officer, inspection=i, result="PASS")


class ShopOwnerTests(MatrixTestCase):
    """Manage own instruments · create verification requests · view own certificates."""

    def test_can_manage_own_instruments(self):
        self.auth(self.owner)

        created = self.client.post(reverse("instrument-list-create"), {
            "instrumentNumber": "INS-2", "serialNumber": "SN-2",
            "instrumentType": "COUNTER_SCALE", "manufacturer": "M", "model": "Y",
            "capacity": "5.000", "capacityUnit": "kg", "location": "Counter",
        })
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)

        patched = self.client.patch(
            reverse("instrument-detail", args=[created.data["id"]]), {"location": "Moved"}
        )
        self.assertEqual(patched.status_code, status.HTTP_200_OK)

    def test_can_create_a_verification_request(self):
        self.auth(self.owner)

        response = self.client.post(reverse("application-list-create"), {
            "instrumentId": str(self.instrument.id), "reason": "Periodic", "submit": True,
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["state"], "SUBMITTED")

    def test_can_view_own_certificates(self):
        inspection = self.make_completed_inspection()
        from certificates.services import issue_certificate

        issue_certificate(user=self.officer, inspection=inspection)

        self.auth(self.owner)
        response = self.client.get(reverse("certificate-list-create"))

        self.assertEqual(response.data["totalItems"], 1)

    def test_cannot_issue_its_own_certificate(self):
        """The escalation this matrix exposed: visibility is not authority."""
        inspection = self.make_completed_inspection()

        self.auth(self.owner)
        response = self.client.post(
            reverse("certificate-list-create"), {"inspectionId": str(inspection.id)}
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Certificate.objects.count(), 0)

    def test_cannot_assign_an_officer(self):
        a = app_svc.create_application(
            user=self.owner, instrument_id=self.instrument.id, reason="r", submit=True
        )

        self.auth(self.owner)
        response = self.client.post(
            reverse("application-assign", args=[a.id]),
            {"officerUserId": str(self.officer.id)},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_perform_an_inspection(self):
        self.auth(self.owner)

        response = self.client.post(
            reverse("inspection-list-create"), {"applicationId": str(self.instrument.id)}
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_manage_users_or_see_analytics(self):
        self.auth(self.owner)

        for name in ["user-list", "audit-list", "admin-dashboard"]:
            with self.subTest(route=name):
                self.assertEqual(
                    self.client.get(reverse(name)).status_code, status.HTTP_403_FORBIDDEN
                )


class OfficerTests(MatrixTestCase):
    """View assigned requests · schedule · perform inspections · generate certificates."""

    def _assigned_application(self):
        a = app_svc.create_application(
            user=self.owner, instrument_id=self.instrument.id, reason="r", submit=True
        )

        return app_svc.assign_officer(user=self.admin, application=a, officer_id=self.officer.id)

    def test_sees_only_assigned_requests(self):
        self._assigned_application()

        self.auth(self.officer)
        mine = self.client.get(reverse("application-list-create"))
        self.assertEqual(mine.data["totalItems"], 1)

        self.auth(self.other_officer)
        theirs = self.client.get(reverse("application-list-create"))
        self.assertEqual(theirs.data["totalItems"], 0)

    def test_can_schedule_own_assigned_inspection(self):
        a = self._assigned_application()

        self.auth(self.officer)
        response = self.client.post(
            reverse("application-schedule", args=[a.id]),
            {"scheduledAt": (timezone.now() + timedelta(days=2)).isoformat()},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["state"], "SCHEDULED")

    def test_cannot_schedule_an_unassigned_application(self):
        a = self._assigned_application()

        self.auth(self.other_officer)
        response = self.client.post(
            reverse("application-schedule", args=[a.id]),
            {"scheduledAt": (timezone.now() + timedelta(days=2)).isoformat()},
        )

        # Outside their scope entirely, so it is not found rather than refused.
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_can_perform_inspection_and_generate_certificate(self):
        inspection = self.make_completed_inspection()

        self.auth(self.officer)
        response = self.client.post(
            reverse("certificate-list-create"), {"inspectionId": str(inspection.id)}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["certificateNumber"])

    def test_cannot_generate_a_certificate_for_someone_elses_inspection(self):
        inspection = self.make_completed_inspection()

        self.auth(self.other_officer)
        response = self.client.post(
            reverse("certificate-list-create"), {"inspectionId": str(inspection.id)}
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND],
        )
        self.assertEqual(Certificate.objects.count(), 0)

    def test_cannot_register_instruments_or_manage_users(self):
        self.auth(self.officer)

        registration = self.client.post(reverse("instrument-list-create"), {
            "instrumentNumber": "INS-9", "serialNumber": "SN-9",
            "instrumentType": "COUNTER_SCALE", "manufacturer": "M", "model": "Y",
            "capacity": "5.000", "capacityUnit": "kg", "location": "X",
        })
        self.assertEqual(registration.status_code, status.HTTP_403_FORBIDDEN)

        self.assertEqual(
            self.client.get(reverse("user-list")).status_code, status.HTTP_403_FORBIDDEN
        )


class AdminTests(MatrixTestCase):
    """Manage users and officers · view all instruments and inspections · analytics."""

    def test_can_create_an_officer_account(self):
        self.auth(self.admin)

        response = self.client.post(reverse("user-list"), {
            "email": "new.officer@x.test", "displayName": "New Officer",
            "role": "OFFICER", "password": "synthetic-password-123",
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["role"], "OFFICER")
        self.assertNotIn("password", str(response.data).lower())

    def test_business_account_requires_a_business(self):
        self.auth(self.admin)

        response = self.client.post(reverse("user-list"), {
            "email": "b2@x.test", "displayName": "B", "role": "BUSINESS",
            "password": "synthetic-password-123",
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_can_deactivate_an_officer(self):
        self.auth(self.admin)

        response = self.client.delete(reverse("user-detail", args=[self.officer.id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["active"])

        self.officer.refresh_from_db()
        self.assertFalse(self.officer.is_active)

    def test_cannot_lock_itself_out(self):
        self.auth(self.admin)

        self.assertEqual(
            self.client.delete(reverse("user-detail", args=[self.admin.id])).status_code,
            status.HTTP_409_CONFLICT,
        )
        self.assertEqual(
            self.client.patch(
                reverse("user-detail", args=[self.admin.id]), {"role": "BUSINESS"}
            ).status_code,
            status.HTTP_409_CONFLICT,
        )

    def test_sees_every_business_instrument(self):
        other = Business.objects.create(
            legal_name="Beta Ltd", contact_name="B", email="b@x.test", address="addr"
        )
        Instrument.objects.create(
            business=other, instrument_number="INS-B", serial_number="SN-B",
            instrument_type="WEIGHBRIDGE", manufacturer="M", model="Z",
            capacity="100.000", capacity_unit="kg", location="Gate",
        )

        self.auth(self.admin)
        response = self.client.get(reverse("instrument-list-create"))

        self.assertEqual(response.data["totalItems"], 2)

    def test_sees_inspections_and_analytics(self):
        self.make_completed_inspection()

        self.auth(self.admin)

        self.assertEqual(
            self.client.get(reverse("inspection-list-create")).data["totalItems"], 1
        )

        dashboard = self.client.get(reverse("admin-dashboard"))
        self.assertEqual(dashboard.status_code, status.HTTP_200_OK)
        self.assertEqual(dashboard.data["inspectionCountsByResult"]["PASS"], 1)
        self.assertEqual(len(dashboard.data["officerWorkload"]), 2)
