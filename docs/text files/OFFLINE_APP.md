# MapanSetu Field Application — PRD, Offline Architecture, UX and Sync Specification

## 1. Purpose and field persona

The field application is for an authorized Legal Metrology Officer working at shops, businesses, or other field locations on a mobile device. The officer works under time pressure, may have unreliable connectivity, needs camera evidence, may need GPS, and must be able to distinguish locally saved work from server-confirmed work.

The app records the officer’s inspection workflow; it does not automate or replace the officer’s physical/statutory judgment.

## 2. Technology and assumptions

React, TypeScript, Vite, PWA manifest, Service Worker, Workbox where useful, IndexedDB via Dexie, Browser Camera API, and Browser Geolocation API. The app runs online to authenticate/cache assigned work and remains useful offline for previously cached cases. Browser storage quotas, permission denial, unavailable hardware, battery, and interrupted sync are expected conditions.

## 3. Routes/screens

`/login` · `/field` · `/field/inspections` · `/field/inspections/:id` · `/field/inspections/:id/checklist` · `/field/inspections/:id/readings` · `/field/inspections/:id/evidence` · `/field/inspections/:id/review` · `/field/sync` · `/field/profile`

## 4. Field workflow

1. Officer authenticates online and caches assigned scheduled cases.
2. Officer opens a cached case and starts it, moving the server application through the documented workflow when online or queueing the operation offline.
3. Officer completes checklist, readings, evidence, GPS/time capture, and review.
4. Officer records `PASS`, `FAIL`, or `REQUIRES_CORRECTION` as the separate Inspection result.
5. Offline operations become `READY_TO_SYNC`; the sync center sends them to `POST /api/v1/sync` when network returns.
6. Server response becomes `SYNCED`, `FAILED`, or `CONFLICT`; the app never reports a server state before confirmation.

## 5. Screen specifications

Every screen supports: visible online/offline indicator, accessible loading/error feedback, no silent data loss, local save confirmation, keyboard/touch operation, and safe back navigation.

### Field login — `/login`

- **Purpose/user:** Officer authentication.
- **Layout/controls:** Email, password, sign-in, connection state, retry/help.
- **Validation:** Required email/password; generic auth errors.
- **Online:** `POST /api/v1/auth/login`, then `GET /api/v1/users/me`; cache only permitted assigned data.
- **Offline:** Do not pretend first-time login works; allow a previously authenticated session only under the approved session policy and show session age.
- **Acceptance:** No token/secret in logs or screenshots; denied login has a clear recovery path.

### Field dashboard — `/field`

- **Purpose/user:** Officer overview of assigned work and sync health.
- **Layout/controls:** Assigned count, local drafts, ready-to-sync count, last sync, connection banner, links to inspections/sync/profile.
- **Validation/data:** `GET /api/v1/applications` for assigned work; local Dexie summaries.
- **Online/offline:** Online refreshes from server; offline shows last cached time and never implies freshness.
- **Acceptance:** Officer can reach every local draft and sync error in two actions.

### Assigned inspection list — `/field/inspections`

- **Purpose/user:** Browse assigned/scheduled cases.
- **Layout/controls:** Search/filter by canonical application state, list/card, cache action, local sync badge.
- **API/local:** `GET /api/v1/applications` for assigned scope; cache `cachedInspections` and metadata.
- **Offline:** Show cached cases only, with last server update and unavailable-data notice.
- **Acceptance:** A cached case opens in airplane mode; unassigned cases never appear through local guessing.

### Inspection overview — `/field/inspections/:id`

- **Purpose/user:** Start/resume one case.
- **Layout/controls:** Instrument identity, business/site summary, schedule, current application state, progress steps, start/resume.
- **API/local:** `GET /api/v1/applications/{id}`, `GET /api/v1/inspections/{id}` where available; create via `POST /api/v1/inspections`.
- **Offline:** Load cached record; create a local inspection operation with UUID; show `LOCAL_DRAFT`/`READY_TO_SYNC`.
- **Acceptance:** No start action on an uncached/unauthorized case; server response or local queue status is explicit.

