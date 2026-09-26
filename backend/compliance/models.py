from uuid import uuid4
from django.db import models
from django.utils.translation import gettext_lazy as _

class ReturnQuarter(models.TextChoices):
    Q1 = "Q1", _("Q1 (Apr-Jun)")
    Q2 = "Q2", _("Q2 (Jul-Sep)")
    Q3 = "Q3", _("Q3 (Oct-Dec)")
    Q4 = "Q4", _("Q4 (Jan-Mar)")

class ReturnStatus(models.TextChoices):
    DRAFT = "DRAFT", _("Draft")
    SUBMITTED = "SUBMITTED", _("Submitted")
    LATE_SUBMITTED = "LATE_SUBMITTED", _("Submitted Late")
    OVERDUE = "OVERDUE", _("Overdue")

class QuarterlyReturn(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    business = models.ForeignKey("businesses.Business", on_delete=models.CASCADE, related_name="returns")
    submitted_by = models.ForeignKey("authentication.User", on_delete=models.PROTECT, related_name="submitted_returns")
    license = models.ForeignKey("licensing.License", on_delete=models.PROTECT, related_name="returns")
    
    financial_year = models.CharField(max_length=9)  # e.g., "2023-2024"
    quarter = models.CharField(max_length=2, choices=ReturnQuarter.choices)
    
    status = models.CharField(max_length=15, choices=ReturnStatus.choices, default=ReturnStatus.DRAFT)
    total_manufactured = models.PositiveIntegerField(default=0)
    total_sold = models.PositiveIntegerField(default=0)
    total_repaired = models.PositiveIntegerField(default=0)
    
    submission_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField()
    late_fee_paid = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ["license", "financial_year", "quarter"]
        ordering = ["-financial_year", "-quarter"]

    def __str__(self):
        return f"{self.business.legal_name} - {self.financial_year} {self.quarter}"

class ProductionRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    quarterly_return = models.ForeignKey(QuarterlyReturn, on_delete=models.CASCADE, related_name="production_records")
    instrument_type = models.CharField(max_length=100)
    quantity_manufactured = models.PositiveIntegerField()
    remarks = models.TextField(blank=True)

class SaleRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    quarterly_return = models.ForeignKey(QuarterlyReturn, on_delete=models.CASCADE, related_name="sale_records")
    instrument_type = models.CharField(max_length=100)
    buyer_name = models.CharField(max_length=200)
    buyer_address = models.TextField()
    quantity = models.PositiveIntegerField()
    dispatch_date = models.DateField()
    invoice_number = models.CharField(max_length=50, blank=True)

class RepairRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    quarterly_return = models.ForeignKey(QuarterlyReturn, on_delete=models.CASCADE, related_name="repair_records")
    instrument_type = models.CharField(max_length=100)
    owner_name = models.CharField(max_length=200)
    nature_of_repair = models.TextField()
    repair_date = models.DateField()
    verification_certificate_number = models.CharField(max_length=100, blank=True)
