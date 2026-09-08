"""Schedule shapes. camelCase per API_CONTRACT.md."""

from rest_framework import serializers

from .models import Schedule


class ScheduleSerializer(serializers.ModelSerializer):
    applicationId = serializers.UUIDField(source="application_id", read_only=True)
    applicationNumber = serializers.CharField(
        source="application.application_number", read_only=True
    )
    applicationState = serializers.CharField(source="application.state", read_only=True)
    instrumentId = serializers.UUIDField(source="application.instrument_id", read_only=True)
    instrumentNumber = serializers.CharField(
        source="application.instrument.instrument_number", read_only=True
    )
    instrumentType = serializers.CharField(
        source="application.instrument.instrument_type", read_only=True
    )
    location = serializers.CharField(
        source="application.instrument.location", read_only=True
    )
    businessId = serializers.UUIDField(source="application.business_id", read_only=True)
    businessName = serializers.CharField(
        source="application.business.legal_name", read_only=True
    )
    officerUserId = serializers.UUIDField(source="officer_id", read_only=True)
    officerName = serializers.CharField(source="officer.display_name", read_only=True)
    scheduledByUserId = serializers.UUIDField(source="scheduled_by_id", read_only=True)
    scheduledAt = serializers.DateTimeField(source="scheduled_at", read_only=True)
    scheduleNote = serializers.CharField(source="schedule_note", read_only=True)
    endedAt = serializers.DateTimeField(source="ended_at", read_only=True)
    endReason = serializers.CharField(source="end_reason", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Schedule
        fields = [
            "id", "applicationId", "applicationNumber", "applicationState",
            "instrumentId", "instrumentNumber", "instrumentType", "location",
            "businessId", "businessName",
            "officerUserId", "officerName", "scheduledByUserId",
            "scheduledAt", "scheduleNote", "status", "endedAt", "endReason",
            "createdAt", "updatedAt",
        ]
        read_only_fields = fields


class RescheduleSerializer(serializers.Serializer):
    scheduledAt = serializers.DateTimeField()
    scheduleNote = serializers.CharField(max_length=500, required=False, allow_blank=True)
