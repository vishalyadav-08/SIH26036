# MapanSetu — Current App Development Guide
## Field / Offline App — SIH 26036

**Purpose:** This is the short implementation guide for the developer building the Field/Offline app under time pressure.

> **Source of truth for implementation:** the current Git repository. The older Java/Spring + Vite documentation is stale where it conflicts with the repository.

---

## 1. Current repository architecture

```text
MapanSetu
├── backend/          Django + Django REST Framework
└── frontend/         Next.js + React + TypeScript
```

### Backend
- Python
- Django
- Django REST Framework (DRF)
- JWT authentication
- PostgreSQL
- MinIO / S3-compatible object storage
- Argon2 password hashing
- ReportLab for PDF
- Segno for QR
- Python cryptography tooling

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Axios
- React Hook Form
- Zod
- Lucide React
- pnpm

### Development ports
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 2. Your responsibility

Build the **Field / Offline officer application** inside the existing `frontend/` Next.js application.

Do **not** create a separate Vite project unless the team explicitly decides otherwise.

Recommended route area:

```text
/field
/field/inspections
/field/inspections/[id]
/field/inspections/[id]/checklist
/field/inspections/[id]/readings
/field/inspections/[id]/evidence
/field/inspections/[id]/review
/field/sync
/field/profile
```

The existing Business/Admin/Public frontend remains part of the same Next.js application.

---

## 3. Field app technology

### UI
- Next.js + React + TypeScript
- Tailwind + existing shadcn/ui components

### State/API
- TanStack Query → server state
- Axios → centralized API client
- React Hook Form + Zod → forms and client validation

### Offline
- IndexedDB
- Dexie
- Service Worker / PWA
- Workbox where useful

### Device
- Browser Camera API
- Browser Geolocation API

### Testing
- Vitest
- Testing Library
- Playwright

---

## 4. Build order — DO THIS IN ORDER

### STEP 1 — Understand existing frontend
Before creating components:
- inspect `frontend/src`
- inspect existing layout/providers
- inspect existing API client
- inspect auth handling
- inspect existing UI components
- reuse existing design system

### STEP 2 — Field shell
Build:
- Field layout
- connection indicator
- officer identity
- navigation
- offline/sync status
- responsive mobile-first UI

### STEP 3 — Online workflow first

```text
Login
  ↓
Field Dashboard
  ↓
Assigned Inspections
  ↓
Inspection Overview
  ↓
Checklist
  ↓
Readings
  ↓
Evidence
  ↓
GPS / Time
  ↓
Review
  ↓
PASS / FAIL / REQUIRES_CORRECTION
```

Get this working online before adding offline complexity.

### STEP 4 — Offline database

Create Dexie stores:

```text
appMetadata
cachedInspections
inspectionDrafts
evidenceBlobs
syncQueue
syncResults
```

Never store private keys or secrets locally.

### STEP 5 — Offline workflow

The officer must be able to:
- reopen cached assigned cases
- complete checklist
- enter readings
- capture evidence
- capture GPS when available
- save drafts
- review a decision
- queue operations without network
- restart the browser/app without losing accepted local data

### STEP 6 — Sync

Implement:

```text
LOCAL_DRAFT
    ↓
READY_TO_SYNC
    ↓
SYNCING
    ↓
SYNCED
```

Failure:

```text
FAILED
```

Version/payload mismatch:

```text
CONFLICT
```

Use a UUID `clientOperationId` for every sync operation.

### STEP 7 — Conflict handling

Never silently overwrite server data.

Show:
- client version
- server version
- changed fields
- available resolution
- retry/result

### STEP 8 — Test Android conditions

Test:
- Chrome Android
- airplane mode
- app/browser restart
- camera permission denied
- GPS permission denied
- no camera
- slow network
- network disappears during sync
- duplicate sync
- conflict
- storage pressure

---

## 5. API integration

Use the **actual Django API implementation and current API contract** before writing endpoint calls.

Important Field operations include the documented concepts:

```text
GET  /api/v1/applications
GET  /api/v1/applications/{id}

POST /api/v1/inspections
GET  /api/v1/inspections/{id}

POST /api/v1/inspections/{id}/readings
POST /api/v1/inspections/{id}/evidence
POST /api/v1/inspections/{id}/decision

POST /api/v1/sync
```

Authentication/profile:

```text
POST /api/v1/auth/login
GET  /api/v1/users/me
```

**Important:** do not invent new API endpoints. Inspect the current Django `urls.py`, views, serializers, and API schema/contract when integrating.

---

## 6. Offline data model

### `cachedInspections`
Stores permitted assigned-case snapshots.

Useful metadata:
- inspection/application ID
- server version
- cachedAt
- localState

### `inspectionDrafts`
Stores working inspection data:
- checklist
- readings
- result draft
- server version
- local state

### `evidenceBlobs`
Stores:
- evidence ID
- Blob
- metadata
- MIME type
- capturedAt
- hash if required

### `syncQueue`
Stores:
- clientOperationId
- entityType
- entityId
- operationType
- payload
- createdAt
- attemptCount
- lastError
- status
- expectedServerVersion

