"""Offline sync: idempotency, isolation, conflicts, and the real domain path.

Every operation goes through the same services the online endpoints use, so
these tests assert on domain state (application, inspection, evidence) and
not only on the sync response.
"""

import base64
import io
import shutil
import tempfile
import uuid
from datetime import timedelta

from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from applications import services as app_svc
from applications.models import Application
from audit.models import AuditLog
from authentication.models import User
from businesses.models import Business
from evidence.models import Evidence
from inspections import services as insp_svc
from inspections.models import Inspection, Measurement
from instruments.models import Instrument
from notifications.models import Notification
from scheduling.services import book_visit
from sync.models import SyncRecord

PASSWORD = "synthetic-password-123"

LOCAL_STORAGE = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}

READINGS = [
    {"testPoint": "ZERO", "referenceValue": 0, "indicatedValue": 0, "unit": "kg"},
    {"testPoint": "HALF_CAPACITY", "referenceValue": 5, "indicatedValue": "5.010", "unit": "kg"},
    {"testPoint": "MAX_CAPACITY", "referenceValue": 10, "indicatedValue": "10.020", "unit": "kg"},
]


def png_b64():
    buffer = io.BytesIO()
    Image.new("RGB", (4, 4), (10, 20, 30)).save(buffer, format="PNG")

    return base64.b64encode(buffer.getvalue()).decode("ascii")


