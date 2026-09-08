"""Warn instrument owners about certificates expiring soon.

Run daily from a scheduler (cron, a container job, or a Celery beat task once
one exists). Idempotent: re-running does not repeat a warning.

    python manage.py send_expiry_warnings --days 30
"""

from django.core.management.base import BaseCommand

from notifications.services import expiry_warnings


class Command(BaseCommand):
    help = "Create EXPIRY_WARNING notifications for certificates expiring within N days."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=30)

    def handle(self, *args, **options):
        created = expiry_warnings(within_days=options["days"])

        self.stdout.write(f"{len(created)} expiry warning(s) created.")
