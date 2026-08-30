# API Contract

This is the client-independent contract for the Django/Django REST Framework backend. The same `/api/v1` semantics serve the Next.js Business/Admin web routes, the current React field PWA, and the conditional Flutter field app. Endpoint documentation is a target contract until corresponding backend views, serializers, and tests exist.

**Base path:** `/api/v1`  
**Transport:** HTTPS in production; JSON for resource requests/responses; multipart for evidence upload.  
**Authority:** The backend is the source of truth for authorization, ownership, state, certificate status, and sync outcomes.

## Contract conventions

Successful JSON responses use the resource shape shown in each endpoint. Errors use:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "One or more fields are invalid.",
  "fieldErrors": [{"field": "serialNumber", "message": "Required"}],
  "requestId": "uuid"
}
```

Common errors: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CONFLICT`, `413 FILE_TOO_LARGE`, `415 UNSUPPORTED_MEDIA_TYPE`, `429 RATE_LIMITED`, `500 INTERNAL_ERROR`. Error messages must not disclose secrets or cross-owner data.

Authenticated roles are `ADMIN`, `OFFICER`, and `BUSINESS`. Public certificate verification is unauthenticated and rate-limited.

List endpoints use `page` (zero-based), `pageSize` (bounded), `sort`, and documented filters. Response shape:

```json
{"items": [], "page": 0, "pageSize": 20, "totalItems": 0, "totalPages": 0}
```

Mutation endpoints that can be retried accept `Idempotency-Key` or the domain-specific `clientOperationId` described below. A retry returns the original result.

## Authentication and profile

### POST `/api/v1/auth/login`

- **Purpose:** Authenticate an active user.
- **Auth/role:** None; rate-limited.
- **Request:** `{ "email": "business@example.test", "password": "synthetic-password" }`.
- **Response:** `{ "accessToken": "jwt", "tokenType": "Bearer", "expiresAt": "2026-08-28T12:00:00Z", "user": {"id":"uuid","email":"business@example.test","displayName":"Demo Business","role":"BUSINESS","businessId":"uuid"} }`.
- **Validation:** Normalized email and non-empty password; generic failure message for invalid credentials.
- **Errors:** `400`, `401`, `429`.
- **Example:** The response must never contain password hash or signing keys.

### GET `/api/v1/users/me`

- **Purpose:** Return the current user profile.
- **Auth/role:** Bearer token; all authenticated roles.
- **Request:** None.
- **Response:** `{ "id":"uuid", "email":"...", "displayName":"...", "phone":"...", "role":"BUSINESS", "businessId":"uuid", "active":true }`.
- **Validation/errors:** `401` for missing/invalid/expired token.

## Businesses

### POST `/api/v1/businesses`

- **Purpose:** Create a business profile.
- **Auth/role:** Bearer; BUSINESS during self-registration or ADMIN.
- **Request:** `{ "legalName":"Synthetic Retail Ltd", "tradeName":"Demo Store", "contactName":"Demo Owner", "email":"owner@example.test", "phone":"0000000000", "address":"Synthetic address", "jurisdictionLabel":"DEMO" }`.
- **Response:** Business object with `id`, canonical fields, `status`, timestamps.
- **Validation:** Required legal/contact fields; synthetic values only for prototype.
- **Errors/idempotency:** `409` for duplicate normalized identity where configured; retry-safe with `Idempotency-Key`.

### GET `/api/v1/businesses/me`

- **Purpose:** Read the signed-in business profile.
- **Auth/role:** BUSINESS; ADMIN may use an approved administrative view later, but this path is the current-user path.
- **Response:** Business object without secrets.
- **Errors:** `401`, `403`, `404`.

## Instruments

### POST `/api/v1/instruments`

- **Purpose:** Register an instrument.
- **Auth/role:** BUSINESS owner or ADMIN.
- **Request:** `{ "instrumentNumber":"INS-DEMO-001", "serialNumber":"SN-DEMO-001", "instrumentType":"ELECTRONIC_SCALE", "manufacturer":"Synthetic Manufacturer", "model":"Demo-100", "capacity":100, "capacityUnit":"kg", "location":"Synthetic Store", "businessId":"uuid" }`; BUSINESS cannot choose another business.
- **Response:** Instrument object with canonical fields and lifecycle fields.
- **Validation:** Required identity fields, positive numeric capacity, bounded text, ownership.
- **Errors/idempotency:** `400`, `403`, `409` for duplicate identity; retry-safe.

### GET `/api/v1/instruments`

