from django.contrib import admin
from .models import QuarterlyReturn, ProductionRecord, SaleRecord, RepairRecord

class ProductionRecordInline(admin.TabularInline):
    model = ProductionRecord
    extra = 1

class SaleRecordInline(admin.TabularInline):
    model = SaleRecord
    extra = 1

class RepairRecordInline(admin.TabularInline):
    model = RepairRecord
    extra = 1

@admin.register(QuarterlyReturn)
class QuarterlyReturnAdmin(admin.ModelAdmin):
    list_display = ['business', 'financial_year', 'quarter', 'status', 'due_date', 'submission_date']
    list_filter = ['status', 'financial_year', 'quarter']
    search_fields = ['business__legal_name']
    inlines = [ProductionRecordInline, SaleRecordInline, RepairRecordInline]
