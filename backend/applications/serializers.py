"""Application shapes. camelCase per API_CONTRACT.md."""

from rest_framework import serializers

from .models import Application


class AssignmentSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    officerUserId = serializers.UUIDField(source="officer_id", read_only=True)
    officerName = serializers.CharField(source="officer.display_name", read_only=True)
    assignedAt = serializers.DateTimeField(source="assigned_at", read_only=True)
    unassignedAt = serializers.DateTimeField(source="unassigned_at", read_only=True)
    assignmentNote = serializers.CharField(source="assignment_note", read_only=True)


class ApplicationSerializer(serializers.ModelSerializer):
    applicationNumber = serializers.CharField(source="application_number", read_only=True)
    instrumentId = serializers.UUIDField(source="instrument_id", read_only=True)
    instrumentNumber = serializers.CharField(
        source="instrument.instrument_number", read_only=True
    )
    businessId = serializers.UUIDField(source="business_id", read_only=True)
    submittedByUserId = serializers.UUIDField(source="submitted_by_id", read_only=True)
    requestedAt = serializers.DateTimeField(source="requested_at", read_only=True)
    assignedAt = serializers.DateTimeField(source="assigned_at", read_only=True)
    scheduledAt = serializers.DateTimeField(source="scheduled_at", read_only=True)
    completedAt = serializers.DateTimeField(source="completed_at", read_only=True)
    rejectionReason = serializers.CharField(source="rejection_reason", read_only=True)
    cancellationReason = serializers.CharField(source="cancellation_reason", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    instrumentType = serializers.CharField(
        source="instrument.instrument_type", read_only=True
    )
    businessName = serializers.CharField(source="business.legal_name", read_only=True)
    # `scheduledDate` is the same instant as scheduledAt, named for the screen
    # that shows it as a visit date.
    scheduledDate = serializers.DateTimeField(source="scheduled_at", read_only=True)
    assignedOfficerId = serializers.SerializerMethodField()
    assignedOfficerName = serializers.SerializerMethodField()
    certificateId = serializers.SerializerMethodField()
    certificateNumber = serializers.SerializerMethodField()
    assignment = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id", "applicationNumber", "instrumentId", "instrumentNumber",
            "businessId", "submittedByUserId", "state", "reason",
            "requestedAt", "assignedAt", "scheduledAt", "completedAt",
            "rejectionReason", "cancellationReason", "assignment", "schedule",
            "instrumentType", "businessName", "scheduledDate",
            "assignedOfficerId", "assignedOfficerName",
            "certificateId", "certificateNumber",
            "createdAt", "updatedAt",
        ]
        read_only_fields = fields

    def get_assignedOfficerId(self, obj):
        active = obj.active_assignment

        return str(active.officer_id) if active else None

    def get_assignedOfficerName(self, obj):
        active = obj.active_assignment

        return active.officer.display_name if active else None

    def get_certificateId(self, obj):
        certificate = getattr(obj, "certificate", None)

        return str(certificate.id) if certificate else None

    def get_certificateNumber(self, obj):
        certificate = getattr(obj, "certificate", None)

        return certificate.certificate_number if certificate else None

    def get_assignment(self, obj):
        active = obj.active_assignment

        return AssignmentSerializer(active).data if active else None

    def get_schedule(self, obj):
        """The current appointment, if any. Full history is under /schedules/."""
        current = obj.schedules.filter(status="CONFIRMED").select_related("officer").first()

        if current is None:
            return None

        return {
            "id": str(current.id),
            "officerUserId": str(current.officer_id),
            "officerName": current.officer.display_name,
            "scheduledAt": current.scheduled_at.isoformat(),
            "scheduleNote": current.schedule_note,
            "status": current.status,
        }


class ApplicationCreateSerializer(serializers.Serializer):
    instrumentId = serializers.UUIDField()
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
    submit = serializers.BooleanField(default=False)


class AssignSerializer(serializers.Serializer):
    officerUserId = serializers.UUIDField()
    assignmentNote = serializers.CharField(max_length=500, required=False, allow_blank=True)


class ScheduleSerializer(serializers.Serializer):
    scheduledAt = serializers.DateTimeField()
    scheduleNote = serializers.CharField(max_length=500, required=False, allow_blank=True)


class ReasonSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=500)
