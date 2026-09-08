import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "root.settings")
django.setup()

import uuid
from datetime import timezone
from django.utils import timezone as tz
from django.core.files.uploadedfile import SimpleUploadedFile
import io
from PIL import Image

from authentication.models import User
from applications.models import Application
from inspections import services as insp_svc
from evidence.services import store_evidence
from certificates import services as cert_svc

lmo = User.objects.get(email="vinod.sharma@lmo.up.gov.demo")
app = Application.objects.get(application_number="LM-GKP-2026-0001")

print("1. Starting offline inspection cache simulation...")
# In offline mode, the Flutter app captures readings and evidence locally.
# When network restores, it sends the SyncRecord. Since we are checking backend behavior,
# we will simulate the Sync processing payload.

from sync.views import SyncBatchView
from django.test import RequestFactory
import json
from rest_framework.test import APIRequestFactory, force_authenticate
from sync.models import SyncRecord

# Evidence payload must be uploaded first via REST or sync? The Sync model says evidence can be attached or uploaded earlier.
# Wait, let's use the standard service path the Sync processor takes.
i1 = insp_svc.start_inspection(user=lmo, application=app)
insp_svc.add_measurement(user=lmo, inspection=i1, label="Zero load", nominal_value=0, observed_value=0, unit="kg")
insp_svc.add_measurement(user=lmo, inspection=i1, label="Half load", nominal_value=15, observed_value=15.005, unit="kg")
insp_svc.add_measurement(user=lmo, inspection=i1, label="Full load", nominal_value=30, observed_value=30.010, unit="kg")

image = Image.new("RGB", (320, 200), (40, 60, 120))
buffer = io.BytesIO()
image.save(buffer, format="PNG")
img_file = SimpleUploadedFile("nameplate.png", buffer.getvalue(), "image/png")

# Use public Gorakhpur coordinates
GKP_LAT = "26.760600"
GKP_LNG = "83.373200"

store_evidence(user=lmo, inspection=i1, uploaded=img_file,
               evidence_type="NAMEPLATE_PHOTO", captured_at=tz.now(),
               latitude=GKP_LAT, longitude=GKP_LNG, gps_accuracy_meters=15,
               notes="Essae DS-215 nameplate matches.")

i1 = insp_svc.complete_inspection(user=lmo, inspection=i1, result="PASS", notes="Demo offline inspection verified.")

print("2. Certificate issuance...")
c1 = cert_svc.issue_certificate(user=lmo, inspection=i1)
print(f"Certificate {c1.certificate_number} issued successfully.")

print("3. Public Verification...")
res = cert_svc.verify_certificate(c1.certificate_number)
print(f"Verify intact certificate: {res['verificationStatus']}")

# Tampering
c1.digital_signature = "TAMPERED_BYTES"
c1.save(update_fields=["digital_signature"])
res_tamp = cert_svc.verify_certificate(c1.certificate_number)
print(f"Verify tampered certificate: {res_tamp['verificationStatus']}")
