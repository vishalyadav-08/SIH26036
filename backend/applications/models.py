import uuid

from django.conf import settings
from django.db import models


class Application(models.Model):
    """A verification request for one Instrument.

    State is backend-enforced and is NOT the inspection result: a FAIL still
    moves the application to COMPLETED (DATA_MODEL.md). Conflating the two is
    the mistake this model is shaped to prevent.
    """

    class State(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SUBMITTED = "SUBMITTED", "Submitted"
        ASSIGNED = "ASSIGNED", "Assigned"
        SCHEDULED = "SCHEDULED", "Scheduled"
        INSPECTION_IN_PROGRESS = "INSPECTION_IN_PROGRESS", "Inspection in progress"
        COMPLETED = "COMPLETED", "Completed"
        REJECTED = "REJECTED", "Rejected"
        CANCELLED = "CANCELLED", "Cancelled"

    TERMINAL_STATES = {State.COMPLETED, State.REJECTED, State.CANCELLED}

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    application_number = models.CharField(max_length=30, unique=True)

    instrument = models.ForeignKey(
        "instruments.Instrument", on_delete=models.PROTECT, related_name="applications"
    )
    business = models.ForeignKey(
        "businesses.Business", on_delete=models.PROTECT, related_name="applications"
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="submitted_applications",
    )

    state = models.CharField(max_length=25, choices=State.choices, default=State.DRAFT)
    reason = models.TextField(max_length=500, blank=True)

    requested_at = models.DateTimeField(null=True, blank=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    rejection_reason = models.TextField(max_length=500, blank=True)
    cancellation_reason = models.TextField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.application_number} ({self.state})"

    @property
    def active_assignment(self):
        return self.assignments.filter(unassigned_at__isnull=True).first()


class ApplicationAssignment(models.Model):
    """Officer assignment history. Append-only; ending one writes unassigned_at."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name="assignments"
    )
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="assignments"
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="assignments_made",
    )

    assigned_at = models.DateTimeField(auto_now_add=True)
    unassigned_at = models.DateTimeField(null=True, blank=True)
    assignment_note = models.TextField(max_length=500, blank=True)

    class Meta:
        ordering = ["-assigned_at"]
        constraints = [
            # At most one active assignment per application in the MVP.
            models.UniqueConstraint(
                fields=["application"],
                condition=models.Q(unassigned_at__isnull=True),
                name="one_active_assignment_per_application",
            )
        ]