- **Purpose:** List instruments visible to the caller.
- **Auth/role:** BUSINESS own scope; OFFICER assigned/authorized scope; ADMIN prototype scope.
- **Query:** `page`, `pageSize`, `search`, `status`, `instrumentType`, `businessId` (ADMIN only).
- **Response:** Paginated Instrument summaries.
- **Errors:** `400`, `401`, `403`.

### GET `/api/v1/instruments/{id}`

- **Purpose:** Read an instrument detail.
- **Auth/role:** Owner BUSINESS, authorized OFFICER, or ADMIN.
- **Response:** Instrument detail plus links/counts for applications and certificates.
- **Errors:** `401`, `403`, `404`.

### GET `/api/v1/instruments/{id}/passport`

- **Purpose:** Read the chronological instrument history/passport.
- **Auth/role:** Owner BUSINESS, authorized OFFICER, or ADMIN.
- **Response:** `{ "instrument": {...}, "applications": [...], "certificates": [...], "timeline": [...] }` with permitted evidence references.
- **Errors:** `401`, `403`, `404`.

## Applications

### POST `/api/v1/applications`

- **Purpose:** Create an Application draft or submit a request.
- **Auth/role:** BUSINESS owner or ADMIN.
- **Request:** `{ "instrumentId":"uuid", "reason":"Periodic verification", "submit":true }`.
- **Response:** Application object including `applicationNumber`, `state`, timestamps, and instrument/business references.
- **Validation:** Instrument exists and belongs to caller; `reason` required for submission; `submit:false` keeps `DRAFT`.
- **Errors/idempotency:** `400`, `403`, `404`, `409`; retry-safe with `Idempotency-Key`.

### GET `/api/v1/applications`

- **Purpose:** List visible Applications.
- **Auth/role:** BUSINESS own; OFFICER assigned; ADMIN all prototype scope.
- **Query:** `page`, `pageSize`, `search`, `state`, `instrumentId`, `officerUserId` (ADMIN), `from`, `to`.
- **Response:** Paginated Application summaries.
- **Errors:** `400`, `401`, `403`.

### GET `/api/v1/applications/{id}`

- **Purpose:** Read Application details and timeline.
- **Auth/role:** Owner BUSINESS, assigned OFFICER, or ADMIN.
- **Response:** Application, assignment, schedule, inspection summary, certificate summary, and permitted timeline.
- **Errors:** `401`, `403`, `404`.

### POST `/api/v1/applications/{id}/assign`

- **Purpose:** Assign an officer.
- **Auth/role:** ADMIN only.
- **Request:** `{ "officerUserId":"uuid", "assignmentNote":"Synthetic assignment" }`.
- **Response:** Updated Application with `state:"ASSIGNED"` and active assignment.
- **Validation:** Application must be `SUBMITTED`; target is active OFFICER; one active assignment in MVP.
- **Errors/idempotency:** `400`, `403`, `404`, `409`; safe retry with `Idempotency-Key`.

### POST `/api/v1/applications/{id}/schedule`

- **Purpose:** Schedule an assigned Application.
- **Auth/role:** ADMIN only.
- **Request:** `{ "scheduledAt":"2026-09-01T10:00:00Z", "scheduleNote":"Synthetic appointment" }`.
- **Response:** Updated Application with `state:"SCHEDULED"`.
- **Validation:** State `ASSIGNED`, valid UTC timestamp, active assignment, conflict policy applied.
- **Errors/idempotency:** `400`, `403`, `404`, `409`; safe retry.

## Inspections

### POST `/api/v1/inspections`

- **Purpose:** Start an inspection for a scheduled Application.
- **Auth/role:** Assigned OFFICER; ADMIN may create a controlled test record.
- **Request:** `{ "applicationId":"uuid", "startedAt":"2026-09-01T10:05:00Z", "clientOperationId":"uuid" }`.
- **Response:** Inspection with `id`, `applicationId`, `officerUserId`, `version`, and parent application state.
- **Validation:** Parent state `SCHEDULED`; officer assignment; UUID idempotency.
- **Errors/idempotency:** `400`, `403`, `404`, `409`; duplicate operation returns original inspection.

### GET `/api/v1/inspections/{id}`

- **Purpose:** Read inspection, readings, evidence metadata, and current result.
- **Auth/role:** Assigned OFFICER, owning BUSINESS after permitted release, or ADMIN.
- **Response:** Inspection object including `measurements`, `evidence`, `result`, `capturedAt`, GPS availability metadata, and `version`.
- **Errors:** `401`, `403`, `404`.

