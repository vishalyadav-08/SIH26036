"""Offline operation processing.

The field client queues work while disconnected and posts it in a batch when
it can. Each operation is applied through the *same* domain services the
online endpoints use — nothing here bypasses assignment checks, state
transitions, or evidence validation. What this module adds is:

- idempotency: a `clientOperationId` is applied once, replays return the
  stored outcome, and the same id with different bytes is a CONFLICT;
- isolation: every operation runs in its own savepoint, so one bad record in
  a batch neither poisons the others nor half-applies itself;
- honest outcomes: SYNCED means the server holds it; FAILED means it never
  will in this form; CONFLICT means the server already has something
  different and a person has to decide.
"""

import base64
import binascii
import uuid
from decimal import Decimal, InvalidOperation

from django.core.files.base import ContentFile
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from applications.models import Application
from applications.services import IllegalTransition, OwnershipError, visible_applications
from audit.services import record_event
from authentication.models import User
from common.canonical import sha256_hex
from evidence import services as evidence_svc
from inspections import services as inspection_svc
from inspections.models import Inspection, Measurement
from notifications import services as notify

from .models import SyncRecord

S = SyncRecord.Status
OP = SyncRecord.OperationType


class SyncFailed(Exception):
    """The operation cannot be applied as sent. Retrying unchanged will not help."""


class SyncConflict(Exception):
    """The server already holds a different truth; a person must resolve it."""


# -- resolution helpers ------------------------------------------------------


def _resolve_application(user, op):
    """The application this operation is about, checked for assignment."""
    payload = op["payload"]
    application_id = payload.get("applicationId")

    if application_id is None and op["entityType"] == SyncRecord.EntityType.APPLICATION:
        application_id = op["entityId"]

    try:
        application_id = uuid.UUID(str(application_id))
    except (TypeError, ValueError):
        raise SyncFailed("A valid applicationId is required.")

    application = (
        visible_applications(user)
        .select_related("instrument", "business")
        .filter(id=application_id)
        .first()
    )

    if application is None:
        raise SyncFailed("Unknown application, or it is not assigned to you.")

    if user.role in User.FIELD_STAFF_ROLES and not inspection_svc.is_assigned_officer(
        user, application
    ):
        raise SyncFailed("You are not the assigned officer for this application.")

    return application


def _resolve_inspection(user, application):
    """The server inspection for the application, starting it if the officer
    has not yet. Starting offline is the normal case: the officer opened the
    case with no signal."""
    existing = Inspection.objects.filter(application=application).first()

    if existing is not None:
        return existing

    if application.state != Application.State.SCHEDULED:
        raise SyncConflict(
            f"Application is {application.state}; an inspection cannot be started."
        )

    try:
        return inspection_svc.start_inspection(user=user, application=application)
    except (inspection_svc.InspectionError, IllegalTransition, OwnershipError) as exc:
        raise SyncConflict(str(exc))


def _check_version(op, inspection):
    expected = op.get("expectedServerVersion")

    if expected is not None and expected != inspection.version:
        raise SyncConflict(
            f"Server version is {inspection.version}, client expected {expected}. "
            f"The inspection changed after this device last saw it."
        )


def _require_open(inspection):
    if inspection.completed_at is not None:
        raise SyncConflict(
            f"This inspection was already completed with result {inspection.result}."
        )


def _decimal(value, name):
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        raise SyncFailed(f"{name} must be numeric.")


def _apply_readings(user, inspection, readings):
    """Replace the draft readings. Accepts both the server's field names and
    the field client's (testPoint / referenceValue / indicatedValue)."""
    if not isinstance(readings, list) or not readings:
        raise SyncFailed("measurements must be a non-empty list.")

    parsed = []

    for index, reading in enumerate(readings, start=1):
        if not isinstance(reading, dict):
            raise SyncFailed(f"measurements[{index}] must be an object.")

        label = reading.get("label") or reading.get("testPoint")
        nominal = reading.get("nominalValue", reading.get("referenceValue"))
        observed = reading.get("observedValue", reading.get("indicatedValue"))
        unit = reading.get("unit")

        if not label or nominal is None or observed is None or not unit:
            raise SyncFailed(
                f"measurements[{index}] needs label/testPoint, nominal, observed and unit."
            )

        parsed.append(
            (
                str(label)[:100],
                _decimal(nominal, f"measurements[{index}].nominalValue"),
                _decimal(observed, f"measurements[{index}].observedValue"),
                str(unit)[:10],
            )
        )

    Measurement.objects.filter(inspection=inspection).delete()

    for label, nominal, observed, unit in parsed:
        inspection_svc.add_measurement(
            user=user, inspection=inspection, label=label,
            nominal_value=nominal, observed_value=observed, unit=unit,
        )

    inspection.refresh_from_db()

    return len(parsed)