class SyncTestCase(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.media_root = tempfile.mkdtemp(prefix="mapansetu-sync-")
        # Most tests here are about the sync mechanics, not the evidence
        # rule; the one test that covers it re-enables the rule.
        cls._settings = override_settings(
            MEDIA_ROOT=cls.media_root, STORAGES=LOCAL_STORAGE,
            INSPECTION_REQUIRE_EVIDENCE=False,
        )
        cls._settings.enable()

    @classmethod
    def tearDownClass(cls):
        cls._settings.disable()
        shutil.rmtree(cls.media_root, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        cache.clear()

        self.business = Business.objects.create(
            legal_name="Alpha Retail Ltd", contact_name="Alpha Owner",
            email="alpha@example.test", address="Synthetic address A",
        )
        self.owner = self._user("owner@example.test", User.Role.BUSINESS, self.business)
        self.admin = self._user("admin@example.test", User.Role.ADMIN)
        self.officer = self._user("officer@example.test", User.Role.LMO)
        self.other_officer = self._user("gatc@example.test", User.Role.GATC)

        self.instrument = Instrument.objects.create(
            business=self.business, instrument_number="INS-A-001", serial_number="SN-A-001",
            instrument_type="ELECTRONIC_SCALE", manufacturer="M", model="X",
            capacity="10.000", capacity_unit="kg", location="Shop",
        )

        self.application = self._scheduled_application(self.instrument)

    # -- helpers ---------------------------------------------------------

    def _user(self, email, role, business=None):
        return User.objects.create_user(
            email=email, password=PASSWORD, display_name=email.split("@")[0],
            role=role, business=business,
        )

    def _scheduled_application(self, instrument, officer=None, days=1):
        application = app_svc.create_application(
            user=self.owner, instrument_id=instrument.id, reason="Periodic", submit=True
        )
        application = app_svc.assign_officer(
            user=self.admin, application=application, officer_id=(officer or self.officer).id
        )
        # Each visit on its own day so the officer is never double-booked.
        book_visit(
            user=self.admin, application=application,
            scheduled_at=timezone.now() + timedelta(days=days),
        )
        application.refresh_from_db()

        return application

    def auth(self, user):
        response = self.client.post(
            reverse("auth-login"), {"email": user.email, "password": PASSWORD}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['accessToken']}")

    def op(self, operation_type="RECORD_DECISION", payload=None, **overrides):
        base = {
            "clientOperationId": str(uuid.uuid4()),
            "createdAt": timezone.now().isoformat(),
            "entityType": "APPLICATION",
            "entityId": str(self.application.id),
            "operationType": operation_type,
            "payload": payload if payload is not None else {
                "applicationId": str(self.application.id),
                "measurements": READINGS,
                "result": "PASS",
                "notes": "Within demo tolerance.",
                "completedAt": timezone.now().isoformat(),
                "evidence": [],
            },
            "attemptCount": 0,
            "status": "READY_TO_SYNC",
            "expectedServerVersion": 1,
        }
        base.update(overrides)

        return base

    def post(self, *operations):
        return self.client.post(
            reverse("sync-batch"), {"operations": list(operations)}, format="json"
        )

    # -- the main offline path -------------------------------------------

    def test_decision_bundle_starts_inspection_applies_readings_and_completes(self):
        operation = self.op()

        self.auth(self.officer)
        response = self.post(operation)

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        result = response.data["results"][0]
        self.assertEqual(result["status"], "SYNCED")
        self.assertEqual(result["clientOperationId"], operation["clientOperationId"])
        self.assertEqual(result["applicationState"], "COMPLETED")

        inspection = Inspection.objects.get(application=self.application)
        self.assertEqual(result["entityId"], str(inspection.id))
        self.assertEqual(inspection.officer, self.officer)
        self.assertEqual(inspection.result, "PASS")
        self.assertEqual(inspection.notes, "Within demo tolerance.")
        self.assertEqual(inspection.measurements.count(), 3)
        self.assertEqual(
            list(inspection.measurements.values_list("label", flat=True)),
            ["ZERO", "HALF_CAPACITY", "MAX_CAPACITY"],
        )
        # 1 at start, +3 readings, +1 decision
        self.assertEqual(inspection.version, 5)
        self.assertEqual(result["serverVersion"], 5)

        self.application.refresh_from_db()
        self.assertEqual(self.application.state, Application.State.COMPLETED)
        self.instrument.refresh_from_db()
        self.assertEqual(self.instrument.status, "ACTIVE")

        record = SyncRecord.objects.get(client_operation_id=operation["clientOperationId"])
        self.assertEqual(record.status, "SYNCED")
        self.assertEqual(record.server_entity_id, inspection.id)
        self.assertEqual(record.result, result)
        self.assertIsNotNone(record.processed_at)

        self.assertTrue(AuditLog.objects.filter(action="SYNC_OPERATION_SYNCED").exists())
        self.assertTrue(AuditLog.objects.filter(action="INSPECTION_COMPLETED").exists())
        self.assertTrue(
            Notification.objects.filter(recipient=self.officer, type="SYNC_RESULT").exists()
        )

    def test_replay_returns_original_result_without_reapplying(self):
        operation = self.op()

        self.auth(self.officer)
        first = self.post(operation).data["results"][0]
        second = self.post(operation).data["results"][0]

        self.assertEqual(first, second)
        self.assertEqual(Inspection.objects.count(), 1)
        self.assertEqual(Measurement.objects.count(), 3)
        self.assertEqual(SyncRecord.objects.get().attempt_count, 2)
        self.assertEqual(AuditLog.objects.filter(action="INSPECTION_COMPLETED").count(), 1)

    def test_same_id_with_different_payload_is_a_conflict(self):
        operation = self.op()

        self.auth(self.officer)
        self.post(operation)

        changed = {**operation, "payload": {**operation["payload"], "result": "FAIL"}}
        result = self.post(changed).data["results"][0]

        self.assertEqual(result["status"], "CONFLICT")
        self.assertIn("different content", result["message"])
        self.assertEqual(Inspection.objects.get().result, "PASS")

    def test_second_decision_for_same_application_is_a_conflict(self):
        self.auth(self.officer)
        self.post(self.op())

        result = self.post(self.op()).data["results"][0]

        self.assertEqual(result["status"], "CONFLICT")
        self.assertIn("already completed", result["message"])

    def test_version_mismatch_is_a_conflict_and_nothing_is_applied(self):
        # The officer recorded a reading online before going offline, so the
        # server is at version 2 while the device still thinks 1.
        inspection = insp_svc.start_inspection(user=self.officer, application=self.application)
        insp_svc.add_measurement(
            user=self.officer, inspection=inspection, label="Zero",
            nominal_value=0, observed_value=0, unit="kg",
        )

        self.auth(self.officer)
        result = self.post(self.op(expectedServerVersion=1)).data["results"][0]

        self.assertEqual(result["status"], "CONFLICT")
        self.assertIn("Server version is 2", result["message"])
        inspection.refresh_from_db()
        self.assertIsNone(inspection.completed_at)
        self.assertEqual(inspection.measurements.count(), 1)
        self.assertEqual(SyncRecord.objects.get().status, "CONFLICT")

    def test_a_bad_operation_does_not_poison_the_batch(self):
        second_instrument = Instrument.objects.create(
            business=self.business, instrument_number="INS-A-002", serial_number="SN-A-002",
            instrument_type="ELECTRONIC_SCALE", manufacturer="M", model="X",
            capacity="10.000", capacity_unit="kg", location="Shop",
        )
        second = self._scheduled_application(second_instrument, days=2)

        bad = self.op(payload={
            "applicationId": str(second.id),
            "measurements": [{"testPoint": "ZERO", "unit": "kg"}],   # missing values
            "result": "PASS",
        }, entityId=str(second.id))
        good = self.op()

        self.auth(self.officer)
        results = {r["clientOperationId"]: r for r in self.post(bad, good).data["results"]}

        self.assertEqual(results[bad["clientOperationId"]]["status"], "FAILED")
        self.assertEqual(results[good["clientOperationId"]]["status"], "SYNCED")

        # The failed one was rolled back entirely: no inspection was left
        # half-started for the second application.
        second.refresh_from_db()
        self.assertEqual(second.state, Application.State.SCHEDULED)
        self.assertFalse(Inspection.objects.filter(application=second).exists())

        self.application.refresh_from_db()
        self.assertEqual(self.application.state, Application.State.COMPLETED)

    def test_invalid_result_and_missing_readings_fail_clearly(self):
        self.auth(self.officer)

        wrong_result = self.op(payload={"applicationId": str(self.application.id), "result": "OK"})
        self.assertIn("PASS, FAIL", self.post(wrong_result).data["results"][0]["message"])

        no_readings = self.op(payload={"applicationId": str(self.application.id), "result": "PASS"})
        result = self.post(no_readings).data["results"][0]
        self.assertEqual(result["status"], "FAILED")
        self.assertIn("at least one reading", result["message"])

        self.application.refresh_from_db()
        self.assertEqual(self.application.state, Application.State.SCHEDULED)

    # -- other operation types ------------------------------------------

    def test_create_then_readings_then_decision_in_one_batch(self):
        base = timezone.now()
        create = self.op(
            "CREATE_INSPECTION", payload={"applicationId": str(self.application.id)},
            createdAt=base.isoformat(), expectedServerVersion=None,
        )
        readings = self.op(
            "UPSERT_READINGS",
            payload={"applicationId": str(self.application.id), "measurements": READINGS},
            createdAt=(base + timedelta(seconds=1)).isoformat(), expectedServerVersion=None,
        )
        decision = self.op(
            payload={"applicationId": str(self.application.id), "result": "FAIL", "notes": "Drift"},
            createdAt=(base + timedelta(seconds=2)).isoformat(), expectedServerVersion=None,
        )

        self.auth(self.officer)
        # Sent out of order; applied in creation order.
        results = self.post(decision, create, readings).data["results"]

        self.assertEqual([r["status"] for r in results], ["SYNCED"] * 3)
        self.assertEqual(
            [r["clientOperationId"] for r in results],
            [create["clientOperationId"], readings["clientOperationId"], decision["clientOperationId"]],
        )
        inspection = Inspection.objects.get()
        self.assertEqual(inspection.result, "FAIL")
        self.assertEqual(inspection.measurements.count(), 3)

    def test_readings_replace_the_draft(self):
        self.auth(self.officer)
        self.post(self.op("UPSERT_READINGS", payload={
            "applicationId": str(self.application.id), "measurements": READINGS,
        }, expectedServerVersion=None))
        self.post(self.op("UPSERT_READINGS", payload={
            "applicationId": str(self.application.id), "measurements": READINGS[:1],
        }, expectedServerVersion=None))

        self.assertEqual(Measurement.objects.count(), 1)

    def test_checklist_is_accepted_and_kept_on_the_record(self):
        items = [{"id": "chk-01", "passed": True}, {"id": "chk-02", "passed": False}]

        self.auth(self.officer)
        result = self.post(self.op("UPSERT_CHECKLIST", payload={
            "applicationId": str(self.application.id), "checklist": items,
        }, expectedServerVersion=None)).data["results"][0]

        self.assertEqual(result["status"], "SYNCED")
        self.assertIn("2 items", result["message"])
        self.assertEqual(SyncRecord.objects.get().payload["checklist"], items)

    def test_evidence_with_base64_content_is_stored_and_verified(self):
        self.auth(self.officer)
        operation = self.op("UPLOAD_EVIDENCE", payload={
            "applicationId": str(self.application.id),
            "fileName": "seal.png",
            "evidenceType": "SEAL_PHOTO",
            "contentBase64": png_b64(),
            "latitude": "28.6139", "longitude": "77.2090", "gpsAccuracyMeters": 8,
        }, expectedServerVersion=None)

        result = self.post(operation).data["results"][0]

        self.assertEqual(result["status"], "SYNCED", result)
        evidence = Evidence.objects.get()
        self.assertEqual(result["entityId"], str(evidence.id))
        self.assertEqual(evidence.mime_type, "image/png")
        self.assertEqual(evidence.evidence_type, "SEAL_PHOTO")
        self.assertEqual(str(evidence.client_operation_id), operation["clientOperationId"])

        # Not an image: refused, nothing stored.
        bad = self.op("UPLOAD_EVIDENCE", payload={
            "applicationId": str(self.application.id),
            "fileName": "x.png", "contentBase64": base64.b64encode(b"hello").decode(),
        }, expectedServerVersion=None)
        self.assertEqual(self.post(bad).data["results"][0]["status"], "FAILED")
        self.assertEqual(Evidence.objects.count(), 1)

    def test_evidence_without_bytes_says_where_to_upload(self):
        self.auth(self.officer)
        result = self.post(self.op("UPLOAD_EVIDENCE", payload={
            "applicationId": str(self.application.id), "fileName": "seal.png",
        }, expectedServerVersion=None)).data["results"][0]

        self.assertEqual(result["status"], "FAILED")
        self.assertIn("/evidence/", result["message"])

    @override_settings(INSPECTION_REQUIRE_EVIDENCE=True)
    def test_evidence_rule_applies_to_offline_decisions(self):
        """The device must sync its evidence bytes before (or with) the decision."""
        self.auth(self.officer)

        alone = self.post(self.op()).data["results"][0]
        self.assertEqual(alone["status"], "FAILED")
        self.assertIn("evidence", alone["message"])
        self.application.refresh_from_db()
        self.assertEqual(self.application.state, Application.State.SCHEDULED)

        base = timezone.now()
        photo = self.op("UPLOAD_EVIDENCE", payload={
            "applicationId": str(self.application.id), "fileName": "seal.png",
            "evidenceType": "SEAL_PHOTO", "contentBase64": png_b64(),
        }, createdAt=base.isoformat(), expectedServerVersion=None)
        decision = self.op(createdAt=(base + timedelta(seconds=1)).isoformat())

        results = self.post(decision, photo).data["results"]

        self.assertEqual([r["status"] for r in results], ["SYNCED", "SYNCED"])
        self.assertEqual(Evidence.objects.count(), 1)
        self.assertEqual(Inspection.objects.get().result, "PASS")

    def test_decision_reports_evidence_still_on_device(self):
        operation = self.op()
        operation["payload"]["evidence"] = [
            {"id": "local-1", "serverId": None, "uploadState": "PENDING"},
            {"id": "local-2", "serverId": str(uuid.uuid4()), "uploadState": "UPLOADED"},
        ]

        self.auth(self.officer)
        result = self.post(operation).data["results"][0]

        self.assertEqual(result["status"], "SYNCED")
        self.assertIn("1 evidence item(s) are still only on the device", result["message"])

    # -- who may sync ----------------------------------------------------

    def test_unassigned_officer_cannot_sync_someone_elses_case(self):
        self.auth(self.other_officer)
        result = self.post(self.op()).data["results"][0]

        self.assertEqual(result["status"], "FAILED")
        self.assertIn("not assigned", result["message"])
        self.assertFalse(Inspection.objects.exists())

    def test_business_cannot_use_sync(self):
        self.auth(self.owner)
        self.assertEqual(self.post(self.op()).status_code, status.HTTP_403_FORBIDDEN)

    def test_another_officers_operation_id_is_unknown_not_leaked(self):
        operation = self.op()
        self.auth(self.officer)
        self.post(operation)

        self.auth(self.other_officer)
        result = self.post(operation).data["results"][0]

        self.assertEqual(result["status"], "FAILED")
        self.assertEqual(result["message"], "Unknown operation id.")

    def test_batch_validation(self):
        self.auth(self.officer)

        self.assertEqual(
            self.post().status_code, status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(
            self.post(self.op(clientOperationId="op-not-a-uuid")).status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertEqual(
            self.post(self.op(operationType="DELETE_EVERYTHING")).status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertEqual(
            self.post(*[self.op() for _ in range(51)]).status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    # -- records ---------------------------------------------------------

    def test_records_are_own_only_and_admin_sees_all_with_status_filter(self):
        self.auth(self.officer)
        good = self.op()
        self.post(good)
        self.post(self.op())   # second decision -> CONFLICT

        mine = self.client.get(reverse("sync-record-list")).data
        self.assertEqual(mine["totalItems"], 2)

        self.auth(self.other_officer)
        self.assertEqual(self.client.get(reverse("sync-record-list")).data["totalItems"], 0)
        self.assertEqual(
            self.client.get(
                reverse("sync-record-detail", args=[good["clientOperationId"]])
            ).status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.auth(self.admin)
        conflicts = self.client.get(reverse("sync-record-list"), {"status": "CONFLICT"}).data
        self.assertEqual(conflicts["totalItems"], 1)
        self.assertEqual(conflicts["items"][0]["submittedByName"], "officer")

        dashboard = self.client.get(reverse("admin-dashboard")).data
        self.assertEqual(dashboard["syncExceptions"], 1)
        self.assertEqual(dashboard["syncCountsByStatus"]["SYNCED"], 1)
