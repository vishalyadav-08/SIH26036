"""Synthetic demo data for the 3 Sept showcase (ADR-016).

Idempotent: safe to re-run before a rehearsal. Everything here is synthetic -
no real business, instrument, or person.
"""
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "root.settings")
django.setup()

from datetime import timedelta
from django.utils import timezone

from applications.models import Application
from applications import services as app_svc
from audit.models import AuditLog
from authentication.models import User
from businesses.models import Business
from certificates.models import Certificate
from certificates import services as cert_svc
from inspections.models import Inspection
from inspections import services as insp_svc
from evidence.models import Evidence
from evidence.services import store_evidence
from instruments.models import Instrument
from notifications.models import Notification
from notifications.services import expiry_warnings
from scheduling.models import Schedule

PASSWORD = "synthetic-password"


def synthetic_photo(label, colour):
    """A small generated PNG so the demo has real evidence bytes, not a stub."""
    import io
    from django.core.files.uploadedfile import SimpleUploadedFile
    from PIL import Image, ImageDraw

    image = Image.new("RGB", (320, 200), colour)
    ImageDraw.Draw(image).text((12, 12), f"SYNTHETIC {label}", fill=(255, 255, 255))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")

    return SimpleUploadedFile(f"{label.lower()}.png", buffer.getvalue(), "image/png")

# Reset in dependency order.
Notification.objects.all().delete()
Certificate.objects.all().delete()
Evidence.objects.all().delete()
Inspection.objects.all().delete()
Schedule.objects.all().delete()
Application.objects.all().delete()
Instrument.objects.all().delete()
User.objects.exclude(is_superuser=True).delete()
Business.objects.all().delete()
AuditLog.objects.all().delete()

# Synthetic Gorakhpur coordinate (General public location/city center)
GKP_LAT = "26.760600"
GKP_LNG = "83.373200"

biz = Business.objects.create(
    legal_name="Shree Balaji Weighing Solutions", trade_name="Shree Balaji Weighing Solutions",
    contact_name="Synthetic Biz Owner", email="info@shreebalaji.demo",
    phone="9876543210", address="Gorakhpur, Uttar Pradesh",
    jurisdiction_label="Gorakhpur District",
)

# 1. Business Users
owner = User.objects.create_user(
    email="info@shreebalaji.demo", password=PASSWORD,
    display_name="Synthetic Biz Owner", role=User.Role.BUSINESS, business=biz)
User.objects.create_user(
    email="business@mapansetu.in", password=PASSWORD,
    display_name="Shree Balaji Weighing Solutions", role=User.Role.BUSINESS, business=biz)

# 2. LMO (Legal Metrology Officer) Users
officer = User.objects.create_user(
    email="vinod.sharma@lmo.up.gov.demo", password=PASSWORD,
    display_name="Vinod Sharma", role=User.Role.LMO)
User.objects.create_user(
    email="lmo@mapansetu.in", password=PASSWORD,
    display_name="Vinod Sharma (LMO)", role=User.Role.LMO)

# 3. GATCs (Government Approved Test Centre) Users
gatc = User.objects.create_user(
    email="gatc@up.gov.demo", password=PASSWORD,
    display_name="Demo Test Centre", role=User.Role.GATC)
User.objects.create_user(
    email="gatc@mapansetu.in", password=PASSWORD,
    display_name="Government Approved Test Centre", role=User.Role.GATC)

# 4. Administrator Supervisors
admin = User.objects.create_user(
    email="admin@up.gov.demo", password=PASSWORD,
    display_name="Demo Supervisor", role=User.Role.ADMIN, is_staff=True)
User.objects.create_user(
    email="admin@mapansetu.in", password=PASSWORD,
    display_name="Central Admin Supervisor", role=User.Role.ADMIN, is_staff=True)

