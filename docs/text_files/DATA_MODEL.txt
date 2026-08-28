# Canonical Logical Data Model

This document is the single logical domain model for MapanSetu. It is not a SQL schema. The future database implementation will use Flyway migrations under `services/api/src/main/resources/db/migration`.

## Canonical terminology

- **Application:** verification request/work item.
- **Inspection:** field verification session for an application.
- **Measurement:** one measured test point recorded during an inspection.
- **Evidence:** photo or document evidence associated with an inspection or instrument.
- **Certificate:** issued artifact representing the recorded outcome; its lifecycle is independent from application state.
- **Public verifier:** unauthenticated person using certificate lookup; not an authenticated role.

## Common conventions

- Identifiers are UUIDs unless a document explicitly says a human-readable number is required.
- Timestamps are stored and exchanged as UTC ISO-8601 values.
- Mutable records carry `createdAt`, `updatedAt`, and an owning scope where applicable.
- Roles are exactly `ADMIN`, `OFFICER`, and `BUSINESS`.
- Business users may read/write only resources owned by their business; officers may access assigned jurisdiction/work; admins may administer the prototype scope.
- Canonical field names below must be used in API DTOs, frontend types, and future persistence mappings.

## Entities

### User

- **Purpose:** Authenticated human identity.
- **Key fields:** `id`, `email`, `displayName`, `phone`, `passwordHash`, `role`, `businessId`, `active`, `createdAt`, `updatedAt`, `lastLoginAt`.
- **Relationships:** Optional `businessId` to Business; may own Application records, act in assignments, and author AuditLog events.
- **Constraints:** Unique normalized email; role required; `businessId` required for BUSINESS users and absent for ADMIN/OFFICER unless future jurisdiction design says otherwise; inactive users cannot authenticate.
- **Lifecycle:** Active, then deactivated; historical references remain.
- **Security ownership:** User can read own profile; ADMIN manages user access; password hash is never exposed.

### Role

- **Purpose:** Canonical authorization vocabulary.
- **Values:** `ADMIN`, `OFFICER`, `BUSINESS`.
- **Relationships:** Assigned to User.
- **Constraints:** No `PUBLIC` authenticated role.
- **Lifecycle:** Configuration data.
- **Security ownership:** ADMIN-only administration.

### Business

- **Purpose:** Organization/person responsible for instruments.
- **Key fields:** `id`, `legalName`, `tradeName`, `contactName`, `email`, `phone`, `address`, `jurisdictionLabel`, `status`, `createdAt`, `updatedAt`.
- **Relationships:** Has Users, Instruments, Applications, Notifications.
- **Constraints:** `legalName` and contact details required; no claim of government registration validation in MVP.
- **Lifecycle:** Registered, updated, inactive.
- **Security ownership:** Owning BUSINESS users read/update permitted profile fields; ADMIN administers.

### Instrument

- **Purpose:** Registry and passport identity for a regulated weighing/measuring instrument.
- **Key fields:** `id`, `businessId`, `instrumentNumber`, `serialNumber`, `instrumentType`, `manufacturer`, `model`, `capacity`, `capacityUnit`, `location`, `status`, `lastCertificateId`, `nextDueDate`, `createdAt`, `updatedAt`.
- **Relationships:** Belongs to Business; has Applications, Inspections through Applications, Evidence, and Certificates.
- **Constraints:** `instrumentNumber` is unique within the applicable business scope; serial identity is required where available; capacity/tolerance values are DEMO/CONFIGURABLE in prototype.
- **Lifecycle:** Registered, pending verification, verified/history, inactive.
- **Security ownership:** Business owns its registry; ADMIN has oversight; OFFICER reads only when assigned or authorized by work scope.

### Application

- **Purpose:** Verification request/work item for one Instrument.
- **Key fields:** `id`, `applicationNumber`, `instrumentId`, `businessId`, `submittedByUserId`, `state`, `reason`, `requestedAt`, `assignedAt`, `scheduledAt`, `completedAt`, `rejectionReason`, `cancellationReason`, `createdAt`, `updatedAt`.
- **Relationships:** Belongs to Business and Instrument; may have one or more ApplicationAssignment records; has Inspection, Notifications, AuditLog events, and zero/one resulting Certificate.
- **Constraints:** State transitions are backend-enforced; application number is unique; business ownership cannot be changed by a business user.
- **Lifecycle:** Canonical state machine below.
- **Security ownership:** Business owns submitted request; ADMIN manages queue/assignment; OFFICER reads assigned work and records inspection data.

