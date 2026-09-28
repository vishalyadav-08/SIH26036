import os
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "root.settings")
django.setup()

from jurisdiction.models import State, Division, District, JurisdictionAssignment, OfficerDesignation
from standards.models import SealInventory, SealType, SealAllocation, VerificationStandard, StandardType
from authentication.models import User

# Clean up
JurisdictionAssignment.objects.all().delete()
District.objects.all().delete()
Division.objects.all().delete()
State.objects.all().delete()

SealAllocation.objects.all().delete()
SealInventory.objects.all().delete()
VerificationStandard.objects.all().delete()

print("Seeding Jurisdiction...")
up = State.objects.create(code="UP", name="Uttar Pradesh", official_language="hi", controller_email="controller@up.gov.in")
mh = State.objects.create(code="MH", name="Maharashtra", official_language="mr", controller_email="controller@mh.gov.in")

gkp_div = Division.objects.create(state=up, code="GKP-DIV", name="Gorakhpur Division", headquarters_city="Gorakhpur")
lko_div = Division.objects.create(state=up, code="LKO-DIV", name="Lucknow Division", headquarters_city="Lucknow")

gkp_dist = District.objects.create(division=gkp_div, code="GKP", name="Gorakhpur", pin_codes=["273001", "273002"])
deoria_dist = District.objects.create(division=gkp_div, code="DEO", name="Deoria")

lko_dist = District.objects.create(division=lko_div, code="LKO", name="Lucknow")

# Assign Officer (Vinod Sharma)
try:
    lmo_user = User.objects.get(email="lmo@mapansetu.in")
    JurisdictionAssignment.objects.create(
        officer=lmo_user,
        designation=OfficerDesignation.LMO,
        state=up,
        division=gkp_div,
        district=gkp_dist,
        active_from=timezone.now().date() - timedelta(days=365)
    )
except User.DoesNotExist:
    print("Warning: lmo@mapansetu.in not found, skipping assignment")

print("Seeding Standards & Seals...")

lead_inv = SealInventory.objects.create(
    state=up,
    seal_type=SealType.LEAD,
    series_prefix="UP-L-26",
    starting_number=10001,
    ending_number=20000,
)

SealInventory.objects.create(
    state=up,
    seal_type=SealType.HOLOGRAPHIC,
    series_prefix="UP-H-26",
    starting_number=50001,
    ending_number=60000,
)

if 'lmo_user' in locals():
    SealAllocation.objects.create(
        inventory=lead_inv,
        officer=lmo_user,
        starting_number=10001,
        ending_number=10500
    )

VerificationStandard.objects.create(
    state=up,
    standard_type=StandardType.WORKING,
    equipment_name="Working Standard Mass Set (1mg-20kg)",
    identification_number="UP/WS/GKP/001",
    calibration_date=timezone.now().date() - timedelta(days=90),
    next_calibration_due=timezone.now().date() + timedelta(days=275),
    calibrated_by="RRSL New Delhi"
)

VerificationStandard.objects.create(
    state=up,
    standard_type=StandardType.WORKING,
    equipment_name="Working Standard Capacity Measure (20L)",
    identification_number="UP/WC/GKP/002",
    calibration_date=timezone.now().date() - timedelta(days=120),
    next_calibration_due=timezone.now().date() + timedelta(days=245),
    calibrated_by="RRSL New Delhi"
)

print("✅ Jurisdiction and Standards successfully seeded!")
