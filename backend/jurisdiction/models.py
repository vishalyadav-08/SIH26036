from uuid import uuid4
from django.db import models
from django.utils.translation import gettext_lazy as _

class State(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    code = models.CharField(max_length=5, unique=True)  # "UP", "MH", "KL"
    name = models.CharField(max_length=100)
    name_local = models.CharField(max_length=200, blank=True)
    official_language = models.CharField(max_length=20, default="hi")
    controller_email = models.EmailField(blank=True)
    controller_phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Division(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    state = models.ForeignKey(State, related_name="divisions", on_delete=models.PROTECT)
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    name_local = models.CharField(max_length=200, blank=True)
    headquarters_city = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.name} ({self.state.code})"

class District(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    division = models.ForeignKey(Division, related_name="districts", on_delete=models.PROTECT)
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    name_local = models.CharField(max_length=200, blank=True)
    pin_codes = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.name

class OfficerDesignation(models.TextChoices):
    CONTROLLER = "CONTROLLER", _("Controller")
    ADDITIONAL_CONTROLLER = "ADDITIONAL_CONTROLLER", _("Additional Controller")
    JOINT_CONTROLLER = "JOINT_CONTROLLER", _("Joint Controller")
    DEPUTY_CONTROLLER = "DEPUTY_CONTROLLER", _("Deputy Controller")
    ACLM = "ACLM", _("Assistant Controller")
    SLMO = "SLMO", _("Senior LMO")
    LMO = "LMO", _("LMO")

class JurisdictionAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    officer = models.ForeignKey("authentication.User", related_name="jurisdiction_assignments", on_delete=models.CASCADE)
    designation = models.CharField(max_length=30, choices=OfficerDesignation.choices)
    state = models.ForeignKey(State, null=True, blank=True, on_delete=models.PROTECT)
    division = models.ForeignKey(Division, null=True, blank=True, on_delete=models.PROTECT)
    district = models.ForeignKey(District, null=True, blank=True, on_delete=models.PROTECT)
    is_primary = models.BooleanField(default=True)
    active_from = models.DateField()
    active_until = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-active_from"]

    def __str__(self):
        return f"{self.officer.email} - {self.designation}"
