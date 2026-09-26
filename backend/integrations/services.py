from .models import IntegrationLog, IntegrationType, DigiLockerDocument
import uuid

class IntegrationService:
    @staticmethod
    def push_to_nsws(license_obj):
        payload = {
            "license_number": license_obj.license_number,
            "business_name": license_obj.business.legal_name,
            "valid_until": str(license_obj.valid_until)
        }
        # Simulate API call
        log = IntegrationLog.objects.create(
            integration_type=IntegrationType.NSWS,
            action="PUSH_LICENSE",
            status="SUCCESS",
            payload=payload,
            response={"message": "Accepted by NSWS", "tracking_id": uuid.uuid4().hex}
        )
        return log

    @staticmethod
    def pull_digilocker_document(business, doc_type):
        doc_uri = f"in.gov.digilocker-{uuid.uuid4().hex[:10]}"
        # Simulate API call
        doc = DigiLockerDocument.objects.create(
            business=business,
            document_type=doc_type,
            document_uri=doc_uri
        )
        IntegrationLog.objects.create(
            integration_type=IntegrationType.DIGILOCKER,
            action="FETCH_DOCUMENT",
            status="SUCCESS",
            payload={"business_id": str(business.id), "doc_type": doc_type},
            response={"uri": doc_uri}
        )
        return doc
