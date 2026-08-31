"""Inspection routes, mounted at /api/v1/inspections/ by root/urls.py."""

from django.urls import path

from .views import (
    CompleteInspectionView,
    InspectionDetailView,
    InspectionListCreateView,
    MeasurementView,
)

urlpatterns = [
    path("", InspectionListCreateView.as_view(), name="inspection-list-create"),
    path("<uuid:inspection_id>/", InspectionDetailView.as_view(), name="inspection-detail"),
    path("<uuid:inspection_id>/measurements/", MeasurementView.as_view(), name="inspection-measurements"),
    path("<uuid:inspection_id>/complete/", CompleteInspectionView.as_view(), name="inspection-complete"),
]
