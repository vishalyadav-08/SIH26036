"""Instrument shapes. Field names are camelCase per API_CONTRACT.md."""

from decimal import Decimal

from rest_framework import serializers

from .models import Instrument


class InstrumentSerializer(serializers.ModelSerializer):
    """Canonical read shape."""

    businessId = serializers.UUIDField(source="business_id", read_only=True)
    businessName = serializers.CharField(source="business.legal_name", read_only=True)
    instrumentNumber = serializers.CharField(source="instrument_number", read_only=True)
    serialNumber = serializers.CharField(source="serial_number", read_only=True)
    instrumentType = serializers.CharField(source="instrument_type", read_only=True)
    capacityUnit = serializers.CharField(source="capacity_unit", read_only=True)
    nextDueDate = serializers.DateField(source="next_due_date", read_only=True)
    # Same date, named for the screen that shows it as a due date.
    nextVerificationDue = serializers.DateField(source="next_due_date", read_only=True)
    activeCertificateNo = serializers.SerializerMethodField()
    lastVerifiedAt = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Instrument
        fields = [
            "id",
            "businessId",
            "businessName",
            "instrumentNumber",
            "serialNumber",
            "instrumentType",
            "manufacturer",
            "model",
            "capacity",
            "capacityUnit",
            "location",
            "status",
            "nextDueDate",
            "nextVerificationDue",
            "activeCertificateNo",
            "lastVerifiedAt",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = fields

    def _current_certificate(self, obj):
        """The instrument's current certificate, if it still has one.

        Revoked and expired certificates are excluded: showing a revoked
        number beside an instrument would read as though it were still valid.
        """
        return (
            obj.certificates.filter(status="ACTIVE").order_by("-issued_at").first()
        )

    def get_activeCertificateNo(self, obj):
        certificate = self._current_certificate(obj)

        return certificate.certificate_number if certificate else None

    def get_lastVerifiedAt(self, obj):
        certificate = self._current_certificate(obj)

        return certificate.issued_at if certificate else None


class InstrumentCreateSerializer(serializers.Serializer):
    """Registration input.

    `status` is absent by design: lifecycle is driven by verification work, not
    chosen by the client. `businessId` is accepted but only honoured for ADMIN
    — the view resolves the real owner.
    """

    instrumentNumber = serializers.CharField(max_length=50)
    serialNumber = serializers.CharField(max_length=50, required=False, allow_blank=True)
    instrumentType = serializers.ChoiceField(choices=Instrument.InstrumentType.choices)
    manufacturer = serializers.CharField(max_length=100)
    model = serializers.CharField(max_length=100)
    capacity = serializers.DecimalField(
        max_digits=12, decimal_places=3, min_value=Decimal("0.001")
    )
    capacityUnit = serializers.CharField(max_length=10)
    location = serializers.CharField(max_length=200, required=False, allow_blank=True)
    businessId = serializers.UUIDField(required=False)

    def validate_instrumentNumber(self, value):
        return value.strip()

    def validate_serialNumber(self, value):
        return value.strip()


class InstrumentUpdateSerializer(serializers.Serializer):
    """Partial update. Identity fields stay editable but uniqueness still holds."""

    instrumentNumber = serializers.CharField(max_length=50, required=False)
    serialNumber = serializers.CharField(max_length=50, required=False)
    instrumentType = serializers.ChoiceField(
        choices=Instrument.InstrumentType.choices, required=False
    )
    manufacturer = serializers.CharField(max_length=100, required=False)
    model = serializers.CharField(max_length=100, required=False)
    capacity = serializers.DecimalField(
        max_digits=12, decimal_places=3, min_value=Decimal("0.001"), required=False
    )
    capacityUnit = serializers.CharField(max_length=10, required=False)
    location = serializers.CharField(max_length=200, required=False)
