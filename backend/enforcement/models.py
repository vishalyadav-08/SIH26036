from uuid import uuid4
from django.db import models
from django.utils.translation import gettext_lazy as _

class ComplaintStatus(models.TextChoices):
    PENDING = "PENDING", _("Pending")
    INVESTIGATING = "INVESTIGATING", _("Investigating")
    RESOLVED = "RESOLVED", _("Resolved")
    DISMISSED = "DISMISSED", _("Dismissed")

class ConsumerComplaint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    consumer_name = models.CharField(max_length=200)
    consumer_phone = models.CharField(max_length=15)
    consumer_email = models.EmailField(blank=True)
    
    business_name = models.CharField(max_length=200)
    business_address = models.TextField()
    pincode = models.CharField(max_length=6)
    
    complaint_type = models.CharField(max_length=100) # e.g., Short Delivery, Overcharging, Unstamped Weight
    description = models.TextField()
    evidence_url = models.URLField(blank=True)
    
    status = models.CharField(max_length=20, choices=ComplaintStatus.choices, default=ComplaintStatus.PENDING)
    assigned_officer = models.ForeignKey("authentication.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_complaints")
    resolution_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Complaint by {self.consumer_name} against {self.business_name}"

class EnforcementActionType(models.TextChoices):
    SURPRISE_INSPECTION = "SURPRISE_INSPECTION", _("Surprise Inspection")
    COMPLAINT_INVESTIGATION = "COMPLAINT_INVESTIGATION", _("Complaint Investigation")
    RAID = "RAID", _("Raid")

class NoticeStatus(models.TextChoices):
    ISSUED = "ISSUED", _("Issued")
    COMPOUNDED = "COMPOUNDED", _("Compounded")
    PROSECUTED = "PROSECUTED", _("Prosecuted")
    CLOSED = "CLOSED", _("Closed")

class EnforcementAction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    action_type = models.CharField(max_length=50, choices=EnforcementActionType.choices)
    officer = models.ForeignKey("authentication.User", on_delete=models.PROTECT, related_name="enforcement_actions")
    business = models.ForeignKey("businesses.Business", null=True, blank=True, on_delete=models.SET_NULL, related_name="enforcement_actions")
    unregistered_business_name = models.CharField(max_length=200, blank=True)
    address = models.TextField()
    
    related_complaint = models.ForeignKey(ConsumerComplaint, null=True, blank=True, on_delete=models.SET_NULL, related_name="actions")
    
    action_date = models.DateTimeField()
    findings = models.TextField()
    
    seizure_memo_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Notice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    enforcement_action = models.ForeignKey(EnforcementAction, on_delete=models.CASCADE, related_name="notices")
    notice_number = models.CharField(max_length=100, unique=True)
    violation_sections = models.JSONField(default=list) # e.g., ["Sec 24", "Sec 33"]
    status = models.CharField(max_length=20, choices=NoticeStatus.choices, default=NoticeStatus.ISSUED)
    compounding_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    due_date = models.DateField()
    issue_date = models.DateField(auto_now_add=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
