"""Comprehensive demo data seed for MapanSetu SIH Demo Video.

Creates realistic data across ALL modules:
  - 4 Businesses with full details
  - 10 Instruments (3 existing + 7 new)
  - Multiple Officers
  - License Applications (Manufacturer, Dealer, Repairer, Packer)
  - Fee Schedules
  - Verification Applications → Inspections → Certificates
  - Compliance Returns with Production/Sale/Repair records
  - Notifications
  - Full Audit Trail

Idempotent: safe to re-run. Wipes and re-creates all demo data.
"""
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "root.settings")
django.setup()

from datetime import timedelta, date
from decimal import Decimal
from django.utils import timezone

from applications.models import Application
from applications import services as app_svc
from audit.models import AuditLog
from authentication.models import User
from businesses.models import Business
from certificates.models import Certificate
from certificates import services as cert_svc
from compliance.models import QuarterlyReturn, ProductionRecord, SaleRecord, RepairRecord
from enforcement.models import *  # noqa — import whatever exists
from evidence.models import Evidence
from evidence.services import store_evidence
from inspections.models import Inspection, Measurement
from inspections import services as insp_svc
from instruments.models import Instrument
from licensing.models import LicenseApplication, License, LicenseDocument
from notifications.models import Notification
from notifications.services import expiry_warnings
from payments.models import FeeSchedule, PaymentTransaction
from scheduling.models import Schedule

import traceback

PASSWORD = "synthetic-password"

# ─── Helper ────────────────────────────────────────────────────────────────────
def synthetic_photo(label, colour):
    """A small generated PNG for demo evidence."""
    import io
    from django.core.files.uploadedfile import SimpleUploadedFile
    from PIL import Image, ImageDraw

    image = Image.new("RGB", (320, 200), colour)
    ImageDraw.Draw(image).text((12, 12), f"DEMO {label}", fill=(255, 255, 255))
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return SimpleUploadedFile(f"{label.lower().replace(' ', '_')}.png", buffer.getvalue(), "image/png")


print("=" * 70)
print("  MapanSetu Full Demo Data Seed")
print("=" * 70)

# ─── 1. CLEAN UP ──────────────────────────────────────────────────────────────
print("\n[1/10] Cleaning existing data...")
for model in [
    Notice, EnforcementAction, ConsumerComplaint,
    Notification, Certificate, Evidence, Measurement, Inspection,
    Schedule, Application, PaymentTransaction, FeeSchedule,
    RepairRecord, SaleRecord, ProductionRecord, QuarterlyReturn,
    LicenseDocument, License, LicenseApplication,
    Instrument,
]:
    try:
        model.objects.all().delete()
    except Exception:
        pass

User.objects.exclude(is_superuser=True).delete()
Business.objects.all().delete()
AuditLog.objects.all().delete()
print("   ✓ All demo data cleared")

# Gorakhpur coordinates
GKP_LAT, GKP_LNG = "26.760600", "83.373200"

# ─── 2. BUSINESSES ────────────────────────────────────────────────────────────
print("\n[2/10] Creating businesses...")

biz1 = Business.objects.create(
    legal_name="Shree Balaji Weighing Solutions",
    trade_name="Shree Balaji Weighing Solutions",
    constitution_type="PROPRIETORSHIP",
    gst_number="09ABCDE1234F1Z5",
    pan_number="ABCDE1234F",
    is_dealer=True,
    contact_name="Rajesh Kumar Gupta",
    email="info@shreebalaji.demo",
    phone="9876543210",
    address="Shop No. 12, Golghar Market, Gorakhpur, Uttar Pradesh",
    pincode="273001",
    jurisdiction_label="Gorakhpur District",
)

biz2 = Business.objects.create(
    legal_name="Delhi Precision Instruments Pvt Ltd",
    trade_name="DPI Instruments",
    constitution_type="PRIVATE_LIMITED",
    gst_number="07AAGCD5678E1ZR",
    pan_number="AAGCD5678E",
    is_manufacturer=True,
    is_dealer=True,
    contact_name="Arun Mehta",
    email="arun@dpinstruments.com",
    phone="9811234567",
    address="Plot 45-A, Okhla Industrial Area Phase-II, New Delhi, Delhi",
    pincode="110020",
    jurisdiction_label="South Delhi Zone",
)

