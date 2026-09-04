"""Evidence upload: format allowlist, size cap, integrity, replay, and access.

Files land in a throwaway MEDIA_ROOT so the suite never touches real storage.
"""

import hashlib
import io
import os
import shutil
import tempfile
import uuid

from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from applications import services as app_svc
from audit.models import AuditLog
from authentication.models import User
from businesses.models import Business
from evidence.models import Evidence
from inspections import services as insp_svc
from instruments.models import Instrument
from scheduling.services import book_visit

PASSWORD = "synthetic-password-123"

LOCAL_STORAGE = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}


def png_bytes(size=(4, 4), colour=(200, 30, 30)):
    buffer = io.BytesIO()
    Image.new("RGB", size, colour).save(buffer, format="PNG")

    return buffer.getvalue()


def jpeg_bytes():
    buffer = io.BytesIO()
    Image.new("RGB", (4, 4), (30, 200, 30)).save(buffer, format="JPEG")

    return buffer.getvalue()


def pdf_bytes():
    return b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n"


def upload(name, content, content_type="application/octet-stream"):
    return SimpleUploadedFile(name, content, content_type=content_type)


class EvidenceTestCase(APITestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.media_root = tempfile.mkdtemp(prefix="mapansetu-evidence-")
        cls._settings = override_settings(MEDIA_ROOT=cls.media_root, STORAGES=LOCAL_STORAGE)
        cls._settings.enable()

    @classmethod
    def tearDownClass(cls):
        cls._settings.disable()
        shutil.rmtree(cls.media_root, ignore_errors=True)
        super().tearDownClass()

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

        self.instrument = Instrument.objects.create(
            business=self.business_a, instrument_number="INS-A-001", serial_number="SN-A-001",
            instrument_type="ELECTRONIC_SCALE", manufacturer="M", model="X",
            capacity="10.000", capacity_unit="kg", location="Shop",
        )

        self.inspection = self._open_inspection(self.owner_a, self.instrument, self.officer)

    # -- helpers ---------------------------------------------------------

    def _user(self, email, role, business=None):
        return User.objects.create_user(
            email=email, password=PASSWORD, display_name=email.split("@")[0],
            role=role, business=business,
        )

    def _open_inspection(self, owner, instrument, officer):
        application = app_svc.create_application(
            user=owner, instrument_id=instrument.id, reason="Periodic", submit=True
        )
        application = app_svc.assign_officer(
            user=self.admin, application=application, officer_id=officer.id
        )
        book_visit(
            user=self.admin, application=application,
            scheduled_at=timezone.now() + timezone.timedelta(days=1),
        )

        return insp_svc.start_inspection(user=officer, application=application)

    def auth(self, user):
        response = self.client.post(
            reverse("auth-login"), {"email": user.email, "password": PASSWORD}
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['accessToken']}")

    def upload_url(self, inspection=None):
        return reverse("inspection-evidence", args=[(inspection or self.inspection).id])

    def post_file(self, content, name="photo.png", inspection=None, **fields):
        return self.client.post(
            self.upload_url(inspection),
            {"file": upload(name, content), **fields},
            format="multipart",
        )

    # -- upload ----------------------------------------------------------

    def test_officer_uploads_png_and_server_records_integrity(self):
        content = png_bytes()

        self.auth(self.officer)
        response = self.post_file(
            content, evidenceType="SEAL_PHOTO", latitude="28.613900",
            longitude="77.209000", gpsAccuracyMeters=12, notes="Seal intact",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["mimeType"], "image/png")
        self.assertEqual(response.data["sizeBytes"], len(content))
        self.assertEqual(response.data["sha256"], hashlib.sha256(content).hexdigest())
        self.assertEqual(response.data["evidenceType"], "SEAL_PHOTO")
        self.assertEqual(response.data["fileName"], "photo.png")
        self.assertTrue(response.data["objectKey"].startswith(f"evidence/{self.inspection.id}/"))
        self.assertTrue(response.data["objectKey"].endswith(".png"))
        self.assertEqual(response.data["fileUrl"], f"/api/v1/evidence/{response.data['id']}/file/")

        evidence = Evidence.objects.get()
        self.assertEqual(evidence.instrument, self.instrument)
        self.assertEqual(evidence.uploaded_by, self.officer)

        event = AuditLog.objects.get(action="EVIDENCE_UPLOADED")
        self.assertEqual(event.metadata["sha256"], evidence.sha256)

    def test_jpeg_and_pdf_are_accepted_with_sensible_default_types(self):
        self.auth(self.officer)

        jpeg = self.post_file(jpeg_bytes(), name="nameplate.jpg")
        self.assertEqual(jpeg.status_code, status.HTTP_201_CREATED, jpeg.data)
        self.assertEqual(jpeg.data["mimeType"], "image/jpeg")
        self.assertEqual(jpeg.data["evidenceType"], "SITE_PHOTO")

        pdf = self.post_file(pdf_bytes(), name="calibration.pdf")
        self.assertEqual(pdf.status_code, status.HTTP_201_CREATED, pdf.data)
        self.assertEqual(pdf.data["mimeType"], "application/pdf")
        self.assertEqual(pdf.data["evidenceType"], "DOCUMENT")

    def test_mime_is_sniffed_from_bytes_not_trusted_from_client(self):
        self.auth(self.officer)

        # A text file wearing a .png name and image/png content type.
        response = self.client.post(
            self.upload_url(),
            {"file": upload("photo.png", b"hello, not a picture", "image/png")},
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
        self.assertEqual(response.data["code"], "UNSUPPORTED_MEDIA_TYPE")
        self.assertFalse(Evidence.objects.exists())

    def test_png_magic_with_garbage_body_is_refused(self):
        self.auth(self.officer)

        response = self.post_file(b"\x89PNG\r\n\x1a\n" + b"\x00" * 64)

        self.assertEqual(response.status_code, status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

    def test_executable_and_svg_are_refused(self):
        self.auth(self.officer)

        for name, content in [
            ("tool.exe", b"MZ\x90\x00" + b"\x00" * 32),
            ("logo.svg", b"<svg xmlns='http://www.w3.org/2000/svg'></svg>"),
        ]:
            response = self.post_file(content, name=name)
            self.assertEqual(response.status_code, status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, name)

    @override_settings(EVIDENCE_MAX_BYTES=1024)
    def test_oversized_file_is_refused(self):
        # Random pixels do not compress, so this is comfortably over 1 KiB.
        noisy = Image.frombytes("RGB", (64, 64), os.urandom(64 * 64 * 3))
        buffer = io.BytesIO()
        noisy.save(buffer, format="PNG")
        content = buffer.getvalue()
        self.assertGreater(len(content), 1024)

        self.auth(self.officer)
        response = self.post_file(content)

        self.assertEqual(response.status_code, status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        self.assertEqual(response.data["code"], "FILE_TOO_LARGE")
        self.assertFalse(Evidence.objects.exists())

    def test_empty_file_is_refused(self):
        self.auth(self.officer)

        response = self.post_file(b"")

        self.assertIn(
            response.status_code,
            (status.HTTP_400_BAD_REQUEST, status.HTTP_415_UNSUPPORTED_MEDIA_TYPE),
        )

    def test_client_sha256_mismatch_is_rejected(self):
        self.auth(self.officer)

        response = self.post_file(png_bytes(), sha256="0" * 64)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["fieldErrors"][0]["field"], "sha256")
        self.assertFalse(Evidence.objects.exists())

    def test_matching_client_sha256_is_accepted(self):
        content = png_bytes()

        self.auth(self.officer)
        response = self.post_file(content, sha256=hashlib.sha256(content).hexdigest().upper())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_replayed_client_operation_returns_original(self):
        operation_id = str(uuid.uuid4())

        self.auth(self.officer)
        first = self.post_file(png_bytes(), clientOperationId=operation_id)
        second = self.post_file(png_bytes(colour=(1, 2, 3)), clientOperationId=operation_id)

        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second.status_code, status.HTTP_200_OK)
        self.assertEqual(second.data["id"], first.data["id"])
        self.assertEqual(second.data["sha256"], first.data["sha256"])
        self.assertEqual(Evidence.objects.count(), 1)

    def test_partial_gps_is_a_validation_error(self):
        self.auth(self.officer)

        response = self.post_file(png_bytes(), latitude="28.6")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # -- who may upload --------------------------------------------------

    def test_unassigned_officer_cannot_see_or_upload(self):
        self.auth(self.other_officer)

        response = self.post_file(png_bytes())

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_business_cannot_upload(self):
        self.auth(self.owner_a)

        response = self.post_file(png_bytes())

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_may_upload_for_correction(self):
        self.auth(self.admin)

        response = self.post_file(png_bytes())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_decision_requires_evidence_then_locks_it(self):
        insp_svc.add_measurement(
            user=self.officer, inspection=self.inspection, label="Zero",
            nominal_value=0, observed_value=0, unit="kg",
        )

        # No evidence yet: the decision is refused.
        with self.assertRaises(insp_svc.InspectionError) as refused:
            insp_svc.complete_inspection(
                user=self.officer, inspection=self.inspection, result="PASS"
            )
        self.assertIn("evidence", str(refused.exception))

        self.auth(self.officer)
        self.assertEqual(self.post_file(png_bytes()).status_code, status.HTTP_201_CREATED)

        insp_svc.complete_inspection(user=self.officer, inspection=self.inspection, result="PASS")

        # Once decided, nothing more can be attached.
        response = self.post_file(png_bytes())
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    # -- read ------------------------------------------------------------

    def test_evidence_appears_on_inspection_and_in_its_list(self):
        self.auth(self.officer)
        self.post_file(png_bytes(), evidenceType="NAMEPLATE_PHOTO")
        self.post_file(pdf_bytes(), name="doc.pdf")

        detail = self.client.get(reverse("inspection-detail", args=[self.inspection.id]))
        self.assertEqual(len(detail.data["evidence"]), 2)
        self.assertEqual(detail.data["evidence"][0]["evidenceType"], "NAMEPLATE_PHOTO")

        listing = self.client.get(self.upload_url())
        self.assertEqual(listing.data["totalItems"], 2)

    def test_owner_reads_evidence_on_their_inspection_but_not_others(self):
        self.auth(self.officer)
        mine = self.post_file(png_bytes()).data

        other_instrument = Instrument.objects.create(
            business=self.business_b, instrument_number="INS-B-001", serial_number="SN-B-001",
            instrument_type="ELECTRONIC_SCALE", manufacturer="M", model="X",
            capacity="10.000", capacity_unit="kg", location="Shop",
        )
        other_inspection = self._open_inspection(self.owner_b, other_instrument, self.other_officer)
        self.auth(self.other_officer)
        theirs = self.post_file(png_bytes(), inspection=other_inspection).data

        self.auth(self.owner_a)
        self.assertEqual(
            self.client.get(reverse("evidence-detail", args=[mine["id"]])).status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            self.client.get(reverse("evidence-detail", args=[theirs["id"]])).status_code,
            status.HTTP_404_NOT_FOUND,
        )
        self.assertEqual(
            self.client.get(reverse("evidence-file", args=[theirs["id"]])).status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_file_is_streamed_with_stored_mime_and_matching_bytes(self):
        content = jpeg_bytes()

        self.auth(self.officer)
        created = self.post_file(content, name="seal.jpg").data

        self.auth(self.admin)
        response = self.client.get(reverse("evidence-file", args=[created["id"]]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "image/jpeg")
        self.assertIn('filename="seal.jpg"', response["Content-Disposition"])
        self.assertEqual(response["X-Content-Type-Options"], "nosniff")
        self.assertEqual(b"".join(response.streaming_content), content)

    def test_file_requires_authentication(self):
        self.auth(self.officer)
        created = self.post_file(png_bytes()).data

        self.client.credentials()
        response = self.client.get(reverse("evidence-file", args=[created["id"]]))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # -- delete ----------------------------------------------------------

    def test_officer_deletes_own_evidence_while_open_and_it_is_audited(self):
        from django.core.files.storage import default_storage

        self.auth(self.officer)
        created = self.post_file(png_bytes()).data
        self.assertTrue(default_storage.exists(created["objectKey"]))

        response = self.client.delete(reverse("evidence-detail", args=[created["id"]]))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Evidence.objects.exists())
        self.assertFalse(default_storage.exists(created["objectKey"]))

        event = AuditLog.objects.get(action="EVIDENCE_DELETED")
        self.assertEqual(event.metadata["sha256"], created["sha256"])

    def test_officer_cannot_delete_after_completion_but_admin_can(self):
        self.auth(self.officer)
        created = self.post_file(png_bytes()).data

        insp_svc.add_measurement(
            user=self.officer, inspection=self.inspection, label="Zero",
            nominal_value=0, observed_value=0, unit="kg",
        )
        insp_svc.complete_inspection(user=self.officer, inspection=self.inspection, result="PASS")

        response = self.client.delete(reverse("evidence-detail", args=[created["id"]]))
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

        self.auth(self.admin)
        response = self.client.delete(reverse("evidence-detail", args=[created["id"]]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(
            AuditLog.objects.get(action="EVIDENCE_DELETED").metadata["inspectionCompleted"]
        )

    def test_business_cannot_delete(self):
        self.auth(self.officer)
        created = self.post_file(png_bytes()).data

        self.auth(self.owner_a)
        response = self.client.delete(reverse("evidence-detail", args=[created["id"]]))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Evidence.objects.exists())