### `syncResults`
Stores:
- clientOperationId
- server result
- server version
- message/status

---

## 7. Critical rules

### Server is authoritative

Never turn a local result into a server-confirmed result before synchronization succeeds.

Good:

> Decision saved locally — waiting for sync.

Bad:

> Certificate issued

when the server has not confirmed it.

### Canonical offline states

Use exactly:

```text
LOCAL_DRAFT
READY_TO_SYNC
SYNCING
SYNCED
FAILED
CONFLICT
```

Do not introduce alternative state names.

### Inspection result is separate

Use:

```text
PASS
FAIL
REQUIRES_CORRECTION
```

Do not mix inspection result with application state or sync state.

### Security
- No private keys in frontend
- No secrets in IndexedDB
- No tokens/passwords in logs
- Don't expose private evidence publicly
- Backend authorization remains authoritative
- Don't trust client-side permissions as security

### Evidence
Allowed prototype formats:

```text
image/jpeg
image/png
image/webp
application/pdf
```

Maximum:

```text
10 MiB per evidence item
```

Validate client-side for UX and server-side for security.

### GPS
GPS can be unavailable.

Represent:
- available
- denied
- unavailable

Do not fake coordinates.

---

## 8. UI/UX rules

The Field app is a government/public-service workflow, not a gaming/cyberpunk interface.

Use:
- clear status
- large touch targets
- simple navigation
- restrained colors
- visible connection state
- clear save/sync feedback
- accessible labels
- keyboard/focus support where relevant
- mobile-first layouts

Every important operation needs:
- loading state
- success state
- error state
- retry/recovery path

Never use color alone to communicate status.

---

## 9. Definition of done for your Field app

A feature is not done merely because the screen renders.

Before calling it complete:

- [ ] Works with the real/current API shape
- [ ] Loading state exists
- [ ] Empty state exists where applicable
- [ ] Error state exists
- [ ] Permission behavior is correct
- [ ] Mobile layout works
- [ ] Accessibility basics work
- [ ] Offline behavior is explicit
- [ ] Local data survives restart where required
- [ ] No silent data loss
- [ ] No fake server state
- [ ] No secrets stored/logged
- [ ] Tests added
- [ ] `npm/pnpm` typecheck/build passes
- [ ] Critical Playwright flow passes

---

## 10. Demo flow

For the SIH demo, prioritize one reliable end-to-end story:

```text
Officer Login
    ↓
Assigned Case
    ↓
Open Inspection
    ↓
Complete Checklist
    ↓
Enter Readings
    ↓
Capture Evidence
    ↓
Show GPS/Time
    ↓
Turn ON Airplane Mode
    ↓
Continue / Save Inspection
    ↓
Show READY_TO_SYNC
    ↓
Restart App
    ↓
Data Still Present
    ↓
Turn Network ON
    ↓
Sync
    ↓
Show SYNCED
    ↓
Backend confirms result
    ↓
Business/Admin can see updated workflow
```

A strong demo should visibly prove the **offline → restart → reconnect → sync** capability.

---

## 11. Documents to use

### Highest priority

1. **Current repository code**
2. `docs/OFFLINE_APP.md` — functional offline requirements
3. `docs/FRONTEND.md` — UI architecture/design rules
4. `docs/API_CONTRACT.md` — API contract, but verify against current Django implementation
5. `docs/DATA_MODEL.md` — entities and canonical states
6. `docs/PRD.md` — product requirements and acceptance criteria
7. `docs/TESTING_SECURITY.md` — security/testing requirements

### Reference only until reconciled

- `docs/TECH_STACK.md`
- `docs/ARCHITECTURE.md`
- `docs/EXECUTION_PLAN.md`
- `docs/DEMO_PLAN.md`
- `docs/ARCHITECTURE_DECISIONS.md`

These contain the old Java/Spring/Vite architecture in places and should not override the current repository.

---

## 12. What NOT to do

Do not:
- start a Flutter project
- start a Kotlin Android project
- create a second frontend unnecessarily
- use Vite for a new separate Field app
- build backend logic in the frontend
- invent API endpoints
- invent statutory tolerance rules
- fake GPS
- fake successful sync
- silently overwrite conflicts
- store private signing keys
- spend early time on animations/visual polish

### Priority

```text
FUNCTIONAL FLOW
      >
OFFLINE RELIABILITY
      >
SYNC / CONFLICTS
      >
ANDROID TESTING
      >
ACCESSIBILITY / POLISH
      >
DECORATIVE UI
```

---

## 13. Fastest route to a working prototype

If time is extremely limited:

**Day/Phase A**
- Field shell
- login
- inspection list
- inspection detail
- checklist
- readings
- evidence
- review

**Day/Phase B**
- Dexie
- cached inspections
- drafts
- evidence blobs
- offline status

**Day/Phase C**
- sync queue
- retry
- duplicate operation handling
- conflict screen

**Day/Phase D**
- Android testing
- Playwright happy path
- demo rehearsal
- bug fixing

Build the smallest reliable vertical slice first. Then expand.

---

## Golden rule

> **Make the Field app work online first, then make that exact workflow survive offline.**

Do not build two separate versions of the application.

