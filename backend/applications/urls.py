"""Application routes, mounted at /api/v1/applications/ by root/urls.py."""

from django.urls import path

from .views import (
    ApplicationDetailView,
    ApplicationListCreateView,
    AssignView,
    CancelView,
    RejectView,
    ScheduleView,
    SubmitView,
)

urlpatterns = [
    path("", ApplicationListCreateView.as_view(), name="application-list-create"),
    path("<uuid:application_id>/", ApplicationDetailView.as_view(), name="application-detail"),
    path("<uuid:application_id>/submit/", SubmitView.as_view(), name="application-submit"),
    path("<uuid:application_id>/assign/", AssignView.as_view(), name="application-assign"),
    path("<uuid:application_id>/schedule/", ScheduleView.as_view(), name="application-schedule"),
    path("<uuid:application_id>/reject/", RejectView.as_view(), name="application-reject"),
    path("<uuid:application_id>/cancel/", CancelView.as_view(), name="application-cancel"),
]