def _gps_from(payload):
    gps = payload.get("gps") or {}

    if not gps and ("latitude" in payload or "longitude" in payload):
        gps = {
            "latitude": payload.get("latitude"),
            "longitude": payload.get("longitude"),
            "accuracyMeters": payload.get("gpsAccuracyMeters"),
        }

    if not gps:
        return None

    captured = gps.get("capturedAt") or payload.get("completedAt") or payload.get("capturedAt")

    return {
        "latitude": gps.get("latitude"),
        "longitude": gps.get("longitude"),
        "accuracyMeters": gps.get("accuracyMeters"),
        "capturedAt": parse_datetime(captured) if isinstance(captured, str) else captured,
    }


# -- operation handlers ------------------------------------------------------


def _result(op, *, status, message, entity=None, version=None, application=None):
    return {
        "clientOperationId": str(op["clientOperationId"]),
        "status": status,
        "entityId": str(entity.id) if entity is not None else None,
        "serverVersion": version,
        "message": message,
        "applicationState": application.state if application is not None else None,
    }


def _handle_create_inspection(user, op):
    application = _resolve_application(user, op)
    inspection = _resolve_inspection(user, application)

    return _result(
        op, status=S.SYNCED, message="Inspection is open on the server.",
        entity=inspection, version=inspection.version, application=application,
    )


def _handle_checklist(user, op):
    """The server keeps no checklist model in the MVP. The checklist travels
    with the operation and is retained on the SyncRecord for the record; the
    inspection itself is what carries readings and the decision."""
    application = _resolve_application(user, op)
    inspection = _resolve_inspection(user, application)
    _require_open(inspection)

    items = op["payload"].get("checklist")
    if not isinstance(items, list):
        raise SyncFailed("checklist must be a list.")

    return _result(
        op, status=S.SYNCED,
        message=f"Checklist ({len(items)} items) recorded with this operation.",
        entity=inspection, version=inspection.version, application=application,
    )


def _handle_readings(user, op):
    application = _resolve_application(user, op)
    inspection = _resolve_inspection(user, application)
    _require_open(inspection)
    _check_version(op, inspection)

    count = _apply_readings(user, inspection, op["payload"].get("measurements"))

    return _result(
        op, status=S.SYNCED, message=f"{count} reading(s) applied.",
        entity=inspection, version=inspection.version, application=application,
    )


def _handle_evidence(user, op):
    """Bytes may ride along base64-encoded under `contentBase64`. Without
    them there is nothing to store: metadata alone is not evidence."""
    payload = op["payload"]
    application = _resolve_application(user, op)
    inspection = _resolve_inspection(user, application)
    _require_open(inspection)

    encoded = payload.get("contentBase64")
    if not encoded:
        raise SyncFailed(
            "No file content. Upload the bytes with multipart "
            f"POST /api/v1/inspections/{inspection.id}/evidence/."
        )

    try:
        content = base64.b64decode(encoded, validate=True)
    except (binascii.Error, ValueError):
        raise SyncFailed("contentBase64 is not valid base64.")

    uploaded = ContentFile(content, name=str(payload.get("fileName") or "evidence")[:255])

    captured = payload.get("capturedAt")

    try:
        evidence, _ = evidence_svc.store_evidence(
            user=user,
            inspection=inspection,
            uploaded=uploaded,
            evidence_type=payload.get("evidenceType") or payload.get("type"),
            captured_at=parse_datetime(captured) if isinstance(captured, str) else None,
            latitude=payload.get("latitude"),
            longitude=payload.get("longitude"),
            gps_accuracy_meters=payload.get("gpsAccuracyMeters"),
            notes=payload.get("notes", ""),
            client_sha256=payload.get("sha256"),
            client_operation_id=op["clientOperationId"],
        )
    except (evidence_svc.UnsupportedEvidenceType, evidence_svc.EvidenceTooLarge,
            evidence_svc.IntegrityMismatch) as exc:
        raise SyncFailed(str(exc))
    except evidence_svc.EvidenceError as exc:
        raise SyncConflict(str(exc))

    return _result(
        op, status=S.SYNCED, message=f"Evidence stored ({evidence.mime_type}).",
        entity=evidence, version=inspection.version, application=application,
    )


