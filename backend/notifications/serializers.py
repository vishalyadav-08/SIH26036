"""Notification shapes. camelCase per API_CONTRACT.md."""

from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    userId = serializers.UUIDField(source="recipient_id", read_only=True)
    businessId = serializers.UUIDField(source="business_id", read_only=True)
    relatedEntityType = serializers.CharField(source="related_entity_type", read_only=True)
    relatedEntityId = serializers.UUIDField(source="related_entity_id", read_only=True)
    read = serializers.BooleanField(source="is_read", read_only=True)
    readAt = serializers.DateTimeField(source="read_at", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id", "userId", "businessId", "type", "title", "message",
            "relatedEntityType", "relatedEntityId", "link",
            "read", "readAt", "createdAt",
        ]
        read_only_fields = fields


class MarkReadSerializer(serializers.Serializer):
    # Optional per the contract; the server's clock is used when absent, and
    # a client value may not be in the future.
    readAt = serializers.DateTimeField(required=False)
