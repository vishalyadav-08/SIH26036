from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.services import IllegalTransition, OwnershipError, visible_applications
from common.exceptions import Conflict
from common.pagination import ContractPagination
from common.permissions import IsOfficer

from .serializers import (
    CompleteInspectionSerializer,
    InspectionSerializer,
    MeasurementCreateSerializer,
    MeasurementSerializer,
    StartInspectionSerializer,
)
from .services import (
    InspectionError,
    add_measurement,
    complete_inspection,
    start_inspection,
    visible_inspections,
)


def _handle(fn, **kwargs):
    try:
        return fn(**kwargs)
    except OwnershipError as exc:
        raise PermissionDenied(str(exc))
    except InspectionError as exc:
        raise Conflict(str(exc))
    except IllegalTransition as exc:
        raise Conflict(str(exc))


class InspectionListCreateView(APIView):
    def get_permissions(self):
        # Starting an inspection is the officer's act. Owners and admins may
        # read the record, but performing the work is not delegable.
        if self.request.method == "POST":
            return [IsOfficer()]

        return super().get_permissions()

    @extend_schema(responses={200: InspectionSerializer(many=True)})
    def get(self, request):
        queryset = visible_inspections(request.user).prefetch_related("measurements")

        paginator = ContractPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)

        return paginator.get_paginated_response(
            InspectionSerializer(page, many=True).data
        )

    @extend_schema(request=StartInspectionSerializer, responses={201: InspectionSerializer})
    def post(self, request):
        serializer = StartInspectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application = get_object_or_404(
            visible_applications(request.user),
            id=serializer.validated_data["applicationId"],
        )

        inspection = _handle(start_inspection, user=request.user, application=application)

        return Response(
            InspectionSerializer(inspection).data, status=status.HTTP_201_CREATED
        )


class InspectionDetailView(APIView):
    @extend_schema(responses={200: InspectionSerializer})
    def get(self, request, inspection_id):
        inspection = get_object_or_404(
            visible_inspections(request.user).prefetch_related("measurements"),
            id=inspection_id,
        )

        return Response(InspectionSerializer(inspection).data)


class MeasurementView(APIView):
    permission_classes = [IsOfficer]

    @extend_schema(request=MeasurementCreateSerializer, responses={201: MeasurementSerializer})
    def post(self, request, inspection_id):
        inspection = get_object_or_404(visible_inspections(request.user), id=inspection_id)

        serializer = MeasurementCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        measurement = _handle(
            add_measurement,
            user=request.user,
            inspection=inspection,
            label=data["label"],
            nominal_value=data["nominalValue"],
            observed_value=data["observedValue"],
            unit=data["unit"],
        )

        return Response(
            MeasurementSerializer(measurement).data, status=status.HTTP_201_CREATED
        )


class CompleteInspectionView(APIView):
    permission_classes = [IsOfficer]

    @extend_schema(request=CompleteInspectionSerializer, responses={200: InspectionSerializer})
    def post(self, request, inspection_id):
        inspection = get_object_or_404(visible_inspections(request.user), id=inspection_id)

        serializer = CompleteInspectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        inspection = _handle(
            complete_inspection,
            user=request.user,
            inspection=inspection,
            result=data["result"],
            notes=data.get("notes", ""),
            gps=data.get("gps"),
        )

        return Response(InspectionSerializer(inspection).data)
