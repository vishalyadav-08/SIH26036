from django.contrib import admin

from .models import Evidence


@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ("original_file_name", "evidence_type", "mime_type", "size_bytes", "inspection", "uploaded_by", "uploaded_at")
    list_filter = ("evidence_type", "mime_type", "status")
    search_fields = ("original_file_name", "sha256", "object_key")
    readonly_fields = ("id", "object_key", "sha256", "size_bytes", "mime_type", "uploaded_at", "updated_at")