### ApplicationAssignment

- **Purpose:** Records officer assignment history for an Application.
- **Key fields:** `id`, `applicationId`, `officerUserId`, `assignedByUserId`, `assignedAt`, `unassignedAt`, `assignmentNote`.
- **Relationships:** Application to OFFICER User; ADMIN is actor for assignment.
- **Constraints:** At most one active assignment in MVP; history is append-only except administrative correction with audit.
- **Lifecycle:** Active or ended.
- **Security ownership:** ADMIN manages; assigned OFFICER reads; BUSINESS sees assigned officer only when product policy permits.

### Inspection

- **Purpose:** Field verification session for an Application.
- **Key fields:** `id`, `applicationId`, `officerUserId`, `startedAt`, `completedAt`, `result`, `notes`, `gpsLatitude`, `gpsLongitude`, `gpsAccuracyMeters`, `capturedAt`, `clientOperationId`, `version`, `createdAt`, `updatedAt`.
- **Relationships:** One Application to zero/one active Inspection in MVP; has Measurements and Evidence; produces Certificate only through a valid decision.
- **Constraints:** Officer must be assigned/authorized; timestamps distinguish device capture and server receipt where available; GPS may be unavailable and must be represented honestly.
- **Lifecycle:** Draft/session, completed with result, correction/rework as governed by Application state.
- **Security ownership:** Assigned OFFICER writes; ADMIN oversees; owning BUSINESS reads final permitted record.

### Measurement

- **Purpose:** One measured test point in an Inspection.
- **Key fields:** `id`, `inspectionId`, `testPoint`, `referenceValue`, `indicatedValue`, `unit`, `errorValue`, `sequence`, `capturedAt`, `notes`.
- **Relationships:** Belongs to Inspection.
- **Constraints:** Required fields and numeric precision are validated; no statutory tolerance is invented; demo acceptance uses configurable reference/tolerance data.
- **Lifecycle:** Drafted, edited before final decision, immutable after finalization except audited correction flow.
- **Security ownership:** Assigned OFFICER writes; ADMIN audits; business reads permitted results.

### Evidence

- **Purpose:** Photo/document evidence linked to an Inspection or Instrument.
- **Key fields:** `id`, `inspectionId`, `instrumentId`, `objectKey`, `originalFileName`, `mimeType`, `sizeBytes`, `sha256`, `capturedAt`, `latitude`, `longitude`, `uploadedAt`, `uploadedByUserId`, `status`.
- **Relationships:** Belongs to Inspection and optionally Instrument; stored binary is in MinIO, metadata in PostgreSQL.
- **Constraints:** Allowlisted MIME types, bounded size, generated object key, no client-controlled executable path; binary is not sent as large base64 JSON by default.
- **Lifecycle:** Captured, queued, uploaded, rejected, retained/expired by policy.
- **Security ownership:** Assigned OFFICER creates; ADMIN can review; business reads only released evidence.

### Certificate

- **Purpose:** Verifiable record generated from a completed inspection decision.
- **Key fields:** `id`, `certificateNumber`, `applicationId`, `instrumentId`, `businessId`, `inspectionId`, `issuedAt`, `validUntil`, `status`, `payloadVersion`, `canonicalPayload`, `payloadHash`, `digitalSignature`, `signatureAlgorithm`, `publicKeyReference`, `pdfObjectKey`, `qrVerificationUrl`, `revokedAt`, `revocationReason`.
- **Relationships:** Belongs to Application, Instrument, Business, and Inspection.
- **Constraints:** Certificate number unique; status only `ACTIVE`, `EXPIRED`, `REVOKED`; private signing key is never stored here or returned; public response is minimized.
- **Lifecycle:** Issued active, expires by date, or revoked by authorized administrative action.
- **Security ownership:** Backend certificate module creates; ADMIN manages/revokes; public verifier reads minimal verification result.

### Notification

- **Purpose:** In-product notification for workflow changes, scheduling, expiry, or sync outcomes.
- **Key fields:** `id`, `recipientUserId`, `businessId`, `type`, `title`, `message`, `relatedEntityType`, `relatedEntityId`, `readAt`, `createdAt`.
- **Relationships:** Recipient User and optional domain entity.
- **Constraints:** No sensitive data in notification text beyond recipient need; delivery channel is in-product in MVP.
- **Lifecycle:** Created, unread, read, retained by policy.
- **Security ownership:** Recipient reads own notifications; ADMIN may inspect operational status.

