"""Evidence upload, integrity, and access.

What the server refuses to trust from the client:

- the MIME type: it is sniffed from the bytes, and images are additionally
  decoded, so a renamed executable does not become "image/png";
- the file name: only kept as a display label, never used in the object key;
- the hash: computed here over the stored bytes. A client-supplied sha256 is
  checked against it and a mismatch is rejected, so a file corrupted in
  transit is never silently accepted.

Limits are the prototype's (DATA_MODEL.md "Evidence limits"), not statutory.
"""

import hashlib
import io
import uuid

from django.conf import settings
from django.core.files.storage import default_storage
from django.db import transaction
from PIL import Image, UnidentifiedImageError

from audit.services import record_event
from authentication.models import User
from inspections.services import visible_inspections

from .models import Evidence

ALLOWED_MIME_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
}

IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

CHUNK = 64 * 1024


def max_bytes():
    # Read per call so the limit can be tuned (or overridden in tests)
    # without restarting the process.
    return getattr(settings, "EVIDENCE_MAX_BYTES", 10 * 1024 * 1024)


class EvidenceError(Exception):
    """The upload is well formed but not permitted in the current state."""


class UnsupportedEvidenceType(Exception):
    """The bytes are not one of the allowlisted formats (415)."""


class EvidenceTooLarge(Exception):
    """Over the per-item size limit (413)."""


class IntegrityMismatch(Exception):
    """The client's claimed sha256 does not match the bytes received (400)."""


def visible_evidence(user):
    """Evidence follows inspection visibility: whoever may read the
    inspection may read its evidence."""
    return Evidence.objects.filter(
        inspection__in=visible_inspections(user).values("id")
    ).select_related("inspection", "uploaded_by")


def sniff_mime(header: bytes):
    """Identify the format from magic bytes. Returns None if not allowlisted."""
    if header.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"

    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"

    if header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "image/webp"

    if header.startswith(b"%PDF-"):
        return "application/pdf"

    return None


def _read_and_hash(uploaded):
    """Single pass over the stream: header for sniffing, sha256, size."""
    digest = hashlib.sha256()
    header = b""
    size = 0
    limit = max_bytes()

    uploaded.seek(0)

    for chunk in uploaded.chunks(CHUNK):
        if len(header) < 16:
            header += chunk[: 16 - len(header)]

        digest.update(chunk)
        size += len(chunk)

        if size > limit:
            raise EvidenceTooLarge(f"Evidence must be {limit // 1024} KiB or smaller.")

    uploaded.seek(0)

    return header, digest.hexdigest(), size


def _verify_image(uploaded):
    """Decode the image headers so a file that merely starts with PNG magic
    but is not a PNG is refused."""
    try:
        uploaded.seek(0)
        Image.open(io.BytesIO(uploaded.read())).verify()
    except (UnidentifiedImageError, OSError, ValueError):
        raise UnsupportedEvidenceType("The file is not a readable image.")
    finally:
        uploaded.seek(0)


def _default_type(mime_type):
    return Evidence.Type.DOCUMENT if mime_type == "application/pdf" else Evidence.Type.SITE_PHOTO


@transaction.atomic
def store_evidence(
    *,
    user,
    inspection,
    uploaded,
    evidence_type=None,
    captured_at=None,
    latitude=None,
    longitude=None,
    gps_accuracy_meters=None,
    notes="",
    client_sha256=None,
    client_operation_id=None,
):
    """Validate, store, and record one evidence item.

    Returns (evidence, created). A replayed client_operation_id returns the
    original row with created=False and stores nothing.
    """
    if client_operation_id is not None:
        existing = Evidence.objects.filter(client_operation_id=client_operation_id).first()

        if existing is not None:
            if existing.inspection_id != inspection.id:
                raise EvidenceError("This operation id was already used for another inspection.")

            return existing, False

    if inspection.officer_id != user.id and user.role != User.Role.ADMIN:
        raise EvidenceError("Only the assigned officer may attach evidence.")

    if inspection.completed_at is not None:
        raise EvidenceError("This inspection is already complete.")

    if not uploaded or getattr(uploaded, "size", 0) == 0:
        raise UnsupportedEvidenceType("The file is empty.")

    header, sha256, size = _read_and_hash(uploaded)

    mime_type = sniff_mime(header)

    if mime_type is None:
        raise UnsupportedEvidenceType(
            "Only JPEG, PNG, WebP images and PDF documents are accepted."
        )

    if mime_type in IMAGE_MIME_TYPES:
        _verify_image(uploaded)

    if client_sha256 and client_sha256.lower() != sha256:
        raise IntegrityMismatch("The uploaded bytes do not match the supplied sha256.")

    evidence_id = uuid.uuid4()
    object_key = f"evidence/{inspection.id}/{evidence_id}.{ALLOWED_MIME_TYPES[mime_type]}"

    # Storage may rename on collision; the row records where it actually went.
    saved_key = default_storage.save(object_key, uploaded)

    evidence = Evidence.objects.create(
        id=evidence_id,
        inspection=inspection,
        instrument=inspection.application.instrument,
        uploaded_by=user,
        evidence_type=evidence_type or _default_type(mime_type),
        object_key=saved_key,
        original_file_name=(getattr(uploaded, "name", "") or "upload")[:255],
        mime_type=mime_type,
        size_bytes=size,
        sha256=sha256,
        captured_at=captured_at,
        latitude=latitude,
        longitude=longitude,
        gps_accuracy_meters=gps_accuracy_meters,
        notes=notes or "",
        client_operation_id=client_operation_id,
    )

    record_event(
        actor=user, action="EVIDENCE_UPLOADED", entity_type="EVIDENCE",
        entity_id=evidence.id,
        metadata={
            "inspectionId": str(inspection.id),
            "evidenceType": evidence.evidence_type,
            "mimeType": mime_type,
            "sizeBytes": size,
            "sha256": sha256,
            "objectKey": saved_key,
        },
    )

    return evidence, True


@transaction.atomic
def delete_evidence(*, user, evidence):
    """Remove an item. The uploading officer may do so while the inspection
    is still open; an administrator may at any time. Either way it is audited
    with the hash, so a removed file is never silently gone."""
    inspection = evidence.inspection

    if user.role == User.Role.ADMIN:
        pass
    elif evidence.uploaded_by_id != user.id or inspection.officer_id != user.id:
        raise EvidenceError("Only the officer who attached this evidence may remove it.")
    elif inspection.completed_at is not None:
        raise EvidenceError("Evidence on a completed inspection is immutable.")

    metadata = {
        "inspectionId": str(inspection.id),
        "evidenceType": evidence.evidence_type,
        "sha256": evidence.sha256,
        "objectKey": evidence.object_key,
        "inspectionCompleted": inspection.completed_at is not None,
    }

    object_key = evidence.object_key
    evidence_id = evidence.id

    evidence.delete()

    if default_storage.exists(object_key):
        default_storage.delete(object_key)

    record_event(
        actor=user, action="EVIDENCE_DELETED", entity_type="EVIDENCE",
        entity_id=evidence_id, metadata=metadata,
    )
