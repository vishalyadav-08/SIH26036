from uuid import uuid4
from django.db import models
from django.utils.translation import gettext_lazy as _

class SealType(models.TextChoices):
    LEAD = "LEAD", _("Lead Seal")
    PAPER = "PAPER", _("Paper Seal")
    HOLOGRAPHIC = "HOLOGRAPHIC", _("Holographic Seal")
    DIGITAL = "DIGITAL", _("Digital e-Seal")

class SealInventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    state = models.ForeignKey("jurisdiction.State", on_delete=models.CASCADE, related_name="seal_inventories")
    seal_type = models.CharField(max_length=20, choices=SealType.choices)
    series_prefix = models.CharField(max_length=10)
    starting_number = models.PositiveBigIntegerField()
    ending_number = models.PositiveBigIntegerField()
    
    received_date = models.DateField(auto_now_add=True)
    is_fully_allocated = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.series_prefix} ({self.starting_number}-{self.ending_number})"

class SealAllocation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    inventory = models.ForeignKey(SealInventory, on_delete=models.CASCADE, related_name="allocations")
    officer = models.ForeignKey("authentication.User", on_delete=models.PROTECT, related_name="seal_allocations")
    starting_number = models.PositiveBigIntegerField()
    ending_number = models.PositiveBigIntegerField()
    
    allocation_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Allocated to {self.officer.display_name}: {self.starting_number}-{self.ending_number}"

class StandardType(models.TextChoices):
    REFERENCE = "REFERENCE", _("Reference Standard")
    SECONDARY = "SECONDARY", _("Secondary Standard")
    WORKING = "WORKING", _("Working Standard")

class VerificationStandard(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    state = models.ForeignKey("jurisdiction.State", on_delete=models.CASCADE, related_name="verification_standards")
    standard_type = models.CharField(max_length=20, choices=StandardType.choices)
    equipment_name = models.CharField(max_length=200)
    identification_number = models.CharField(max_length=100, unique=True)
    
    calibration_date = models.DateField()
    next_calibration_due = models.DateField()
    calibrated_by = models.CharField(max_length=200)
    
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.equipment_name} ({self.identification_number})"
