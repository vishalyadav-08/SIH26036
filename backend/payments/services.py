from django.utils import timezone
from .models import FeeSchedule, PaymentTransaction, PaymentStatus
import uuid

class PaymentService:
    @staticmethod
    def calculate_fee(service_type, state_code="NAT", validity_years=1):
        # Retrieve the most recent active fee schedule
        today = timezone.now().date()
        fee_schedule = FeeSchedule.objects.filter(
            service_type=service_type,
            state_code__in=[state_code, "NAT"],
            effective_from__lte=today
        ).order_by('-state_code', '-effective_from').first()
        
        if not fee_schedule:
            # Fallback mock rates if db is unseeded
            base_fee = 500.00
            per_year_fee = 0.00
        else:
            base_fee = float(fee_schedule.base_fee)
            per_year_fee = float(fee_schedule.per_year_fee)
            
        total_base = base_fee + (per_year_fee * (validity_years - 1) if validity_years > 1 else 0)
        # Mocking no surcharge and 18% GST for simplicity
        gst = total_base * 0.18
        total = total_base + gst
        
        return {
            "base_fee": total_base,
            "surcharge": 0.0,
            "gst": gst,
            "total": total
        }
        
    @staticmethod
    def initiate_payment(business, user, service_type, related_entity_type, related_entity_id, validity_years=1):
        fee_data = PaymentService.calculate_fee(service_type, validity_years=validity_years)
        
        transaction_reference = f"TXN-{uuid.uuid4().hex[:10].upper()}"
        
        transaction = PaymentTransaction.objects.create(
            transaction_reference=transaction_reference,
            payer_business=business,
            payer_user=user,
            service_type=service_type,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            amount=fee_data["total"],
            fee_breakdown=fee_data,
            gateway="DEMO",
            status=PaymentStatus.INITIATED
        )
        return transaction
        
    @staticmethod
    def process_callback(transaction, payment_id, status=PaymentStatus.SUCCESS):
        transaction.gateway_payment_id = payment_id
        transaction.status = status
        if status == PaymentStatus.SUCCESS:
            transaction.paid_at = timezone.now()
            transaction.receipt_url = f"https://mock-storage.mapansetu.com/receipts/{transaction.transaction_reference}.pdf"
        transaction.save(update_fields=['gateway_payment_id', 'status', 'paid_at', 'receipt_url', 'updated_at'])
        
        # Link to licensing if it's a license application
        if status == PaymentStatus.SUCCESS and transaction.related_entity_type == "LICENSE_APPLICATION":
            from licensing.models import LicenseApplication, LicenseAppState
            try:
                app = LicenseApplication.objects.get(id=transaction.related_entity_id)
                # Auto-transition if it was waiting for payment
                if app.state == LicenseAppState.SUBMITTED:
                    # In a real app we might update it here, but typically an officer reviews next
                    pass 
            except LicenseApplication.DoesNotExist:
                pass
                
        return transaction
