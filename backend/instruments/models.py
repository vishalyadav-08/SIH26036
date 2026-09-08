import uuid

from django.core.validators import MinValueValidator
from django.db import models


class Instrument(models.Model):
    """Registry and passport identity for a regulated instrument.

    Capacity and tolerance values are DEMO/CONFIGURABLE in the prototype
    (ADR-016) — nothing here asserts a statutory limit.
    """

    class InstrumentType(models.TextChoices):
        ELECTRONIC_SCALE = "ELECTRONIC_SCALE", "Electronic scale"
        PLATFORM_SCALE = "PLATFORM_SCALE", "Platform scale (industrial)"
        COUNTER_SCALE = "COUNTER_SCALE", "Counter scale (retail)"
        WEIGHBRIDGE = "WEIGHBRIDGE", "Weighbridge"
        SPRING_BALANCE = "SPRING_BALANCE", "Spring balance (mechanical)"
        FUEL_DISPENSER = "FUEL_DISPENSER", "Fuel dispenser"
        BEAM_SCALE = "BEAM_SCALE", "Beam scale"
        WEIGHT_SET = "WEIGHT_SET", "Weight set"
        MEASURING_TAPE = "MEASURING_TAPE", "Measuring tape"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        """The instrument lifecycle from DATA_MODEL.md.

        REGISTERED is deliberately distinct from ACTIVE. A newly recorded
        instrument has not been verified by anyone, and defaulting it to
        ACTIVE would have the software assert a verification that never
        happened — the exact claim the prototype boundary forbids. Only a PASS
        inspection moves an instrument to ACTIVE.
        """

        REGISTERED = "REGISTERED", "Registered — not yet verified"
        ACTIVE = "ACTIVE", "Active — verification current"
        PENDING_VERIFICATION = "PENDING_VERIFICATION", "Pending verification"
        EXPIRED = "EXPIRED", "Expired"
        REJECTED = "REJECTED", "Rejected"
        INACTIVE = "INACTIVE", "Inactive"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    business = models.ForeignKey(
        "businesses.Business",
        on_delete=models.PROTECT,
        related_name="instruments",
    )

    instrument_number = models.CharField(max_length=50)
    serial_number = models.CharField(max_length=50)

    instrument_type = models.CharField(max_length=20, choices=InstrumentType.choices)

    manufacturer = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    capacity = models.DecimalField(
        max_digits=12, decimal_places=3, validators=[MinValueValidator(0.001)]
    )
    capacity_unit = models.CharField(max_length=10)

    location = models.CharField(max_length=200)

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.REGISTERED
    )

    # Set by the certificate module (CERT-001) once issuance exists.
    next_due_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            # "Unique within the applicable business scope" — two businesses
            # may legitimately use the same internal numbering.
            models.UniqueConstraint(
                fields=["business", "instrument_number"],
                name="unique_instrument_number_per_business",
            ),
            models.UniqueConstraint(
                fields=["business", "serial_number"],
                name="unique_serial_number_per_business",
            ),
        ]

    def __str__(self):
        return f"{self.instrument_number} ({self.instrument_type})"
