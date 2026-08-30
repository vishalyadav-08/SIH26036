# Flutter Field Application — Offline Architecture and Sync Specification

## 1. Purpose

Define the offline contract for the officer field workflow. The official field application is the Flutter/Dart mobile app at `flutter_field_app/`. The React field PWA is a testing/prototype client that validates the same field workflow and API contract during development. The backend must not care which client produced a request.

## 2. Official Field Application

**The official field application is Flutter/Dart** (`flutter_field_app/`).

The React field PWA at `frontend/src/app/field/` is a **testing / prototype client only**. It is not the final field architecture.

```
Flutter Field App (flutter_field_app/)    ← OFFICIAL FIELD CLIENT
     │
     │ HTTPS / /api/v1/
     ▼
Django Backend API

React Field PWA (frontend/src/app/field/) ← TESTING / PROTOTYPE ONLY
     │
     │ HTTPS / /api/v1/
     ▼
Django Backend API
```

Both clients use the same API contract and canonical sync states. The backend does not differentiate clients.

## 3. Flutter/Dart Architecture

The Flutter field application exists at `flutter_field_app/` (Dart SDK ^3.13.2). The current scaffold includes the Flutter framework with `cupertino_icons`; production field features are implementation tasks.

### Open implementation decisions (require dedicated ADR before adoption)

| Concern | Status |
|---|---|
| Local persistence / database | **Open decision** — no package selected; SQLite-based or Hive/Isar packages are common candidates; requires ADR |
| State management | **Open decision** — no package selected; requires ADR |
| HTTP client | **Open decision** — `http` or `dio`; requires ADR |
| Camera | **Open decision** — `camera` or `image_picker`; requires ADR |
| Location / GPS | **Open decision** — `geolocator`; requires ADR |
| Secure storage | **Open decision** — `flutter_secure_storage`; requires ADR |
| Background sync | **Open decision** — requires ADR |

Do not invent Flutter packages. Do not create Flutter-specific server endpoints or server states.

### Flutter application structure (target layout)

```text
flutter_field_app/
  lib/
    main.dart              entry point
    app/                   app-level routing and theme
    features/
      auth/                login, session, token management
      inspections/         assigned inspection list and detail
      checklist/           checklist and readings
      evidence/            camera capture and evidence queue
      sync/                sync queue, state machine, conflict resolution
    data/
      local/               local persistence layer (package TBD)
      remote/              API client services
      models/              data transfer and domain models
    core/                  shared utilities, constants, error handling
  test/                    Dart unit, widget, and integration tests
```

## 4. Offline-first Design

The Flutter field app is offline-first. The officer must be able to perform a complete inspection workflow without network connectivity, provided the assignment was previously cached while online.

Design principles:
- Cache assigned case data when online before entering the field.
- Allow all inspection workflow steps offline: open assignment, checklist, readings, evidence capture, result decision.
- Never present local state as server-confirmed.
- Queue all mutations with `clientOperationId` UUIDs.
- Sync automatically when connectivity returns.

## 5. Local Persistence

The Flutter local persistence layer stores only the minimum data needed to continue assigned offline work:

| Data | Contents |
|---|---|
| Cached inspection snapshot | Assignment, instrument, business, schedule data as of last sync |
| Draft inspection | Checklist progress, readings, decision state, notes |
| Evidence queue | Captured images, GPS metadata, capture timestamps, MIME/size |
| Sync queue | Pending operations with type, payload, clientOperationId, attempt count |
| Sync results | Results from server for completed operations |
| Schema version | Local schema version for migration |

Every local record must carry provenance: `serverVersion`, local sync state, and updated/captured timestamps as applicable. Local data is untrusted; it may be deleted or unavailable due to device lifecycle.

## 6. Sync Queue

Canonical offline states (shared with React PWA):

```text
LOCAL_DRAFT → READY_TO_SYNC → SYNCING → SYNCED
                                    \→ FAILED → READY_TO_SYNC
                                    \→ CONFLICT → explicit resolution
```

Queue operations deterministically by creation time and process bounded batches:
- Mark `SYNCING` before transmission.
- Keep the same `clientOperationId` UUID for transient retries.
- Record attempt count and last error.
- Map errors:
  - `400` / `413` payload failures → `FAILED`
  - Auth failures → re-authentication required
  - Network/server/rate-limit transient failures → retryable
  - Server version conflict / payload changed → `CONFLICT`

The `/api/v1/sync` response returns one result per submitted operation: operation ID, status, entity ID, server version, and a safe message. A client may display `SYNCED` only from that server result.

## 7. Sync State Machine

```text
On app launch with cached assignment:
  → restore SYNCING operations to READY_TO_SYNC (outcome unknown)
  → keep original clientOperationId unchanged

On network available:
  → process READY_TO_SYNC operations in bounded batch
  → transition to SYNCING during request

On server response:
  → SYNCED: update local state, record server version
  → FAILED: record error, leave for manual review or retry
  → CONFLICT: surface conflict UI, require explicit resolution

On app close with READY_TO_SYNC:
  → preserve queue; process on next launch with network

On logout with unsynced work:
  → warn officer with unsynced count
  → require explicit confirmation; follow product-approved handling
```

