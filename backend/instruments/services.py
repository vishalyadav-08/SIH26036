"""Instrument domain logic: visibility scope, ownership, and lifecycle.

Every rule here is enforced server-side. Route guards in the browser are UX
only (ARCHITECTURE.md section 10).
"""

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction

from authentication.models import User
from businesses.models import Business

from .models import Instrument

FIELD_MAP = {
    "instrumentNumber": "instrument_number",
    "serialNumber": "serial_number",
    "instrumentType": "instrument_type",
    "capacityUnit": "capacity_unit",
}


class DuplicateInstrument(Exception):
    """An instrument with this number or serial already exists for the business."""


class OwnershipError(Exception):
    """The caller may not act on this business's registry."""


def visible_instruments(user):
    """The queryset a caller is allowed to see at all.

    Scoping happens here rather than in the view so list, detail, update and
    deactivate cannot drift apart — a 404 for an instrument outside scope is
    the same lookup that filters the list.
    """
    queryset = Instrument.objects.select_related("business")

    if user.role == User.Role.ADMIN:
        return queryset

    if user.role == User.Role.BUSINESS:
        if user.business_id is None:
            return queryset.none()

        return queryset.filter(business_id=user.business_id)

    # OFFICER sees instruments reached through assigned work. Assignment is
    # OPS-001 and does not exist yet, so the honest answer today is none —
    # rather than quietly granting officers the whole registry.
    return queryset.none()


def resolve_owner_business(user, requested_business_id):
    """Decide which Business a new instrument belongs to.

    A BUSINESS user can only ever register against their own business; the
    contract says they cannot choose another. An ADMIN must name one.
    """
    if user.role == User.Role.BUSINESS:
        if user.business_id is None:
            raise OwnershipError("This account is not linked to a business.")

        if requested_business_id and str(requested_business_id) != str(user.business_id):
            raise OwnershipError("You cannot register instruments for another business.")

        return user.business

    if user.role == User.Role.ADMIN:
        if not requested_business_id:
            raise OwnershipError("businessId is required.")

        business = Business.objects.filter(id=requested_business_id).first()

        if business is None:
            raise OwnershipError("Unknown business.")

        return business

    raise OwnershipError("Your role cannot register instruments.")


def _to_model_fields(validated):
    return {FIELD_MAP.get(key, key): value for key, value in validated.items()}


@transaction.atomic
def create_instrument(*, user, validated_data):
    data = dict(validated_data)
    requested = data.pop("businessId", None)

    business = resolve_owner_business(user, requested)

    instrument = Instrument(business=business, **_to_model_fields(data))

    try:
        instrument.full_clean(exclude=["business"])
        instrument.save()
    except IntegrityError as exc:
        raise DuplicateInstrument from exc
    except DjangoValidationError as exc:
        raise DuplicateInstrument from exc

    return instrument


@transaction.atomic
def update_instrument(*, instrument, validated_data):
    for field, value in _to_model_fields(validated_data).items():
        setattr(instrument, field, value)

    try:
        instrument.full_clean(exclude=["business"])
        instrument.save()
    except (IntegrityError, DjangoValidationError) as exc:
        raise DuplicateInstrument from exc

    return instrument


@transaction.atomic
def deactivate_instrument(*, instrument):
    """Soft delete.

    Historical references must remain (DATA_MODEL.md — Instrument lifecycle):
    an instrument that has been inspected or certified is part of an audit
    trail, so it is retired, never removed.
    """
    instrument.status = Instrument.Status.INACTIVE
    instrument.save(update_fields=["status", "updated_at"])

    return instrument