### POST `/api/v1/inspections/{id}/readings`

- **Purpose:** Add or replace draft Measurements for an inspection.
- **Auth/role:** Assigned OFFICER; ADMIN for controlled correction.
- **Request:** `{ "clientOperationId":"uuid", "expectedVersion":3, "measurements":[{"testPoint":"ZERO","referenceValue":0,"indicatedValue":0.1,"unit":"kg","errorValue":0.1,"sequence":1,"capturedAt":"2026-09-01T10:10:00Z","notes":"Synthetic"}] }`.
- **Response:** `{ "inspectionId":"uuid", "version":4, "measurements":[...] }`.
- **Validation:** Numeric values, units, sequence, version, ownership; tolerance rules are DEMO/CONFIGURABLE.
- **Errors/idempotency:** `400`, `403`, `404`, `409` for version conflict; replay is idempotent.

### POST `/api/v1/inspections/{id}/evidence`

- **Purpose:** Upload one evidence item and its metadata.
- **Auth/role:** Assigned OFFICER; ADMIN review/correction path.
- **Request:** `multipart/form-data` with `file`, `clientOperationId`, `capturedAt`, optional `latitude`, `longitude`, `gpsAccuracyMeters`, and `sha256`.
- **Response:** Evidence metadata with generated `id`, `objectKey` reference, server hash, upload status.
- **Validation:** MIME must be `image/jpeg`, `image/png`, `image/webp`, or `application/pdf`; maximum 10 MiB per item; generated object key; valid timestamp/coordinates; virus/security scanning hook where deployed.
- **Errors/idempotency:** `400`, `403`, `404`, `413`, `415`, `409`; duplicate operation returns original evidence result.

### POST `/api/v1/inspections/{id}/decision`

- **Purpose:** Record the officer’s final inspection result and complete the parent workflow when valid.
- **Auth/role:** Assigned OFFICER; ADMIN only for controlled correction.
- **Request:** `{ "clientOperationId":"uuid", "expectedVersion":4, "result":"PASS", "notes":"Synthetic decision", "completedAt":"2026-09-01T10:30:00Z" }`.
- **Response:** `{ "inspection": {...}, "application": {"id":"uuid","state":"COMPLETED"}, "certificateEligible":true }`.
- **Validation:** Result exactly `PASS`, `FAIL`, or `REQUIRES_CORRECTION`; required readings/evidence and notes according to configured demo rules; no client state override.
- **Errors/idempotency:** `400`, `403`, `404`, `409`; duplicate operation returns original decision.

## Certificates and public verification

### POST `/api/v1/certificates`

- **Purpose:** Generate a certificate for an eligible completed pass.
- **Auth/role:** ADMIN or controlled backend workflow after decision; not a public endpoint.
- **Request:** `{ "inspectionId":"uuid", "clientOperationId":"uuid" }`.
- **Response:** Certificate metadata including `certificateNumber`, `status`, `issuedAt`, `validUntil`, `payloadHash`, `signatureAlgorithm`, `pdfObjectKey`, and `qrVerificationUrl`.
- **Validation:** Inspection/application eligibility, unique certificate, configurable demo validity, canonical payload version.
- **Errors/idempotency:** `400`, `403`, `404`, `409`; duplicate returns the existing certificate.

### GET `/api/v1/certificates`

- **Purpose:** List certificates visible to the caller.
- **Auth/role:** BUSINESS own; OFFICER assigned/permitted; ADMIN all prototype scope.
- **Query:** `page`, `pageSize`, `search`, `status`, `businessId` (ADMIN), `from`, `to`.
- **Response:** Paginated certificate summaries.
- **Errors:** `400`, `401`, `403`.

### GET `/api/v1/certificates/{id}`

- **Purpose:** Read certificate detail and download reference.
- **Auth/role:** Owning BUSINESS, permitted OFFICER, or ADMIN.
- **Response:** Certificate metadata; PDF is served through an authorized download mechanism represented by `pdfObjectKey`/download URL policy, never by exposing storage credentials.
- **Errors:** `401`, `403`, `404`.

### POST `/api/v1/certificates/{id}/revoke`

- **Purpose:** Revoke a certificate.
- **Auth/role:** ADMIN only.
- **Request:** `{ "reason":"Synthetic administrative revocation", "clientOperationId":"uuid" }`.
- **Response:** Updated Certificate with `status:"REVOKED"`, `revokedAt`, and `revocationReason`.
- **Validation:** Certificate not already revoked; reason required; audit event required.
- **Errors/idempotency:** `400`, `403`, `404`, `409`; safe retry.