biz3 = Business.objects.create(
    legal_name="Ganga Petroleum & Fuel Services",
    trade_name="Ganga Fuel Station",
    constitution_type="PARTNERSHIP",
    gst_number="09AAHFG7890K1Z3",
    pan_number="AAHFG7890K",
    is_dealer=True,
    contact_name="Suresh Tiwari",
    email="suresh@gangafuel.in",
    phone="9415678901",
    address="NH-28, Near Railway Crossing, Gorakhpur-Lucknow Highway, Gorakhpur, UP",
    pincode="273014",
    jurisdiction_label="Gorakhpur District",
)

biz4 = Business.objects.create(
    legal_name="Kisan Agro Traders",
    trade_name="Kisan Agro",
    constitution_type="PROPRIETORSHIP",
    gst_number="09BNZPY1234L1Z8",
    pan_number="BNZPY1234L",
    is_packer=True,
    contact_name="Ram Bahadur Yadav",
    email="kisan.agro@gmail.com",
    phone="8765432109",
    address="Mandi Samiti Complex, Rapti Nagar, Gorakhpur, Uttar Pradesh",
    pincode="273004",
    jurisdiction_label="Gorakhpur District",
)

print(f"   ✓ 4 businesses created")

# ─── 3. USERS ─────────────────────────────────────────────────────────────────
print("\n[3/10] Creating users...")

# Business users
owner1 = User.objects.create_user(
    email="info@shreebalaji.demo", password=PASSWORD,
    display_name="Rajesh Kumar Gupta", role=User.Role.BUSINESS, business=biz1)
User.objects.create_user(
    email="business@mapansetu.in", password=PASSWORD,
    display_name="Shree Balaji Weighing Solutions", role=User.Role.BUSINESS, business=biz1)

owner2 = User.objects.create_user(
    email="arun@dpinstruments.com", password=PASSWORD,
    display_name="Arun Mehta", role=User.Role.BUSINESS, business=biz2)

owner3 = User.objects.create_user(
    email="suresh@gangafuel.in", password=PASSWORD,
    display_name="Suresh Tiwari", role=User.Role.BUSINESS, business=biz3)

owner4 = User.objects.create_user(
    email="kisan.agro@gmail.com", password=PASSWORD,
    display_name="Ram Bahadur Yadav", role=User.Role.BUSINESS, business=biz4)

# LMO users
officer1 = User.objects.create_user(
    email="vinod.sharma@lmo.up.gov.demo", password=PASSWORD,
    display_name="Vinod Sharma", role=User.Role.LMO)
User.objects.create_user(
    email="lmo@mapansetu.in", password=PASSWORD,
    display_name="Vinod Sharma (LMO)", role=User.Role.LMO)

officer2 = User.objects.create_user(
    email="priya.mishra@lmo.up.gov.demo", password=PASSWORD,
    display_name="Priya Mishra", role=User.Role.LMO)

# GATC users
gatc = User.objects.create_user(
    email="gatc@up.gov.demo", password=PASSWORD,
    display_name="Gorakhpur Approved Test Centre", role=User.Role.GATC)
User.objects.create_user(
    email="gatc@mapansetu.in", password=PASSWORD,
    display_name="Government Approved Test Centre", role=User.Role.GATC)

# Admin users
admin = User.objects.create_user(
    email="admin@up.gov.demo", password=PASSWORD,
    display_name="Dr. Anand Srivastava (Controller)", role=User.Role.ADMIN, is_staff=True)
User.objects.create_user(
    email="admin@mapansetu.in", password=PASSWORD,
    display_name="Central Admin Supervisor", role=User.Role.ADMIN, is_staff=True)

print(f"   ✓ {User.objects.exclude(is_superuser=True).count()} users created")

# ─── 4. INSTRUMENTS ───────────────────────────────────────────────────────────
print("\n[4/10] Creating instruments...")

# Business 1 instruments (Shree Balaji)
specs_biz1 = [
    ("INS-GKP-001", "ES-GKP-2026-001", "ELECTRONIC_SCALE", "Essae", "DS-215", "30.000", "kg", "Gorakhpur Shop Floor"),
    ("INS-GKP-002", "SN-PSC-1000-4421", "PLATFORM_SCALE", "Swastik Systems", "PSC-1000", "500.000", "kg", "Loading Dock, Golghar Market"),
    ("INS-GKP-003", "SN-MT-50M-8891", "MEASURING_TAPE", "Freemans Measures", "Pro-Tape 50", "50.000", "m", "Main Warehouse"),
]

