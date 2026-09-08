from django.contrib import admin

from .models import SyncRecord


@admin.register(SyncRecord)
class SyncRecordAdmin(admin.ModelAdmin):
    list_display = ("client_operation_id", "operation_type", "status", "submitted_by", "received_at", "processed_at")
    list_filter = ("status", "operation_type")
    search_fields = ("client_operation_id", "entity_id", "last_error")
    readonly_fields = ("id", "payload_hash", "received_at", "processed_at", "result")
