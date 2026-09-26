from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import State, Division, District, JurisdictionAssignment
from .serializers import (
    StateSerializer, DivisionSerializer, DistrictSerializer, JurisdictionAssignmentSerializer
)
from .services import JurisdictionService

class StateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = State.objects.filter(is_active=True)
    serializer_class = StateSerializer
    permission_classes = [permissions.IsAuthenticated]

class DivisionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Division.objects.all()
    serializer_class = DivisionSerializer
    permission_classes = [permissions.IsAuthenticated]

class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = District.objects.all()
    serializer_class = DistrictSerializer
    permission_classes = [permissions.IsAuthenticated]

class JurisdictionAssignmentViewSet(viewsets.ModelViewSet):
    queryset = JurisdictionAssignment.objects.all()
    serializer_class = JurisdictionAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset
        # Officers can see assignments in their state
        return self.queryset.none()
        
    @action(detail=False, methods=['get'])
    def resolve(self, request):
        pincode = request.query_params.get('pincode')
        if not pincode:
            return Response({"error": "pincode parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        district = JurisdictionService.resolve_district(pincode)
        if district:
            return Response(DistrictSerializer(district).data)
        return Response({"error": "No jurisdiction found for this pincode"}, status=status.HTTP_404_NOT_FOUND)
