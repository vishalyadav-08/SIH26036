from rest_framework import serializers
from .models import (
    LicenseApplication, License, LicenseDocument,
    LicenseCategory, LicenseType, LicenseAppState, LicenseStatus, DocumentType
)
from businesses.serializers import BusinessSerializer
from authentication.serializers import UserSerializer

class LicenseDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LicenseDocument
        fields = [
            'id', 'document_type', 'object_key', 'original_file_name', 
            'mime_type', 'size_bytes', 'sha256', 'verification_status', 
            'verification_note', 'uploaded_at'
        ]
        read_only_fields = [
            'id', 'object_key', 'original_file_name', 'mime_type', 
            'size_bytes', 'sha256', 'verification_status', 
            'verification_note', 'uploaded_at'
        ]

class LicenseApplicationSerializer(serializers.ModelSerializer):
    business_details = BusinessSerializer(source='business', read_only=True)
    submitted_by_details = UserSerializer(source='submitted_by', read_only=True)
    reviewing_officer_details = UserSerializer(source='reviewing_officer', read_only=True)
    documents = LicenseDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = LicenseApplication
        fields = [
            'id', 'application_number', 'business', 'business_details',
            'submitted_by', 'submitted_by_details', 'category', 'license_type',
            'validity_years', 'state', 'reviewing_officer', 'reviewing_officer_details',
            'query_details', 'query_response', 'inspection_date', 'inspection_report',
            'approval_date', 'rejection_reason', 'premises_address', 'premises_proof_type',
            'gst_number', 'pan_number', 'model_approval_number', 'machinery_list',
            'technical_staff_count', 'qualification_details', 'equipment_list',
            'dealership_authorization', 'commodity_list', 'iec_code', 'sample_labels',
            'created_at', 'updated_at', 'documents'
        ]
        read_only_fields = [
            'id', 'application_number', 'state', 'reviewing_officer',
            'query_details', 'inspection_date', 'inspection_report',
            'approval_date', 'rejection_reason', 'created_at', 'updated_at'
        ]
        
class LicenseSerializer(serializers.ModelSerializer):
    business_details = BusinessSerializer(source='business', read_only=True)
    
    class Meta:
        model = License
        fields = [
            'id', 'license_number', 'business', 'business_details', 'application',
            'category', 'issued_date', 'valid_from', 'valid_until', 'status',
            'conditions', 'qr_verification_url', 'pdf_object_key',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'license_number', 'issued_date', 'valid_from', 'valid_until',
            'status', 'qr_verification_url', 'pdf_object_key', 'created_at', 'updated_at'
        ]
