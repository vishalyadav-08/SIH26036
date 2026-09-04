import uuid

from django.conf import settings
from django.db import models


class Schedule(models.Model):
    """One booked site visit for an Application.

    Application.scheduled_at is the *current* appointment and is what the
    workflow reads. This table is the appointment *history*: every booking and
    rebooking is a new row, so an admin can see that a visit was moved, by whom,
    and from when. Rows are never edited in place — a superseded booking is
    marked RESCHEDULED and a new CONFIRMED row takes its place.
    """

    class Status(models.TextChoices):
        CONFIRMED = "CONFIRMED", "Confirmed"
        RESCHEDULED = "RESCHEDULED", "Rescheduled (superseded)"
        CANCELLED = "CANCELLED", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    application = models.ForeignKey(
        "applications.Application", on_delete=models.PROTECT, related_name="schedules"
    )
    # The officer the visit was booked for. Kept on the row rather than
    # resolved through the active assignment so history stays accurate if the
    # assignment later changes.
    officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="schedules"
    )
    scheduled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="schedules_made",
    )

    scheduled_at = models.DateTimeField()
    schedule_note = models.TextField(max_length=500, blank=True)

    status = models.CharField(max_length=15, choices=Status.choices, default=Status.CONFIRMED)

    # Why a CONFIRMED booking stopped being current. Blank while CONFIRMED.
    ended_at = models.DateTimeField(null=True, blank=True)
    end_reason = models.TextField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_at"]
        constraints = [
            # An application has at most one current appointment.
            models.UniqueConstraint(
                fields=["application"],
                condition=models.Q(status="CONFIRMED"),
                name="one_confirmed_schedule_per_application",
            )
        ]
        indexes = [
            models.Index(fields=["officer", "scheduled_at"]),
        ]

    def __str__(self):
        return f"{self.application_id} @ {self.scheduled_at:%Y-%m-%d %H:%M} ({self.status})"
