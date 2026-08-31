from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from .analytics import admin_dashboard
from .permissions import IsAdmin


class AdminDashboardView(APIView):
    """GET /api/v1/dashboards/admin — summary metrics. Administrators only."""

    permission_classes = [IsAdmin]

    @extend_schema(responses={200: dict})
    def get(self, request):
        return Response(admin_dashboard())
