"""Frontend contract: every route the web client calls answers, for the role
that calls it, with the fields the client's types rely on.

This is the "nothing is wired to a missing endpoint" check. It drives the
real domain services to build a full scenario (owner -> admin -> officer ->
certificate), then walks the routes exactly as the screens do.

If a screen starts reading a new field, add it to EXPECT below; if a route
moves, this fails before the demo does.
"""

import io
from datetime import timedelta

from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from applications import services as app_svc
from authentication.models import User
from businesses.models import Business
from certificates import services as cert_svc
from evidence.services import store_evidence
from inspections import services as insp_svc
from instruments.models import Instrument
from scheduling.services import book_visit

PASSWORD = "synthetic-password-123"

# Fields each screen reads from the response (frontend/src/types/*.ts).
EXPECT = {
    "user": ["id", "email", "displayName", "role", "businessId", "active"],
    "instrument": [
        "id", "instrumentNumber", "instrumentType", "manufacturer", "model", "capacity",
        "capacityUnit", "status", "businessId", "nextDueDate", "activeCertificateNo", "createdAt",
    ],
    "application": [
        "id", "applicationNumber", "instrumentId", "instrumentNumber", "instrumentType",
        "businessId", "businessName", "state", "reason", "scheduledDate", "schedule",
        "assignedOfficerId", "assignedOfficerName", "certificateId", "certificateNumber", "createdAt",
    ],
    "schedule": [
        "id", "applicationId", "applicationNumber", "applicationState", "instrumentNumber",
        "instrumentType", "location", "businessName", "officerUserId", "officerName",
        "scheduledAt", "scheduleNote", "status",
    ],
    "inspection": [
        "id", "applicationId", "officerUserId", "startedAt", "completedAt", "result", "notes",
        "gpsLatitude", "gpsLongitude", "gpsAccuracyMeters", "capturedAt", "version",
        "measurements", "evidence",
    ],
    "evidence": [
        "id", "inspectionId", "evidenceType", "fileName", "mimeType", "sizeBytes", "sha256",
        "capturedAt", "latitude", "longitude", "gpsAccuracyMeters", "uploadedAt", "fileUrl",
    ],
    "certificate": [
        "id", "certificateNumber", "applicationId", "instrumentId", "instrumentNumber",
        "businessId", "status", "issuedAt", "validUntil", "payloadHash", "signatureAlgorithm",
        "qrVerificationUrl", "applicationNumber", "instrumentType", "businessName",
        "issuerOfficerName",
    ],
    "verification": [
        "certificateNumber", "verificationStatus", "certificateStatus", "signatureValid",
        "payloadHash", "issuedAt", "validUntil", "instrumentSummary", "verificationMessage",
    ],
    "notification": ["id", "userId", "title", "message", "type", "read", "link", "createdAt"],
    "audit": [
        "id", "eventId", "sequence", "actorUserId", "actorEmail", "actorName", "actorRole",
        "isValidChain", "action", "entityType", "entityId", "timestamp", "metadata",
        "previousHash", "currentHash",
    ],
    "dashboard": [
        "applicationCountsByState", "inspectionCountsByResult", "certificateCountsByStatus",
        "expiryBuckets", "visits", "syncExceptions", "syncCountsByStatus", "officerWorkload",
    ],
    "sync_record": ["clientOperationId", "operationType", "status", "lastError", "serverEntityId"],
}

PAGE_KEYS = ["items", "page", "pageSize", "totalItems", "totalPages"]

LOCAL_STORAGE = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}


def png():
    buffer = io.BytesIO()
    Image.new("RGB", (4, 4), (1, 2, 3)).save(buffer, format="PNG")

    return buffer.getvalue()


