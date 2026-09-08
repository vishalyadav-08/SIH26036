import uuid

from django.db import models


class AuditLog(models.Model):
    """Tamper-evident event chain (ADR-012).

    Each event stores the previous event's hash, so altering or deleting a link
    breaks every hash after it. This is tamper *evidence*, not immutability —
    someone with database access can still rewrite the whole chain. Access
    control and backups remain necessary.
    """

    # `sequence` is the primary key because the chain needs a total order that
    # a UUID cannot give. `event_id` stays the public identifier.
    sequence = models.BigAutoField(primary_key=True, editable=False)

    event_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    # Denormalised on purpose: NOT a ForeignKey.
    #
    # With a FK, deleting a user rewrote actor_user to NULL via SET_NULL and
    # silently broke every hash that referenced them — a cascade could edit the
    # audit trail. An append-only chain must be unaffected by what happens to
    # other tables, so the actor is captured as flat values at write time.
    actor_user_id = models.UUIDField(null=True, blank=True)
    actor_email = models.EmailField(max_length=254, blank=True)
    actor_role = models.CharField(max_length=10, blank=True)

    action = models.CharField(max_length=80)
    entity_type = models.CharField(max_length=50)
    entity_id = models.CharField(max_length=64)

    timestamp = models.DateTimeField()

    # Never contains passwords, tokens, private keys, or unnecessary personal
    # data (ARCHITECTURE.md section 8).
    metadata = models.JSONField(default=dict, blank=True)

    previous_hash = models.CharField(max_length=64, blank=True)
    current_hash = models.CharField(max_length=64)

    class Meta:
        ordering = ["-sequence"]

    def __str__(self):
        return f"{self.action} {self.entity_type}:{self.entity_id}"
