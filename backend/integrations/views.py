from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import IntegrationLog, DigiLockerDocument
from .serializers import IntegrationLogSerializer, DigiLockerDocumentSerializer
from .services import IntegrationService
from rest_framework.exceptions import PermissionDenied

class IntegrationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IntegrationLog.objects.all()
    serializer_class = IntegrationLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return self.queryset
        return self.queryset.none()

class DigiLockerDocumentViewSet(viewsets.ModelViewSet):
    queryset = DigiLockerDocument.objects.all()
    serializer_class = DigiLockerDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset
        elif user.role == 'BUSINESS':
            return self.queryset.filter(business=user.business)
        return self.queryset.none()

    @action(detail=False, methods=['post'])
    def pull(self, request):
        if request.user.role != 'BUSINESS':
            raise PermissionDenied("Only businesses can pull DigiLocker documents.")
            
        doc_type = request.data.get('document_type', 'PAN_CARD')
        doc = IntegrationService.pull_digilocker_document(request.user.business, doc_type)
        return Response(self.get_serializer(doc).data)
