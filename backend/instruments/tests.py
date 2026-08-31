"""Instrument CRUD, ownership isolation, and duplicate identity (REG-002).

Critical acceptance test 2 in TESTING_SECURITY.md: a BUSINESS user cannot read
or mutate another business's records. That is the bulk of what is asserted here.
"""

from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from authentication.models import User
from businesses.models import Business
from instruments.models import Instrument

PASSWORD = "synthetic-password-123"

VALID_PAYLOAD = {
    "instrumentNumber": "INS-DEMO-001",
    "serialNumber": "SN-DEMO-001",
    "instrumentType": "ELECTRONIC_SCALE",
    "manufacturer": "Synthetic Manufacturer",
    "model": "Demo-100",
    "capacity": "100.000",
    "capacityUnit": "kg",
    "location": "Synthetic Store",
}


class InstrumentTestCase(APITestCase):
    def setUp(self):
        cache.clear()

        self.business_a = Business.objects.create(
            legal_name="Alpha Retail Ltd",
            contact_name="Alpha Owner",
            email="alpha@example.test",
            address="Synthetic address A",
        )
        self.business_b = Business.objects.create(
            legal_name="Beta Traders Ltd",
            contact_name="Beta Owner",
            email="beta@example.test",
            address="Synthetic address B",
        )

        self.owner_a = self._user("a@example.test", User.Role.BUSINESS, self.business_a)
        self.owner_b = self._user("b@example.test", User.Role.BUSINESS, self.business_b)
        self.admin = self._user("admin@example.test", User.Role.ADMIN)
        self.officer = self._user("officer@example.test", User.Role.OFFICER)

    def _user(self, email, role, business=None):
        return User.objects.create_user(
            email=email,
            password=PASSWORD,
            display_name="Demo",
            role=role,
            business=business,
        )

    def auth(self, email):
        response = self.client.post(
            reverse("auth-login"), {"email": email, "password": PASSWORD}
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['accessToken']}"
        )

    def make_instrument(self, business, number="INS-A-001", serial="SN-A-001"):
        return Instrument.objects.create(
            business=business,
            instrument_number=number,
            serial_number=serial,
            instrument_type="ELECTRONIC_SCALE",
            manufacturer="M",
            model="X",
            capacity="10.000",
            capacity_unit="kg",
            location="Shop",
        )


