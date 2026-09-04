"""Inspection shapes. camelCase per API_CONTRACT.md."""

from rest_framework import serializers

from evidence.serializers import EvidenceSerializer

from .models import Inspection, Measurement


class MeasurementSerializer(serializers.ModelSerializer):
    nominalValue = serializers.DecimalField(
        source="nominal_value", max_digits=12, decimal_places=3, read_only=True
    )
    observedValue = serializers.DecimalField(
        source="observed_value", max_digits=12, decimal_places=3, read_only=True
    )
    withinTolerance = serializers.BooleanField(source="within_tolerance", read_only=True)

    class Meta:
        model = Measurement
        fields = ["id", "label", "nominalValue", "observedValue", "unit", "withinTolerance"]
        read_only_fields = fields


class InspectionSerializer(serializers.ModelSerializer):
    applicationId = serializers.UUIDField(source="application_id", read_only=True)
    officerUserId = serializers.UUIDField(source="officer_id", read_only=True)
    startedAt = serializers.DateTimeField(source="started_at", read_only=True)
    completedAt = serializers.DateTimeField(source="completed_at", read_only=True)
    capturedAt = serializers.DateTimeField(source="captured_at", read_only=True)
    gpsLatitude = serializers.DecimalField(
        source="gps_latitude", max_digits=9, decimal_places=6, read_only=True
    )
    gpsLongitude = serializers.DecimalField(
        source="gps_longitude", max_digits=9, decimal_places=6, read_only=True
    )
    gpsAccuracyMeters = serializers.IntegerField(
        source="gps_accuracy_meters", read_only=True
    )
    measurements = MeasurementSerializer(many=True, read_only=True)
    evidence = EvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = Inspection
        fields = [
            "id", "applicationId", "officerUserId", "startedAt", "completedAt",
            "result", "notes", "gpsLatitude", "gpsLongitude", "gpsAccuracyMeters",
            "capturedAt", "version", "measurements", "evidence",
        ]
        read_only_fields = fields


class StartInspectionSerializer(serializers.Serializer):
    applicationId = serializers.UUIDField()


class MeasurementCreateSerializer(serializers.Serializer):
    label = serializers.CharField(max_length=100)
    nominalValue = serializers.DecimalField(max_digits=12, decimal_places=3)
    observedValue = serializers.DecimalField(max_digits=12, decimal_places=3)
    unit = serializers.CharField(max_length=10)


class GpsSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False)
    accuracyMeters = serializers.IntegerField(required=False)
    capturedAt = serializers.DateTimeField(required=False)


class CompleteInspectionSerializer(serializers.Serializer):
    result = serializers.ChoiceField(choices=Inspection.Result.choices)
    notes = serializers.CharField(max_length=2000, required=False, allow_blank=True)
    gps = GpsSerializer(required=False)
