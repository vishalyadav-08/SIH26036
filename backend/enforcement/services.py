from django.utils import timezone
from .models import ConsumerComplaint, ComplaintStatus, EnforcementAction, Notice, NoticeStatus
import uuid

class EnforcementService:
    @staticmethod
    def file_complaint(data):
        complaint = ConsumerComplaint.objects.create(
            **data
        )
        # Attempt to auto-assign based on pincode using Jurisdiction service
        try:
            from jurisdiction.services import JurisdictionService
            district = JurisdictionService.resolve_district(complaint.pincode)
            if district:
                aclm = JurisdictionService.find_aclm(district)
                if aclm:
                    complaint.assigned_officer = aclm
                    complaint.save(update_fields=['assigned_officer'])
        except Exception:
            pass
            
        return complaint
        
    @staticmethod
    def generate_notice(enforcement_action, sections, amount, due_date):
        notice_number = f"NTC/{timezone.now().year}/{uuid.uuid4().hex[:6].upper()}"
        notice = Notice.objects.create(
            enforcement_action=enforcement_action,
            notice_number=notice_number,
            violation_sections=sections,
            compounding_amount=amount,
            due_date=due_date
        )
        return notice
