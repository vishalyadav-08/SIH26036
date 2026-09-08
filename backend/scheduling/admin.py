from django.contrib import admin

from .models import Schedule


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ("application", "officer", "scheduled_at", "status", "scheduled_by")
    list_filter = ("status",)
    search_fields = ("application__application_number", "officer__email")
    readonly_fields = ("id", "created_at", "updated_at")
