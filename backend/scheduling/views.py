from datetime import datetime, time

from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.services import IllegalTransition, OwnershipError
from common.exceptions import Conflict
from common.pagination import ContractPagination
from common.permissions import IsAdminOrFieldStaff

from .models import Schedule
from .serializers import RescheduleSerializer, ScheduleSerializer
from .services import reschedule_visit, visible_schedules


def _parse_bound(raw, *, end_of_day):
    """Accept either a date (YYYY-MM-DD) or a full ISO datetime.

    A bare date is widened to the whole day in the server's time zone so
    `?from=2026-09-05&to=2026-09-05` means "everything on the 5th".
    """
    if not raw:
        return None

    # Check for a bare date first: parse_datetime also accepts "2026-09-05"
    # and would silently turn it into midnight, collapsing a `to=` bound to
    # the very start of the day it was meant to include.
    day = parse_date(raw) if len(raw) == 10 else None

    if day is not None:
        parsed = datetime.combine(day, time.max if end_of_day else time.min)
    else:
        parsed = parse_datetime(raw)

    if parsed is None:
        raise ValidationError(
            {"to" if end_of_day else "from": "Use YYYY-MM-DD or an ISO datetime."}
        )

    if timezone.is_naive(parsed):
        parsed = timezone.make_aware(parsed)

    return parsed


class ScheduleListView(APIView):
    """GET /api/v1/schedules/ — the calendar.

    Admins see every visit, officers only their own, businesses only visits to
    their premises. Defaults to CONFIRMED (current) appointments; pass
    `status=` to see history.
    """

    @extend_schema(responses={200: ScheduleSerializer(many=True)})
    def get(self, request):
        queryset = visible_schedules(request.user)
        params = request.query_params

        status_filter = params.get("status", Schedule.Status.CONFIRMED)
        if status_filter and status_filter != "ALL":
            queryset = queryset.filter(status=status_filter)

        officer_id = params.get("officerUserId")
        if officer_id:
            queryset = queryset.filter(officer_id=officer_id)

        application_id = params.get("applicationId")
        if application_id:
            queryset = queryset.filter(application_id=application_id)

        start = _parse_bound(params.get("from"), end_of_day=False)
        if start is not None:
            queryset = queryset.filter(scheduled_at__gte=start)

        end = _parse_bound(params.get("to"), end_of_day=True)
        if end is not None:
            queryset = queryset.filter(scheduled_at__lte=end)

        paginator = ContractPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)

        return paginator.get_paginated_response(ScheduleSerializer(page, many=True).data)


class ScheduleDetailView(APIView):
    @extend_schema(responses={200: ScheduleSerializer})
    def get(self, request, schedule_id):
        schedule = get_object_or_404(visible_schedules(request.user), id=schedule_id)

        return Response(ScheduleSerializer(schedule).data)


class RescheduleView(APIView):
    """POST /api/v1/schedules/{id}/reschedule/ — move the current appointment."""

    permission_classes = [IsAdminOrFieldStaff]

    @extend_schema(request=RescheduleSerializer, responses={200: ScheduleSerializer})
    def post(self, request, schedule_id):
        schedule = get_object_or_404(visible_schedules(request.user), id=schedule_id)

        serializer = RescheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            replacement = reschedule_visit(
                user=request.user,
                schedule=schedule,
                scheduled_at=serializer.validated_data["scheduledAt"],
                note=serializer.validated_data.get("scheduleNote", ""),
            )
        except OwnershipError as exc:
            raise PermissionDenied(str(exc))
        except IllegalTransition as exc:
            raise Conflict(str(exc))

        return Response(ScheduleSerializer(replacement).data)