# Business 2 instruments (DPI)
specs_biz2 = [
    ("INS-DPI-001", "SN-ESS-44501-A", "ELECTRONIC_SCALE", "Essae Digitronics Pvt Ltd", "DS-852 Pro", "30.000", "kg", "Factory Floor, Okhla"),
    ("INS-DPI-002", "MT-FM-30M-5590", "MEASURING_TAPE", "Freemans Measures Ltd", "Pro-Tape 30", "30.000", "m", "QC Lab, Okhla"),
]

# Business 3 instruments (Ganga Fuel)
specs_biz3 = [
    ("INS-GFS-001", "FD-GFS-2026-01", "FUEL_DISPENSER", "Tatsuno India Pvt Ltd", "TATSUNO-DUAL-50L", "50.000", "L", "Pump Island 1, NH-28"),
    ("INS-GFS-002", "FD-GFS-2026-02", "FUEL_DISPENSER", "Tatsuno India Pvt Ltd", "TATSUNO-DUAL-50L", "50.000", "L", "Pump Island 2, NH-28"),
]

# Business 4 instruments (Kisan Agro)
specs_biz4 = [
    ("INS-KAT-001", "SN-PSC-500-7782", "PLATFORM_SCALE", "Swastik Systems & Services", "SSS-PF-500", "500.000", "kg", "Mandi Floor, Rapti Nagar"),
    ("INS-KAT-002", "WB-KL-60T-2026", "WEIGHBRIDGE", "Kanta King Weighbridge Systems", "KK-WB-60000", "60000.000", "kg", "Gate Entry, Rapti Nagar"),
    ("INS-KAT-003", "CS-KAT-001", "COUNTER_SCALE", "Essae Digitronics", "DS-450", "5.000", "kg", "Retail Counter, Rapti Nagar"),
]

all_instruments = []
for biz, specs in [(biz1, specs_biz1), (biz2, specs_biz2), (biz3, specs_biz3), (biz4, specs_biz4)]:
    for n, s, t, m, mo, c, u, loc in specs:
        inst = Instrument.objects.create(
            business=biz, instrument_number=n, serial_number=s,
            instrument_type=t, manufacturer=m, model=mo,
            capacity=c, capacity_unit=u, location=loc,
        )
        all_instruments.append(inst)

print(f"   ✓ {len(all_instruments)} instruments created")

# ─── 5. VERIFICATION APPLICATIONS & INSPECTIONS ──────────────────────────────
print("\n[5/10] Creating verification applications, inspections & certificates...")

# === Path A: SCHEDULED (ready for live demo inspection) ===
a1 = app_svc.create_application(user=owner1, instrument_id=all_instruments[0].id,
                                reason="Periodic verification", submit=True)
a1.application_number = "LM-GKP-2026-0001"
a1.save(update_fields=["application_number"])
a1 = app_svc.assign_officer(user=admin, application=a1, officer_id=officer1.id)
a1 = app_svc.schedule_application(user=admin, application=a1,
                                  scheduled_at=timezone.now() + timedelta(hours=2),
                                  note="Morning slot; inspect Electronic Weighing Scale.")
print(f"   ✓ {a1.application_number} → SCHEDULED (ES-GKP-2026-001, assigned to Vinod Sharma)")

# === Path B: Full pipeline → PASS → VALID certificate ===
# Schedule in the future first (service validates), then backdate
a2 = app_svc.create_application(user=owner1, instrument_id=all_instruments[2].id,
                                reason="Statutory initial verification", submit=True)
a2 = app_svc.assign_officer(user=admin, application=a2, officer_id=officer1.id)
a2 = app_svc.schedule_application(user=admin, application=a2,
                                  scheduled_at=timezone.now() + timedelta(days=1))
# Backdate the schedule for demo realism
Schedule.objects.filter(application=a2, status="CONFIRMED").update(
    scheduled_at=timezone.now() - timedelta(days=5))
a2.scheduled_at = timezone.now() - timedelta(days=5)
a2.save(update_fields=["scheduled_at"])

i2 = insp_svc.start_inspection(user=officer1, application=a2)
insp_svc.add_measurement(user=officer1, inspection=i2, label="Graduation calibration",
                         nominal_value=50, observed_value="50.002", unit="m")
store_evidence(user=officer1, inspection=i2,
               uploaded=synthetic_photo("TAPE VERIFY", (40, 80, 120)),
               evidence_type="MACHINE_PHOTO", captured_at=timezone.now(),
               latitude=GKP_LAT, longitude=GKP_LNG, gps_accuracy_meters=5)
