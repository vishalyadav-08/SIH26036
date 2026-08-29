# MapanSetu Demo Plan

## Purpose and guardrails

Demonstrate the end-to-end prototype with synthetic users and configurable demo values. The demo shows workflow coordination and certificate verification mechanics; it must not claim statutory approval, government integration, legal-signature authority, or real regulatory tolerances.

## Pre-demo setup

- Start the documented Next.js web/PWA on port 3000 and Django API on port 8000.
- Configure PostgreSQL through `DATABASE_URI` and MinIO through `MINIO_ENDPOINT` only if those services are available; otherwise state the local fallback clearly.
- Seed synthetic Business, ADMIN, OFFICER, instrument, and certificate fixtures.
- Confirm reset/reseed and critical tests. Prepare active, expired, revoked, and tampered certificate fixtures.
- Keep a PWA path available even if Flutter is selected. Keep an AI-disabled path.

## Preferred path when Flutter is ready

```text
Business Web
  ↓
Admin Web
  ↓
Flutter Field App
  ↓
Offline inspection
  ↓
Sync
  ↓
Certificate
  ↓
Public verification
```

## Fallback path when Flutter is not ready

```text
Business Web
  ↓
Admin Web
  ↓
React Field PWA
  ↓
Offline inspection
  ↓
Sync
  ↓
Certificate
  ↓
Public verification
```

Only the field client changes; the backend workflow and API contract do not.

## Narrative

1. Business signs in, registers a synthetic instrument, and submits an application.
2. Admin assigns an officer, schedules the case, and shows notification/audit effects.
3. The selected field client caches assigned work, enters airplane mode, completes checklist/readings, captures synthetic evidence and available GPS, and saves locally.
4. Show `READY_TO_SYNC`, restore network, sync with the same `clientOperationId`, and show `SYNCED`.
5. Show `PASS` as the inspection result and `COMPLETED` as the separate application state.
6. Generate certificate metadata/PDF/QR, then verify publicly without login.
7. Show instrument history, expiry/notification/admin views, and an isolated tamper fixture returning `INVALID`.

## Failure rehearsal

Show an explicit `FAILED` retry and a `CONFLICT` resolution if the happy path is unavailable. Never hide a failed sync or claim local data is server-confirmed. If the backend certificate or storage implementation is not yet complete, label the corresponding step as a planned contract rather than simulating it as production behavior.
