from django.contrib import admin

from .models import Instrument


@admin.register(Instrument)
class InstrumentAdmin(admin.ModelAdmin):
    list_display = (
        "instrument_number",
        "serial_number",
        "instrument_type",
        "business",
        "status",
        "next_due_date",
    )
    list_filter = ("status", "instrument_type")
    search_fields = ("instrument_number", "serial_number", "manufacturer", "model")
    readonly_fields = ("id", "created_at", "updated_at")
