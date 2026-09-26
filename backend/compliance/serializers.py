from rest_framework import serializers
from .models import QuarterlyReturn, ProductionRecord, SaleRecord, RepairRecord

class ProductionRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionRecord
        fields = ['id', 'instrument_type', 'quantity_manufactured', 'remarks']

class SaleRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleRecord
        fields = ['id', 'instrument_type', 'buyer_name', 'buyer_address', 'quantity', 'dispatch_date', 'invoice_number']

class RepairRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairRecord
        fields = ['id', 'instrument_type', 'owner_name', 'nature_of_repair', 'repair_date', 'verification_certificate_number']

class QuarterlyReturnSerializer(serializers.ModelSerializer):
    production_records = ProductionRecordSerializer(many=True, read_only=True)
    sale_records = SaleRecordSerializer(many=True, read_only=True)
    repair_records = RepairRecordSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuarterlyReturn
        fields = [
            'id', 'business', 'license', 'financial_year', 'quarter', 
            'status', 'total_manufactured', 'total_sold', 'total_repaired',
            'submission_date', 'due_date', 'late_fee_paid',
            'production_records', 'sale_records', 'repair_records',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'total_manufactured', 'total_sold', 'total_repaired', 'submission_date', 'created_at', 'updated_at']