@override_settings(STORAGES=LOCAL_STORAGE)
class FrontendContractTests(APITestCase):
    @classmethod
    def setUpClass(cls):
        import tempfile

        super().setUpClass()
        cls._media = override_settings(MEDIA_ROOT=tempfile.mkdtemp(prefix="mapansetu-contract-"))
        cls._media.enable()

    @classmethod
    def tearDownClass(cls):
        cls._media.disable()
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

        self.instrument = Instrument.objects.create(
            business=self.business, instrument_number="INS-A-001", serial_number="SN-A-001",
            instrument_type="ELECTRONIC_SCALE", manufacturer="M", model="X",
            capacity="10.000", capacity_unit="kg", location="Shop",
        )

        # Full happy path -> ACTIVE certificate, plus a second case still SCHEDULED.
        self.application = app_svc.create_application(
            user=self.owner, instrument_id=self.instrument.id, reason="Periodic", submit=True
        )
        app_svc.assign_officer(
            user=self.admin, application=self.application, officer_id=self.officer.id
        )
        self.schedule = book_visit(
            user=self.admin, application=self.application,
            scheduled_at=timezone.now() + timedelta(days=1), note="Gate 2",
        )
        self.inspection = insp_svc.start_inspection(user=self.officer, application=self.application)
        insp_svc.add_measurement(
            user=self.officer, inspection=self.inspection, label="Zero",
            nominal_value=0, observed_value=0, unit="kg",
        )
        from django.core.files.uploadedfile import SimpleUploadedFile

        self.evidence, _ = store_evidence(
            user=self.officer, inspection=self.inspection,
            uploaded=SimpleUploadedFile("seal.png", png(), "image/png"),
        )
        insp_svc.complete_inspection(user=self.officer, inspection=self.inspection, result="PASS")
        self.certificate = cert_svc.issue_certificate(user=self.officer, inspection=self.inspection)

        self.instrument_two = Instrument.objects.create(
            business=self.business, instrument_number="INS-A-002", serial_number="SN-A-002",
            instrument_type="PLATFORM_SCALE", manufacturer="M", model="Y",
            capacity="100.000", capacity_unit="kg", location="Dock",
        )
        self.open_application = app_svc.create_application(
            user=self.owner, instrument_id=self.instrument_two.id, reason="Annual", submit=True
        )
        app_svc.assign_officer(
            user=self.admin, application=self.open_application, officer_id=self.officer.id
        )
        self.open_schedule = book_visit(
            user=self.admin, application=self.open_application,
            scheduled_at=timezone.now() + timedelta(days=2),
        )

    def _user(self, email, role, business=None):
        return User.objects.create_user(
            email=email, password=PASSWORD, display_name=email.split("@")[0],
            role=role, business=business,
        )

    def login(self, user):
        response = self.client.post(
            reverse("auth-login"), {"email": user.email, "password": PASSWORD}
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertKeys(response.data, ["accessToken", "tokenType", "expiresAt", "user"])
        self.assertKeys(response.data["user"], EXPECT["user"])
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['accessToken']}")

    def assertKeys(self, payload, keys):
        missing = [k for k in keys if k not in payload]
        self.assertFalse(missing, f"Missing fields {missing} in {sorted(payload)}")

    def get_ok(self, url, params=None, expect=None, paginated=False):
        response = self.client.get(url, params or {})
        self.assertEqual(response.status_code, 200, f"{url}: {response.data}")

        if paginated:
            self.assertKeys(response.data, PAGE_KEYS)
            self.assertGreater(response.data["totalItems"], 0, f"{url} returned nothing")
            if expect:
                self.assertKeys(response.data["items"][0], EXPECT[expect])
        elif expect:
            self.assertKeys(response.data, EXPECT[expect])

        return response.data

    # -- business portal (/app) ---------------------------------------------

    def test_business_portal_routes(self):
        self.login(self.owner)

        self.get_ok(reverse("users-me"), expect="user")
        self.get_ok(reverse("business-me"))
        self.get_ok(reverse("instrument-list-create"), expect="instrument", paginated=True)
        self.get_ok(reverse("instrument-detail", args=[self.instrument.id]), expect="instrument")
        self.get_ok(reverse("application-list-create"), expect="application", paginated=True)
        self.get_ok(reverse("application-detail", args=[self.application.id]), expect="application")
        self.get_ok(reverse("certificate-list-create"), expect="certificate", paginated=True)
        self.get_ok(reverse("certificate-detail", args=[self.certificate.id]), expect="certificate")
        self.get_ok(reverse("schedule-list"), expect="schedule", paginated=True)
        self.get_ok(reverse("notification-list"), expect="notification", paginated=True)
        self.get_ok(reverse("notification-unread-count"))

        qr = self.client.get(reverse("certificate-qr", args=[self.certificate.id]))
        self.assertEqual(qr.status_code, 200)
        self.assertEqual(qr["Content-Type"], "image/svg+xml")

        # Register + submit from the owner's screens.
        created = self.client.post(reverse("instrument-list-create"), {
            "instrumentNumber": "INS-A-003", "serialNumber": "SN-A-003",
            "instrumentType": "COUNTER_SCALE", "manufacturer": "M", "model": "Z",
            "capacity": "20.000", "capacityUnit": "kg", "location": "Counter",
        }, format="json")
        self.assertEqual(created.status_code, 201, created.data)

        application = self.client.post(reverse("application-list-create"), {
            "instrumentId": created.data["id"], "reason": "Initial", "submit": True,
        }, format="json")
        self.assertEqual(application.status_code, 201, application.data)
        self.assertEqual(application.data["state"], "SUBMITTED")

        read = self.client.post(
            reverse("notification-read", args=[self.get_ok(reverse("notification-list"))["items"][0]["id"]])
        )
        self.assertEqual(read.status_code, 200)
        self.assertEqual(self.client.post(reverse("notification-read-all")).status_code, 200)

    # -- admin portal (/admin) ----------------------------------------------

    def test_admin_portal_routes(self):
        self.login(self.admin)

        self.get_ok(reverse("admin-dashboard"), expect="dashboard")
        self.get_ok(reverse("user-list"), {"role": "LMO,GATC"}, expect="user", paginated=True)
        self.get_ok(reverse("application-list-create"), expect="application", paginated=True)
        self.get_ok(reverse("application-list-create"), {"state": "SCHEDULED"}, paginated=True)
        self.get_ok(reverse("schedule-list"), expect="schedule", paginated=True)
        self.get_ok(reverse("schedule-detail", args=[self.open_schedule.id]), expect="schedule")
        self.get_ok(reverse("certificate-list-create"), expect="certificate", paginated=True)
        self.get_ok(reverse("instrument-list-create"), expect="instrument", paginated=True)
        self.get_ok(reverse("audit-list"), expect="audit", paginated=True)
        self.get_ok(reverse("audit-verify"))
        self.get_ok(reverse("notification-list"), expect="notification", paginated=True)
        self.get_ok(reverse("sync-record-list"), paginated=False)

        # Assign -> schedule -> reschedule from the admin screens.
        new_instrument = Instrument.objects.create(
            business=self.business, instrument_number="INS-A-009", serial_number="SN-A-009",
            instrument_type="WEIGHBRIDGE", manufacturer="M", model="W",
            capacity="50000.000", capacity_unit="kg", location="Gate",
        )
        application = app_svc.create_application(
            user=self.owner, instrument_id=new_instrument.id, reason="New", submit=True
        )

        assigned = self.client.post(
            reverse("application-assign", args=[application.id]),
            {"officerUserId": str(self.officer.id), "assignmentNote": "Nearest officer"},
            format="json",
        )
        self.assertEqual(assigned.status_code, 200, assigned.data)
        self.assertEqual(assigned.data["assignedOfficerName"], self.officer.display_name)

        when = timezone.now() + timedelta(days=5)
        scheduled = self.client.post(
            reverse("application-schedule", args=[application.id]),
            {"scheduledAt": when.isoformat(), "scheduleNote": "Morning"},
            format="json",
        )
        self.assertEqual(scheduled.status_code, 200, scheduled.data)
        self.assertEqual(scheduled.data["state"], "SCHEDULED")
        self.assertEqual(scheduled.data["schedule"]["scheduleNote"], "Morning")

        moved = self.client.post(
            reverse("schedule-reschedule", args=[scheduled.data["schedule"]["id"]]),
            {"scheduledAt": (when + timedelta(days=1)).isoformat()},
            format="json",
        )
        self.assertEqual(moved.status_code, 200, moved.data)

        revoked = self.client.post(
            reverse("certificate-revoke", args=[self.certificate.id]),
            {"reason": "Demo revocation"}, format="json",
        )
        self.assertEqual(revoked.status_code, 200, revoked.data)
        self.assertEqual(revoked.data["status"], "REVOKED")

    # -- field PWA (/field) -------------------------------------------------

    def test_field_pwa_routes(self):
        self.login(self.officer)

        self.get_ok(reverse("users-me"), expect="user")
        apps = self.get_ok(reverse("application-list-create"), expect="application", paginated=True)
        self.assertTrue(all(a["assignedOfficerId"] == str(self.officer.id) for a in apps["items"]))
        self.get_ok(reverse("schedule-list"), expect="schedule", paginated=True)
        inspections = self.get_ok(reverse("inspection-list-create"), expect="inspection", paginated=True)
        self.assertKeys(inspections["items"][0]["evidence"][0], EXPECT["evidence"])
        self.get_ok(reverse("inspection-detail", args=[self.inspection.id]), expect="inspection")
        self.get_ok(reverse("inspection-evidence", args=[self.inspection.id]), expect="evidence", paginated=True)
        self.get_ok(reverse("evidence-detail", args=[self.evidence.id]), expect="evidence")
        self.get_ok(reverse("notification-list"), expect="notification", paginated=True)

        file_response = self.client.get(reverse("evidence-file", args=[self.evidence.id]))
        self.assertEqual(file_response.status_code, 200)
        self.assertEqual(file_response["Content-Type"], "image/png")

        # The online inspection flow, step by step, exactly as the PWA does it.
        started = self.client.post(
            reverse("inspection-list-create"),
            {"applicationId": str(self.open_application.id)}, format="json",
        )
        self.assertEqual(started.status_code, 201, started.data)
        inspection_id = started.data["id"]

        reading = self.client.post(
            reverse("inspection-measurements", args=[inspection_id]),
            {"label": "Half load", "nominalValue": "50.000", "observedValue": "50.100", "unit": "kg"},
            format="json",
        )
        self.assertEqual(reading.status_code, 201, reading.data)
        self.assertTrue(reading.data["withinTolerance"])

        from django.core.files.uploadedfile import SimpleUploadedFile

        uploaded = self.client.post(
            reverse("inspection-evidence", args=[inspection_id]),
            {"file": SimpleUploadedFile("plate.png", png(), "image/png"), "evidenceType": "NAMEPLATE_PHOTO"},
            format="multipart",
        )
        self.assertEqual(uploaded.status_code, 201, uploaded.data)

        completed = self.client.post(
            reverse("inspection-complete", args=[inspection_id]),
            {"result": "PASS", "notes": "OK", "gps": {"latitude": "28.613900", "longitude": "77.209000", "accuracyMeters": 9}},
            format="json",
        )
        self.assertEqual(completed.status_code, 200, completed.data)
        self.assertEqual(completed.data["result"], "PASS")

        issued = self.client.post(
            reverse("certificate-list-create"), {"inspectionId": inspection_id}, format="json"
        )
        self.assertEqual(issued.status_code, 201, issued.data)
        self.assertKeys(issued.data, EXPECT["certificate"])

        # Offline path through /sync/ for a third case.
        import uuid

        third = Instrument.objects.create(
            business=self.business, instrument_number="INS-A-010", serial_number="SN-A-010",
            instrument_type="SPRING_BALANCE", manufacturer="M", model="S",
            capacity="5.000", capacity_unit="kg", location="Stall",
        )
        offline_app = app_svc.create_application(
            user=self.owner, instrument_id=third.id, reason="Offline", submit=True
        )
        app_svc.assign_officer(user=self.admin, application=offline_app, officer_id=self.officer.id)
        book_visit(user=self.admin, application=offline_app, scheduled_at=timezone.now() + timedelta(days=3))

        import base64

        base = timezone.now()
        batch = self.client.post(reverse("sync-batch"), {"operations": [
            {
                "clientOperationId": str(uuid.uuid4()), "createdAt": base.isoformat(),
                "entityType": "APPLICATION", "entityId": str(offline_app.id),
                "operationType": "UPLOAD_EVIDENCE",
                "payload": {"applicationId": str(offline_app.id), "fileName": "site.png",
                            "evidenceType": "SITE_PHOTO",
                            "contentBase64": base64.b64encode(png()).decode()},
                "attemptCount": 0, "status": "READY_TO_SYNC",
            },
            {
                "clientOperationId": str(uuid.uuid4()),
                "createdAt": (base + timedelta(seconds=1)).isoformat(),
                "entityType": "APPLICATION", "entityId": str(offline_app.id),
                "operationType": "RECORD_DECISION",
                "payload": {"applicationId": str(offline_app.id), "result": "PASS",
                            "measurements": [{"testPoint": "ZERO", "referenceValue": 0, "indicatedValue": 0, "unit": "kg"}]},
                "attemptCount": 0, "status": "READY_TO_SYNC", "expectedServerVersion": 1,
            },
        ]}, format="json")
        self.assertEqual(batch.status_code, 200, batch.data)
        self.assertEqual([r["status"] for r in batch.data["results"]], ["SYNCED", "SYNCED"])

        self.get_ok(reverse("sync-record-list"), expect="sync_record", paginated=True)

    # -- public --------------------------------------------------------------

    def test_public_verification_needs_no_login(self):
        self.client.credentials()

        valid = self.client.get(reverse("public-verify"), {"certNo": self.certificate.certificate_number})
        self.assertEqual(valid.status_code, 200)
        self.assertKeys(valid.data, EXPECT["verification"])
        self.assertEqual(valid.data["verificationStatus"], "VALID")
        self.assertTrue(valid.data["signatureValid"])

        unknown = self.client.get(reverse("public-verify"), {"certNo": "CERT-NOPE-0001"})
        self.assertEqual(unknown.data["verificationStatus"], "INVALID")

    def test_every_protected_route_rejects_anonymous(self):
        self.client.credentials()

        for name, args in [
            ("users-me", []), ("instrument-list-create", []), ("application-list-create", []),
            ("schedule-list", []), ("inspection-list-create", []), ("certificate-list-create", []),
            ("notification-list", []), ("audit-list", []), ("admin-dashboard", []),
            ("sync-record-list", []), ("evidence-file", [self.evidence.id]),
        ]:
            response = self.client.get(reverse(name, args=args))
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, name)
