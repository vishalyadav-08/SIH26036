"""In-product notifications.

Two halves:

1. The inbox: what a user may read and mark read. Strictly recipient-scoped.
2. Event helpers (`application_submitted`, `certificate_issued`, ...) that the
   domain modules call after they commit a change. Each decides *who* needs
   to know and writes one row per recipient with a link for that person's
   role. Domain modules never construct notification text themselves.

Nothing here imports a domain module at import time: those modules import
this one, so any such import would be circular.
"""

import math
from datetime import timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from authentication.models import User

from .models import Notification

T = Notification.Type


# -- inbox -------------------------------------------------------------------


def visible_notifications(user):
    return Notification.objects.filter(recipient=user)


def unread_count(user):
    return visible_notifications(user).filter(read_at__isnull=True).count()


def mark_read(*, user, notification, read_at=None):
    """Idempotent: an already-read notification keeps its original read_at."""
    if notification.recipient_id != user.id:
        # visible_notifications already filters; this guards direct callers.
        raise PermissionError("Not the recipient.")

    if notification.read_at is not None:
        return notification

    now = timezone.now()

    # A client-supplied time may not claim the future.
    notification.read_at = min(read_at, now) if read_at else now
    notification.save(update_fields=["read_at"])

    return notification


def mark_all_read(*, user):
    return visible_notifications(user).filter(read_at__isnull=True).update(
        read_at=timezone.now()
    )


# -- links -------------------------------------------------------------------


def application_link(user, application):
    if user.role == User.Role.BUSINESS:
        return f"/app/applications/{application.id}"

    if user.role in User.FIELD_STAFF_ROLES:
        return f"/field/inspections/{application.id}"

    return f"/admin/applications/{application.id}"


def certificate_link(user, certificate):
    if user.role == User.Role.BUSINESS:
        return f"/app/certificates/{certificate.id}"

    if user.role == User.Role.ADMIN:
        return f"/admin/applications/{certificate.application_id}"

    return f"/verify/{certificate.certificate_number}"


def instrument_link(user, instrument):
    if user.role == User.Role.BUSINESS:
        return f"/app/instruments/{instrument.id}"

    return "/admin/instruments"


# -- recipients --------------------------------------------------------------


def admins():
    return User.objects.filter(role=User.Role.ADMIN, is_active=True)


def business_users(business):
    return User.objects.filter(business=business, role=User.Role.BUSINESS, is_active=True)


def active_officer(application):
    assignment = application.active_assignment

    return assignment.officer if assignment and assignment.officer.is_active else None


# -- writing -----------------------------------------------------------------


def notify(*, recipient, type, title, message, related=None, link="", business=None):
    """One row for one person. Inactive recipients are skipped silently:
    they cannot sign in to read it, and deactivation is not deletion."""
    if recipient is None or not recipient.is_active:
        return None

    related_type = ""
    related_id = None

    if related is not None:
        # `type` is the notification type here, so the class is read via
        # __class__ rather than the shadowed builtin.
        related_type = related.__class__.__name__.upper()
        related_id = related.id

    return Notification.objects.create(
        recipient=recipient,
        business=business,
        type=type,
        title=title[:150],
        message=message[:500],
        related_entity_type=related_type,
        related_entity_id=related_id,
        link=link or "",
    )


def notify_each(recipients, *, link_for=None, **fields):
    """Fan out to several recipients, computing each one's link by role."""
    created = []

    for recipient in recipients:
        link = link_for(recipient) if link_for else fields.get("link", "")
        created.append(notify(recipient=recipient, **{**fields, "link": link}))

    return [n for n in created if n is not None]


# -- domain events -----------------------------------------------------------
# Called by the domain services inside their transaction, after the change
# and its audit event. Text is written for the recipient's viewpoint.


def application_submitted(application):
    instrument = application.instrument

    return notify_each(
        admins(),
        type=T.APPLICATION_UPDATE,
        title="New verification request",
        message=(
            f"{application.application_number} for {instrument.instrument_number} "
            f"({instrument.get_instrument_type_display()}) from "
            f"{application.business.legal_name} is awaiting officer assignment."
        ),
        related=application,
        business=application.business,
        link_for=lambda u: application_link(u, application),
    )


