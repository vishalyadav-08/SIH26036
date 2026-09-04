from drf_spectacular.utils import extend_schema
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from common.pagination import ContractPagination
from common.permissions import IsAdminOrFieldStaff

from .serializers import (
    SyncBatchResponseSerializer,
    SyncBatchSerializer,
    SyncRecordSerializer,
)
from .services import process_batch, visible_sync_records


class SyncBatchView(APIView):
    """POST /api/v1/sync/ — apply a batch of offline operations.

    Always 200 with one result per operation. A rejected operation is a
    per-item FAILED or CONFLICT, not an HTTP error, so one bad record does
    not hide the outcome of the rest.
    """

    permission_classes = [IsAdminOrFieldStaff]

    @extend_schema(request=SyncBatchSerializer, responses={200: SyncBatchResponseSerializer})
    def post(self, request):
        serializer = SyncBatchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        results = process_batch(
            user=request.user, operations=serializer.validated_data["operations"]
        )

        return Response({"results": results})


class SyncRecordListView(APIView):
    """GET /api/v1/sync/ — an officer's own operations; every officer's for admins."""

    permission_classes = [IsAdminOrFieldStaff]

    @extend_schema(responses={200: SyncRecordSerializer(many=True)})
    def get(self, request):
        queryset = visible_sync_records(request.user)

        status_filter = request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        paginator = ContractPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)

        return paginator.get_paginated_response(SyncRecordSerializer(page, many=True).data)


class SyncRecordDetailView(APIView):
    permission_classes = [IsAdminOrFieldStaff]

    @extend_schema(responses={200: SyncRecordSerializer})
    def get(self, request, client_operation_id):
        record = get_object_or_404(
            visible_sync_records(request.user), client_operation_id=client_operation_id
        )

        return Response(SyncRecordSerializer(record).data)
