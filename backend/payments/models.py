from uuid import uuid4
from django.db import models
from django.utils.translation import gettext_lazy as _

class ServiceType(models.TextChoices):
    MANUFACTURER_LICENSE_NEW = "MANUFACTURER_LICENSE_NEW", _("New Manufacturer License")
    MANUFACTURER_LICENSE_RENEWAL = "MANUFACTURER_LICENSE_RENEWAL", _("Manufacturer License Renewal")
    DEALER_LICENSE_NEW = "DEALER_LICENSE_NEW", _("New Dealer License")
    DEALER_LICENSE_RENEWAL = "DEALER_LICENSE_RENEWAL", _("Dealer License Renewal")
    REPAIRER_LICENSE_NEW = "REPAIRER_LICENSE_NEW", _("New Repairer License")
    REPAIRER_LICENSE_RENEWAL = "REPAIRER_LICENSE_RENEWAL", _("Repairer License Renewal")
    PACKER_REGISTRATION = "PACKER_REGISTRATION", _("Packer Registration")
    VERIFICATION_FEE = "VERIFICATION_FEE", _("Verification Fee")
    DUPLICATE_LICENSE = "DUPLICATE_LICENSE", _("Duplicate License")
    AMENDMENT_FEE = "AMENDMENT_FEE", _("Amendment Fee")
    COMPOUNDING_FEE = "COMPOUNDING_FEE", _("Compounding Fee")

class FeeSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    state_code = models.CharField(max_length=5, default="NAT")  # NAT = national default
    service_type = models.CharField(max_length=40, choices=ServiceType.choices)
    instrument_category = models.CharField(max_length=50, blank=True)
    base_fee = models.DecimalField(max_digits=10, decimal_places=2)
    per_year_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_surcharge_percent = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    gst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    effective_from = models.DateField()
    effective_until = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey("authentication.User", on_delete=models.PROTECT, related_name="created_fee_schedules")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-effective_from"]
        
    def __str__(self):
        return f"{self.service_type} - {self.state_code}"

class PaymentStatus(models.TextChoices):
    INITIATED = "INITIATED", _("Initiated")
    PENDING = "PENDING", _("Pending")
    SUCCESS = "SUCCESS", _("Success")
    FAILED = "FAILED", _("Failed")
    REFUNDED = "REFUNDED", _("Refunded")

class PaymentTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    transaction_reference = models.CharField(max_length=50, unique=True)
    payer_business = models.ForeignKey("businesses.Business", on_delete=models.PROTECT, related_name="payments")
    payer_user = models.ForeignKey("authentication.User", on_delete=models.PROTECT, related_name="initiated_payments")
    service_type = models.CharField(max_length=40, choices=ServiceType.choices)
    related_entity_type = models.CharField(max_length=30)  # e.g. LICENSE_APPLICATION, VERIFICATION
    related_entity_id = models.UUIDField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fee_breakdown = models.JSONField(default=dict, blank=True)  # {base, surcharge, gst, total}
    gateway = models.CharField(max_length=20, default="DEMO")  # RAZORPAY / UPI / DEMO
    gateway_order_id = models.CharField(max_length=100, blank=True)
    gateway_payment_id = models.CharField(max_length=100, blank=True)
    gateway_signature = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=15, choices=PaymentStatus.choices, default=PaymentStatus.INITIATED)
    receipt_url = models.URLField(blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        
    def __str__(self):
        return f"{self.transaction_reference} - {self.status}"
