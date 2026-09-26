import uuid

from django.db import models


class Business(models.Model):
    """Organization or person responsible for instruments (DATA_MODEL.md).

    The MVP makes no claim of validating government registration — these are
    self-declared, synthetic prototype records.
    """

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    legal_name = models.CharField(max_length=200)
    trade_name = models.CharField(max_length=200, blank=True)
    
    # Constitution & Tax info based on scraped rules
    constitution_type = models.CharField(max_length=100, blank=True, null=True) # Proprietorship, Partnership, etc.
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    pan_number = models.CharField(max_length=50, blank=True, null=True)
    
    # Intended Business Types (Manufacturer, Dealer, Repairer, Packer)
    # Stored as JSON or simple boolean flags for the MVP
    is_manufacturer = models.BooleanField(default=False)
    is_dealer = models.BooleanField(default=False)
    is_repairer = models.BooleanField(default=False)
    is_packer = models.BooleanField(default=False)

    contact_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=254)
    phone = models.CharField(max_length=20, blank=True)
    
    # Premises / Address details
    address = models.TextField(max_length=500)
    pincode = models.CharField(max_length=10, blank=True, null=True)

    jurisdiction_label = models.CharField(max_length=100, default="DEMO")

    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["legal_name"]
        verbose_name_plural = "businesses"

    def __str__(self):
        return self.legal_name
