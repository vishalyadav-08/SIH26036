from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from common.exceptions import Conflict
from common.pagination import ContractPagination
from common.permissions import IsAdmin, IsAdminOrFieldStaff
from inspections.services import visible_inspections

from .serializers import (
    CertificateSerializer,
    IssueCertificateSerializer,
    RevokeSerializer,
)
from .services import (
    CertificateError,
    issue_certificate,
    qr_svg,
    revoke_certificate,
    visible_certificates,
)


class CertificateListCreateView(APIView):
    def get_permissions(self):
        # Defence in depth: the service also refuses anyone who is not the
        # inspecting officer or an administrator.
        if self.request.method == "POST":
            return [IsAdminOrFieldStaff()]

        return super().get_permissions()

    @extend_schema(responses={200: CertificateSerializer(many=True)})
    def get(self, request):
        queryset = visible_certificates(request.user)

        certificate_status = request.query_params.get("status")
        if certificate_status:
            queryset = queryset.filter(status=certificate_status)

        paginator = ContractPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)

        return paginator.get_paginated_response(
            CertificateSerializer(page, many=True).data
        )

    @extend_schema(request=IssueCertificateSerializer, responses={201: CertificateSerializer})
    def post(self, request):
        serializer = IssueCertificateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        inspection = get_object_or_404(
            visible_inspections(request.user),
            id=serializer.validated_data["inspectionId"],
        )

        try:
            certificate = issue_certificate(user=request.user, inspection=inspection)
        except CertificateError as exc:
            raise Conflict(str(exc))

        return Response(
            CertificateSerializer(certificate).data, status=status.HTTP_201_CREATED
        )


class CertificateDetailView(APIView):
    @extend_schema(responses={200: CertificateSerializer})
    def get(self, request, certificate_id):
        certificate = get_object_or_404(
            visible_certificates(request.user), id=certificate_id
        )

        return Response(CertificateSerializer(certificate).data)


class CertificateQrView(APIView):
    """SVG QR encoding only the public verification URL."""

    def get(self, request, certificate_id):
        certificate = get_object_or_404(
            visible_certificates(request.user), id=certificate_id
        )

        return HttpResponse(qr_svg(certificate), content_type="image/svg+xml")


class CertificateRevokeView(APIView):
    permission_classes = [IsAdmin]

    @extend_schema(request=RevokeSerializer, responses={200: CertificateSerializer})
    def post(self, request, certificate_id):
        certificate = get_object_or_404(
            visible_certificates(request.user), id=certificate_id
        )

        serializer = RevokeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            certificate = revoke_certificate(
                user=request.user,
                certificate=certificate,
                reason=serializer.validated_data["reason"],
            )
        except CertificateError as exc:
            raise Conflict(str(exc))

        return Response(CertificateSerializer(certificate).data)
