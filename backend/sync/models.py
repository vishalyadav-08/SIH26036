import uuid

from django.conf import settings
from django.db import models


class SyncRecord(models.Model):
    """Server-side record of one offline operation (DATA_MODEL.md — SyncRecord).

    `client_operation_id` is the idempotency key. The first time an operation
    arrives it is applied and its outcome stored here; every later arrival of
    the same id with the same payload gets that stored outcome back without
    touching the domain again. The same id with a *different* payload is a
    CONFLICT: the client changed its mind after the fact, and the server will
    not guess which version it meant.

    `result` is the exact response object the client was given, kept so a
    replay returns byte-for-byte what the first attempt did.
    """

    class EntityType(models.TextChoices):
        INSPECTION = "INSPECTION", "Inspection"
        APPLICATION = "APPLICATION", "Application"

    class OperationType(models.TextChoices):
        CREATE_INSPECTION = "CREATE_INSPECTION", "Start inspection"
        UPSERT_CHECKLIST = "UPSERT_CHECKLIST", "Checklist"
        UPSERT_READINGS = "UPSERT_READINGS", "Readings"
        UPLOAD_EVIDENCE = "UPLOAD_EVIDENCE", "Evidence"
        RECORD_DECISION = "RECORD_DECISION", "Decision"

    class Status(models.TextChoices):
        SYNCING = "SYNCING", "Syncing"
        SYNCED = "SYNCED", "Synced"
        FAILED = "FAILED", "Failed"
        CONFLICT = "CONFLICT", "Conflict"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    client_operation_id = models.UUIDField(unique=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="sync_records"
    )

    entity_type = models.CharField(max_length=15, choices=EntityType.choices)
    # The client's own identifier for the entity. May be a local draft id, so
    # it is stored as text and never used to look anything up directly.
    entity_id = models.CharField(max_length=100)
    operation_type = models.CharField(max_length=20, choices=OperationType.choices)

    payload = models.JSONField(default=dict)
    payload_hash = models.CharField(max_length=64)
    expected_server_version = models.PositiveIntegerField(null=True, blank=True)

    client_created_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    attempt_count = models.PositiveIntegerField(default=1)

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SYNCING)
    last_error = models.TextField(max_length=500, blank=True)

    # What the operation resolved to on the server.
    server_entity_type = models.CharField(max_length=15, blank=True)
    server_entity_id = models.UUIDField(null=True, blank=True)
    server_version = models.PositiveIntegerField(null=True, blank=True)

    result = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-received_at"]
        indexes = [
            models.Index(fields=["submitted_by", "status", "-received_at"]),
        ]

    def __str__(self):
        return f"{self.operation_type} {self.client_operation_id} ({self.status})"
