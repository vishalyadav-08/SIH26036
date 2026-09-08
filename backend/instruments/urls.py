"""Instrument routes, mounted at /api/v1/instruments/ by root/urls.py."""

from django.urls import path

from .views import InstrumentDetailView, InstrumentListCreateView

urlpatterns = [
    path("", InstrumentListCreateView.as_view(), name="instrument-list-create"),
    path("<uuid:instrument_id>/", InstrumentDetailView.as_view(), name="instrument-detail"),
]
