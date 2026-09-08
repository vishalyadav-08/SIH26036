"""Application lifecycle. Every transition in DATA_MODEL.md is enforced here."""

from django.db import transaction
from django.utils import timezone

from audit.services import record_event
from authentication.models import User
from instruments.models import Instrument
from notifications import services as notify

from .models import Application, ApplicationAssignment

S = Application.State

# The canonical transition table. A move absent from this map is illegal, so a
# new state cannot quietly become reachable by adding a view.
ALLOWED = {
    S.DRAFT: {S.SUBMITTED, S.CANCELLED},
    S.SUBMITTED: {S.ASSIGNED, S.REJECTED, S.CANCELLED},
    S.ASSIGNED: {S.SCHEDULED, S.INSPECTION_IN_PROGRESS, S.CANCELLED},
    S.SCHEDULED: {S.INSPECTION_IN_PROGRESS, S.CANCELLED},
    S.INSPECTION_IN_PROGRESS: {S.COMPLETED, S.CANCELLED},
    S.COMPLETED: set(),
    S.REJECTED: set(),
    S.CANCELLED: set(),
}

INITIATOR = {
    (S.DRAFT, S.SUBMITTED): {User.Role.BUSINESS, User.Role.ADMIN, User.Role.GATC},
    (S.DRAFT, S.CANCELLED): {User.Role.BUSINESS, User.Role.ADMIN, User.Role.GATC},
    (S.SUBMITTED, S.ASSIGNED): {User.Role.ADMIN, User.Role.GATC},
    (S.SUBMITTED, S.REJECTED): {User.Role.ADMIN, User.Role.GATC},
    (S.SUBMITTED, S.CANCELLED): {User.Role.BUSINESS, User.Role.ADMIN, User.Role.GATC},
    # The assigned officer books their own visit; an admin or GATC may also do it.
    (S.ASSIGNED, S.SCHEDULED): {User.Role.ADMIN, User.Role.GATC, *User.FIELD_STAFF_ROLES},
    (S.ASSIGNED, S.INSPECTION_IN_PROGRESS): {User.Role.ADMIN, User.Role.GATC, *User.FIELD_STAFF_ROLES},
    (S.ASSIGNED, S.CANCELLED): {User.Role.ADMIN, User.Role.GATC},
    (S.SCHEDULED, S.INSPECTION_IN_PROGRESS): {User.Role.ADMIN, User.Role.GATC, *User.FIELD_STAFF_ROLES},
    (S.SCHEDULED, S.CANCELLED): {User.Role.ADMIN, User.Role.GATC, *User.FIELD_STAFF_ROLES},
    (S.INSPECTION_IN_PROGRESS, S.COMPLETED): {User.Role.ADMIN, User.Role.GATC, *User.FIELD_STAFF_ROLES},
    (S.INSPECTION_IN_PROGRESS, S.CANCELLED): {User.Role.ADMIN, User.Role.GATC},
}


class IllegalTransition(Exception):
    """The requested state change is not in the canonical table."""


class OwnershipError(Exception):
    """The caller may not act on this application."""


def assert_transition(application, to_state, actor):
    from_state = application.state

    if to_state not in ALLOWED.get(from_state, set()):
        raise IllegalTransition(f"Cannot move from {from_state} to {to_state}.")

    if actor.role not in INITIATOR.get((from_state, to_state), set()):
        raise OwnershipError(f"{actor.role} cannot perform this transition.")


def next_application_number():
    count = Application.objects.count() + 1

    return f"APP-DEMO-{count:04d}"


def visible_applications(user):
    queryset = Application.objects.select_related("instrument", "business", "submitted_by")

    if user.role in (User.Role.ADMIN, User.Role.GATC):
        return queryset

    if user.role == User.Role.BUSINESS:
        if user.business_id is None:
            return queryset.none()

        return queryset.filter(business_id=user.business_id)

    # LMO/Field staff: only work actually assigned to them.
    return queryset.filter(
        assignments__officer=user, assignments__unassigned_at__isnull=True
    ).distinct()


