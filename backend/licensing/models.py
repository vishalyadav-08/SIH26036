from uuid import uuid4
from django.db import models
from django.utils.translation import gettext_lazy as _

class LicenseCategory(models.TextChoices):
    MANUFACTURER = "MANUFACTURER", _("Manufacturer")
    DEALER = "DEALER", _("Dealer")
    REPAIRER = "REPAIRER", _("Repairer")
    PACKER_IMPORTER = "PACKER_IMPORTER", _("Packer/Importer")

class LicenseType(models.TextChoices):
    NEW = "NEW", _("New")
    RENEWAL = "RENEWAL", _("Renewal")
    AMENDMENT = "AMENDMENT", _("Amendment")
    DUPLICATE = "DUPLICATE", _("Duplicate")

class LicenseAppState(models.TextChoices):
    DRAFT = "DRAFT", _("Draft")
    SUBMITTED = "SUBMITTED", _("Submitted")
    UNDER_REVIEW = "UNDER_REVIEW", _("Under Review")
    QUERY_RAISED = "QUERY_RAISED", _("Query Raised")
    INSPECTION_SCHEDULED = "INSPECTION_SCHEDULED", _("Inspection Scheduled")
    APPROVED = "APPROVED", _("Approved")
    REJECTED = "REJECTED", _("Rejected")
    CANCELLED = "CANCELLED", _("Cancelled")

class LicenseApplication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    application_number = models.CharField(max_length=30, unique=True)
    business = models.ForeignKey("businesses.Business", on_delete=models.PROTECT, related_name="license_applications")
    submitted_by = models.ForeignKey("authentication.User", on_delete=models.PROTECT, related_name="submitted_license_applications")
    category = models.CharField(max_length=20, choices=LicenseCategory.choices)
    license_type = models.CharField(max_length=15, choices=LicenseType.choices)
    validity_years = models.PositiveSmallIntegerField(default=1)  # 1–10 years
    state = models.CharField(max_length=25, choices=LicenseAppState.choices, default=LicenseAppState.DRAFT)
    
    # Review workflow
    reviewing_officer = models.ForeignKey("authentication.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="license_reviews")
    query_details = models.TextField(blank=True)
    query_response = models.TextField(blank=True)
    inspection_date = models.DateTimeField(null=True, blank=True)
    inspection_report = models.TextField(blank=True)
    
    # Decision
    approval_date = models.DateField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Payment (we use string loosely now or comment out if payments app is not ready. Since payments isn't made yet, I'll keep it simple for now)
    # payment = models.ForeignKey("payments.PaymentTransaction", null=True, on_delete=models.SET_NULL)
    
    # Metadata
    premises_address = models.TextField()
    premises_proof_type = models.CharField(max_length=30)  # OWNED/LEASED/RENTED
    gst_number = models.CharField(max_length=15, blank=True)
    pan_number = models.CharField(max_length=10, blank=True)
    
    # Manufacturer-specific
    model_approval_number = models.CharField(max_length=50, blank=True)
    machinery_list = models.JSONField(default=list, blank=True)
    technical_staff_count = models.PositiveIntegerField(default=0)
    
    # Repairer-specific
    qualification_details = models.TextField(blank=True)
    equipment_list = models.JSONField(default=list, blank=True)
    
    # Dealer-specific
    dealership_authorization = models.CharField(max_length=200, blank=True)
    
    # Packer/Importer-specific
    commodity_list = models.JSONField(default=list, blank=True)
    iec_code = models.CharField(max_length=15, blank=True)
    sample_labels = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"{self.application_number} ({self.state})"

class LicenseStatus(models.TextChoices):
    ACTIVE = "ACTIVE", _("Active")
    EXPIRED = "EXPIRED", _("Expired")
    SUSPENDED = "SUSPENDED", _("Suspended")
    CANCELLED = "CANCELLED", _("Cancelled")
    RENEWAL_PENDING = "RENEWAL_PENDING", _("Renewal Pending")

class License(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    license_number = models.CharField(max_length=30, unique=True)
    business = models.ForeignKey("businesses.Business", on_delete=models.PROTECT, related_name="licenses")
    application = models.OneToOneField(LicenseApplication, on_delete=models.PROTECT, related_name="issued_license")
    category = models.CharField(max_length=20, choices=LicenseCategory.choices)
    issued_date = models.DateField()
    valid_from = models.DateField()
    valid_until = models.DateField()
    status = models.CharField(max_length=20, choices=LicenseStatus.choices, default=LicenseStatus.ACTIVE)
    conditions = models.JSONField(default=list, blank=True)
    digital_signature = models.TextField(blank=True)
    payload_hash = models.CharField(max_length=64, blank=True)
    qr_verification_url = models.URLField(blank=True)
    pdf_object_key = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.license_number} ({self.status})"

class DocumentType(models.TextChoices):
    PREMISES_PROOF = "PREMISES_PROOF", _("Premises Proof")
    IDENTITY_PAN = "IDENTITY_PAN", _("PAN")
    IDENTITY_AADHAAR = "IDENTITY_AADHAAR", _("Aadhaar")
    GST_CERTIFICATE = "GST_CERTIFICATE", _("GST Certificate")
    INCORPORATION_CERT = "INCORPORATION_CERT", _("Incorporation Certificate")
    PARTNERSHIP_DEED = "PARTNERSHIP_DEED", _("Partnership Deed")
    MODEL_APPROVAL = "MODEL_APPROVAL", _("Model Approval")
    QUALIFICATION_CERT = "QUALIFICATION_CERT", _("Qualification Certificate")
    EQUIPMENT_LIST = "EQUIPMENT_LIST", _("Equipment List")
    FACTORY_LICENSE = "FACTORY_LICENSE", _("Factory License")
    TRADE_LICENSE = "TRADE_LICENSE", _("Trade License")
    DEALERSHIP_AUTH = "DEALERSHIP_AUTH", _("Dealership Authorization")
    IEC_CERTIFICATE = "IEC_CERTIFICATE", _("IEC Certificate")
    AFFIDAVIT = "AFFIDAVIT", _("Affidavit")
    SITE_MAP = "SITE_MAP", _("Site Map")
    SAMPLE_LABEL = "SAMPLE_LABEL", _("Sample Label")
    OTHER = "OTHER", _("Other")

class VerificationStatus(models.TextChoices):
    PENDING = "PENDING", _("Pending")
    VERIFIED = "VERIFIED", _("Verified")
    REJECTED = "REJECTED", _("Rejected")

class LicenseDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    application = models.ForeignKey(LicenseApplication, related_name="documents", on_delete=models.CASCADE)
    document_type = models.CharField(max_length=30, choices=DocumentType.choices)
    object_key = models.CharField(max_length=200, unique=True)
    original_file_name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    size_bytes = models.PositiveIntegerField()
    sha256 = models.CharField(max_length=64)
    verified_by = models.ForeignKey("authentication.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    verification_status = models.CharField(max_length=15, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    verification_note = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.document_type} for {self.application.application_number}"