i2 = insp_svc.complete_inspection(user=officer1, inspection=i2, result="PASS")
c2 = cert_svc.issue_certificate(user=officer1, inspection=i2)
print(f"   ✓ {c2.certificate_number} → VALID (Measuring Tape INS-GKP-003)")

# === Path C: Full pipeline → PASS → then REVOKED certificate ===
a3 = app_svc.create_application(user=owner1, instrument_id=all_instruments[1].id,
                                reason="Annual re-verification", submit=True)
a3 = app_svc.assign_officer(user=admin, application=a3, officer_id=officer1.id)
a3 = app_svc.schedule_application(user=admin, application=a3,
                                  scheduled_at=timezone.now() + timedelta(days=2))
# Backdate
Schedule.objects.filter(application=a3, status="CONFIRMED").update(
    scheduled_at=timezone.now() - timedelta(days=10))
a3.scheduled_at = timezone.now() - timedelta(days=10)
a3.save(update_fields=["scheduled_at"])

i3 = insp_svc.start_inspection(user=officer1, application=a3)
insp_svc.add_measurement(user=officer1, inspection=i3, label="Full load test",
                         nominal_value=500, observed_value="501.200", unit="kg")
store_evidence(user=officer1, inspection=i3,
               uploaded=synthetic_photo("PLATFORM SCALE", (90, 60, 30)),
               evidence_type="MACHINE_PHOTO", captured_at=timezone.now(),
               latitude=GKP_LAT, longitude=GKP_LNG, gps_accuracy_meters=9)
i3 = insp_svc.complete_inspection(user=officer1, inspection=i3, result="PASS")
c3 = cert_svc.issue_certificate(user=officer1, inspection=i3)
cert_svc.revoke_certificate(user=admin, certificate=c3, reason="Demo revocation for showcase — suspected tampering")
print(f"   ✓ {c3.certificate_number} → REVOKED (Platform Scale INS-GKP-002)")

# === Path D: Fuel dispenser → PASS ===
a4 = app_svc.create_application(user=owner3, instrument_id=all_instruments[5].id,
                                reason="Initial verification of newly installed fuel dispenser", submit=True)
a4 = app_svc.assign_officer(user=admin, application=a4, officer_id=officer2.id)
a4 = app_svc.schedule_application(user=admin, application=a4,
                                  scheduled_at=timezone.now() + timedelta(days=3))
# Backdate
Schedule.objects.filter(application=a4, status="CONFIRMED").update(
    scheduled_at=timezone.now() - timedelta(days=3))
a4.scheduled_at = timezone.now() - timedelta(days=3)
a4.save(update_fields=["scheduled_at"])

i4 = insp_svc.start_inspection(user=officer2, application=a4)
insp_svc.add_measurement(user=officer2, inspection=i4, label="5L volumetric test",
                         nominal_value=5, observed_value="5.003", unit="L")
insp_svc.add_measurement(user=officer2, inspection=i4, label="10L volumetric test",
                         nominal_value=10, observed_value="10.008", unit="L")
store_evidence(user=officer2, inspection=i4,
               uploaded=synthetic_photo("FUEL DISPENSER", (20, 60, 100)),
               evidence_type="MACHINE_PHOTO", captured_at=timezone.now(),
               latitude="26.755800", longitude="83.380100", gps_accuracy_meters=7)
i4 = insp_svc.complete_inspection(user=officer2, inspection=i4, result="PASS")
c4 = cert_svc.issue_certificate(user=officer2, inspection=i4)
print(f"   ✓ {c4.certificate_number} → VALID (Fuel Dispenser INS-GFS-001)")

# === Path E: SUBMITTED (no officer yet, for demo assignment) ===
a5 = app_svc.create_application(user=owner4, instrument_id=all_instruments[8].id,
                                reason="Statutory verification of weighbridge after relocation", submit=True)
print(f"   ✓ {a5.application_number} → SUBMITTED (Weighbridge, awaiting assignment)")

# === Path F: DPI electronic scale → ASSIGNED (officer, no schedule yet) ===
a6 = app_svc.create_application(user=owner2, instrument_id=all_instruments[3].id,
                                reason="Annual periodic verification of factory floor scale", submit=True)
a6 = app_svc.assign_officer(user=admin, application=a6, officer_id=officer1.id)
print(f"   ✓ {a6.application_number} → ASSIGNED (DPI Electronic Scale)")

# ─── 6. FEE SCHEDULES & PAYMENT ──────────────────────────────────────────────
print("\n[6/10] Creating fee schedules...")

