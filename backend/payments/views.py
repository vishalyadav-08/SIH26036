from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PaymentTransaction, FeeSchedule
from .serializers import PaymentTransactionSerializer, FeeScheduleSerializer
from .services import PaymentService
from rest_framework.exceptions import ValidationError

class FeeScheduleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FeeSchedule.objects.all()
    serializer_class = FeeScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def calculate(self, request):
        service_type = request.data.get('service_type')
        validity_years = int(request.data.get('validity_years', 1))
        state_code = request.data.get('state_code', 'NAT')
        
        if not service_type:
            return Response({"error": "service_type is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        fee_data = PaymentService.calculate_fee(service_type, state_code, validity_years)
        return Response(fee_data)

class PaymentTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PaymentTransaction.objects.all()
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'OFFICER']:
            return self.queryset
        elif user.role == 'BUSINESS':
            return self.queryset.filter(payer_business=user.business)
        return self.queryset.none()

    @action(detail=False, methods=['post'])
    def initiate(self, request):
        if request.user.role != 'BUSINESS':
            return Response({"error": "Only businesses can initiate payments"}, status=status.HTTP_403_FORBIDDEN)
            
        service_type = request.data.get('service_type')
        related_entity_type = request.data.get('related_entity_type')
        related_entity_id = request.data.get('related_entity_id')
        validity_years = int(request.data.get('validity_years', 1))
        
        if not all([service_type, related_entity_type, related_entity_id]):
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            
        transaction = PaymentService.initiate_payment(
            business=request.user.business,
            user=request.user,
            service_type=service_type,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            validity_years=validity_years
        )
        return Response(self.get_serializer(transaction).data)

    @action(detail=True, methods=['post'])
    def callback(self, request, pk=None):
        transaction = self.get_object()
        # In a real scenario, this would be a webhook verifying Razorpay signatures
        payment_id = request.data.get('gateway_payment_id', 'mock_payment_123')
        payment_status = request.data.get('status', 'SUCCESS')
        
        transaction = PaymentService.process_callback(transaction, payment_id, payment_status)
        return Response(self.get_serializer(transaction).data)
