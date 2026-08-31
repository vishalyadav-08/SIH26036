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

    contact_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=254)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(max_length=500)

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