### AuditLog

- **Purpose:** Traceable record of security- and workflow-relevant actions.
- **Key fields:** `eventId`, `actorUserId`, `actorRole`, `action`, `entityType`, `entityId`, `timestamp`, `metadata`, `previousHash`, `currentHash`.
- **Relationships:** Actor User and referenced domain entity.
- **Constraints:** Hash chain uses canonical event data; metadata excludes secrets; deletions/edits are not silently hidden.
- **Lifecycle:** Append-only application behavior; retention is a policy decision.
- **Security ownership:** System writes; ADMIN/auditor reads; public never sees internal audit metadata.

### SyncRecord

- **Purpose:** Server-side record of an offline operation and its idempotent processing result.
- **Key fields:** `clientOperationId`, `entityType`, `entityId`, `operationType`, `payloadHash`, `createdAt`, `receivedAt`, `processedAt`, `attemptCount`, `status`, `lastError`, `serverVersion`.
- **Relationships:** Links to Inspection/Evidence/Application operation and possibly AuditLog.
- **Constraints:** `clientOperationId` unique; replay returns the original result; conflict is explicit, never silent overwrite.
- **Lifecycle:** `SYNCING`, `SYNCED`, `FAILED`, `CONFLICT`; receipt and processing timestamps explain the server path without adding another public state enum.
- **Security ownership:** Officer client submits; backend owns final status; ADMIN can inspect failures.

## Application state machine

The only application states are `DRAFT`, `SUBMITTED`, `ASSIGNED`, `SCHEDULED`, `INSPECTION_IN_PROGRESS`, `COMPLETED`, `REJECTED`, and `CANCELLED`.

| From | To | Initiator | Rule |
|---|---|---|---|
| DRAFT | SUBMITTED | BUSINESS | Required business/instrument/application fields pass validation. |
| DRAFT | CANCELLED | BUSINESS or ADMIN | Request is withdrawn before submission; reason is recorded. |
| SUBMITTED | ASSIGNED | ADMIN | Valid officer assignment exists. |
| SUBMITTED | REJECTED | ADMIN | Administrative rejection reason is required. |
| SUBMITTED | CANCELLED | BUSINESS or ADMIN | Cancellation is permitted before assignment under policy. |
| ASSIGNED | SCHEDULED | ADMIN | Appointment date/time and officer are valid. |
| ASSIGNED | CANCELLED | ADMIN | Cancellation reason is required. |
| SCHEDULED | INSPECTION_IN_PROGRESS | OFFICER | Assigned officer opens/starts the inspection. |
| SCHEDULED | CANCELLED | ADMIN or authorized OFFICER | Cancellation reason is required and audited. |
| INSPECTION_IN_PROGRESS | COMPLETED | OFFICER | Inspection data and decision are complete and valid; the separate result may be PASS, FAIL, or REQUIRES_CORRECTION. |
| INSPECTION_IN_PROGRESS | CANCELLED | ADMIN | Administrative cancellation is audited. |

`COMPLETED`, `REJECTED`, and `CANCELLED` are terminal for the current application record. A `FAIL` or `REQUIRES_CORRECTION` result does not silently rename the application state or create a certificate. Re-verification creates a new Application linked to the same Instrument history; it does not rename the old state.

## Inspection result

Inspection result is separate from Application state and is exactly one of `PASS`, `FAIL`, or `REQUIRES_CORRECTION`. A final result requires validated readings/evidence according to the applicable demo configuration and an authorized officer action.

## Certificate status

Certificate status is independent and exactly one of `ACTIVE`, `EXPIRED`, or `REVOKED`. Expiry is determined from `validUntil`; revocation requires an authorized action and reason. A certificate may be validly signed yet no longer active.

## Offline local states

The field client uses exactly `LOCAL_DRAFT`, `READY_TO_SYNC`, `SYNCING`, `SYNCED`, `FAILED`, and `CONFLICT`. These are client synchronization states, not server application states.

## Evidence limits

The prototype allowlist is `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`. The client and server reject files larger than 10 MiB per evidence item; image compression is attempted before queueing. These are prototype limits, not statutory requirements, and may change only through a documented security/product decision.
