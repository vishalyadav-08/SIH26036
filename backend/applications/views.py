from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from common.exceptions import Conflict
from common.pagination import ContractPagination
from common.permissions import IsAdmin, IsBusinessOrAdmin

from .serializers import (
    ApplicationCreateSerializer,
    ApplicationSerializer,
    AssignSerializer,
    ReasonSerializer,
    ScheduleSerializer,
)
from .services import (
    IllegalTransition,
    OwnershipError,
    assign_officer,
    cancel_application,
    create_application,
    reject_application,
    schedule_application,
    submit_application,
    visible_applications,
)


def _handle(fn, *args, **kwargs):
    """Map domain errors onto the contract's status codes.

    IllegalTransition is 409, not 400: the payload was well formed, the
    current state simply does not permit the move (TESTING_SECURITY.md test 5).
    """
    try:
        return fn(*args, **kwargs)
    except OwnershipError as exc:
        raise PermissionDenied(str(exc))
    except IllegalTransition as exc:
        raise Conflict(str(exc))


class ApplicationListCreateView(APIView):
    def get_permissions(self):
        # Only a shop owner raises a verification request (an admin may do it
        # on their behalf). An officer receives work; they do not create it.
        if self.request.method == "POST":
            return [IsBusinessOrAdmin()]

        return super().get_permissions()

    @extend_schema(responses={200: ApplicationSerializer(many=True)})
    def get(self, request):
        queryset = visible_applications(request.user)

        state = request.query_params.get("state")
        if state:
            queryset = queryset.filter(state=state)

        instrument_id = request.query_params.get("instrumentId")
        if instrument_id:
            queryset = queryset.filter(instrument_id=instrument_id)

        paginator = ContractPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)

        return paginator.get_paginated_response(
            ApplicationSerializer(page, many=True).data
        )

    @extend_schema(request=ApplicationCreateSerializer, responses={201: ApplicationSerializer})
    def post(self, request):
        serializer = ApplicationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        application = _handle(
            create_application,
            user=request.user,
            instrument_id=data["instrumentId"],
            reason=data.get("reason", ""),
            submit=data["submit"],
        )

        return Response(
            ApplicationSerializer(application).data, status=status.HTTP_201_CREATED
        )


class ApplicationDetailView(APIView):
    @extend_schema(responses={200: ApplicationSerializer})
    def get(self, request, application_id):
        application = get_object_or_404(
            visible_applications(request.user), id=application_id
        )

        return Response(ApplicationSerializer(application).data)


class ApplicationActionView(APIView):
    """Base for the state-changing endpoints."""

    def get_application(self, request, application_id):
        return get_object_or_404(visible_applications(request.user), id=application_id)


class SubmitView(ApplicationActionView):
    permission_classes = [IsBusinessOrAdmin]

    @extend_schema(responses={200: ApplicationSerializer})
    def post(self, request, application_id):
        application = _handle(
            submit_application,
            user=request.user,
            application=self.get_application(request, application_id),
        )

        return Response(ApplicationSerializer(application).data)


class AssignView(ApplicationActionView):
    """Assignment is an administrator action — it is how work reaches officers."""

    permission_classes = [IsAdmin]

    @extend_schema(request=AssignSerializer, responses={200: ApplicationSerializer})
    def post(self, request, application_id):
        serializer = AssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application = _handle(
            assign_officer,
            user=request.user,
            application=self.get_application(request, application_id),
            officer_id=serializer.validated_data["officerUserId"],
            note=serializer.validated_data.get("assignmentNote", ""),
        )

        return Response(ApplicationSerializer(application).data)


class ScheduleView(ApplicationActionView):
    @extend_schema(request=ScheduleSerializer, responses={200: ApplicationSerializer})
    def post(self, request, application_id):
        serializer = ScheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application = _handle(
            schedule_application,
            user=request.user,
            application=self.get_application(request, application_id),
            scheduled_at=serializer.validated_data["scheduledAt"],
            note=serializer.validated_data.get("scheduleNote", ""),
        )

        return Response(ApplicationSerializer(application).data)


class RejectView(ApplicationActionView):
    permission_classes = [IsAdmin]

    @extend_schema(request=ReasonSerializer, responses={200: ApplicationSerializer})
    def post(self, request, application_id):
        serializer = ReasonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application = _handle(
            reject_application,
            user=request.user,
            application=self.get_application(request, application_id),
            reason=serializer.validated_data["reason"],
        )

        return Response(ApplicationSerializer(application).data)


class CancelView(ApplicationActionView):
    @extend_schema(request=ReasonSerializer, responses={200: ApplicationSerializer})
    def post(self, request, application_id):
        serializer = ReasonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application = _handle(
            cancel_application,
            user=request.user,
            application=self.get_application(request, application_id),
            reason=serializer.validated_data["reason"],
        )

        return Response(ApplicationSerializer(application).data)
