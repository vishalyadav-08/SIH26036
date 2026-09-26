"""Business shapes. camelCase per API_CONTRACT.md."""

from rest_framework import serializers

from .models import Business


class BusinessSerializer(serializers.ModelSerializer):
    legalName = serializers.CharField(source="legal_name", read_only=True)
    tradeName = serializers.CharField(source="trade_name", read_only=True)
    contactName = serializers.CharField(source="contact_name", read_only=True)
    
    constitutionType = serializers.CharField(source="constitution_type", read_only=True)
    gstNumber = serializers.CharField(source="gst_number", read_only=True)
    panNumber = serializers.CharField(source="pan_number", read_only=True)
    
    isManufacturer = serializers.BooleanField(source="is_manufacturer", read_only=True)
    isDealer = serializers.BooleanField(source="is_dealer", read_only=True)
    isRepairer = serializers.BooleanField(source="is_repairer", read_only=True)
    isPacker = serializers.BooleanField(source="is_packer", read_only=True)
    
    jurisdictionLabel = serializers.CharField(source="jurisdiction_label", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Business
        fields = [
            "id",
            "legalName",
            "tradeName",
            "constitutionType",
            "gstNumber",
            "panNumber",
            "isManufacturer",
            "isDealer",
            "isRepairer",
            "isPacker",
            "contactName",
            "email",
            "phone",
            "address",
            "pincode",
            "jurisdictionLabel",
            "status",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = fields


class BusinessCreateSerializer(serializers.Serializer):
    legalName = serializers.CharField(max_length=200)
    tradeName = serializers.CharField(max_length=200, required=False, allow_blank=True)
    
    constitutionType = serializers.CharField(max_length=100, required=False, allow_blank=True)
    gstNumber = serializers.CharField(max_length=50, required=False, allow_blank=True)
    panNumber = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    isManufacturer = serializers.BooleanField(default=False)
    isDealer = serializers.BooleanField(default=False)
    isRepairer = serializers.BooleanField(default=False)
    isPacker = serializers.BooleanField(default=False)
    
    contactName = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    address = serializers.CharField(max_length=500)
    pincode = serializers.CharField(max_length=10, required=False, allow_blank=True)
    jurisdictionLabel = serializers.CharField(max_length=100, required=False)
