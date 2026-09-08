"""Business domain logic."""

from django.db import transaction

from .models import Business

FIELD_MAP = {
    "legalName": "legal_name",
    "tradeName": "trade_name",
    "contactName": "contact_name",
    "jurisdictionLabel": "jurisdiction_label",
}


class AlreadyRegistered(Exception):
    """This user already owns a business profile."""


@transaction.atomic
def create_business(*, user, validated_data):
    """Create a business and link the calling user to it.

    A BUSINESS user gets exactly one profile in the MVP: creating a second
    would silently orphan the first along with its instruments.
    """
    if user.business_id is not None:
        raise AlreadyRegistered

    fields = {FIELD_MAP.get(k, k): v for k, v in validated_data.items()}

    business = Business.objects.create(**fields)

    user.business = business
    user.save(update_fields=["business", "updated_at"])

    return business
