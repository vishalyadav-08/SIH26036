from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from common.exceptions import Conflict

from .serializers import BusinessCreateSerializer, BusinessSerializer
from .services import AlreadyRegistered, create_business


class BusinessCreateView(APIView):
    """POST /api/v1/businesses — create a business profile."""

    @extend_schema(request=BusinessCreateSerializer, responses={201: BusinessSerializer})
    def post(self, request):
        serializer = BusinessCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            business = create_business(
                user=request.user, validated_data=serializer.validated_data
            )
        except AlreadyRegistered:
            raise Conflict("This account already has a business profile.")

        return Response(BusinessSerializer(business).data, status=status.HTTP_201_CREATED)


class BusinessMeView(APIView):
    """GET /api/v1/businesses/me — the signed-in user's own business."""

    @extend_schema(responses={200: BusinessSerializer})
    def get(self, request):
        if request.user.business_id is None:
            raise NotFound("This account is not linked to a business.")

        return Response(BusinessSerializer(request.user.business).data)