def application_assigned(application, officer):
    instrument = application.instrument

    officer_note = notify(
        recipient=officer,
        type=T.APPLICATION_UPDATE,
        title="Case assigned to you",
        message=(
            f"{application.application_number}: {instrument.instrument_number} at "
            f"{application.business.legal_name}, {instrument.location or 'location on file'}. "
            f"Book the site visit when ready."
        ),
        related=application,
        business=application.business,
        link=application_link(officer, application),
    )

    owner_notes = notify_each(
        business_users(application.business),
        type=T.APPLICATION_UPDATE,
        title="Officer assigned",
        message=(
            f"{application.application_number} for {instrument.instrument_number} has been "
            f"assigned to {officer.display_name}. You will be notified when a visit is booked."
        ),
        related=application,
        business=application.business,
        link_for=lambda u: application_link(u, application),
    )

    return [n for n in [officer_note, *owner_notes] if n]


def visit_scheduled(schedule):
    application = schedule.application
    instrument = application.instrument
    when = timezone.localtime(schedule.scheduled_at).strftime("%d %b %Y, %H:%M")

    owner_notes = notify_each(
        business_users(application.business),
        type=T.SCHEDULE_UPDATE,
        title="Inspection visit scheduled",
        message=(
            f"{schedule.officer.display_name} will inspect {instrument.instrument_number} "
            f"on {when}. {schedule.schedule_note}".strip()
        ),
        related=application,
        business=application.business,
        link_for=lambda u: application_link(u, application),
    )

    officer_note = None
    if schedule.scheduled_by_id != schedule.officer_id:
        officer_note = notify(
            recipient=schedule.officer,
            type=T.SCHEDULE_UPDATE,
            title="Visit booked on your calendar",
            message=(
                f"{application.application_number}: {instrument.instrument_number} at "
                f"{application.business.legal_name} on {when}."
            ),
            related=application,
            business=application.business,
            link=application_link(schedule.officer, application),
        )

    return [n for n in [*owner_notes, officer_note] if n]


def visit_rescheduled(schedule, previous):
    application = schedule.application
    instrument = application.instrument
    was = timezone.localtime(previous.scheduled_at).strftime("%d %b %Y, %H:%M")
    now_at = timezone.localtime(schedule.scheduled_at).strftime("%d %b %Y, %H:%M")

    recipients = list(business_users(application.business))
    if schedule.scheduled_by_id != schedule.officer_id:
        recipients.append(schedule.officer)

    return notify_each(
        recipients,
        type=T.SCHEDULE_UPDATE,
        title="Inspection visit moved",
        message=(
            f"The visit for {instrument.instrument_number} ({application.application_number}) "
            f"has moved from {was} to {now_at}. {schedule.schedule_note}".strip()
        ),
        related=application,
        business=application.business,
        link_for=lambda u: application_link(u, application),
    )


def application_rejected(application):
    return notify_each(
        business_users(application.business),
        type=T.APPLICATION_UPDATE,
        title="Verification request rejected",
        message=(
            f"{application.application_number} for {application.instrument.instrument_number} "
            f"was not accepted: {application.rejection_reason}"
        ),
        related=application,
        business=application.business,
        link_for=lambda u: application_link(u, application),
    )


def application_cancelled(application, actor):
    """Tell everyone involved other than the person who cancelled."""
    recipients = list(business_users(application.business)) + list(admins())

    officer = active_officer(application)
    if officer is not None:
        recipients.append(officer)

    recipients = [r for r in recipients if r.id != actor.id]

    return notify_each(
        recipients,
        type=T.APPLICATION_UPDATE,
        title="Verification request cancelled",
        message=(
            f"{application.application_number} for {application.instrument.instrument_number} "
            f"was cancelled by {actor.display_name}: {application.cancellation_reason}"
        ),
        related=application,
        business=application.business,
        link_for=lambda u: application_link(u, application),
    )


def inspection_started(inspection):
    application = inspection.application

    return notify_each(
        business_users(application.business),
        type=T.APPLICATION_UPDATE,
        title="Inspection in progress",
        message=(
            f"{inspection.officer.display_name} has started the on-site inspection of "
            f"{application.instrument.instrument_number}."
        ),
        related=application,
        business=application.business,
        link_for=lambda u: application_link(u, application),
    )


