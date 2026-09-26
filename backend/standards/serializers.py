from rest_framework import serializers
from .models import SealInventory, SealAllocation, VerificationStandard

class SealAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SealAllocation
        fields = '__all__'

class SealInventorySerializer(serializers.ModelSerializer):
    allocations = SealAllocationSerializer(many=True, read_only=True)
    class Meta:
        model = SealInventory
        fields = '__all__'

class VerificationStandardSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationStandard
        fields = '__all__'
