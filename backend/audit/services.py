"""Append-only audit chain."""

from django.db import transaction

from common.canonical import canonical_json, sha256_hex

from .models import AuditLog

GENESIS_HASH = ""


def _canonical_event(*, actor_user_id, actor_role, action, entity_type, entity_id, timestamp, metadata):
    """The exact fields that enter the hash. Order is fixed by canonical_json."""
    return {
        "actorUserId": str(actor_user_id) if actor_user_id else None,
        "actorRole": actor_role,
        "action": action,
        "entityType": entity_type,
        "entityId": str(entity_id),
        "timestamp": timestamp,
        "metadata": metadata,
    }


@transaction.atomic
def record_event(*, actor, action, entity_type, entity_id, metadata=None):
    """Append one event, chained to the current tail.

    select_for_update on the tail serialises concurrent writers: two events
    computed against the same previous hash would produce a fork that later
    verification cannot resolve.
    """
    metadata = metadata or {}

    tail = AuditLog.objects.select_for_update().order_by("-sequence").first()
    previous_hash = tail.current_hash if tail else GENESIS_HASH

    event = AuditLog(
        actor_user_id=getattr(actor, "id", None),
        actor_email=getattr(actor, "email", "") or "",
        actor_role=getattr(actor, "role", "") or "",
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        metadata=metadata,
        previous_hash=previous_hash,
    )

    # auto_now_add has not fired yet, so take the timestamp explicitly and use
    # the same value for both the hash and the stored row.
    from django.utils import timezone as dj_timezone

    now = dj_timezone.now()

    body = _canonical_event(
        actor_user_id=getattr(actor, "id", None),
        actor_role=event.actor_role,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        timestamp=now,
        metadata=metadata,
    )

    event.current_hash = sha256_hex(canonical_json({"previousHash": previous_hash, "event": body}))
    event.timestamp = now

    event.save()

    return event


def verify_chain():
    """Recompute every link. Returns (ok, first_broken_event_id)."""
    previous_hash = GENESIS_HASH

    for event in AuditLog.objects.order_by("sequence"):
        body = _canonical_event(
            actor_user_id=event.actor_user_id,
            actor_role=event.actor_role,
            action=event.action,
            entity_type=event.entity_type,
            entity_id=event.entity_id,
            timestamp=event.timestamp,
            metadata=event.metadata,
        )

        expected = sha256_hex(
            canonical_json({"previousHash": previous_hash, "event": body})
        )

        if expected != event.current_hash or event.previous_hash != previous_hash:
            return False, event.event_id

        previous_hash = event.current_hash

    return True, None
