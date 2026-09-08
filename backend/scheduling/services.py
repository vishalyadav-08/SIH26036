"""Site-visit booking for an Application.

Owns the ASSIGNED -> SCHEDULED transition and the conflict policy. The
Application module delegates here so the workflow state and the appointment
history can never disagree about when a visit is.

Conflict policy (DEMO/CONFIGURABLE, ADR-016): one officer cannot hold two
CONFIRMED visits within VISIT_SLOT_MINUTES of each other. This is a prototype
rule to demonstrate that double-booking is refused, not a statutory workload
limit.
"""

from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from applications.models import Application
from applications.services import IllegalTransition, OwnershipError, assert_transition
from audit.services import record_event
from authentication.models import User
from notifications import services as notify

from .models import Schedule

VISIT_SLOT_MINUTES = 60


class ScheduleConflict(IllegalTransition):
    """The officer already has a confirmed visit in this slot.

    A kind of IllegalTransition so every caller that already maps that to 409
    handles double-booking the same way without knowing about this module.
    """


def visible_schedules(user):
    queryset = Schedule.objects.select_related(
        "application", "application__instrument", "application__business",
        "officer", "scheduled_by",
    )

    if user.role == User.Role.ADMIN:
        return queryset

    if user.role in User.FIELD_STAFF_ROLES:
        return queryset.filter(officer=user)

    if user.role == User.Role.BUSINESS and user.business_id:
        return queryset.filter(application__business_id=user.business_id)

    return queryset.none()


def find_conflict(*, officer, scheduled_at, exclude_application=None):
    """Return the CONFIRMED schedule that clashes with this slot, or None."""
    window = timedelta(minutes=VISIT_SLOT_MINUTES)

    queryset = Schedule.objects.filter(
        officer=officer,
        status=Schedule.Status.CONFIRMED,
        scheduled_at__gt=scheduled_at - window,
        scheduled_at__lt=scheduled_at + window,
    )

    if exclude_application is not None:
        queryset = queryset.exclude(application=exclude_application)

    return queryset.select_related("application").first()


def _validate_slot(*, officer, scheduled_at, application):
    if scheduled_at <= timezone.now():
        raise IllegalTransition("Schedule a visit in the future.")

    clash = find_conflict(
        officer=officer, scheduled_at=scheduled_at, exclude_application=application
    )

    if clash is not None:
        raise ScheduleConflict(
            f"{officer.display_name} already has a visit at "
            f"{clash.scheduled_at:%Y-%m-%d %H:%M} for {clash.application.application_number}."
        )


def _assigned_officer(application, actor):
    assignment = application.active_assignment

    if assignment is None:
        raise IllegalTransition("Assign an officer before scheduling.")

    # An officer may book only the work actually assigned to them.
    if actor.role in User.FIELD_STAFF_ROLES and assignment.officer_id != actor.id:
        raise OwnershipError("You are not assigned to this application.")

    return assignment.officer


@transaction.atomic
def book_visit(*, user, application, scheduled_at, note=""):
    """ASSIGNED -> SCHEDULED. Creates the first CONFIRMED appointment."""
    assert_transition(application, Application.State.SCHEDULED, user)

    officer = _assigned_officer(application, user)

    _validate_slot(officer=officer, scheduled_at=scheduled_at, application=application)

    schedule = Schedule.objects.create(
        application=application,
        officer=officer,
        scheduled_by=user,
        scheduled_at=scheduled_at,
        schedule_note=note or "",
    )

    application.state = Application.State.SCHEDULED
    application.scheduled_at = scheduled_at
    application.save(update_fields=["state", "scheduled_at", "updated_at"])

    record_event(
        actor=user, action="APPLICATION_SCHEDULED", entity_type="APPLICATION",
        entity_id=application.id,
        metadata={
            "scheduleId": str(schedule.id),
            "officerUserId": str(officer.id),
            "scheduledAt": scheduled_at.isoformat(),
        },
    )

    notify.visit_scheduled(schedule)

    return schedule


@transaction.atomic
def reschedule_visit(*, user, schedule, scheduled_at, note=""):
    """Move a CONFIRMED visit. The application stays SCHEDULED.

    Only the current appointment can be moved, and only while the inspection
    has not started: once the officer is on site there is nothing to move.
    """
    if user.role not in (User.Role.ADMIN, *User.FIELD_STAFF_ROLES):
        raise OwnershipError(f"{user.role} cannot reschedule a visit.")

    if schedule.status != Schedule.Status.CONFIRMED:
        raise IllegalTransition("Only the current appointment can be rescheduled.")

    application = schedule.application

    if application.state != Application.State.SCHEDULED:
        raise IllegalTransition(
            f"Cannot reschedule an application in state {application.state}."
        )

    officer = _assigned_officer(application, user)

    _validate_slot(officer=officer, scheduled_at=scheduled_at, application=application)

    now = timezone.now()

    schedule.status = Schedule.Status.RESCHEDULED
    schedule.ended_at = now
    schedule.end_reason = f"Moved to {scheduled_at.isoformat()}"
    schedule.save(update_fields=["status", "ended_at", "end_reason", "updated_at"])

    replacement = Schedule.objects.create(
        application=application,
        officer=officer,
        scheduled_by=user,
        scheduled_at=scheduled_at,
        schedule_note=note or "",
    )

    application.scheduled_at = scheduled_at
    application.save(update_fields=["scheduled_at", "updated_at"])

    record_event(
        actor=user, action="APPLICATION_RESCHEDULED", entity_type="APPLICATION",
        entity_id=application.id,
        metadata={
            "previousScheduleId": str(schedule.id),
            "scheduleId": str(replacement.id),
            "previousScheduledAt": schedule.scheduled_at.isoformat(),
            "scheduledAt": scheduled_at.isoformat(),
        },
    )

    notify.visit_rescheduled(replacement, previous=schedule)

    return replacement


@transaction.atomic
def cancel_active_schedule(*, application, reason=""):
    """End the current appointment, if any. Called when the application is
    cancelled from SCHEDULED so the officer's calendar frees up.

    Not an audited event of its own: the application cancellation that
    triggers it is already recorded, and this is a consequence of that, not a
    separate decision.
    """
    schedule = application.schedules.filter(status=Schedule.Status.CONFIRMED).first()

    if schedule is None:
        return None

    schedule.status = Schedule.Status.CANCELLED
    schedule.ended_at = timezone.now()
    schedule.end_reason = reason or ""
    schedule.save(update_fields=["status", "ended_at", "end_reason", "updated_at"])

    return schedule
