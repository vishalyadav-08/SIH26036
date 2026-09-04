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
