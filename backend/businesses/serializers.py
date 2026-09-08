"""Business shapes. camelCase per API_CONTRACT.md."""

from rest_framework import serializers

from .models import Business


class BusinessSerializer(serializers.ModelSerializer):
    legalName = serializers.CharField(source="legal_name", read_only=True)
    tradeName = serializers.CharField(source="trade_name", read_only=True)
    contactName = serializers.CharField(source="contact_name", read_only=True)
    jurisdictionLabel = serializers.CharField(source="jurisdiction_label", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Business
        fields = [
            "id",
            "legalName",
            "tradeName",
            "contactName",
            "email",
            "phone",
            "address",
            "jurisdictionLabel",
            "status",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = fields


class BusinessCreateSerializer(serializers.Serializer):
    legalName = serializers.CharField(max_length=200)
    tradeName = serializers.CharField(max_length=200, required=False, allow_blank=True)
    contactName = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(max_length=500)
    jurisdictionLabel = serializers.CharField(max_length=100, required=False)
