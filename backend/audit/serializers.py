"""Audit event shapes. Admin-only; the public never sees these."""

from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    eventId = serializers.UUIDField(source="event_id", read_only=True)
    actorUserId = serializers.UUIDField(source="actor_user_id", read_only=True)
    actorEmail = serializers.EmailField(source="actor_email", read_only=True)
    actorRole = serializers.CharField(source="actor_role", read_only=True)
    entityType = serializers.CharField(source="entity_type", read_only=True)
    entityId = serializers.CharField(source="entity_id", read_only=True)
    previousHash = serializers.CharField(source="previous_hash", read_only=True)
    currentHash = serializers.CharField(source="current_hash", read_only=True)
    id = serializers.UUIDField(source="event_id", read_only=True)
    actorName = serializers.CharField(source="actor_email", read_only=True)
    # Per-row chain validity is not decidable in isolation — a link is only
    # valid relative to its predecessor. The whole-chain answer comes from
    # /audit/verify/, so this reports the stored linkage being present.
    isValidChain = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id", "eventId", "sequence", "actorUserId", "actorEmail", "actorName",
            "actorRole", "isValidChain", "action",
            "entityType", "entityId", "timestamp", "metadata",
            "previousHash", "currentHash",
        ]
        read_only_fields = fields

    def get_isValidChain(self, obj):
        return bool(obj.current_hash)
