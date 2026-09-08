"""Sync shapes. camelCase per API_CONTRACT.md."""

from rest_framework import serializers

from .models import SyncRecord

MAX_BATCH = 50


class SyncOperationSerializer(serializers.Serializer):
    clientOperationId = serializers.UUIDField()
    createdAt = serializers.DateTimeField(required=False)
    entityType = serializers.ChoiceField(choices=SyncRecord.EntityType.choices)
    entityId = serializers.CharField(max_length=100)
    operationType = serializers.ChoiceField(choices=SyncRecord.OperationType.choices)
    payload = serializers.DictField(default=dict)
    attemptCount = serializers.IntegerField(required=False, min_value=0)
    lastError = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    status = serializers.CharField(required=False)
    expectedServerVersion = serializers.IntegerField(required=False, allow_null=True, min_value=0)
    # Display-only on the client; accepted and ignored so old queues still post.
    inspectionSummary = serializers.DictField(required=False)


class SyncBatchSerializer(serializers.Serializer):
    operations = SyncOperationSerializer(many=True, min_length=1, max_length=MAX_BATCH)


class SyncResultSerializer(serializers.Serializer):
    clientOperationId = serializers.UUIDField()
    status = serializers.ChoiceField(choices=["SYNCED", "FAILED", "CONFLICT"])
    entityId = serializers.CharField(allow_null=True)
    serverVersion = serializers.IntegerField(allow_null=True)
    message = serializers.CharField()
    applicationState = serializers.CharField(required=False, allow_null=True)


class SyncBatchResponseSerializer(serializers.Serializer):
    results = SyncResultSerializer(many=True)


class SyncRecordSerializer(serializers.ModelSerializer):
    clientOperationId = serializers.UUIDField(source="client_operation_id", read_only=True)
    submittedByUserId = serializers.UUIDField(source="submitted_by_id", read_only=True)
    submittedByName = serializers.CharField(source="submitted_by.display_name", read_only=True)
    entityType = serializers.CharField(source="entity_type", read_only=True)
    entityId = serializers.CharField(source="entity_id", read_only=True)
    operationType = serializers.CharField(source="operation_type", read_only=True)
    payloadHash = serializers.CharField(source="payload_hash", read_only=True)
    expectedServerVersion = serializers.IntegerField(source="expected_server_version", read_only=True)
    clientCreatedAt = serializers.DateTimeField(source="client_created_at", read_only=True)
    receivedAt = serializers.DateTimeField(source="received_at", read_only=True)
    processedAt = serializers.DateTimeField(source="processed_at", read_only=True)
    attemptCount = serializers.IntegerField(source="attempt_count", read_only=True)
    lastError = serializers.CharField(source="last_error", read_only=True)
    serverEntityType = serializers.CharField(source="server_entity_type", read_only=True)
    serverEntityId = serializers.UUIDField(source="server_entity_id", read_only=True)
    serverVersion = serializers.IntegerField(source="server_version", read_only=True)

    class Meta:
        model = SyncRecord
        fields = [
            "id", "clientOperationId", "submittedByUserId", "submittedByName",
            "entityType", "entityId", "operationType", "payloadHash",
            "expectedServerVersion", "clientCreatedAt", "receivedAt", "processedAt",
            "attemptCount", "status", "lastError",
            "serverEntityType", "serverEntityId", "serverVersion", "result",
        ]
        read_only_fields = fields
