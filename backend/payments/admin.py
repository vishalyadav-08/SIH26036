from django.contrib import admin
from .models import FeeSchedule, PaymentTransaction

@admin.register(FeeSchedule)
class FeeScheduleAdmin(admin.ModelAdmin):
    list_display = ['service_type', 'state_code', 'base_fee', 'effective_from', 'effective_until']
    list_filter = ['state_code', 'service_type']
    search_fields = ['service_type']

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ['transaction_reference', 'payer_business', 'service_type', 'amount', 'status', 'paid_at']
    list_filter = ['status', 'service_type', 'gateway']
    search_fields = ['transaction_reference', 'payer_business__legal_name']
    readonly_fields = ['id', 'transaction_reference', 'created_at', 'updated_at']
