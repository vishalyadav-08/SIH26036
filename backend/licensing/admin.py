from django.contrib import admin
from .models import LicenseApplication, License, LicenseDocument

@admin.register(LicenseApplication)
class LicenseApplicationAdmin(admin.ModelAdmin):
    list_display = ['application_number', 'business', 'category', 'license_type', 'state', 'created_at']
    list_filter = ['state', 'category', 'license_type']
    search_fields = ['application_number', 'business__legal_name']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ['license_number', 'business', 'category', 'status', 'valid_until']
    list_filter = ['status', 'category']
    search_fields = ['license_number', 'business__legal_name']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(LicenseDocument)
class LicenseDocumentAdmin(admin.ModelAdmin):
    list_display = ['document_type', 'application', 'verification_status', 'uploaded_at']
    list_filter = ['verification_status', 'document_type']
