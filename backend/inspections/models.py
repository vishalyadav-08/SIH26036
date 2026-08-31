import uuid

from django.conf import settings
from django.db import models


class Inspection(models.Model):
    """A field verification session for one Application.

    `result` is deliberately separate from Application.state. A FAIL is a
    completed inspection, not a failed application — conflating the two is
    explicitly called out in DATA_MODEL.md and TESTING_SECURITY.md test 6.
    """

    class Result(models.TextChoices):
        PASS = "PASS", "Pass"
        FAIL = "FAIL", "Fail"
        REQUIRES_CORRECTION = "REQUIRES_CORRECTION", "Requires correction"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    application = models.OneToOneField(
        "applications.Application", on_delete=models.PROTECT, related_name="inspection"
    )
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="inspections"
    )

    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    result = models.CharField(max_length=20, choices=Result.choices, blank=True)
    notes = models.TextField(max_length=2000, blank=True)

    # GPS may genuinely be unavailable — denied permission, no signal indoors.
    # Null means "not captured" and must never be rendered as 0,0.
    gps_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    gps_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    gps_accuracy_meters = models.PositiveIntegerField(null=True, blank=True)

    # Device capture time vs server receipt time are different facts; an
    # offline inspection may be captured hours before it syncs.
    captured_at = models.DateTimeField(null=True, blank=True)

    client_operation_id = models.UUIDField(null=True, blank=True, unique=True)
    version = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"Inspection {self.id} ({self.result or 'in progress'})"


class Measurement(models.Model):
    """One reading taken during an inspection. Demo tolerances (ADR-016)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    inspection = models.ForeignKey(
        Inspection, on_delete=models.CASCADE, related_name="measurements"
    )

    label = models.CharField(max_length=100)
    nominal_value = models.DecimalField(max_digits=12, decimal_places=3)
    observed_value = models.DecimalField(max_digits=12, decimal_places=3)
    unit = models.CharField(max_length=10)
    within_tolerance = models.BooleanField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