fee_data = [
    ("MANUFACTURER_LICENSE_NEW", "", 5000, 2000, "2025-04-01"),
    ("MANUFACTURER_LICENSE_RENEWAL", "", 3000, 1500, "2025-04-01"),
    ("DEALER_LICENSE_NEW", "", 2000, 800, "2025-04-01"),
    ("DEALER_LICENSE_RENEWAL", "", 1500, 600, "2025-04-01"),
    ("REPAIRER_LICENSE_NEW", "", 2000, 800, "2025-04-01"),
    ("REPAIRER_LICENSE_RENEWAL", "", 1500, 600, "2025-04-01"),
    ("PACKER_REGISTRATION", "", 1000, 0, "2025-04-01"),
    ("VERIFICATION_FEE", "ELECTRONIC_SCALE", 450, 0, "2025-04-01"),
    ("VERIFICATION_FEE", "PLATFORM_SCALE", 850, 0, "2025-04-01"),
    ("VERIFICATION_FEE", "WEIGHBRIDGE", 3500, 0, "2025-04-01"),
    ("VERIFICATION_FEE", "FUEL_DISPENSER", 1500, 0, "2025-04-01"),
    ("DUPLICATE_LICENSE", "", 500, 0, "2025-04-01"),
    ("COMPOUNDING_FEE", "", 10000, 0, "2025-04-01"),
    ("AMENDMENT_FEE", "", 500, 0, "2025-04-01"),
]

for svc_type, cat, base, per_yr, eff_from in fee_data:
    FeeSchedule.objects.create(
        state_code="UP",
        service_type=svc_type,
        instrument_category=cat,
        base_fee=Decimal(str(base)),
        per_year_fee=Decimal(str(per_yr)),
        gst_percent=Decimal("18") if "LICENSE" in svc_type or "REGISTRATION" in svc_type else Decimal("0"),
        effective_from=date.fromisoformat(eff_from),
        created_by=admin,
    )
print(f"   ✓ {FeeSchedule.objects.count()} fee schedules created")

# Demo payment transactions
pt1 = PaymentTransaction.objects.create(
    transaction_reference="TXN-2026-GKP-00001",
    payer_business=biz1, payer_user=owner1,
    service_type="VERIFICATION_FEE",
    related_entity_type="APPLICATION",
    related_entity_id=a1.id,
    amount=Decimal("450.00"),
    fee_breakdown={"base": 450, "surcharge": 0, "gst": 0, "total": 450},
    gateway="DEMO", status="SUCCESS",
    paid_at=timezone.now() - timedelta(days=1),
)

pt2 = PaymentTransaction.objects.create(
    transaction_reference="TXN-2026-GKP-00002",
    payer_business=biz3, payer_user=owner3,
    service_type="VERIFICATION_FEE",
    related_entity_type="APPLICATION",
    related_entity_id=a4.id,
    amount=Decimal("1500.00"),
    fee_breakdown={"base": 1500, "surcharge": 0, "gst": 0, "total": 1500},
    gateway="DEMO", status="SUCCESS",
    paid_at=timezone.now() - timedelta(days=4),
)

pt3 = PaymentTransaction.objects.create(
    transaction_reference="TXN-2026-GKP-00003",
    payer_business=biz4, payer_user=owner4,
    service_type="VERIFICATION_FEE",
    related_entity_type="APPLICATION",
    related_entity_id=a5.id,
    amount=Decimal("3500.00"),
    fee_breakdown={"base": 3500, "surcharge": 0, "gst": 0, "total": 3500},
    gateway="DEMO", status="SUCCESS",
    paid_at=timezone.now(),
)

print(f"   ✓ {PaymentTransaction.objects.count()} payment transactions created")

# ─── 7. LICENSE APPLICATIONS ─────────────────────────────────────────────────
print("\n[7/10] Creating license applications...")

# Manufacturer license (DPI) — APPROVED
la1 = LicenseApplication.objects.create(
    application_number="LIC-MFG-2026-001",
    business=biz2, submitted_by=owner2,
    category="MANUFACTURER", license_type="NEW",
    validity_years=3,
    state="APPROVED",
    reviewing_officer=officer1,
    approval_date=date(2026, 6, 15),
    premises_address="Plot 45-A, Okhla Industrial Area Phase-II, New Delhi, Delhi 110020",
    premises_proof_type="OWNED",
    gst_number="07AAGCD5678E1ZR",
    pan_number="AAGCD5678E",
    model_approval_number="CRS/MA-2025/WM/0842",
    machinery_list=["CNC Lathe Machine", "Calibration Test Bench", "Load Cell Assembly Line"],
    technical_staff_count=12,
)