### Checklist — `/field/inspections/:id/checklist`

- **Purpose/user:** Complete configured inspection checklist.
- **Layout/controls:** One item per section, required markers, notes, progress, save/next/back.
- **Validation:** Required items complete; no invented statutory checks; DEMO/CONFIGURABLE rules are labelled.
- **Online/offline:** Persist locally on every accepted change; online may sync draft operations but not bypass final decision.
- **Acceptance:** App restart preserves accepted checklist data; incomplete required item blocks review with exact location.

### Measurement entry — `/field/inspections/:id/readings`

- **Purpose/user:** Record Measurements.
- **Layout/controls:** Test point rows, reference/indicated/unit/error fields, add/remove configured points, notes, validation summary.
- **Validation:** Numeric ranges/precision, required fields, unit, sequence; tolerance is configurable demo data only.
- **API/local:** Local `inspectionDrafts`; online or queued `POST /api/v1/inspections/{id}/readings`.
- **Acceptance:** Invalid numeric input is not accepted; saved values survive reload; version conflict is surfaced.

### Evidence capture — `/field/inspections/:id/evidence`

- **Purpose/user:** Capture machine/nameplate/site photo or document evidence.
- **Layout/controls:** Camera/file picker, preview, retake/delete before finalization, evidence type/note, upload queue and size/MIME feedback.
- **Validation:** `image/jpeg`, `image/png`, `image/webp`, or `application/pdf`; compressed image where possible; maximum 10 MiB per item; non-empty file; hash stored when required.
- **API/local:** Blob in `evidenceBlobs`; metadata/operation in `syncQueue`; online upload through `POST /api/v1/inspections/{id}/evidence`.
- **Offline:** Capture and save Blob without network; show local-only badge; do not claim upload.
- **Acceptance:** Invalid/oversized file is rejected before queue; browser restart preserves accepted Blob or shows a storage failure before loss.

### GPS/time capture — part of overview/evidence/review

- **Purpose/user:** Record available capture context.
- **Controls:** Capture location, accuracy, timestamp; permission status and manual unavailable reason.
- **Validation/privacy:** Coordinates must be valid; deny/unavailable is an explicit state; retain only needed precision/policy; timestamps distinguish device capture from server receipt.
- **Online/offline:** Geolocation can work offline; server receipt is added on sync.
- **Acceptance:** Permission denial never blocks an honest unavailable path unless a documented demo rule explicitly requires it.

### Review before submit — `/field/inspections/:id/review`

- **Purpose/user:** Confirm completeness and final result.
- **Layout/controls:** Summary of checklist/readings/evidence/GPS/time, result selector, notes, submit/return-to-edit.
- **Validation:** Required data and notes; result exactly `PASS`, `FAIL`, or `REQUIRES_CORRECTION`; explicit confirmation.
- **Online:** `POST /api/v1/inspections/{id}/decision`; server controls parent state.
- **Offline:** Save decision operation as `READY_TO_SYNC`; label as pending and prevent certificate claim.
- **Acceptance:** No certificate is shown as issued until server confirmation; duplicate submit is idempotent.

### Offline queue — `/field/sync`

- **Purpose/user:** Show local operations and storage health.
- **Layout/controls:** Counts by `LOCAL_DRAFT`, `READY_TO_SYNC`, `SYNCING`, `SYNCED`, `FAILED`, `CONFLICT`; retry, inspect, discard only before server application and with confirmation.
- **API/local:** Dexie stores; `POST /api/v1/sync` for queued operations.
- **Acceptance:** Each item shows UUID, entity, created time, attempts, last error, and next action.

### Sync center and conflict screen — `/field/sync`

- **Purpose/user:** Recover from failed/conflicting operations.
- **Layout/controls:** Server/client version comparison, field-level differences, keep server/keep client/merge where safe, retry, contact admin.
- **Validation:** Resolution creates a new explicit operation; original record remains auditable.
- **Offline/online:** Conflict can be reviewed offline; resolution submission requires network unless the resolution is itself safely queueable.
- **Acceptance:** No silent overwrite; same operation ID with changed payload is rejected as conflict.

