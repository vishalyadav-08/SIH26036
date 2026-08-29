# Field Application — Offline Architecture and Sync Specification

## 1. Purpose

Define the shared offline contract for the officer field workflow and the two possible clients: the current React PWA and the conditional Flutter native app. The backend must not care which client produced a request.

## 2. Field application strategy

```text
Flutter ready before internal hackathon?
  YES -> Flutter is the primary demo/native target; PWA remains testing/fallback.
  NO  -> React field PWA is the primary demo/testing path; Flutter remains future target.
```

These are alternative field-client paths. Do not describe both as simultaneously required production clients. The API, data model, authentication, certificate flow, and domain states remain unchanged.

## 3. Client selection

The current checkout selects the PWA path: field screens live under `frontend/src/app/field/`, storage under `frontend/src/offline/`, services under `frontend/src/services/field/`, and the service worker at `frontend/public/sw.js`. No Flutter/Dart project exists. Flutter adoption is conditional on a readiness review before the internal hackathon.

## 4. Common offline contract

Both clients must use the same authenticated API and the same canonical states:

```text
LOCAL_DRAFT -> READY_TO_SYNC -> SYNCING -> SYNCED
                                      \-> FAILED -> READY_TO_SYNC
                                      \-> CONFLICT -> explicit resolution
```

`clientOperationId` is a UUID for every retriable/offline mutation. The client sends the operation type, entity ID, payload, expected server version, and operation ID. The server stores an operation result and applies the operation at most once:

- same operation ID + same payload hash → return the original result;
- same operation ID + different payload → `CONFLICT`;
- stale entity version → explicit `CONFLICT`;
- network failure → do not claim server confirmation; retry with the same operation ID.

No client-specific server state is allowed. Conflict resolution is explicit; unsafe silent merge/overwrite is forbidden.

## 5. React PWA implementation

The current implementation uses:

- Next.js/React routes and providers;
- Dexie 4 over IndexedDB (`frontend/src/offline/db.ts`);
- tables for app metadata, cached inspections, drafts, evidence blobs, sync queue, and sync results;
- a bounded queue processor in `frontend/src/services/field/sync.service.ts`;
- `public/sw.js` for network-first caching of GET/static assets and network pass-through for API calls;
- browser file input for evidence (with a camera-labelled action in the current UI) and Geolocation API;
- a mock sync interceptor for local workflow testing because the Django sync endpoint is not implemented.

The current PWA is not evidence that the final backend endpoints or production service-worker strategy are complete. API responses remain authoritative when online.

## 6. Flutter implementation

Flutter is the planned native field client and is not implemented in this repository. Its exact local persistence, state-management, networking, camera, location, secure-storage, and background-sync packages remain an implementation decision and must be documented by a new ADR before implementation. Do not guess packages or create Flutter-only endpoints/models.

The Flutter repository, once approved, must implement the common operation envelope, local states, version/conflict handling, evidence metadata, session behavior, and API contract defined here.

## 7. Local persistence

Persist only the minimum data needed to continue assigned work offline: cached inspection snapshot, draft checklist/readings/decision, evidence blobs/metadata, sync queue, operation results, schema version, and timestamps. Every local record must carry provenance (`serverVersion`, local state, and updated/captured time as applicable). Local data is untrusted and may be deleted or unavailable due to quota/device lifecycle.

On app restart, recover operations left in `SYNCING` to `READY_TO_SYNC` only when their request outcome is unknown; the original operation ID must remain unchanged. Logout with unsynced work requires a warning and explicit product-approved handling.

## 8. Sync queue

Queue operations deterministically by creation time and process bounded batches. Mark `SYNCING` before transmission, keep the same operation ID for transient retries, and record attempt/error information. Map `400/413` payload failures to `FAILED`, auth failures to a re-auth-required failure, transient network/server/rate-limit failures to retryable state, and server version/payload conflicts to `CONFLICT`.

The `/api/v1/sync` response returns one result per submitted operation, including operation ID, status, entity ID, server version where available, and a safe message. A client may display `SYNCED` only from that result.

## 9. Conflict handling

Show the local and server versions and require an explicit user decision. A resolution is a new operation with a new UUID and the original conflict remains auditable. The client must not silently choose local or server data.

## 10. Evidence capture

Evidence is queued locally with filename, MIME type, size, blob, capture timestamp, inspection ID, and optional GPS. Current prototype allowlist: JPEG, PNG, WebP, and PDF; maximum 10 MiB per item. The server repeats every validation, generates object keys, stores metadata in the database, and stores binary content in configured object storage. A local blob is not an uploaded artifact until the API confirms it.

## 11. Camera and GPS

The PWA uses browser APIs and must handle denied permission, unavailable hardware, timeout, inaccurate location, and no network. Capture time and GPS provenance must remain explicit. Flutter will use native capabilities only after its implementation ADR; GPS is useful evidence metadata, not a replacement for server authorization.

## 12. Authentication/session

Both clients authenticate through the common JWT contract. Access/refresh expiry, re-authentication, token storage, and logout behavior must avoid exposing secrets in logs or ordinary local domain records. Offline work may continue only for previously authorized/cached assignments; the client must not mint authorization or extend server permissions.

## 13. Security

Never store private signing keys in either field client. Treat IndexedDB/device storage as recoverable exposure: minimize data, clear on approved sign-out/device reset, and protect sensitive logs. The backend independently validates role, assignment, ownership, state transition, evidence, idempotency, and version.

## 14. Testing

PWA tests cover offline mode, app restart, Dexie persistence, queue transitions, duplicate replay, changed-payload conflict, version conflict, evidence limits, camera/GPS denial, service-worker cache behavior, re-authentication, and unsynced logout. Flutter tests are conditional until the project exists: Dart unit/widget/integration tests must cover the same contract and lifecycle cases. API tests cover both clients through the same endpoints.
