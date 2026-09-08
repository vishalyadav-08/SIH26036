from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from common.pagination import ContractPagination
from common.permissions import IsAdmin

from .models import AuditLog
from .serializers import AuditLogSerializer
from .services import verify_chain


class AuditListView(APIView):
    """GET /api/v1/audit — the event chain. Administrators only."""

    permission_classes = [IsAdmin]

    @extend_schema(responses={200: AuditLogSerializer(many=True)})
    def get(self, request):
        queryset = AuditLog.objects.all()

        entity_type = request.query_params.get("entityType")
        if entity_type:
            queryset = queryset.filter(entity_type=entity_type)

        entity_id = request.query_params.get("entityId")
        if entity_id:
            queryset = queryset.filter(entity_id=entity_id)

        paginator = ContractPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)

        return paginator.get_paginated_response(AuditLogSerializer(page, many=True).data)


class AuditVerifyView(APIView):
    """GET /api/v1/audit/verify — recompute every link in the chain."""

    permission_classes = [IsAdmin]

    def get(self, request):
        ok, broken_event_id = verify_chain()

        return Response(
            {
                "chainValid": ok,
                "eventCount": AuditLog.objects.count(),
                "firstBrokenEventId": str(broken_event_id) if broken_event_id else None,
                # Tamper evidence, not immutability (ADR-012).
                "message": (
                    "Audit chain verified; no alteration detected."
                    if ok
                    else "Audit chain is broken — an event was altered or removed."
                ),
            }
        )
