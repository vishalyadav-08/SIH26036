"""Deterministic serialization (CRYPTOGRAPHY.md section 4).

The serialized *bytes* are what gets hashed and signed, never a language-native
object. Two processes must produce byte-identical output for the same logical
payload, so ordering, separators, and timestamp format are all pinned here.
"""

import hashlib
import json
from datetime import date, datetime, timezone
from decimal import Decimal
from uuid import UUID


def _normalize(value):
    if isinstance(value, datetime):
        # Always UTC, always the same shape. A naive datetime is assumed UTC
        # rather than silently taking the server's local zone.
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)

        return value.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    if isinstance(value, date):
        return value.isoformat()

    if isinstance(value, (UUID, Decimal)):
        return str(value)

    if isinstance(value, dict):
        return {k: _normalize(v) for k, v in value.items()}

    if isinstance(value, (list, tuple)):
        return [_normalize(v) for v in value]

    return value


def canonical_json(payload):
    """Return the canonical UTF-8 bytes for a payload."""
    return json.dumps(
        _normalize(payload),
        sort_keys=True,          # stable property ordering
        separators=(",", ":"),   # no insignificant whitespace
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")


def sha256_hex(data):
    """SHA-256 over canonical bytes, as lowercase hex."""
    if not isinstance(data, (bytes, bytearray)):
        data = canonical_json(data)

    return hashlib.sha256(data).hexdigest()