# Issue the license
lic1 = License.objects.create(
    license_number="LIC-MFG-UP-2026-0001",
    business=biz2, application=la1,
    category="MANUFACTURER",
    issued_date=date(2026, 6, 15),
    valid_from=date(2026, 6, 15),
    valid_until=date(2029, 6, 14),
    status="ACTIVE",
    conditions=["Must maintain Model Approval for all manufactured instruments",
                 "Quarterly returns to be filed within 15 days of quarter end"],
)

# Dealer license (Shree Balaji) — APPROVED
la2 = LicenseApplication.objects.create(
    application_number="LIC-DLR-2026-001",
    business=biz1, submitted_by=owner1,
    category="DEALER", license_type="NEW",
    validity_years=1,
    state="APPROVED",
    reviewing_officer=officer1,
    approval_date=date(2026, 3, 1),
    premises_address="Shop No. 12, Golghar Market, Gorakhpur, Uttar Pradesh 273001",
    premises_proof_type="RENTED",
    gst_number="09ABCDE1234F1Z5",
    pan_number="ABCDE1234F",
    dealership_authorization="Authorized dealer of Essae Digitronics Pvt Ltd (Ref: ED/AUTH/2025/1847)",
)

lic2 = License.objects.create(
    license_number="LIC-DLR-UP-GKP-2026-0001",
    business=biz1, application=la2,
    category="DEALER",
    issued_date=date(2026, 3, 1),
    valid_from=date(2026, 3, 1),
    valid_until=date(2027, 2, 28),
    status="ACTIVE",
)

# Repairer license — UNDER_REVIEW
la3 = LicenseApplication.objects.create(
    application_number="LIC-RPR-2026-001",
    business=biz1, submitted_by=owner1,
    category="REPAIRER", license_type="NEW",
    validity_years=2,
    state="UNDER_REVIEW",
    reviewing_officer=officer2,
    premises_address="B-12, Industrial Estate, Sahibabad, Ghaziabad, UP 201010",
    premises_proof_type="LEASED",
    gst_number="09AAHFR3456G1Z7",
    pan_number="AAHFR3456G",
    qualification_details="ITI Diploma (Instrument Mechanic), 8 years field experience. Trained at Essae Service Centre.",
    equipment_list=["Standard Weight Set (1mg - 20kg)", "Digital Multimeter", "Load Cell Tester", "Calibration Software Suite"],
)

# Packer registration — SUBMITTED
la4 = LicenseApplication.objects.create(
    application_number="LIC-PKR-2026-001",
    business=biz4, submitted_by=owner4,
    category="PACKER_IMPORTER", license_type="NEW",
    validity_years=1,
    state="SUBMITTED",
    premises_address="Mandi Samiti Complex, Rapti Nagar, Gorakhpur, UP 273004",
    premises_proof_type="OWNED",
    gst_number="09BNZPY1234L1Z8",
    pan_number="BNZPY1234L",
    commodity_list=["Basmati Rice (5kg, 10kg, 25kg)", "Wheat Flour (1kg, 5kg, 10kg)", "Pulses (1kg, 2kg)"],
    iec_code="0609012345",
    sample_labels=["FSSAI Compliant with MRP, Net Qty, Manufacturer, Batch No"],
)

print(f"   ✓ {LicenseApplication.objects.count()} license applications")
print(f"   ✓ {License.objects.count()} issued licenses")

# ─── 8. COMPLIANCE RETURNS ────────────────────────────────────────────────────
print("\n[8/10] Creating compliance returns...")

qr1 = QuarterlyReturn.objects.create(
    business=biz2, submitted_by=owner2, license=lic1,
    financial_year="2026-2027", quarter="Q1",
    status="SUBMITTED",
    total_manufactured=280, total_sold=220, total_repaired=15,
    submission_date=timezone.now() - timedelta(days=85),
    due_date=date(2026, 7, 15),
)

ProductionRecord.objects.create(
    quarterly_return=qr1, instrument_type="Electronic Scale Class II",
    quantity_manufactured=150, remarks="Regular production batch")
ProductionRecord.objects.create(
    quarterly_return=qr1, instrument_type="Counter Scale Class III",
    quantity_manufactured=130, remarks="New model launch")

SaleRecord.objects.create(
    quarterly_return=qr1, instrument_type="Electronic Scale Class II",
    buyer_name="Shree Balaji Weighing Solutions",
    buyer_address="Gorakhpur, UP",
    quantity=40, dispatch_date=date(2026, 5, 12),
    invoice_number="DPI/2026/1001")
