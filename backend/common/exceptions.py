"""The canonical error envelope from API_CONTRACT.md.

Every error response carries `code`, `message`, an optional `fieldErrors`
list, and a `requestId`. DRF's own error bodies vary in shape by exception
type, so they are normalised here once rather than in each view.

Error messages must never disclose secrets or another owner's data.
"""

import uuid

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler as drf_exception_handler


class Conflict(APIException):
    """409 — the request conflicts with existing state, e.g. duplicate identity."""

    status_code = status.HTTP_409_CONFLICT
    default_detail = "The request conflicts with the current state."
    default_code = "CONFLICT"


class FileTooLarge(APIException):
    """413 — an upload exceeds the per-item evidence limit."""

    status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    default_detail = "The file is too large."
    default_code = "FILE_TOO_LARGE"


class UnsupportedMediaType(APIException):
    """415 — the bytes are not an allowlisted evidence format.

    Not DRF's own UnsupportedMediaType: that one is about the request body's
    Content-Type and needs the media type as an argument.
    """

    status_code = status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
    default_detail = "Unsupported file type."
    default_code = "UNSUPPORTED_MEDIA_TYPE"


class InvalidCredentials(APIException):
    """Login failed — for any reason.

    Deliberately not DRF's AuthenticationFailed: on a view with no
    authentication classes, DRF rewrites that to 403 because it cannot build a
    WWW-Authenticate challenge. The API contract specifies 401 for a failed
    login, and a plain APIException keeps the status we declare.
    """

    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Invalid email or password."
    default_code = "UNAUTHENTICATED"

STATUS_CODES = {
    status.HTTP_400_BAD_REQUEST: "VALIDATION_ERROR",
    status.HTTP_401_UNAUTHORIZED: "UNAUTHENTICATED",
    status.HTTP_403_FORBIDDEN: "FORBIDDEN",
    status.HTTP_404_NOT_FOUND: "NOT_FOUND",
    status.HTTP_409_CONFLICT: "CONFLICT",
    status.HTTP_413_REQUEST_ENTITY_TOO_LARGE: "FILE_TOO_LARGE",
    status.HTTP_415_UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",
    status.HTTP_429_TOO_MANY_REQUESTS: "RATE_LIMITED",
}

DEFAULT_MESSAGES = {
    "VALIDATION_ERROR": "One or more fields are invalid.",
    "UNAUTHENTICATED": "Authentication is required.",
    "FORBIDDEN": "You do not have access to this resource.",
    "NOT_FOUND": "The requested resource does not exist.",
    "CONFLICT": "The request conflicts with the current state.",
    "FILE_TOO_LARGE": "The file is too large.",
    "UNSUPPORTED_MEDIA_TYPE": "Unsupported file type.",
    "RATE_LIMITED": "Too many requests. Try again later.",
    "INTERNAL_ERROR": "Something went wrong.",
}


def _flatten_field_errors(detail, prefix=""):
    """Turn DRF's nested error detail into the contract's flat list."""
    errors = []

    if isinstance(detail, dict):
        for field, value in detail.items():
            path = f"{prefix}.{field}" if prefix else str(field)
            errors.extend(_flatten_field_errors(value, path))

    elif isinstance(detail, list):
        for item in detail:
            if isinstance(item, (dict, list)):
                errors.extend(_flatten_field_errors(item, prefix))
            elif prefix:
                errors.append({"field": prefix, "message": str(item)})

    elif prefix:
        errors.append({"field": prefix, "message": str(detail)})

    return errors


def exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is None:
        # Unhandled exception: let Django's own 500 path deal with it so the
        # traceback still reaches the logs, rather than swallowing it here.
        return None

    code = STATUS_CODES.get(response.status_code, "INTERNAL_ERROR")
    detail = response.data

    # A view may already have returned the contract shape (login does). Respect
    # its `code` and `message` instead of overwriting them.
    if isinstance(detail, dict) and "code" in detail:
        code = detail["code"]
        message = detail.get("message", DEFAULT_MESSAGES.get(code, ""))
        field_errors = detail.get("fieldErrors", [])
    else:
        field_errors = _flatten_field_errors(detail)
        message = DEFAULT_MESSAGES.get(code, "Request failed.")

        # A non-field error (a bare string detail) carries the real reason.
        if isinstance(detail, dict) and "detail" in detail:
            message = str(detail["detail"])
            field_errors = []

    body = {
        "code": code,
        "message": message,
        "requestId": str(uuid.uuid4()),
    }

    if field_errors:
        body["fieldErrors"] = field_errors

    response.data = body

    return response
