import uuid

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """An authenticated human identity (DATA_MODEL.md — User).

    Role is the canonical authorization vocabulary and drives every access
    decision in the API. There is deliberately no PUBLIC role: certificate
    verification is unauthenticated (ADR-017), not a role someone holds.

    The password hash lives in AbstractBaseUser.password and is never exposed
    by any serializer.
    """

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Administrator"
        OFFICER = "OFFICER", "Legal Metrology Officer"
        BUSINESS = "BUSINESS", "Business / Instrument Owner"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    email = models.EmailField(unique=True, max_length=254)
    display_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)

    role = models.CharField(max_length=10, choices=Role.choices)

    # `is_active` is the data model's `active`. An inactive user cannot
    # authenticate, but their historical references stay intact — deactivation
    # is not deletion.
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Google's stable subject identifier, set the first time an account signs
    # in with Google. Email is the *linking* key but not the identity key: a
    # Google account's email can change, while `sub` never does.
    google_sub = models.CharField(
        max_length=255, unique=True, null=True, blank=True, editable=False
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["display_name", "role"]

    class Meta:
        ordering = ["email"]

    def __str__(self):
        return f"{self.email} ({self.role})"

    @property
    def business_id(self):
        """The Business this user owns, once the businesses module exists.

        The data model gives BUSINESS users a `businessId` and leaves it absent
        for ADMIN/OFFICER. The Business entity is REG-001, so this resolves to
        None for now and the API contract's field shape stays stable either way.
        """
        business = getattr(self, "business", None)

        return business.id if business else None
