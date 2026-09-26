from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SealInventory, SealAllocation, VerificationStandard
from .serializers import SealInventorySerializer, SealAllocationSerializer, VerificationStandardSerializer
from rest_framework.exceptions import PermissionDenied

class SealInventoryViewSet(viewsets.ModelViewSet):
    queryset = SealInventory.objects.all()
    serializer_class = SealInventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset
        # Simplified: Officers might only see their state's inventory
        return self.queryset.none()

class SealAllocationViewSet(viewsets.ModelViewSet):
    queryset = SealAllocation.objects.all()
    serializer_class = SealAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset
        elif user.role in ['OFFICER', 'LMO', 'GATC']:
            return self.queryset.filter(officer=user)
        return self.queryset.none()

class VerificationStandardViewSet(viewsets.ModelViewSet):
    queryset = VerificationStandard.objects.all()
    serializer_class = VerificationStandardSerializer
    permission_classes = [permissions.IsAuthenticated]