@transaction.atomic
def create_application(*, user, instrument_id, reason, submit):
    """Create a draft, optionally submitting it in the same call."""
    from instruments.services import visible_instruments

    instrument = visible_instruments(user).filter(id=instrument_id).first()

    if instrument is None:
        raise OwnershipError("Unknown instrument.")

    if submit and not reason:
        raise IllegalTransition("A reason is required to submit.")

    application = Application.objects.create(
        application_number=next_application_number(),
        instrument=instrument,
        business=instrument.business,
        submitted_by=user,
        reason=reason or "",
        state=S.SUBMITTED if submit else S.DRAFT,
        requested_at=timezone.now() if submit else None,
    )

    if submit:
        instrument.status = Instrument.Status.PENDING_VERIFICATION
        instrument.save(update_fields=["status", "updated_at"])

    record_event(
        actor=user,
        action="APPLICATION_SUBMITTED" if submit else "APPLICATION_CREATED",
        entity_type="APPLICATION",
        entity_id=application.id,
        metadata={"applicationNumber": application.application_number, "state": application.state},
    )

    if submit:
        notify.application_submitted(application)

    return application


@transaction.atomic
def submit_application(*, user, application):
    assert_transition(application, S.SUBMITTED, user)

    if not application.reason:
        raise IllegalTransition("A reason is required to submit.")

    application.state = S.SUBMITTED
    application.requested_at = timezone.now()
    application.save(update_fields=["state", "requested_at", "updated_at"])

    application.instrument.status = Instrument.Status.PENDING_VERIFICATION
    application.instrument.save(update_fields=["status", "updated_at"])

    record_event(
        actor=user, action="APPLICATION_SUBMITTED", entity_type="APPLICATION",
        entity_id=application.id, metadata={"state": application.state},
    )

    notify.application_submitted(application)

    return application


@transaction.atomic
def assign_officer(*, user, application, officer_id, note=""):
    assert_transition(application, S.ASSIGNED, user)

    officer = User.objects.filter(
        id=officer_id, role__in=User.FIELD_STAFF_ROLES, is_active=True
    ).first()

    if officer is None:
        raise OwnershipError("Unknown or inactive officer.")

    ApplicationAssignment.objects.create(
        application=application, officer=officer, assigned_by=user, assignment_note=note
    )

    application.state = S.ASSIGNED
    application.assigned_at = timezone.now()
    application.save(update_fields=["state", "assigned_at", "updated_at"])

    record_event(
        actor=user, action="APPLICATION_ASSIGNED", entity_type="APPLICATION",
        entity_id=application.id, metadata={"officerUserId": str(officer.id)},
    )

    notify.application_assigned(application, officer)

    return application


def schedule_application(*, user, application, scheduled_at, note=""):
    """ASSIGNED -> SCHEDULED. The scheduling module owns the booking itself
    (appointment history, officer double-booking policy); this keeps the
    transition callable from the application's own service surface.

    Imported lazily: scheduling depends on this module for assert_transition.
    """
    from scheduling.services import book_visit

    book_visit(user=user, application=application, scheduled_at=scheduled_at, note=note)

    return application


@transaction.atomic
def reject_application(*, user, application, reason):
    assert_transition(application, S.REJECTED, user)

    if not reason:
        raise IllegalTransition("A rejection reason is required.")

    application.state = S.REJECTED
    application.rejection_reason = reason
    application.save(update_fields=["state", "rejection_reason", "updated_at"])

    record_event(
        actor=user, action="APPLICATION_REJECTED", entity_type="APPLICATION",
        entity_id=application.id, metadata={"reason": reason},
    )

    notify.application_rejected(application)

    return application


@transaction.atomic
def cancel_application(*, user, application, reason):
    assert_transition(application, S.CANCELLED, user)

    if not reason:
        raise IllegalTransition("A cancellation reason is required.")

    was_scheduled = application.state == S.SCHEDULED

    application.state = S.CANCELLED
    application.cancellation_reason = reason
    application.save(update_fields=["state", "cancellation_reason", "updated_at"])

    if was_scheduled:
        # Free the officer's slot; the cancellation itself is the audited act.
        from scheduling.services import cancel_active_schedule

        cancel_active_schedule(application=application, reason=reason)

    record_event(
        actor=user, action="APPLICATION_CANCELLED", entity_type="APPLICATION",
        entity_id=application.id, metadata={"reason": reason},
    )

    notify.application_cancelled(application, actor=user)

    return application