# Update instruments list to include the specific required one.
specs = [
    ("INS-GKP-001", "ES-GKP-2026-001", "ELECTRONIC_SCALE", "Essae", "DS-215", "30.000", "kg", "Gorakhpur Shop Floor"),
    ("INS-DEMO-002", "SN-PSC-1000-4421", "PLATFORM_SCALE", "Synthetic Standard Corp", "PSC-1000", "1000.000", "kg", "Loading Dock"),
]
instruments = [
    Instrument.objects.create(
        business=biz, instrument_number=n, serial_number=s, instrument_type=t,
        manufacturer=m, model=mo, capacity=c, capacity_unit=u, location=loc)
    for n, s, t, m, mo, c, u, loc in specs
]
print(f"business + {len(instruments)} instruments + 3 users")

# PRIMARY DEMO PATH: Application LM-GKP-2026-0001 assigned and scheduled for Vinod Sharma
a_primary = app_svc.create_application(user=owner, instrument_id=instruments[0].id,
                                reason="Periodic verification", submit=True)
# Override the application number as requested
a_primary.application_number = "LM-GKP-2026-0001"
a_primary.save(update_fields=["application_number"])

a_primary = app_svc.assign_officer(user=admin, application=a_primary, officer_id=officer.id)
a_primary = app_svc.schedule_application(user=admin, application=a_primary,
                                  scheduled_at=timezone.now() + timedelta(days=1),
                                  note="Morning slot; inspect Electronic Platform Weighing Scale.")
print(f"  {a_primary.application_number}  SCHEDULED (ES-GKP-2026-001, assigned to Vinod Sharma)")

# 2) A revoked certificate for UI testing
a2 = app_svc.create_application(user=owner, instrument_id=instruments[1].id,
                                reason="Annual re-verification", submit=True)
a2 = app_svc.assign_officer(user=admin, application=a2, officer_id=officer.id)
a2 = app_svc.schedule_application(user=admin, application=a2, scheduled_at=timezone.now() + timedelta(days=2))
i2 = insp_svc.start_inspection(user=officer, application=a2)
insp_svc.add_measurement(user=officer, inspection=i2, label="Full load", nominal_value=1000, observed_value="1002.000", unit="kg")
store_evidence(user=officer, inspection=i2, uploaded=synthetic_photo("PLATFORM", (90, 60, 30)),
               evidence_type="MACHINE_PHOTO", captured_at=timezone.now(),
               latitude=GKP_LAT, longitude=GKP_LNG, gps_accuracy_meters=9)
i2 = insp_svc.complete_inspection(user=officer, inspection=i2, result="PASS")
c2 = cert_svc.issue_certificate(user=officer, inspection=i2)
cert_svc.revoke_certificate(user=admin, certificate=c2, reason="Demo revocation for showcase")
print(f"  {c2.certificate_number}  REVOKED  (INS-DEMO-002)")

ok, _ = cert_svc.verify_certificate(c2.certificate_number), None
from audit.services import verify_chain
chain_ok, _ = verify_chain()

print(f"\nevidence items: {Evidence.objects.count()}")
print(f"notifications: {Notification.objects.count()} "
      f"(owner {Notification.objects.filter(recipient=owner).count()}, "
      f"officer {Notification.objects.filter(recipient=officer).count()}, "
      f"admin {Notification.objects.filter(recipient=admin).count()})")
print(f"audit events: {AuditLog.objects.count()}   chain: {'VALID' if chain_ok else 'BROKEN'}")
print("\n" + "=" * 60)
print("DEMO CREDENTIALS GENERATED BY BACKEND:")
print("=" * 60)
print(f"Password for all accounts: {PASSWORD}\n")
print("1. Business Portal:")
print("   - info@shreebalaji.demo")
print("   - business@mapansetu.in")
print("2. LMO (Legal Metrology Officer):")
print("   - vinod.sharma@lmo.up.gov.demo")
print("   - lmo@mapansetu.in")
print("3. GATCs (Government Approved Test Centre):")
print("   - gatc@up.gov.demo")
print("   - gatc@mapansetu.in")
print("4. GATC / Admin Supervisor:")
print("   - admin@up.gov.demo")
print("   - admin@mapansetu.in")
print("=" * 60)
