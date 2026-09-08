"""Cross-cutting routes mounted at /api/v1/ by root/urls.py."""

from django.urls import path

from .views import AdminDashboardView

urlpatterns = [
    path("dashboards/admin/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("dashboards/admin", AdminDashboardView.as_view(), name="admin-dashboard-no-slash"),
]
