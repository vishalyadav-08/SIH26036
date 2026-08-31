import uuid

from django.db import models


class Certificate(models.Model):
    """A verifiable record generated from a completed inspection decision.

    `canonical_payload` stores the exact bytes that were hashed and signed. It
    is kept verbatim so verification never has to rebuild the payload and risk
    producing different bytes than the ones originally signed.
    """

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        EXPIRED = "EXPIRED", "Expired"
        REVOKED = "REVOKED", "Revoked"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    certificate_number = models.CharField(max_length=40, unique=True)

    application = models.OneToOneField(
        "applications.Application", on_delete=models.PROTECT, related_name="certificate"
    )
    instrument = models.ForeignKey(
        "instruments.Instrument", on_delete=models.PROTECT, related_name="certificates"
    )
    business = models.ForeignKey(
        "businesses.Business", on_delete=models.PROTECT, related_name="certificates"
    )
    inspection = models.OneToOneField(
        "inspections.Inspection", on_delete=models.PROTECT, related_name="certificate"
    )

    issued_at = models.DateTimeField()
    valid_until = models.DateTimeField()

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)

    payload_version = models.CharField(max_length=10, default="1")
    canonical_payload = models.TextField()
    payload_hash = models.CharField(max_length=64)

    digital_signature = models.TextField()
    signature_algorithm = models.CharField(max_length=50, default="RSASSA-PSS-SHA256")
    public_key_reference = models.CharField(max_length=100, default="prototype-key-1")

    pdf_object_key = models.CharField(max_length=255, blank=True)
    qr_verification_url = models.URLField(max_length=500, blank=True)

    revoked_at = models.DateTimeField(null=True, blank=True)
    revocation_reason = models.TextField(max_length=500, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-issued_at"]

    def __str__(self):
        return self.certificate_number

    @property
    def is_expired(self):
        from django.utils import timezone

        return timezone.now() > self.valid_until
