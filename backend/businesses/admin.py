from django.contrib import admin

from .models import Business


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ("legal_name", "trade_name", "contact_name", "email", "status")
    list_filter = ("status", "jurisdiction_label")
    search_fields = ("legal_name", "trade_name", "email", "contact_name")
    readonly_fields = ("id", "created_at", "updated_at")