SaleRecord.objects.create(
    quarterly_return=qr1, instrument_type="Counter Scale Class III",
    buyer_name="Metro Retail Instruments",
    buyer_address="Lucknow, UP",
    quantity=60, dispatch_date=date(2026, 6, 20),
    invoice_number="DPI/2026/1102")

qr2 = QuarterlyReturn.objects.create(
    business=biz2, submitted_by=owner2, license=lic1,
    financial_year="2026-2027", quarter="Q2",
    status="DRAFT",
    total_manufactured=340, total_sold=285, total_repaired=22,
    due_date=date(2026, 10, 15),
)

ProductionRecord.objects.create(
    quarterly_return=qr2, instrument_type="Electronic Scale Class II",
    quantity_manufactured=180, remarks="Increased demand")
ProductionRecord.objects.create(
    quarterly_return=qr2, instrument_type="Counter Scale Class III",
    quantity_manufactured=160)

SaleRecord.objects.create(
    quarterly_return=qr2, instrument_type="Electronic Scale",
    buyer_name="Shree Balaji Weighing Solutions",
    buyer_address="Gorakhpur, UP",
    quantity=50, dispatch_date=date(2026, 8, 12),
    invoice_number="DPI/2026/1234")

RepairRecord.objects.create(
    quarterly_return=qr2, instrument_type="Electronic Scale Class II",
    owner_name="Ravi Medical Store",
    nature_of_repair="Load cell replacement and re-calibration",
    repair_date=date(2026, 8, 5),
    verification_certificate_number=c2.certificate_number if c2 else "")

print(f"   ✓ {QuarterlyReturn.objects.count()} quarterly returns with records")

# ─── 9. NOTIFICATIONS ────────────────────────────────────────────────────────
print("\n[9/10] Creating notifications...")

# Generate system notifications
try:
    expiry_warnings()
except Exception:
    pass

# The user logs in as business@mapansetu.in (biz_user) and admin@mapansetu.in (admin_user)
biz_user = User.objects.get(email="business@mapansetu.in")
admin_user = User.objects.get(email="admin@mapansetu.in")

# Additional demo notifications
notif_data = [
    (biz_user, "APPLICATION_UPDATE", "Application Assigned",
     f"Your application {a1.application_number} has been assigned to Inspector Vinod Sharma for field verification.",
     a1.id, "Application"),
    (biz_user, "SCHEDULE_UPDATE", "Inspection Scheduled",
     f"Field inspection for {all_instruments[0].instrument_number} is scheduled for tomorrow at 10:00 AM. Inspector: Vinod Sharma.",
     a1.id, "Application"),
    (biz_user, "CERTIFICATE_ISSUED", "Certificate Issued",
     f"Verification certificate {c2.certificate_number} has been issued for your Measuring Tape. Valid for 1 year.",
     c2.id, "Certificate"),
    (biz_user, "CERTIFICATE_REVOKED", "Certificate Revoked",
     f"Certificate {c3.certificate_number} for Platform Scale has been revoked. Reason: Suspected tampering.",
     c3.id, "Certificate"),
    (owner3, "CERTIFICATE_ISSUED", "Certificate Issued",
     f"Verification certificate {c4.certificate_number} has been issued for your Fuel Dispenser. Valid for 1 year.",
     c4.id, "Certificate"),
    (officer1, "APPLICATION_UPDATE", "New Application Assigned",
     f"Application {a1.application_number} (Electronic Scale at Gorakhpur Shop Floor) has been assigned to you.",
     a1.id, "Application"),
    (officer1, "SCHEDULE_UPDATE", "Inspection Due Tomorrow",
     f"You have an inspection scheduled for tomorrow: {all_instruments[0].instrument_number} at Gorakhpur Shop Floor.",
     a1.id, "Application"),
    (admin_user, "GENERAL", "Weekly Summary",
     "This week: 6 applications received, 3 inspections completed, 2 certificates issued, 1 revoked.",
     None, ""),
    (biz_user, "EXPIRY_WARNING", "License Renewal Due",
     "Your Dealer License LIC-DLR-UP-GKP-2026-0001 expires on 28 Feb 2027. Apply for renewal to avoid penalty.",
     None, "License"),
    (owner4, "APPLICATION_UPDATE", "Application Received",
     f"Your weighbridge verification application {a5.application_number} has been received. Awaiting officer assignment.",
     a5.id, "Application"),
]

