"""Audit routes, mounted at /api/v1/audit/ by root/urls.py."""

from django.urls import path

from .views import AuditListView, AuditVerifyView

urlpatterns = [
    path("", AuditListView.as_view(), name="audit-list"),
    path("verify/", AuditVerifyView.as_view(), name="audit-verify"),
]
