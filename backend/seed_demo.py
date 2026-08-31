"""Synthetic demo data for the 3 Sept showcase (ADR-016).

Idempotent: safe to re-run before a rehearsal. Everything here is synthetic —
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
from instruments.models import Instrument

PASSWORD = "synthetic-password"

# Reset in dependency order.
Certificate.objects.all().delete()
Inspection.objects.all().delete()
Application.objects.all().delete()
Instrument.objects.all().delete()
User.objects.exclude(is_superuser=True).delete()
Business.objects.all().delete()
AuditLog.objects.all().delete()

biz = Business.objects.create(
    legal_name="Synthetic Retail Ltd", trade_name="Demo Store",
    contact_name="Demo Owner", email="owner@example.test",
    phone="0000000000", address="Synthetic address, DEMO district",
    jurisdiction_label="DEMO",
)

owner = User.objects.create_user(
    email="business@example.test", password=PASSWORD,
    display_name="Demo Business Owner", role=User.Role.BUSINESS, business=biz)
officer = User.objects.create_user(
    email="officer@example.test", password=PASSWORD,
    display_name="Demo Field Officer", role=User.Role.OFFICER)
admin = User.objects.create_user(
    email="admin@example.test", password=PASSWORD,
    display_name="Demo Supervisor", role=User.Role.ADMIN, is_staff=True)

specs = [
    ("INS-DEMO-001", "SN-SML-500-8891", "ELECTRONIC_SCALE", "Synthetic Metrology Labs", "SML-500", "100.000", "kg", "Main Warehouse, Bay 3"),
    ("INS-DEMO-002", "SN-PSC-1000-4421", "PLATFORM_SCALE", "Synthetic Standard Corp", "PSC-1000", "1000.000", "kg", "Loading Dock"),
    ("INS-DEMO-003", "SN-CTR-020-7733", "COUNTER_SCALE", "Synthetic Metrology Labs", "CTR-20", "20.000", "kg", "Retail Counter 1"),
    ("INS-DEMO-004", "SN-WB-50T-1120", "WEIGHBRIDGE", "Synthetic Heavy Systems", "WB-50T", "50000.000", "kg", "Gate Weighbridge"),
]
instruments = [
    Instrument.objects.create(
        business=biz, instrument_number=n, serial_number=s, instrument_type=t,
        manufacturer=m, model=mo, capacity=c, capacity_unit=u, location=loc)
    for n, s, t, m, mo, c, u, loc in specs
]
print(f"business + {len(instruments)} instruments + 3 users")

# 1) Full happy path -> ACTIVE certificate
a1 = app_svc.create_application(user=owner, instrument_id=instruments[0].id,
                                reason="Periodic verification", submit=True)
a1 = app_svc.assign_officer(user=admin, application=a1, officer_id=officer.id)
a1 = app_svc.schedule_application(user=admin, application=a1,
                                  scheduled_at=timezone.now() + timedelta(days=1))
i1 = insp_svc.start_inspection(user=officer, application=a1)
insp_svc.add_measurement(user=officer, inspection=i1, label="Zero load", nominal_value=0, observed_value=0, unit="kg")
insp_svc.add_measurement(user=officer, inspection=i1, label="Half load", nominal_value=50, observed_value="50.100", unit="kg")
insp_svc.add_measurement(user=officer, inspection=i1, label="Full load", nominal_value=100, observed_value="100.200", unit="kg")
i1 = insp_svc.complete_inspection(user=officer, inspection=i1, result="PASS", notes="Within demo tolerance.")
c1 = cert_svc.issue_certificate(user=officer, inspection=i1)
print(f"  {c1.certificate_number}  ACTIVE   (INS-DEMO-001)")

# 2) A revoked certificate, so the public page can show REVOKED
a2 = app_svc.create_application(user=owner, instrument_id=instruments[1].id,
                                reason="Annual re-verification", submit=True)
a2 = app_svc.assign_officer(user=admin, application=a2, officer_id=officer.id)
a2 = app_svc.schedule_application(user=admin, application=a2, scheduled_at=timezone.now() + timedelta(days=2))
i2 = insp_svc.start_inspection(user=officer, application=a2)
insp_svc.add_measurement(user=officer, inspection=i2, label="Full load", nominal_value=1000, observed_value="1002.000", unit="kg")
i2 = insp_svc.complete_inspection(user=officer, inspection=i2, result="PASS")
c2 = cert_svc.issue_certificate(user=officer, inspection=i2)
cert_svc.revoke_certificate(user=admin, certificate=c2, reason="Demo revocation for showcase")
print(f"  {c2.certificate_number}  REVOKED  (INS-DEMO-002)")

# 3) An expired certificate
a3 = app_svc.create_application(user=owner, instrument_id=instruments[2].id,
                                reason="Initial verification", submit=True)
a3 = app_svc.assign_officer(user=admin, application=a3, officer_id=officer.id)
a3 = app_svc.schedule_application(user=admin, application=a3, scheduled_at=timezone.now() + timedelta(days=3))
i3 = insp_svc.start_inspection(user=officer, application=a3)
insp_svc.add_measurement(user=officer, inspection=i3, label="Full load", nominal_value=20, observed_value="20.050", unit="kg")
i3 = insp_svc.complete_inspection(user=officer, inspection=i3, result="PASS")
c3 = cert_svc.issue_certificate(user=officer, inspection=i3)
c3.valid_until = timezone.now() - timedelta(days=10)
c3.save(update_fields=["valid_until"])
print(f"  {c3.certificate_number}  EXPIRED  (INS-DEMO-003)")

# 4) One still in the queue, so the admin screen has work to show
a4 = app_svc.create_application(user=owner, instrument_id=instruments[3].id,
                                reason="New weighbridge commissioning", submit=True)
print(f"  {a4.application_number}  SUBMITTED (awaiting assignment)")

ok, _ = cert_svc.verify_certificate(c1.certificate_number), None
from audit.services import verify_chain
chain_ok, _ = verify_chain()
print(f"\naudit events: {AuditLog.objects.count()}   chain: {'VALID' if chain_ok else 'BROKEN'}")
print(f"\nAccounts (password: {PASSWORD})")
for e in ["business@example.test", "officer@example.test", "admin@example.test"]:
    print("  " + e)
