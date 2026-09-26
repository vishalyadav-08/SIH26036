from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LicenseApplication, License, LicenseDocument
from .serializers import LicenseApplicationSerializer, LicenseSerializer, LicenseDocumentSerializer
from .services import LicenseApplicationService
from rest_framework.exceptions import ValidationError

class LicenseApplicationViewSet(viewsets.ModelViewSet):
    queryset = LicenseApplication.objects.all()
    serializer_class = LicenseApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset
        elif user.role == 'OFFICER':
            # Simplified for now: officer sees all or assigned
            return self.queryset
        elif user.role == 'BUSINESS':
            return self.queryset.filter(business=user.business)
        return self.queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'BUSINESS':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only business users can create license applications.")
        serializer.save(submitted_by=user, business=user.business)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        application = self.get_object()
        if application.business != request.user.business:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            application = LicenseApplicationService.submit_application(application)
            return Response(self.get_serializer(application).data)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        if request.user.role not in ['ADMIN', 'OFFICER']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        application = self.get_object()
        try:
            application = LicenseApplicationService.assign_reviewer(application, request.user)
            return Response(self.get_serializer(application).data)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if request.user.role not in ['ADMIN', 'OFFICER']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        application = self.get_object()
        try:
            application, license_obj = LicenseApplicationService.approve_application(application)
            return Response({
                "application": self.get_serializer(application).data,
                "license": LicenseSerializer(license_obj).data
            })
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if request.user.role not in ['ADMIN', 'OFFICER']:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        reason = request.data.get("rejection_reason")
        if not reason:
            return Response({"error": "rejection_reason is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        application = self.get_object()
        try:
            application = LicenseApplicationService.reject_application(application, reason)
            return Response(self.get_serializer(application).data)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LicenseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = License.objects.all()
    serializer_class = LicenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN' or user.role == 'OFFICER':
            return self.queryset
        elif user.role == 'BUSINESS':
            return self.queryset.filter(business=user.business)
        return self.queryset.none()
