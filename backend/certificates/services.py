"""Certificate issuance, verification, and revocation (CERT-001, PUB-001)."""

from datetime import timedelta

import segno
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from audit.services import record_event
from authentication.models import User
from common.canonical import canonical_json, sha256_hex
from inspections.models import Inspection

from .crypto import sign_payload, verify_payload
from .models import Certificate

# DEMO/CONFIGURABLE (ADR-016). Not a statutory validity period.
DEMO_VALIDITY_DAYS = 365

PAYLOAD_VERSION = "1"


class CertificateError(Exception):
    """Issuance is not permitted for this inspection."""


def next_certificate_number():
    count = Certificate.objects.count() + 1

    return f"CERT-DEMO-{count:04d}"


def build_payload(*, certificate_number, application, instrument, issued_at, valid_until, result):
    """The versioned, stable field set that gets signed.

    Only stable identity and decision facts go in. Anything mutable — owner
    contact details, internal ids, status — is deliberately excluded so the
    signature stays valid for the life of the record.
    """
    return {
        "payloadVersion": PAYLOAD_VERSION,
        "certificateNumber": certificate_number,
        "applicationNumber": application.application_number,
        "instrumentNumber": instrument.instrument_number,
        "instrumentType": instrument.instrument_type,
        "issuedAt": issued_at,
        "validUntil": valid_until,
        "inspectionResult": result,
        "demoConfiguration": "SIH-PROTOTYPE",
    }


def visible_certificates(user):
    queryset = Certificate.objects.select_related("instrument", "business", "application")

    if user.role == User.Role.ADMIN:
        return queryset

    if user.role == User.Role.BUSINESS and user.business_id:
        return queryset.filter(business_id=user.business_id)

    if user.role == User.Role.OFFICER:
        return queryset.filter(inspection__officer=user)

    return queryset.none()


@transaction.atomic
def issue_certificate(*, user, inspection):
    """Issue a certificate for a PASS inspection.

    Only PASS produces an artifact. A FAIL or REQUIRES_CORRECTION is a
    completed inspection with no certificate — issuing one anyway would be the
    software asserting a verification that did not happen.
    """
    # Visibility is not authority. A business owner can legitimately *see*
    # their own inspection, so gating issuance on visibility alone would have
    # let them issue their own certificate. Only the officer who performed the
    # inspection, or an administrator, may issue one.
    if user.role == User.Role.OFFICER:
        if inspection.officer_id != user.id:
            raise CertificateError("Only the inspecting officer may issue this certificate.")
    elif user.role != User.Role.ADMIN:
        raise CertificateError("Your role cannot issue certificates.")

    if inspection.result != Inspection.Result.PASS:
        raise CertificateError("Only a PASS inspection can produce a certificate.")

    if inspection.completed_at is None:
        raise CertificateError("The inspection is not complete.")

    if Certificate.objects.filter(inspection=inspection).exists():
        raise CertificateError("A certificate already exists for this inspection.")

    application = inspection.application
    instrument = application.instrument

    certificate_number = next_certificate_number()
    issued_at = timezone.now()
    valid_until = issued_at + timedelta(days=DEMO_VALIDITY_DAYS)

    payload = build_payload(
        certificate_number=certificate_number,
        application=application,
        instrument=instrument,
        issued_at=issued_at,
        valid_until=valid_until,
        result=inspection.result,
    )

    canonical_bytes = canonical_json(payload)
    payload_hash = sha256_hex(canonical_bytes)
    signature = sign_payload(canonical_bytes)

    # QR carries only the lookup URL. It is discovery, not a security proof.
    qr_url = f"{settings.FRONTEND_URL}/verify/{certificate_number}"

    certificate = Certificate.objects.create(
        certificate_number=certificate_number,
        application=application,
        instrument=instrument,
        business=application.business,
        inspection=inspection,
        issued_at=issued_at,
        valid_until=valid_until,
        payload_version=PAYLOAD_VERSION,
        canonical_payload=canonical_bytes.decode("utf-8"),
        payload_hash=payload_hash,
        digital_signature=signature,
        qr_verification_url=qr_url,
    )

    instrument.next_due_date = valid_until.date()
    instrument.save(update_fields=["next_due_date", "updated_at"])

    record_event(
        actor=user, action="CERTIFICATE_ISSUED", entity_type="CERTIFICATE",
        entity_id=certificate.id,
        metadata={"certificateNumber": certificate_number, "payloadHash": payload_hash},
    )

    return certificate


def qr_svg(certificate):
    """Inline SVG for the certificate's verification URL."""
    return segno.make(certificate.qr_verification_url).svg_inline(scale=6)


def verify_certificate(certificate_number):
    """Public verification. Returns the minimal contract response.

    Every failure mode collapses to INVALID with no detail: a member of the
    public gets an answer, not a description of our data.
    """
    invalid = {
        "certificateNumber": certificate_number,
        "verificationStatus": "INVALID",
        "certificateStatus": None,
        "signatureValid": False,
        "payloadHash": None,
        "issuedAt": None,
        "validUntil": None,
        "instrumentSummary": None,
        "signatureAlgorithm": None,
        "revokedAt": None,
        "verificationMessage": "No valid certificate matches this number.",
    }

    certificate = Certificate.objects.select_related("instrument").filter(
        certificate_number=certificate_number
    ).first()

    if certificate is None:
        return invalid

    canonical_bytes = certificate.canonical_payload.encode("utf-8")

    # Recompute the hash and verify the signature over the stored bytes. If
    # anyone edited the payload in the database, both checks fail here.
    recomputed_hash = sha256_hex(canonical_bytes)
    hash_matches = recomputed_hash == certificate.payload_hash
    signature_valid = verify_payload(canonical_bytes, certificate.digital_signature)

    if not (hash_matches and signature_valid):
        return {**invalid, "verificationMessage": "Certificate data failed integrity verification."}

    if certificate.status == Certificate.Status.REVOKED:
        status_word, message = "REVOKED", "Certificate has been revoked."
    elif certificate.is_expired or certificate.status == Certificate.Status.EXPIRED:
        status_word, message = "EXPIRED", "Certificate has expired."
    else:
        status_word, message = "VALID", "Certificate is active and signature verified."

    return {
        "certificateNumber": certificate.certificate_number,
        "verificationStatus": status_word,
        "certificateStatus": certificate.status,
        "signatureValid": True,
        "payloadHash": certificate.payload_hash,
        "issuedAt": certificate.issued_at,
        "validUntil": certificate.valid_until,
        # Minimal disclosure: no owner contact details, no evidence, no audit
        # metadata, no signing material.
        "instrumentSummary": {
            "instrumentNumber": certificate.instrument.instrument_number,
            "instrumentType": certificate.instrument.instrument_type,
        },
        "signatureAlgorithm": certificate.signature_algorithm,
        "revokedAt": certificate.revoked_at,
        # revocationReason is deliberately withheld: it is an internal
        # administrative note, and the public only needs the status.
        "verificationMessage": message,
    }


@transaction.atomic
def revoke_certificate(*, user, certificate, reason):
    if not reason:
        raise CertificateError("A revocation reason is required.")

    if certificate.status == Certificate.Status.REVOKED:
        raise CertificateError("This certificate is already revoked.")

    certificate.status = Certificate.Status.REVOKED
    certificate.revoked_at = timezone.now()
    certificate.revocation_reason = reason
    certificate.save(update_fields=["status", "revoked_at", "revocation_reason", "updated_at"])

    record_event(
        actor=user, action="CERTIFICATE_REVOKED", entity_type="CERTIFICATE",
        entity_id=certificate.id, metadata={"reason": reason},
    )

    return certificate
