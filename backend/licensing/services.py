from django.utils import timezone
from .models import LicenseApplication, LicenseAppState, LicenseType, LicenseCategory, License, LicenseStatus
from rest_framework.exceptions import ValidationError

class LicenseApplicationService:
    @staticmethod
    def create_application(business, submitted_by, category, license_type=LicenseType.NEW, **kwargs):
        # Auto-generate application number based on category and year
        year = timezone.now().year
        # Get count for the year
        count = LicenseApplication.objects.filter(
            category=category, 
            created_at__year=year
        ).count() + 1
        
        category_code = category[:3].upper()
        application_number = f"UP/LM/{category_code}/{year}/{count:05d}"
        
        application = LicenseApplication.objects.create(
            application_number=application_number,
            business=business,
            submitted_by=submitted_by,
            category=category,
            license_type=license_type,
            **kwargs
        )
        return application

    @staticmethod
    def submit_application(application):
        if application.state != LicenseAppState.DRAFT:
            raise ValidationError(f"Cannot submit application in {application.state} state.")
        application.state = LicenseAppState.SUBMITTED
        application.save(update_fields=['state', 'updated_at'])
        # A real implementation would trigger signals for notification
        return application

    @staticmethod
    def assign_reviewer(application, reviewer):
        valid_states = [LicenseAppState.SUBMITTED, LicenseAppState.QUERY_RAISED]
        if application.state not in valid_states:
            raise ValidationError(f"Cannot assign reviewer in {application.state} state.")
        application.reviewing_officer = reviewer
        application.state = LicenseAppState.UNDER_REVIEW
        application.save(update_fields=['reviewing_officer', 'state', 'updated_at'])
        return application

    @staticmethod
    def raise_query(application, query_details):
        if application.state != LicenseAppState.UNDER_REVIEW:
            raise ValidationError("Query can only be raised when under review.")
        application.query_details = query_details
        application.state = LicenseAppState.QUERY_RAISED
        application.save(update_fields=['query_details', 'state', 'updated_at'])
        return application

    @staticmethod
    def approve_application(application):
        if application.state != LicenseAppState.UNDER_REVIEW:
            raise ValidationError("Application must be under review to approve.")
        
        application.state = LicenseAppState.APPROVED
        application.approval_date = timezone.now().date()
        application.save(update_fields=['state', 'approval_date', 'updated_at'])
        
        # Generate license number
        year = timezone.now().year
        count = License.objects.filter(
            category=application.category, 
            created_at__year=year
        ).count() + 1
        category_code = application.category[:3].upper()
        license_number = f"LIC/UP/{category_code}/{year}/{count:05d}"
        
        valid_from = timezone.now().date()
        import datetime
        valid_until = valid_from + datetime.timedelta(days=365 * application.validity_years)
        
        license_obj = License.objects.create(
            license_number=license_number,
            business=application.business,
            application=application,
            category=application.category,
            issued_date=valid_from,
            valid_from=valid_from,
            valid_until=valid_until,
            status=LicenseStatus.ACTIVE
        )
        return application, license_obj

    @staticmethod
    def reject_application(application, reason):
        if application.state != LicenseAppState.UNDER_REVIEW:
            raise ValidationError("Application must be under review to reject.")
        application.state = LicenseAppState.REJECTED
        application.rejection_reason = reason
        application.save(update_fields=['state', 'rejection_reason', 'updated_at'])
        return application
