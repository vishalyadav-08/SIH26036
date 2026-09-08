import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """An in-product message to one user about something that happened to a
    record they care about (DATA_MODEL.md — Notification).

    One row per recipient: an event that concerns three people produces three
    rows, each with its own read state and its own role-appropriate link.
    Delivery is in-product only in the MVP; the text carries no more than the
    recipient needs (no other party's contact details, no internal metadata).
    """

    class Type(models.TextChoices):
        APPLICATION_UPDATE = "APPLICATION_UPDATE", "Application update"
        SCHEDULE_UPDATE = "SCHEDULE_UPDATE", "Visit scheduled or moved"
        INSPECTION_RESULT = "INSPECTION_RESULT", "Inspection result"
        CERTIFICATE_ISSUED = "CERTIFICATE_ISSUED", "Certificate issued"
        CERTIFICATE_REVOKED = "CERTIFICATE_REVOKED", "Certificate revoked"
        EXPIRY_WARNING = "EXPIRY_WARNING", "Certificate expiry warning"
        SYNC_RESULT = "SYNC_RESULT", "Offline sync outcome"
        GENERAL = "GENERAL", "General"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # CASCADE, unlike most FKs in this codebase: a notification is derived
    # from other records and has no meaning without its recipient.
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    business = models.ForeignKey(
        "businesses.Business",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="notifications",
    )

    type = models.CharField(max_length=25, choices=Type.choices, default=Type.GENERAL)
    title = models.CharField(max_length=150)
    message = models.TextField(max_length=500)

    related_entity_type = models.CharField(max_length=30, blank=True)
    related_entity_id = models.UUIDField(null=True, blank=True)

    # A front-end path for this recipient's role, e.g. /app/applications/<id>.
    link = models.CharField(max_length=300, blank=True)

    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "read_at", "-created_at"]),
            models.Index(fields=["related_entity_type", "related_entity_id"]),
        ]

    def __str__(self):
        return f"{self.type} -> {self.recipient_id}: {self.title}"

    @property
    def is_read(self):
        return self.read_at is not None
