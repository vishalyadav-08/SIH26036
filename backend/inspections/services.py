"""Inspection lifecycle: an assigned officer starts, records, and decides."""

from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils import timezone

from applications.models import Application
from applications.services import assert_transition
from audit.services import record_event
from authentication.models import User
from instruments.models import Instrument

from .models import Inspection, Measurement

# DEMO/CONFIGURABLE (ADR-016). Not a statutory tolerance.
DEMO_TOLERANCE_PERCENT = 0.5


class InspectionError(Exception):
    """The inspection cannot be started, updated, or completed as requested."""


def is_assigned_officer(user, application):
    assignment = application.active_assignment

    return assignment is not None and assignment.officer_id == user.id


def visible_inspections(user):
    queryset = Inspection.objects.select_related("application", "officer")

    if user.role == User.Role.ADMIN:
        return queryset

    if user.role == User.Role.OFFICER:
        return queryset.filter(officer=user)

    if user.role == User.Role.BUSINESS and user.business_id:
        return queryset.filter(application__business_id=user.business_id)

    return queryset.none()


@transaction.atomic
def start_inspection(*, user, application):
    """SCHEDULED -> INSPECTION_IN_PROGRESS, by the assigned officer only."""
    if not is_assigned_officer(user, application):
        raise InspectionError("You are not assigned to this application.")

    assert_transition(application, Application.State.INSPECTION_IN_PROGRESS, user)

    inspection, created = Inspection.objects.get_or_create(
        application=application, defaults={"officer": user}
    )

    application.state = Application.State.INSPECTION_IN_PROGRESS
    application.save(update_fields=["state", "updated_at"])

    record_event(
        actor=user, action="INSPECTION_STARTED", entity_type="INSPECTION",
        entity_id=inspection.id,
        metadata={"applicationNumber": application.application_number},
    )

    return inspection


def evaluate_tolerance(nominal, observed):
    """Demo rule: within DEMO_TOLERANCE_PERCENT of nominal.

    Values are coerced to Decimal rather than assumed numeric — this is a
    public service function, and readings also arrive from the offline sync
    path where nothing has passed through a DRF serializer first. Decimal, not
    float, because these are measurements people compare against a document.
    """
    try:
        nominal = Decimal(str(nominal))
        observed = Decimal(str(observed))
    except (InvalidOperation, TypeError, ValueError):
        raise InspectionError("Readings must be numeric.")

    if nominal == 0:
        return observed == 0

    deviation = abs(observed - nominal) / abs(nominal) * 100

    return deviation <= Decimal(str(DEMO_TOLERANCE_PERCENT))


@transaction.atomic
def add_measurement(*, user, inspection, label, nominal_value, observed_value, unit):
    if inspection.officer_id != user.id:
        raise InspectionError("Only the assigned officer may record readings.")

    if inspection.completed_at is not None:
        raise InspectionError("This inspection is already complete.")

    return Measurement.objects.create(
        inspection=inspection,
        label=label,
        nominal_value=nominal_value,
        observed_value=observed_value,
        unit=unit,
        within_tolerance=evaluate_tolerance(nominal_value, observed_value),
    )


@transaction.atomic
def complete_inspection(*, user, inspection, result, notes="", gps=None):
    """Record the officer's decision and close the application.

    A FAIL or REQUIRES_CORRECTION still completes the application — only the
    certificate module decides whether an artifact is warranted.
    """
    if inspection.officer_id != user.id:
        raise InspectionError("Only the assigned officer may complete this inspection.")

    if inspection.completed_at is not None:
        raise InspectionError("This inspection is already complete.")

    if not inspection.measurements.exists():
        raise InspectionError("Record at least one reading before deciding.")

    application = inspection.application

    assert_transition(application, Application.State.COMPLETED, user)

    inspection.result = result
    inspection.notes = notes
    inspection.completed_at = timezone.now()

    if gps:
        inspection.gps_latitude = gps.get("latitude")
        inspection.gps_longitude = gps.get("longitude")
        inspection.gps_accuracy_meters = gps.get("accuracyMeters")
        inspection.captured_at = gps.get("capturedAt")

    inspection.save()

    application.state = Application.State.COMPLETED
    application.completed_at = inspection.completed_at
    application.save(update_fields=["state", "completed_at", "updated_at"])

    instrument = application.instrument
    # A PASS makes the instrument current; anything else sends it back for
    # correction. Neither is the same thing as the application's state.
    instrument.status = (
        Instrument.Status.ACTIVE
        if result == Inspection.Result.PASS
        else Instrument.Status.REJECTED
    )
    instrument.save(update_fields=["status", "updated_at"])

    record_event(
        actor=user, action="INSPECTION_COMPLETED", entity_type="INSPECTION",
        entity_id=inspection.id, metadata={"result": result},
    )

    return inspection
