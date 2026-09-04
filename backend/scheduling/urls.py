"""Schedule routes, mounted at /api/v1/schedules/ by root/urls.py.

Booking the first visit is POST /applications/{id}/schedule/ because it is a
state transition on the application. Everything after that — the calendar,
one appointment, moving it — lives here.
"""

from django.urls import path

from .views import RescheduleView, ScheduleDetailView, ScheduleListView

urlpatterns = [
    path("", ScheduleListView.as_view(), name="schedule-list"),
    path("<uuid:schedule_id>/", ScheduleDetailView.as_view(), name="schedule-detail"),
    path("<uuid:schedule_id>/reschedule/", RescheduleView.as_view(), name="schedule-reschedule"),
]