### GET `/api/v1/certificates/verify?certNo={certificateNo}`

- **Purpose:** Public certificate lookup and signature/status verification.
- **Auth/role:** None; rate-limited.
- **Request:** Certificate number query parameter; bounded length and safe character set.
- **Response:** `{ "certificateNumber":"CERT-DEMO-001", "verificationStatus":"VALID", "certificateStatus":"ACTIVE", "signatureValid":true, "payloadHash":"hex", "issuedAt":"...", "validUntil":"...", "instrumentSummary":{"instrumentNumber":"INS-DEMO-001","instrumentType":"ELECTRONIC_SCALE"}, "verificationMessage":"Certificate is active and signature verified." }`.
- **States:** `VALID`, `EXPIRED`, `REVOKED`, `INVALID`; `INVALID` covers missing, malformed, tampered, or unverifiable data.
- **Privacy:** Do not return owner contact details, private evidence, internal audit metadata, or signing material.
- **Errors:** Use `404` or an indistinguishable invalid response according to abuse/privacy review; `429` when rate limited.

## Notifications

### GET `/api/v1/notifications`

- **Purpose:** List notifications for the current user.
- **Auth/role:** All authenticated roles; own recipient scope.
- **Query:** `page`, `pageSize`, `unreadOnly`, `type`.
- **Response:** Paginated Notification objects.
- **Errors:** `401`, `400`.

### POST `/api/v1/notifications/{id}/read`

- **Purpose:** Mark the recipient’s notification read.
- **Auth/role:** Recipient only.
- **Request:** None or `{ "readAt":"..." }`.
- **Response:** Updated Notification.
- **Errors/idempotency:** `401`, `403`, `404`; repeat is idempotent.

## Admin dashboard, officers, and audit

### GET `/api/v1/dashboards/admin`

- **Purpose:** Provide admin summary cards/charts.
- **Auth/role:** ADMIN.
- **Query:** `from`, `to`.
- **Response:** `{ "applicationCountsByState":{}, "inspectionCountsByResult":{}, "certificateCountsByStatus":{}, "expiryBuckets":{}, "syncExceptions":0, "officerWorkload":[] }`.
- **Errors:** `401`, `403`, `400`.

### GET `/api/v1/officers`

- **Purpose:** List active officers for assignment UI.
- **Auth/role:** ADMIN only.
- **Query:** `page`, `pageSize`, `search`, `active`.
- **Response:** Paginated safe officer summaries; never password or token data.
- **Errors:** `401`, `403`, `400`.

### GET `/api/v1/audit`

- **Purpose:** Search audit events.
- **Auth/role:** ADMIN only.
- **Query:** `page`, `pageSize`, `entityType`, `entityId`, `actorUserId`, `action`, `from`, `to`.
- **Response:** Paginated `AuditLog` fields including `previousHash` and `currentHash`.
- **Errors:** `401`, `403`, `400`.

## Offline sync

### POST `/api/v1/sync`

- **Purpose:** Submit one or more offline operations.
- **Auth/role:** Authenticated OFFICER; ADMIN may use controlled test operations.
- **Request:**

```json
{
  "operations": [{
    "clientOperationId": "uuid",
    "createdAt": "2026-09-01T10:20:00Z",
    "entityType": "INSPECTION",
    "entityId": "uuid",
    "operationType": "UPSERT_READINGS",
    "payload": {},
    "attemptCount": 1,
    "lastError": null,
    "status": "READY_TO_SYNC",
    "expectedServerVersion": 3
  }]
}
```

- **Response:** `{ "results":[{"clientOperationId":"uuid","status":"SYNCED","entityId":"uuid","serverVersion":4,"message":"Applied"}] }`; result status is `SYNCED`, `FAILED`, or `CONFLICT` for the client.
- **Validation:** UUID, supported entity/operation, authenticated officer ownership, payload schema, bounded batch size.
- **Idempotency:** The server stores `clientOperationId` uniquely in SyncRecord. The same operation and payload returns its original result; the same ID with a different payload is a conflict.
- **Errors:** `400`, `401`, `403`, `409`, `413`, `429`.

## API/data alignment rules

- Resource names and fields follow [DATA_MODEL.md](DATA_MODEL.md).
- Public frontend route is `/verify/:certNo`; the only public API verification path is the certificate query endpoint above.
- Any new endpoint requires an API-contract update, data-model impact check, security review, tests, and an approved task. No undocumented endpoint is permitted.
