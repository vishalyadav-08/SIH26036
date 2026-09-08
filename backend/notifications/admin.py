from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "recipient", "read_at", "created_at")
    list_filter = ("type",)
    search_fields = ("title", "message", "recipient__email")
    readonly_fields = ("id", "created_at")