def inspection_completed(inspection):
    application = inspection.application
    instrument = application.instrument
    result = inspection.get_result_display()

    outcome = {
        "PASS": "The instrument passed. A certificate will follow once issued.",
        "FAIL": "The instrument did not pass. A new request is needed after correction.",
        "REQUIRES_CORRECTION": "Corrections are required before the instrument can be certified.",
    }.get(inspection.result, "")

    owner_notes = notify_each(
        business_users(application.business),
        type=T.INSPECTION_RESULT,
        title=f"Inspection result: {result}",
        message=f"{instrument.instrument_number} ({application.application_number}). {outcome}",
        related=application,
        business=application.business,
        link_for=lambda u: application_link(u, application),
    )

    admin_notes = notify_each(
        admins(),
        type=T.INSPECTION_RESULT,
        title=f"Inspection completed: {result}",
        message=(
            f"{inspection.officer.display_name} completed {application.application_number} "
            f"({instrument.instrument_number}) with result {inspection.result}."
        ),
        related=application,
        business=application.business,
        link_for=lambda u: application_link(u, application),
    )

    return owner_notes + admin_notes


def certificate_issued(certificate):
    valid_until = timezone.localtime(certificate.valid_until).strftime("%d %b %Y")

    return notify_each(
        business_users(certificate.business),
        type=T.CERTIFICATE_ISSUED,
        title="Verification certificate issued",
        message=(
            f"{certificate.certificate_number} for {certificate.instrument.instrument_number} "
            f"is active until {valid_until}. It can be verified by anyone via its QR code."
        ),
        related=certificate,
        business=certificate.business,
        link_for=lambda u: certificate_link(u, certificate),
    )


def certificate_revoked(certificate):
    recipients = list(business_users(certificate.business))

    officer = certificate.inspection.officer
    if officer.is_active:
        recipients.append(officer)

    return notify_each(
        recipients,
        type=T.CERTIFICATE_REVOKED,
        title="Certificate revoked",
        message=(
            f"{certificate.certificate_number} for {certificate.instrument.instrument_number} "
            f"is no longer valid: {certificate.revocation_reason}"
        ),
        related=certificate,
        business=certificate.business,
        link_for=lambda u: certificate_link(u, certificate),
    )


@transaction.atomic
def expiry_warnings(*, within_days=30):
    """Warn owners about ACTIVE certificates expiring soon. Idempotent: a
    certificate is warned about once per recipient, so this is safe to run
    from a scheduler every day."""
    from certificates.models import Certificate  # local: avoids an import cycle

    now = timezone.now()
    horizon = now + timedelta(days=within_days)

    expiring = Certificate.objects.filter(
        status=Certificate.Status.ACTIVE, valid_until__gt=now, valid_until__lte=horizon
    ).select_related("instrument", "business")

    created = []

    for certificate in expiring:
        # Round up: 9.9 days left reads as "10 days", not "9".
        remaining = certificate.valid_until - now
        days_left = max(math.ceil(remaining.total_seconds() / 86400), 0)
        valid_until = timezone.localtime(certificate.valid_until).strftime("%d %b %Y")

        for owner in business_users(certificate.business):
            already = Notification.objects.filter(
                recipient=owner,
                type=T.EXPIRY_WARNING,
                related_entity_type="CERTIFICATE",
                related_entity_id=certificate.id,
            ).exists()

            if already:
                continue

            created.append(
                notify(
                    recipient=owner,
                    type=T.EXPIRY_WARNING,
                    title="Verification due soon",
                    message=(
                        f"{certificate.certificate_number} for "
                        f"{certificate.instrument.instrument_number} expires on {valid_until} "
                        f"({days_left} days). Submit a re-verification request to stay compliant."
                    ),
                    related=certificate,
                    business=certificate.business,
                    link=instrument_link(owner, certificate.instrument),
                )
            )

    return created


def sync_result(*, user, synced, failed, detail=""):
    """Outcome of an offline batch, for the officer who submitted it."""
    if synced == 0 and failed == 0:
        return None

    title = "Offline records synced" if failed == 0 else "Some offline records were rejected"

    return notify(
        recipient=user,
        type=T.SYNC_RESULT,
        title=title,
        message=f"{synced} synced, {failed} rejected. {detail}".strip(),
        link="/field/sync",
    )
