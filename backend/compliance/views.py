from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import QuarterlyReturn, ProductionRecord, SaleRecord, RepairRecord
from .serializers import (
    QuarterlyReturnSerializer, ProductionRecordSerializer, 
    SaleRecordSerializer, RepairRecordSerializer
)
from .services import ComplianceService
from rest_framework.exceptions import PermissionDenied, ValidationError

class QuarterlyReturnViewSet(viewsets.ModelViewSet):
    queryset = QuarterlyReturn.objects.all()
    serializer_class = QuarterlyReturnSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'OFFICER']:
            return self.queryset
        elif user.role == 'BUSINESS':
            # Optionally run overdue checks on fetch
            qs = self.queryset.filter(business=user.business)
            for ret in qs:
                ComplianceService.check_overdue(ret)
            return qs
        return self.queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'BUSINESS':
            raise PermissionDenied("Only businesses can file returns.")
            
        financial_year = serializer.validated_data.get('financial_year')
        quarter = serializer.validated_data.get('quarter')
        due_date = ComplianceService.calculate_due_date(financial_year, quarter)
        
        serializer.save(
            business=user.business,
            submitted_by=user,
            due_date=due_date
        )

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        return_obj = self.get_object()
        if return_obj.business != request.user.business and request.user.role != 'ADMIN':
            raise PermissionDenied("Cannot submit returns for another business.")
            
        try:
            return_obj = ComplianceService.submit_return(return_obj)
            return Response(self.get_serializer(return_obj).data)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProductionRecordViewSet(viewsets.ModelViewSet):
    queryset = ProductionRecord.objects.all()
    serializer_class = ProductionRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        return_id = self.kwargs.get('return_pk')
        try:
            qr = QuarterlyReturn.objects.get(id=return_id, business=self.request.user.business)
        except QuarterlyReturn.DoesNotExist:
            raise PermissionDenied("Quarterly return not found or unauthorized.")
            
        if qr.status not in ['DRAFT', 'OVERDUE']:
            raise ValidationError("Cannot add records to a submitted return.")
            
        serializer.save(quarterly_return=qr)

class SaleRecordViewSet(viewsets.ModelViewSet):
    queryset = SaleRecord.objects.all()
    serializer_class = SaleRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        return_id = self.kwargs.get('return_pk')
        try:
            qr = QuarterlyReturn.objects.get(id=return_id, business=self.request.user.business)
        except QuarterlyReturn.DoesNotExist:
            raise PermissionDenied("Quarterly return not found or unauthorized.")
            
        if qr.status not in ['DRAFT', 'OVERDUE']:
            raise ValidationError("Cannot add records to a submitted return.")
            
        serializer.save(quarterly_return=qr)

class RepairRecordViewSet(viewsets.ModelViewSet):
    queryset = RepairRecord.objects.all()
    serializer_class = RepairRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        return_id = self.kwargs.get('return_pk')
        try:
            qr = QuarterlyReturn.objects.get(id=return_id, business=self.request.user.business)
        except QuarterlyReturn.DoesNotExist:
            raise PermissionDenied("Quarterly return not found or unauthorized.")
            
        if qr.status not in ['DRAFT', 'OVERDUE']:
            raise ValidationError("Cannot add records to a submitted return.")
            
        serializer.save(quarterly_return=qr)