class CreateTests(InstrumentTestCase):
    def test_business_registers_an_instrument(self):
        self.auth("a@example.test")

        response = self.client.post(reverse("instrument-list-create"), VALID_PAYLOAD)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["instrumentNumber"], "INS-DEMO-001")
        self.assertEqual(response.data["status"], "REGISTERED")
        self.assertEqual(response.data["businessId"], str(self.business_a.id))

    def test_business_cannot_register_for_another_business(self):
        self.auth("a@example.test")

        payload = {**VALID_PAYLOAD, "businessId": str(self.business_b.id)}
        response = self.client.post(reverse("instrument-list-create"), payload)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Instrument.objects.filter(business=self.business_b).count(), 0)

    def test_duplicate_instrument_number_in_same_business_is_conflict(self):
        self.auth("a@example.test")
        self.client.post(reverse("instrument-list-create"), VALID_PAYLOAD)

        response = self.client.post(reverse("instrument-list-create"), VALID_PAYLOAD)

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data["code"], "CONFLICT")

    def test_same_number_in_a_different_business_is_allowed(self):
        self.auth("a@example.test")
        self.client.post(reverse("instrument-list-create"), VALID_PAYLOAD)

        self.auth("b@example.test")
        response = self.client.post(reverse("instrument-list-create"), VALID_PAYLOAD)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_zero_or_negative_capacity_is_rejected(self):
        self.auth("a@example.test")

        for bad in ["0.000", "-5.000"]:
            with self.subTest(capacity=bad):
                response = self.client.post(
                    reverse("instrument-list-create"), {**VALID_PAYLOAD, "capacity": bad}
                )
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unknown_instrument_type_is_rejected(self):
        self.auth("a@example.test")

        response = self.client.post(
            reverse("instrument-list-create"),
            {**VALID_PAYLOAD, "instrumentType": "TELEPORTER"},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_new_instrument_is_not_marked_verified(self):
        """A freshly registered instrument has been verified by nobody.

        Defaulting it to ACTIVE would have the software assert a verification
        that never happened."""
        self.auth("a@example.test")

        response = self.client.post(reverse("instrument-list-create"), VALID_PAYLOAD)

        self.assertEqual(response.data["status"], "REGISTERED")
        self.assertNotEqual(response.data["status"], "ACTIVE")
        self.assertIsNone(response.data["activeCertificateNo"])

    def test_client_cannot_choose_its_own_status(self):
        self.auth("a@example.test")

        response = self.client.post(
            reverse("instrument-list-create"), {**VALID_PAYLOAD, "status": "VERIFIED"}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "REGISTERED")

    def test_admin_must_name_a_business(self):
        self.auth("admin@example.test")

        response = self.client.post(reverse("instrument-list-create"), VALID_PAYLOAD)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_register_for_a_named_business(self):
        self.auth("admin@example.test")

        response = self.client.post(
            reverse("instrument-list-create"),
            {**VALID_PAYLOAD, "businessId": str(self.business_a.id)},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["businessId"], str(self.business_a.id))

    def test_unauthenticated_registration_is_rejected(self):
        response = self.client.post(reverse("instrument-list-create"), VALID_PAYLOAD)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ListTests(InstrumentTestCase):
    def test_list_uses_the_contract_envelope(self):
        self.make_instrument(self.business_a)
        self.auth("a@example.test")

        response = self.client.get(reverse("instrument-list-create"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for key in ["items", "page", "pageSize", "totalItems", "totalPages"]:
            self.assertIn(key, response.data)
        self.assertEqual(response.data["page"], 0)
        self.assertEqual(response.data["totalItems"], 1)

    def test_business_sees_only_its_own_instruments(self):
        self.make_instrument(self.business_a, "INS-A-001", "SN-A-001")
        self.make_instrument(self.business_b, "INS-B-001", "SN-B-001")

        self.auth("a@example.test")
        response = self.client.get(reverse("instrument-list-create"))

        numbers = [i["instrumentNumber"] for i in response.data["items"]]
        self.assertEqual(numbers, ["INS-A-001"])

    def test_admin_sees_every_business(self):
        self.make_instrument(self.business_a, "INS-A-001", "SN-A-001")
        self.make_instrument(self.business_b, "INS-B-001", "SN-B-001")

        self.auth("admin@example.test")
        response = self.client.get(reverse("instrument-list-create"))

        self.assertEqual(response.data["totalItems"], 2)

    def test_officer_sees_none_without_an_assignment(self):
        self.make_instrument(self.business_a)

        self.auth("officer@example.test")
        response = self.client.get(reverse("instrument-list-create"))

        self.assertEqual(response.data["totalItems"], 0)

    def test_search_filters_results(self):
        self.make_instrument(self.business_a, "INS-A-001", "SN-A-001")
        self.make_instrument(self.business_a, "INS-A-002", "SN-A-002")

        self.auth("a@example.test")
        response = self.client.get(reverse("instrument-list-create"), {"search": "A-002"})

        self.assertEqual(response.data["totalItems"], 1)

    def test_business_id_filter_is_ignored_for_a_business_user(self):
        self.make_instrument(self.business_a, "INS-A-001", "SN-A-001")
        self.make_instrument(self.business_b, "INS-B-001", "SN-B-001")

        self.auth("a@example.test")
        response = self.client.get(
            reverse("instrument-list-create"), {"businessId": str(self.business_b.id)}
        )

        # Scope is already their own; the parameter must not widen it.
        self.assertEqual(response.data["totalItems"], 1)
        self.assertEqual(response.data["items"][0]["instrumentNumber"], "INS-A-001")


class DetailTests(InstrumentTestCase):
    def test_owner_reads_its_instrument(self):
        instrument = self.make_instrument(self.business_a)
        self.auth("a@example.test")

        response = self.client.get(
            reverse("instrument-detail", args=[instrument.id])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(instrument.id))

    def test_other_business_gets_404_not_403(self):
        instrument = self.make_instrument(self.business_a)
        self.auth("b@example.test")

        response = self.client.get(reverse("instrument-detail", args=[instrument.id]))

        # 403 would confirm the id exists. 404 reveals nothing.
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class UpdateTests(InstrumentTestCase):
    def test_owner_updates_its_instrument(self):
        instrument = self.make_instrument(self.business_a)
        self.auth("a@example.test")

        response = self.client.patch(
            reverse("instrument-detail", args=[instrument.id]),
            {"location": "Relocated Warehouse"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["location"], "Relocated Warehouse")

    def test_other_business_cannot_update(self):
        instrument = self.make_instrument(self.business_a)
        self.auth("b@example.test")

        response = self.client.patch(
            reverse("instrument-detail", args=[instrument.id]), {"location": "Hijacked"}
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        instrument.refresh_from_db()
        self.assertEqual(instrument.location, "Shop")

    def test_update_to_a_duplicate_number_is_conflict(self):
        self.make_instrument(self.business_a, "INS-A-001", "SN-A-001")
        second = self.make_instrument(self.business_a, "INS-A-002", "SN-A-002")

        self.auth("a@example.test")
        response = self.client.patch(
            reverse("instrument-detail", args=[second.id]),
            {"instrumentNumber": "INS-A-001"},
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_business_cannot_be_reassigned_through_update(self):
        instrument = self.make_instrument(self.business_a)
        self.auth("a@example.test")

        self.client.patch(
            reverse("instrument-detail", args=[instrument.id]),
            {"businessId": str(self.business_b.id)},
        )

        instrument.refresh_from_db()
        self.assertEqual(instrument.business_id, self.business_a.id)


class DeactivateTests(InstrumentTestCase):
    def test_delete_retires_rather_than_removes(self):
        instrument = self.make_instrument(self.business_a)
        self.auth("a@example.test")

        response = self.client.delete(
            reverse("instrument-detail", args=[instrument.id])
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "INACTIVE")

        # The row survives: it may already be referenced by an audit trail.
        instrument.refresh_from_db()
        self.assertEqual(instrument.status, "INACTIVE")

    def test_other_business_cannot_deactivate(self):
        instrument = self.make_instrument(self.business_a)
        self.auth("b@example.test")

        response = self.client.delete(reverse("instrument-detail", args=[instrument.id]))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        instrument.refresh_from_db()
        self.assertEqual(instrument.status, "REGISTERED")