### Field profile — `/field/profile`

- **Purpose/user:** Show officer identity, session, storage/cache controls.
- **Controls:** User info, last sync, clear cached data, logout.
- **API/local:** `GET /api/v1/users/me`; local cleanup with confirmation.
- **Security:** Clearing local data warns that unsynced data may be lost; logout policy must protect or deliberately clear cached sensitive data.
- **Acceptance:** No secret or full token is rendered.

## 6. Offline-first data architecture

The service worker caches the offline shell and versioned static assets. Dexie stores domain drafts and operations. Server data is authoritative; local data is a working copy with provenance (`serverVersion`, `cachedAt`, `localState`). Local writes are transactional where possible: update draft, append operation, and update local status together.

### IndexedDB conceptual stores

| Store | Key | Purpose | Retention/relationship |
|---|---|---|---|
| `appMetadata` | `key` | schema/cache version, last successful sync, session metadata | Small; replace on upgrade |
| `cachedInspections` | `inspectionId` | permitted assigned case snapshot | Until unassigned/expired/cleared |
| `inspectionDrafts` | `inspectionId` | checklist/readings/result draft, server version | Until synced/retained by policy |
| `evidenceBlobs` | `evidenceId` | compressed Blob and metadata | Until upload confirmed plus retention cleanup |
| `syncQueue` | `clientOperationId` | pending operation, payload, attempt/error/status | Until result retained/audited |
| `syncResults` | `clientOperationId` | server outcome/version/message | Retain for user recovery/audit window |

Relationships use IDs, not duplicated mutable ownership facts. Local stores never contain private signing keys.

## 7. Sync contract and conflict handling

Every offline operation contains `clientOperationId` UUID, `createdAt`, `entityType`, `entityId`, `payload`, `operationType`, `attemptCount`, `lastError`, `status`, and `expectedServerVersion` where applicable. The server stores the operation in SyncRecord with payload hash and returns a stable result on replay.

Client states are exactly:

`LOCAL_DRAFT` → `READY_TO_SYNC` → `SYNCING` → `SYNCED`  
Failure goes to `FAILED`; version/payload mismatch goes to `CONFLICT`.

Conflict detection compares server version and client expected version, plus operation identity/payload hash. The UI shows both versions and requires an explicit user/admin resolution. Never silently overwrite or mark local data as server-confirmed.

## 8. Evidence, camera, GPS, and security

Compress images before storage/upload where quality remains sufficient; use Blob rather than large base64 JSON. The prototype allowlist is `image/jpeg`, `image/png`, `image/webp`, and `application/pdf`, with a maximum of 10 MiB per evidence item. MIME and size limits are enforced client-side for usability and server-side for security. Camera permission denial, unavailable hardware, and file-picker fallback are explicit. GPS coordinates include accuracy when supplied, are optional when unavailable, and follow coarse-location/privacy policy. Local sensitive data has expiration/cleanup controls; storage pressure produces a visible warning and prevents pretending a save succeeded.

The app requires authentication, protects cached data from casual disclosure, never stores private keys, uses secure transport online, and clears or deliberately retains local data on logout according to the approved session policy.

## 9. PWA requirements and update strategy

- Installable manifest with app name, icons, start URL, and standalone display.
- Service Worker caches the app shell and versioned assets; API data is not treated as universally cacheable.
- Workbox may manage precaching/runtime strategies where it does not hide freshness or security state.
- New versions notify the officer and provide a safe update path that does not discard unsynced data.
- Storage quota is estimated; cleanup is explicit and observable.

## 10. Field testing requirements

Test online cache, airplane mode, offline restart, slow/intermittent network, interrupted sync, duplicate operation replay, conflict, storage pressure, permission denial, unavailable camera/GPS, failed upload, logout with unsynced data, service-worker update, and public separation from field auth. See [TESTING_SECURITY.md](TESTING_SECURITY.md).