def _handle_decision(user, op):
    """The whole offline bundle: readings, then the decision."""
    payload = op["payload"]
    application = _resolve_application(user, op)
    inspection = _resolve_inspection(user, application)
    _require_open(inspection)
    _check_version(op, inspection)

    result = payload.get("result")
    if result not in Inspection.Result.values:
        raise SyncFailed("result must be PASS, FAIL or REQUIRES_CORRECTION.")

    readings = payload.get("measurements")
    if readings:
        _apply_readings(user, inspection, readings)

    try:
        inspection = inspection_svc.complete_inspection(
            user=user,
            inspection=inspection,
            result=result,
            notes=str(payload.get("notes") or "")[:2000],
            gps=_gps_from(payload),
        )
    except inspection_svc.InspectionError as exc:
        raise SyncFailed(str(exc))
    except (IllegalTransition, OwnershipError) as exc:
        raise SyncConflict(str(exc))

    application.refresh_from_db()

    evidence_note = ""
    pending = [e for e in (payload.get("evidence") or []) if not e.get("serverId")]
    if pending:
        evidence_note = (
            f" {len(pending)} evidence item(s) are still only on the device; "
            f"upload them to /inspections/{inspection.id}/evidence/."
        )

    return _result(
        op, status=S.SYNCED,
        message=f"Decision {result} recorded.{evidence_note}",
        entity=inspection, version=inspection.version, application=application,
    )


HANDLERS = {
    OP.CREATE_INSPECTION: _handle_create_inspection,
    OP.UPSERT_CHECKLIST: _handle_checklist,
    OP.UPSERT_READINGS: _handle_readings,
    OP.UPLOAD_EVIDENCE: _handle_evidence,
    OP.RECORD_DECISION: _handle_decision,
}


# -- batch -------------------------------------------------------------------


def visible_sync_records(user):
    queryset = SyncRecord.objects.select_related("submitted_by")

    if user.role == User.Role.ADMIN:
        return queryset

    return queryset.filter(submitted_by=user)


def _payload_hash(op):
    return sha256_hex(
        {
            "entityType": op["entityType"],
            "entityId": op["entityId"],
            "operationType": op["operationType"],
            "payload": op["payload"],
        }
    )


def apply_operation(user, op):
    """Apply one operation and return its result dict. Never raises for a
    domain problem: the outcome is in the result's status."""
    payload_hash = _payload_hash(op)

    existing = SyncRecord.objects.filter(client_operation_id=op["clientOperationId"]).first()

    if existing is not None:
        if existing.submitted_by_id != user.id:
            # Someone else's operation id: treat as unknown rather than leak
            # its outcome.
            return _result(op, status=S.FAILED, message="Unknown operation id.")

        existing.attempt_count += 1

        if existing.payload_hash == payload_hash and existing.status != S.SYNCING:
            existing.save(update_fields=["attempt_count"])

            return existing.result

        if existing.payload_hash != payload_hash:
            existing.save(update_fields=["attempt_count"])

            return _result(
                op, status=S.CONFLICT,
                message="This operation id was already submitted with different content. "
                        "Resolve on the device and resubmit as a new operation.",
            )

        # Same payload, previous attempt never finished (status SYNCING):
        # fall through and apply it now.
        record = existing
    else:
        record = SyncRecord.objects.create(
            client_operation_id=op["clientOperationId"],
            submitted_by=user,
            entity_type=op["entityType"],
            entity_id=str(op["entityId"])[:100],
            operation_type=op["operationType"],
            payload=op["payload"],
            payload_hash=payload_hash,
            expected_server_version=op.get("expectedServerVersion"),
            client_created_at=op.get("createdAt"),
            attempt_count=max(int(op.get("attemptCount") or 0), 0) + 1,
        )

    handler = HANDLERS[op["operationType"]]

    try:
        with transaction.atomic():
            result = handler(user, op)
    except SyncFailed as exc:
        result = _result(op, status=S.FAILED, message=str(exc))
    except SyncConflict as exc:
        result = _result(op, status=S.CONFLICT, message=str(exc))

    record.status = result["status"]
    record.last_error = "" if result["status"] == S.SYNCED else result["message"][:500]
    record.server_entity_id = result["entityId"]
    record.server_entity_type = (
        "EVIDENCE" if op["operationType"] == OP.UPLOAD_EVIDENCE else "INSPECTION"
    ) if result["entityId"] else ""
    record.server_version = result["serverVersion"]
    record.processed_at = timezone.now()
    record.result = result
    record.save()

    record_event(
        actor=user, action=f"SYNC_OPERATION_{result['status']}", entity_type="SYNC_RECORD",
        entity_id=record.id,
        metadata={
            "clientOperationId": str(op["clientOperationId"]),
            "operationType": op["operationType"],
            "serverEntityId": result["entityId"],
            "message": result["message"],
        },
    )

    return result


def process_batch(*, user, operations):
    """Apply operations in client creation order. Returns one result each."""
    ordered = sorted(
        operations,
        key=lambda op: (op.get("createdAt") or timezone.now(), str(op["clientOperationId"])),
    )

    results = [apply_operation(user, op) for op in ordered]

    synced = sum(1 for r in results if r["status"] == S.SYNCED)
    rejected = len(results) - synced

    if results:
        detail = ""
        if rejected:
            first = next(r for r in results if r["status"] != S.SYNCED)
            detail = f"First problem: {first['message']}"

        notify.sync_result(user=user, synced=synced, failed=rejected, detail=detail)

    return results