for recip, ntype, title, msg, eid, etype in notif_data:
    Notification.objects.create(
        recipient=recip,
        type=ntype,
        title=title,
        message=msg,
        related_entity_type=etype,
        related_entity_id=eid,
    )

print(f"   ✓ {Notification.objects.count()} notifications created")

# ─── 9.5 ENFORCEMENT ────────────────────────────────────────────────────────
print("\n[9.5/10] Creating enforcement data...")

try:
    c_comp = ConsumerComplaint.objects.create(
        consumer_name="Ramesh Singh",
        consumer_phone="9988776655",
        consumer_email="ramesh.singh@example.com",
        business_name="Local Grocery Store",
        business_address="Main Market, Gorakhpur",
        pincode="273001",
        complaint_type="SHORT_DELIVERY",
        description="Purchased 1kg sugar but weight was found to be 900g on checking.",
        status="INVESTIGATING",
        assigned_officer=officer1
    )
    
    e_action = EnforcementAction.objects.create(
        action_type="SURPRISE_INSPECTION",
        officer=officer1,
        business=biz1,
        address=biz1.address,
        action_date=timezone.now() - timedelta(days=2),
        findings="Found one unverified counter scale being used for transactions.",
    )
    
    Notice.objects.create(
        enforcement_action=e_action,
        notice_number="NTC-GKP-2026-001",
        violation_sections=["Section 24, Legal Metrology Act 2009"],
        status="ISSUED",
        compounding_amount=Decimal("5000.00"),
        due_date=timezone.now() + timedelta(days=15),
        issue_date=timezone.now() - timedelta(days=1)
    )
    print("   ✓ Enforcement data created")
except Exception as e:
    print(f"   ! Could not create enforcement data: {e}")

# ─── 10. VERIFICATION & AUDIT ────────────────────────────────────────────────
print("\n[10/10] Verifying certificates & audit chain...")

try:
    cert_svc.verify_certificate(c2.certificate_number)
    cert_svc.verify_certificate(c3.certificate_number)
    cert_svc.verify_certificate(c4.certificate_number)
except Exception:
    pass

try:
    from audit.services import verify_chain
    chain_ok, _ = verify_chain()
except Exception:
    chain_ok = "UNKNOWN"

# ─── SUMMARY ──────────────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("  SEED COMPLETE — SUMMARY")
print("=" * 70)
print(f"  Businesses:         {Business.objects.count()}")
print(f"  Users:              {User.objects.exclude(is_superuser=True).count()}")
print(f"  Instruments:        {Instrument.objects.count()}")
print(f"  Applications:       {Application.objects.count()}")
print(f"  Inspections:        {Inspection.objects.count()}")
print(f"  Certificates:       {Certificate.objects.count()}")
print(f"  Evidence Items:     {Evidence.objects.count()}")
print(f"  License Apps:       {LicenseApplication.objects.count()}")
print(f"  Issued Licenses:    {License.objects.count()}")
print(f"  Fee Schedules:      {FeeSchedule.objects.count()}")
print(f"  Payments:           {PaymentTransaction.objects.count()}")
print(f"  Quarterly Returns:  {QuarterlyReturn.objects.count()}")
print(f"  Notifications:      {Notification.objects.count()}")
print(f"  Audit Events:       {AuditLog.objects.count()}")
print(f"  Audit Chain:        {'VALID' if chain_ok else 'BROKEN/UNKNOWN'}")

print("\n" + "=" * 70)
print("  DEMO CREDENTIALS")
print("=" * 70)
print(f"  Password for ALL accounts: {PASSWORD}\n")
print("  1. Business Portal:")
print("     - business@mapansetu.in      (Shree Balaji - Gorakhpur)")
print("     - info@shreebalaji.demo      (Shree Balaji - Alt)")
print("     - arun@dpinstruments.com     (DPI Instruments - Delhi)")
print("     - suresh@gangafuel.in        (Ganga Fuel Station)")
print("     - kisan.agro@gmail.com       (Kisan Agro Traders)")
print()
print("  2. LMO / Inspector:")
print("     - lmo@mapansetu.in           (Vinod Sharma)")
print("     - vinod.sharma@lmo.up.gov.demo")
print("     - priya.mishra@lmo.up.gov.demo")
print()
print("  3. GATC:")
print("     - gatc@mapansetu.in")
print("     - gatc@up.gov.demo")
print()
print("  4. Admin / Supervisor:")
print("     - admin@mapansetu.in")
print("     - admin@up.gov.demo")
print("=" * 70)
