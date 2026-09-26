from uuid import uuid4
from django.db import models

class IntegrationType(models.TextChoices):
    NSWS = "NSWS", "National Single Window System"
    DIGILOCKER = "DIGILOCKER", "DigiLocker"

class IntegrationLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    integration_type = models.CharField(max_length=20, choices=IntegrationType.choices)
    action = models.CharField(max_length=100) # e.g. "PUSH_LICENSE", "FETCH_DOCUMENT"
    status = models.CharField(max_length=20) # "SUCCESS", "FAILED"
    payload = models.JSONField(blank=True, default=dict)
    response = models.JSONField(blank=True, default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-created_at"]
        
class DigiLockerDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    business = models.ForeignKey("businesses.Business", on_delete=models.CASCADE, related_name="digilocker_documents")
    document_uri = models.CharField(max_length=200, unique=True)
    document_type = models.CharField(max_length=100)
    pulled_at = models.DateTimeField(auto_now_add=True)
