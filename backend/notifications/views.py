from drf_spectacular.utils import extend_schema
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from common.pagination import ContractPagination

from .models import Notification
from .serializers import MarkReadSerializer, NotificationSerializer
from .services import mark_all_read, mark_read, unread_count, visible_notifications

TRUTHY = {"1", "true", "yes"}


class NotificationListView(APIView):
    """GET /api/v1/notifications/ — the caller's own inbox, newest first."""

    @extend_schema(responses={200: NotificationSerializer(many=True)})
    def get(self, request):
        queryset = visible_notifications(request.user)
        params = request.query_params

        if (params.get("unreadOnly") or "").lower() in TRUTHY:
            queryset = queryset.filter(read_at__isnull=True)

        notification_type = params.get("type")
        if notification_type:
            queryset = queryset.filter(type=notification_type)

        paginator = ContractPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)

        return paginator.get_paginated_response(
            NotificationSerializer(page, many=True).data
        )


class UnreadCountView(APIView):
    """GET /api/v1/notifications/unread-count/ — for the bell badge."""

    @extend_schema(responses={200: dict})
    def get(self, request):
        return Response({"unreadCount": unread_count(request.user)})


class MarkReadView(APIView):
    """POST /api/v1/notifications/{id}/read/ — idempotent."""

    @extend_schema(request=MarkReadSerializer, responses={200: NotificationSerializer})
    def post(self, request, notification_id):
        # Scoped to the recipient: someone else's notification is 404, not
        # 403, so ids cannot be probed.
        notification = get_object_or_404(
            visible_notifications(request.user), id=notification_id
        )

        serializer = MarkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        notification = mark_read(
            user=request.user,
            notification=notification,
            read_at=serializer.validated_data.get("readAt"),
        )

        return Response(NotificationSerializer(notification).data)


class MarkAllReadView(APIView):
    """POST /api/v1/notifications/read-all/"""

    @extend_schema(responses={200: dict})
    def post(self, request):
        updated = mark_all_read(user=request.user)

        return Response({"markedRead": updated, "unreadCount": 0})
