from django.core.files.storage import FileSystemStorage, default_storage
from django.http import FileResponse, HttpResponseRedirect
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from common.exceptions import Conflict, FileTooLarge, UnsupportedMediaType
from common.pagination import ContractPagination
from common.permissions import IsAdminOrFieldStaff
from inspections.services import visible_inspections

from .serializers import EvidenceSerializer, EvidenceUploadSerializer
from .services import (
    EvidenceError,
    EvidenceTooLarge,
    IntegrityMismatch,
    UnsupportedEvidenceType,
    delete_evidence,
    store_evidence,
    visible_evidence,
)


class InspectionEvidenceView(APIView):
    """GET/POST /api/v1/inspections/{id}/evidence/"""

    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminOrFieldStaff()]

        return super().get_permissions()

    @extend_schema(responses={200: EvidenceSerializer(many=True)})
    def get(self, request, inspection_id):
        inspection = get_object_or_404(visible_inspections(request.user), id=inspection_id)

        queryset = visible_evidence(request.user).filter(inspection=inspection)

        paginator = ContractPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)

        return paginator.get_paginated_response(EvidenceSerializer(page, many=True).data)

    @extend_schema(request=EvidenceUploadSerializer, responses={201: EvidenceSerializer})
    def post(self, request, inspection_id):
        inspection = get_object_or_404(
            visible_inspections(request.user).select_related("application__instrument"),
            id=inspection_id,
        )

        serializer = EvidenceUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        try:
            evidence, created = store_evidence(
                user=request.user,
                inspection=inspection,
                uploaded=data["file"],
                evidence_type=data.get("evidenceType"),
                captured_at=data.get("capturedAt"),
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                gps_accuracy_meters=data.get("gpsAccuracyMeters"),
                notes=data.get("notes", ""),
                client_sha256=data.get("sha256"),
                client_operation_id=data.get("clientOperationId"),
            )
        except EvidenceTooLarge as exc:
            raise FileTooLarge(str(exc))
        except UnsupportedEvidenceType as exc:
            raise UnsupportedMediaType(str(exc))
        except IntegrityMismatch as exc:
            raise ValidationError({"sha256": str(exc)})
        except EvidenceError as exc:
            raise Conflict(str(exc))

        return Response(
            EvidenceSerializer(evidence).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class EvidenceDetailView(APIView):
    """GET/DELETE /api/v1/evidence/{id}/"""

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminOrFieldStaff()]

        return super().get_permissions()

    @extend_schema(responses={200: EvidenceSerializer})
    def get(self, request, evidence_id):
        evidence = get_object_or_404(visible_evidence(request.user), id=evidence_id)

        return Response(EvidenceSerializer(evidence).data)

    @extend_schema(responses={204: None})
    def delete(self, request, evidence_id):
        evidence = get_object_or_404(visible_evidence(request.user), id=evidence_id)

        try:
            delete_evidence(user=request.user, evidence=evidence)
        except EvidenceError as exc:
            raise Conflict(str(exc))

        return Response(status=status.HTTP_204_NO_CONTENT)


class EvidenceFileView(APIView):
    """GET /api/v1/evidence/{id}/file/ — the bytes.

    Access is decided here, per request, against inspection visibility. With
    object storage configured this redirects to a short-lived signed URL; on
    the local filesystem it streams the file directly.
    """

    def get(self, request, evidence_id):
        evidence = get_object_or_404(visible_evidence(request.user), id=evidence_id)

        if isinstance(default_storage, FileSystemStorage):
            response = FileResponse(
                default_storage.open(evidence.object_key, "rb"),
                content_type=evidence.mime_type,
            )
            response["Content-Disposition"] = (
                f'inline; filename="{evidence.original_file_name}"'
            )
            response["X-Content-Type-Options"] = "nosniff"

            return response

        return HttpResponseRedirect(default_storage.url(evidence.object_key))
