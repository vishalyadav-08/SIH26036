from django.db.models import Q
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from authentication.models import User
from common.exceptions import Conflict
from common.pagination import ContractPagination
from common.permissions import IsBusinessOrAdmin

from .serializers import (
    InstrumentCreateSerializer,
    InstrumentSerializer,
    InstrumentUpdateSerializer,
)
from .services import (
    DuplicateInstrument,
    OwnershipError,
    create_instrument,
    deactivate_instrument,
    update_instrument,
    visible_instruments,
)


class InstrumentListCreateView(APIView):
    """GET /api/v1/instruments — list. POST — register.

    All authenticated roles may list (scoped by visible_instruments); only a
    shop owner or an administrator may register one.
    """

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsBusinessOrAdmin()]

        return super().get_permissions()

    @extend_schema(responses={200: InstrumentSerializer(many=True)})
    def get(self, request):
        queryset = visible_instruments(request.user)

        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(instrument_number__icontains=search)
                | Q(serial_number__icontains=search)
                | Q(manufacturer__icontains=search)
                | Q(model__icontains=search)
                | Q(location__icontains=search)
            )

        instrument_status = request.query_params.get("status")
        if instrument_status:
            queryset = queryset.filter(status=instrument_status)

        instrument_type = request.query_params.get("instrumentType")
        if instrument_type:
            queryset = queryset.filter(instrument_type=instrument_type)

        # ADMIN only: narrowing to one business. For a BUSINESS user the scope
        # is already their own, so honouring this would be a no-op at best and
        # a probe for other businesses' data at worst.
        business_id = request.query_params.get("businessId")
        if business_id and request.user.role == User.Role.ADMIN:
            queryset = queryset.filter(business_id=business_id)

        paginator = ContractPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)

        return paginator.get_paginated_response(InstrumentSerializer(page, many=True).data)

    @extend_schema(request=InstrumentCreateSerializer, responses={201: InstrumentSerializer})
    def post(self, request):
        serializer = InstrumentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            instrument = create_instrument(
                user=request.user, validated_data=serializer.validated_data
            )
        except OwnershipError as exc:
            raise PermissionDenied(str(exc))
        except DuplicateInstrument:
            raise Conflict("An instrument with this number or serial already exists.")

        return Response(
            InstrumentSerializer(instrument).data, status=status.HTTP_201_CREATED
        )


class InstrumentDetailView(APIView):
    """GET, PATCH and DELETE for a single instrument.

    Officers read instruments through their assigned work but never modify the
    registry — the owner does that.
    """

    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE"):
            return [IsBusinessOrAdmin()]

        return super().get_permissions()

    def get_instrument(self, request, instrument_id):
        # Looked up inside the caller's visible scope, so an instrument owned by
        # someone else is a 404 rather than a 403 — a 403 would confirm the id
        # exists and leak the shape of another business's registry.
        return get_object_or_404(visible_instruments(request.user), id=instrument_id)

    @extend_schema(responses={200: InstrumentSerializer})
    def get(self, request, instrument_id):
        instrument = self.get_instrument(request, instrument_id)

        return Response(InstrumentSerializer(instrument).data)

    @extend_schema(request=InstrumentUpdateSerializer, responses={200: InstrumentSerializer})
    def patch(self, request, instrument_id):
        instrument = self.get_instrument(request, instrument_id)

        serializer = InstrumentUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            instrument = update_instrument(
                instrument=instrument, validated_data=serializer.validated_data
            )
        except DuplicateInstrument:
            raise Conflict("An instrument with this number or serial already exists.")

        return Response(InstrumentSerializer(instrument).data)

    @extend_schema(responses={200: InstrumentSerializer})
    def delete(self, request, instrument_id):
        instrument = self.get_instrument(request, instrument_id)

        instrument = deactivate_instrument(instrument=instrument)

        return Response(InstrumentSerializer(instrument).data, status=status.HTTP_200_OK)