## 8. Conflict Handling

When the server returns `CONFLICT`:
- Display local version and server version side by side.
- Require explicit officer decision: keep local or keep server.
- A resolution is submitted as a **new operation** with a **new UUID**.
- The original conflict operation remains auditable.
- The client must not silently choose local or server data.

## 9. Evidence Capture

Evidence is captured locally with:
- Filename, MIME type, size, blob, capture timestamp
- Inspection ID association
- GPS coordinates and accuracy (if available; unavailable states recorded explicitly)
- Sync state

Prototype allowlist: JPEG, PNG, WebP, PDF; maximum 10 MiB per item.

The server repeats every validation, generates object keys, stores metadata in PostgreSQL, and stores binary content in MinIO/S3. A local blob is not an uploaded artifact until the API confirms it.

## 10. Camera

The Flutter app uses native device camera capabilities (implementation package TBD, requires ADR). The camera integration must:
- Handle denied camera permission gracefully (inform officer, offer file picker fallback).
- Handle unavailable hardware.
- Record capture timestamp in local evidence metadata.
- Not require network connectivity for capture.

## 11. GPS / Location

The Flutter app captures GPS coordinates using native location APIs (implementation package TBD, requires ADR):
- Record coordinate, accuracy, and timestamp.
- Handle denied location permission gracefully — GPS is useful evidence metadata, not a replacement for server authorization.
- Handle timeout and unavailable GPS (record unavailable state explicitly).
- Never use GPS as a security or authorization mechanism.

## 12. Authentication / Session

The Flutter app authenticates through the common JWT contract (`/api/v1/auth/login`):
- Store access and refresh tokens in device secure storage (package TBD; never in plain local storage or logs).
- Handle token expiry with automatic refresh; re-authenticate when refresh fails.
- Offline work may continue only for previously authorized/cached assignments.
- The app must not mint authorization or extend server permissions.
- Logout with unsynced work requires a warning and explicit confirmation.

## 13. Security

- **Never** store private certificate signing keys in the Flutter app.
- Treat local device storage as recoverable exposure: minimize data, clear on approved sign-out/device reset.
- Protect sensitive logs — no passwords, tokens, private keys, or personal data in debug output.
- The backend independently validates role, assignment, ownership, state transition, evidence, idempotency, and version.
- Client-side checks are convenience only; backend is authoritative.

## 14. API Integration

The Flutter app consumes the same `/api/v1/` API contract as React Web and the React field PWA:

| Feature | Endpoint |
|---|---|
| Login | `POST /api/v1/auth/login` |
| Profile | `GET /api/v1/users/me` |
| Assigned inspections | `GET /api/v1/inspections/` |
| Inspection detail | `GET /api/v1/inspections/{id}/` |
| Evidence upload | `POST /api/v1/evidence/` |
| Sync | `POST /api/v1/sync` |

No Flutter-specific endpoints or request schemas are permitted.

## 15. Testing

Flutter testing uses the Dart testing framework:

| Layer | Tool | Coverage |
|---|---|---|
| Unit | `flutter_test` | Local persistence operations, sync state machine, conflict handling, evidence validation, GPS/timestamp utilities |
| Widget | `flutter_test` | Checklist, readings, evidence, sync status, conflict resolution UI |
| Integration | `flutter_test` integration runner | Full offline workflow: cache → offline → inspect → queue → reconnect → sync → result |
| Lifecycle | Integration | Background/foreground transitions, app restart with pending queue |
| Camera | Integration | Permission grant/deny, capture, metadata recording |
| Location | Integration | Permission grant/deny, coordinate recording, unavailable state |
| Secure storage | Unit + integration | Token storage, clear on logout |

Run tests:
```bash
cd flutter_field_app
flutter test
```

API contract tests verify that Flutter and React PWA produce consistent backend behavior through the same endpoints.

---

## 16. React Field PWA — Testing Client

The React field PWA at `frontend/src/app/field/` exists for **testing and prototype validation** of the field workflow and API contract. It is **not** the final field application.

**Purpose:** Validate the field API contract, offline behavior mechanics, and sync state machine during development — especially before or during Flutter development.

**Implementation details (PWA-specific; not canonical offline contract):**
- Dexie 4 over IndexedDB for local persistence
- `public/sw.js` service worker
- Browser file input for evidence (camera-labelled action)
- Browser Geolocation API
- Mock sync adapter (backend sync endpoint not yet implemented)

**Sync states are shared** with Flutter: `LOCAL_DRAFT`, `READY_TO_SYNC`, `SYNCING`, `SYNCED`, `FAILED`, `CONFLICT`.

**API contract is shared** with Flutter: same `/api/v1/` endpoints, same `clientOperationId` idempotency, same response shapes.

IndexedDB, Dexie, and Service Worker are PWA-specific implementation details. They are **not** the canonical offline storage mechanism for the official field application.

Tests for the React PWA cover: offline mode, app restart, Dexie persistence, queue transitions, duplicate replay, changed-payload conflict, version conflict, evidence limits, camera/GPS denial, service-worker cache behavior, re-authentication, and unsynced logout.
