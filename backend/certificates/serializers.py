"""Certificate shapes. The authenticated view; public verification is separate."""

from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    certificateNumber = serializers.CharField(source="certificate_number", read_only=True)
    applicationId = serializers.UUIDField(source="application_id", read_only=True)
    instrumentId = serializers.UUIDField(source="instrument_id", read_only=True)
    instrumentNumber = serializers.CharField(
        source="instrument.instrument_number", read_only=True
    )
    businessId = serializers.UUIDField(source="business_id", read_only=True)
    inspectionId = serializers.UUIDField(source="inspection_id", read_only=True)
    issuedAt = serializers.DateTimeField(source="issued_at", read_only=True)
    validUntil = serializers.DateTimeField(source="valid_until", read_only=True)
    payloadHash = serializers.CharField(source="payload_hash", read_only=True)
    signatureAlgorithm = serializers.CharField(source="signature_algorithm", read_only=True)
    publicKeyReference = serializers.CharField(source="public_key_reference", read_only=True)
    qrVerificationUrl = serializers.CharField(source="qr_verification_url", read_only=True)
    revokedAt = serializers.DateTimeField(source="revoked_at", read_only=True)
    revocationReason = serializers.CharField(source="revocation_reason", read_only=True)
    applicationNumber = serializers.CharField(
        source="application.application_number", read_only=True
    )
    instrumentType = serializers.CharField(
        source="instrument.instrument_type", read_only=True
    )
    businessName = serializers.CharField(source="business.legal_name", read_only=True)
    issuerOfficerName = serializers.CharField(
        source="inspection.officer.display_name", read_only=True
    )
    pdfObjectKey = serializers.CharField(source="pdf_object_key", read_only=True)

    class Meta:
        model = Certificate
        # digital_signature and canonical_payload are deliberately absent: the
        # holder does not need signing material to use their certificate.
        fields = [
            "id", "certificateNumber", "applicationId", "instrumentId",
            "instrumentNumber", "businessId", "inspectionId", "issuedAt",
            "validUntil", "status", "payloadHash", "signatureAlgorithm",
            "publicKeyReference", "qrVerificationUrl", "revokedAt", "revocationReason",
            "applicationNumber", "instrumentType", "businessName",
            "issuerOfficerName", "pdfObjectKey",
        ]
        read_only_fields = fields


class IssueCertificateSerializer(serializers.Serializer):
    inspectionId = serializers.UUIDField()


class RevokeSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=500)


class VerificationResultSerializer(serializers.Serializer):
    """Public response. Minimal disclosure by design."""

    certificateNumber = serializers.CharField()
    verificationStatus = serializers.CharField()
    certificateStatus = serializers.CharField(allow_null=True)
    signatureValid = serializers.BooleanField()
    payloadHash = serializers.CharField(allow_null=True)
    issuedAt = serializers.DateTimeField(allow_null=True)
    validUntil = serializers.DateTimeField(allow_null=True)
    instrumentSummary = serializers.DictField(allow_null=True)
    signatureAlgorithm = serializers.CharField(allow_null=True)
    revokedAt = serializers.DateTimeField(allow_null=True)
    verificationMessage = serializers.CharField()
