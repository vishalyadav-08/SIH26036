"""Evidence shapes. camelCase per API_CONTRACT.md.

The upload request is multipart, so the create serializer validates the
metadata fields only; the file itself is checked byte-by-byte in services.
"""

from rest_framework import serializers

from .models import Evidence


class EvidenceSerializer(serializers.ModelSerializer):
    inspectionId = serializers.UUIDField(source="inspection_id", read_only=True)
    instrumentId = serializers.UUIDField(source="instrument_id", read_only=True)
    uploadedByUserId = serializers.UUIDField(source="uploaded_by_id", read_only=True)
    uploadedByName = serializers.CharField(source="uploaded_by.display_name", read_only=True)
    evidenceType = serializers.CharField(source="evidence_type", read_only=True)
    objectKey = serializers.CharField(source="object_key", read_only=True)
    fileName = serializers.CharField(source="original_file_name", read_only=True)
    mimeType = serializers.CharField(source="mime_type", read_only=True)
    sizeBytes = serializers.IntegerField(source="size_bytes", read_only=True)
    capturedAt = serializers.DateTimeField(source="captured_at", read_only=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    gpsAccuracyMeters = serializers.IntegerField(source="gps_accuracy_meters", read_only=True)
    clientOperationId = serializers.UUIDField(source="client_operation_id", read_only=True)
    uploadedAt = serializers.DateTimeField(source="uploaded_at", read_only=True)
    fileUrl = serializers.SerializerMethodField()

    class Meta:
        model = Evidence
        fields = [
            "id", "inspectionId", "instrumentId", "uploadedByUserId", "uploadedByName",
            "evidenceType", "objectKey", "fileName", "mimeType", "sizeBytes", "sha256",
            "capturedAt", "latitude", "longitude", "gpsAccuracyMeters", "notes",
            "clientOperationId", "status", "uploadedAt", "fileUrl",
        ]
        read_only_fields = fields

    def get_fileUrl(self, obj) -> str:
        # Always the authenticated API route, never a raw storage URL: access
        # is decided per request, not by whoever holds a link.
        return f"/api/v1/evidence/{obj.id}/file/"


class EvidenceUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    evidenceType = serializers.ChoiceField(choices=Evidence.Type.choices, required=False)
    capturedAt = serializers.DateTimeField(required=False)
    latitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, min_value=-90, max_value=90
    )
    longitude = serializers.DecimalField(
        max_digits=9, decimal_places=6, required=False, min_value=-180, max_value=180
    )
    gpsAccuracyMeters = serializers.IntegerField(required=False, min_value=0)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)
    sha256 = serializers.RegexField(r"^[A-Fa-f0-9]{64}$", required=False)
    clientOperationId = serializers.UUIDField(required=False)

    def validate(self, attrs):
        has_lat = "latitude" in attrs
        has_lng = "longitude" in attrs

        if has_lat != has_lng:
            raise serializers.ValidationError(
                {"latitude": "Provide both latitude and longitude, or neither."}
            )

        return attrs
