from django.utils import timezone
from datetime import date
from .models import QuarterlyReturn, ReturnStatus
from rest_framework.exceptions import ValidationError

class ComplianceService:
    @staticmethod
    def calculate_due_date(financial_year: str, quarter: str) -> date:
        # e.g. "2023-2024"
        start_yr_str, end_yr_str = financial_year.split('-')
        start_yr = int(start_yr_str)
        end_yr = int(end_yr_str)
        
        # Deadlines are 10th of the month following the quarter
        if quarter == "Q1":
            # Apr-Jun -> Due July 10
            return date(start_yr, 7, 10)
        elif quarter == "Q2":
            # Jul-Sep -> Due Oct 10
            return date(start_yr, 10, 10)
        elif quarter == "Q3":
            # Oct-Dec -> Due Jan 10 of next year
            return date(end_yr, 1, 10)
        elif quarter == "Q4":
            # Jan-Mar -> Due Apr 10 of next year
            return date(end_yr, 4, 10)
        raise ValueError("Invalid quarter")

    @staticmethod
    def check_overdue(quarterly_return: QuarterlyReturn) -> bool:
        today = timezone.now().date()
        if quarterly_return.status == ReturnStatus.DRAFT and today > quarterly_return.due_date:
            quarterly_return.status = ReturnStatus.OVERDUE
            quarterly_return.save(update_fields=['status'])
            return True
        return quarterly_return.status == ReturnStatus.OVERDUE

    @staticmethod
    def submit_return(quarterly_return: QuarterlyReturn):
        if quarterly_return.status not in [ReturnStatus.DRAFT, ReturnStatus.OVERDUE]:
            raise ValidationError("Return is already submitted.")
            
        today = timezone.now().date()
        
        if today > quarterly_return.due_date:
            # For MVP, we just mark as late submitted. In a full version, we'd trigger a late fee payment
            quarterly_return.status = ReturnStatus.LATE_SUBMITTED
            # If late fee integration is active, we'd verify `late_fee_paid` here before allowing submission
        else:
            quarterly_return.status = ReturnStatus.SUBMITTED
            
        quarterly_return.submission_date = timezone.now()
        
        # Aggregate totals from records
        quarterly_return.total_manufactured = sum([r.quantity_manufactured for r in quarterly_return.production_records.all()])
        quarterly_return.total_sold = sum([r.quantity for r in quarterly_return.sale_records.all()])
        quarterly_return.total_repaired = quarterly_return.repair_records.count()
        
        quarterly_return.save()
        return quarterly_return
