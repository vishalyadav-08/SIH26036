"""Admin dashboard metrics (GET /api/v1/dashboards/admin).

Every number is derived from real records. Nothing is estimated or invented —
if a metric has no source yet, it reports zero and says so.
"""

from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone

from applications.models import Application, ApplicationAssignment
from authentication.models import User
from certificates.models import Certificate
from inspections.models import Inspection
from scheduling.models import Schedule
from sync.models import SyncRecord


def _counts(queryset, field):
    return {
        row[field]: row["total"]
        for row in queryset.values(field).annotate(total=Count("id"))
    }


def admin_dashboard():
    now = timezone.now()

    application_counts = _counts(Application.objects.all(), "state")
    # Report every state, including the ones at zero: a missing key reads as
    # "no data" rather than "none in this state".
    application_counts = {
        state: application_counts.get(state, 0) for state, _ in Application.State.choices
    }

    inspection_counts = _counts(
        Inspection.objects.exclude(result=""), "result"
    )
    inspection_counts = {
        result: inspection_counts.get(result, 0) for result, _ in Inspection.Result.choices
    }

    certificate_counts = _counts(Certificate.objects.all(), "status")
    certificate_counts = {
        status: certificate_counts.get(status, 0) for status, _ in Certificate.Status.choices
    }

    active = Certificate.objects.filter(status=Certificate.Status.ACTIVE)

    expiry_buckets = {
        "expired": Certificate.objects.filter(valid_until__lt=now).count(),
        "next30Days": active.filter(
            valid_until__gte=now, valid_until__lt=now + timedelta(days=30)
        ).count(),
        "next90Days": active.filter(
            valid_until__gte=now + timedelta(days=30),
            valid_until__lt=now + timedelta(days=90),
        ).count(),
        "beyond90Days": active.filter(valid_until__gte=now + timedelta(days=90)).count(),
    }

    sync_counts = _counts(SyncRecord.objects.all(), "status")

    today = timezone.localdate()
    confirmed = Schedule.objects.filter(status=Schedule.Status.CONFIRMED)

    visits = {
        "today": confirmed.filter(scheduled_at__date=today).count(),
        "next7Days": confirmed.filter(
            scheduled_at__date__gt=today,
            scheduled_at__date__lte=today + timedelta(days=7),
        ).count(),
        # A confirmed visit whose time has passed with no inspection started.
        "overdue": confirmed.filter(
            scheduled_at__lt=now, application__state=Application.State.SCHEDULED
        ).count(),
    }

    officer_workload = [
        {
            "officerUserId": str(officer.id),
            "officerName": officer.display_name,
            "email": officer.email,
            "activeAssignments": officer.assignments.filter(
                unassigned_at__isnull=True
            ).exclude(
                application__state__in=[
                    Application.State.COMPLETED,
                    Application.State.REJECTED,
                    Application.State.CANCELLED,
                ]
            ).count(),
            "completedInspections": officer.inspections.filter(
                completed_at__isnull=False
            ).count(),
            "upcomingVisits": officer.schedules.filter(
                status=Schedule.Status.CONFIRMED, scheduled_at__gte=now
            ).count(),
        }
        for officer in User.objects.filter(role__in=User.FIELD_STAFF_ROLES, is_active=True)
    ]

    return {
        "applicationCountsByState": application_counts,
        "inspectionCountsByResult": inspection_counts,
        "certificateCountsByStatus": certificate_counts,
        "expiryBuckets": expiry_buckets,
        "visits": visits,
        # Offline operations the server refused or could not reconcile; each
        # is something an officer or admin still has to look at.
        "syncExceptions": SyncRecord.objects.filter(
            status__in=[SyncRecord.Status.FAILED, SyncRecord.Status.CONFLICT]
        ).count(),
        "syncCountsByStatus": {
            status: sync_counts.get(status, 0) for status, _ in SyncRecord.Status.choices
        },
        "officerWorkload": officer_workload,
        "generatedAt": now,
    }
