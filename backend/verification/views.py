"""Public certificate verification (ADR-017, PUB-001).

Unauthenticated and rate-limited. No account, no PUBLIC role.
"""

import re

from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from certificates.serializers import VerificationResultSerializer
from certificates.services import verify_certificate

# Bounded length and a safe character set, checked before touching the database.
CERT_NUMBER_PATTERN = re.compile(r"^[A-Za-z0-9\-]{1,40}$")


class PublicVerifyView(APIView):
    """GET /api/v1/certificates/verify?certNo=..."""

    permission_classes = [AllowAny]
    authentication_classes = []

    throttle_scope = "public_verify"

    @extend_schema(responses={200: VerificationResultSerializer})
    def get(self, request):
        cert_no = (request.query_params.get("certNo") or "").strip()

        if not CERT_NUMBER_PATTERN.match(cert_no):
            # Malformed input is INVALID, not a validation error: the response
            # must not differ from "no such certificate", or it becomes a probe
            # for which number formats exist.
            return Response(
                {
                    "certificateNumber": cert_no[:40],
                    "verificationStatus": "INVALID",
                    "certificateStatus": None,
                    "signatureValid": False,
                    "payloadHash": None,
                    "issuedAt": None,
                    "validUntil": None,
                    "instrumentSummary": None,
                    "verificationMessage": "No valid certificate matches this number.",
                }
            )

        return Response(verify_certificate(cert_no))

import copy
import json
from common.canonical import canonical_json, sha256_hex
from certificates.crypto import sign_payload, verify_payload
class PublicCertificatesSampleView(APIView):
    """GET /api/v1/certificates/samples/
    Returns non-confidential sample certificate metadata for prototype autofill & testing.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        from certificates.models import Certificate
        certs = Certificate.objects.select_related("instrument").order_by("-issued_at")[:10]
        data = [
            {
                "certificateNumber": c.certificate_number,
                "status": c.status,
                "instrumentNumber": c.instrument.instrument_number if c.instrument else "",
                "instrumentType": c.instrument.instrument_type if c.instrument else "",
            }
            for c in certs
        ]
        return Response(data)


class TamperDemoView(APIView):
    """GET /api/v1/certificates/demo/tamper and POST"""

    permission_classes = [AllowAny]
    authentication_classes = []

    def get_original_payload(self):
        return {
            "payloadVersion": "1",
            "certificateNumber": "CERT-DEMO-001",
            "applicationNumber": "APP-DEMO-001",
            "instrumentNumber": "ES-GKP-2026-001",
            "instrumentType": "ELECTRONIC_SCALE",
            "issuedAt": "2026-09-01T10:30:00Z",
            "validUntil": "2027-09-01T23:59:59Z",
            "inspectionResult": "PASS",
            "demoConfiguration": "SIH-PROTOTYPE"
        }

    def get(self, request):
        original_payload = self.get_original_payload()
        canonical_original = canonical_json(original_payload)
        hash_original = sha256_hex(canonical_original)
        signature = sign_payload(canonical_original)
        verify_original = verify_payload(canonical_original, signature)
        
        return Response({
            "payload": original_payload,
            "hash": hash_original,
            "signatureValid": verify_original,
            "verification": "VALID" if verify_original else "INVALID"
        })

    def post(self, request):
        # 1. We securely hold the original signature on the server (simulated by re-signing the known original)
        original_payload = self.get_original_payload()
        canonical_original = canonical_json(original_payload)
        signature = sign_payload(canonical_original)

        # 2. We receive the user's manipulated JSON data
        tampered_payload = request.data
        canonical_tampered = canonical_json(tampered_payload)
        hash_tampered = sha256_hex(canonical_tampered)

        # 3. We attempt to verify the NEW hash using the ORIGINAL signature
        verify_tampered = verify_payload(canonical_tampered, signature)

        return Response({
            "payload": tampered_payload,
            "hash": hash_tampered,
            "signatureValid": verify_tampered,
            "verification": "VALID" if verify_tampered else "INVALID"
        })
