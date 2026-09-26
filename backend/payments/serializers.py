from rest_framework import serializers
from .models import FeeSchedule, PaymentTransaction, ServiceType, PaymentStatus
from businesses.serializers import BusinessSerializer
from authentication.serializers import UserSerializer

class FeeScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeSchedule
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class PaymentTransactionSerializer(serializers.ModelSerializer):
    payer_business_details = BusinessSerializer(source='payer_business', read_only=True)
    payer_user_details = UserSerializer(source='payer_user', read_only=True)
    
    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'transaction_reference', 'payer_business', 'payer_business_details',
            'payer_user', 'payer_user_details', 'service_type', 'related_entity_type',
            'related_entity_id', 'amount', 'fee_breakdown', 'gateway', 'gateway_order_id',
            'status', 'receipt_url', 'paid_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'transaction_reference', 'amount', 'fee_breakdown', 'gateway',
            'gateway_order_id', 'status', 'receipt_url', 'paid_at', 'created_at', 'updated_at'
        ]
