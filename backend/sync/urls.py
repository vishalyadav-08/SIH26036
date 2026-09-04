"""Sync routes, mounted at /api/v1/sync/ by root/urls.py."""

from django.urls import path

from .views import SyncBatchView, SyncRecordDetailView, SyncRecordListView

urlpatterns = [
    path("", SyncBatchView.as_view(), name="sync-batch"),
    path("records/", SyncRecordListView.as_view(), name="sync-record-list"),
    path(
        "records/<uuid:client_operation_id>/",
        SyncRecordDetailView.as_view(),
        name="sync-record-detail",
    ),
]
