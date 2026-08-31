# MapanSetu Demo Plan

## Purpose and Guardrails

Demonstrate the end-to-end prototype with synthetic users and configurable demo values. The demo shows workflow coordination and certificate verification mechanics; it must not claim statutory approval, government integration, legal-signature authority, or real regulatory tolerances.

## Pre-demo Setup

1. Start the Django API on port 8000: `cd backend; python manage.py runserver 8000`
2. Start the Next.js web/PWA on port 3000: `cd frontend; pnpm dev`
3. Launch the Flutter field app on a connected device or emulator: `cd flutter_field_app; flutter run`
4. Configure PostgreSQL through `DATABASE_URI` and MinIO through `MINIO_ENDPOINT` if available; otherwise state the local fallback clearly.
5. Seed synthetic Business, ADMIN, OFFICER, instrument, and certificate fixtures.
6. Confirm reset/reseed and critical tests. Prepare active, expired, revoked, and tampered certificate fixtures.

## Official Demo Path

The official demo uses the Flutter field application.

```text
1.  Business opens React Web (port 3000)
2.  Business registers a synthetic instrument
3.  Business submits a verification application
4.  Admin opens React Web
5.  Admin assigns an officer to the application
6.  Admin schedules the inspection
7.  Officer opens the Flutter Field App (flutter_field_app/)
8.  Officer logs in through the Flutter app
9.  Officer views assigned inspection and caches assignment data
10. Device goes offline (airplane mode)
11. Officer performs the inspection workflow: checklist, readings, notes
12. Officer records measurements
13. Officer captures evidence (photos, available GPS metadata)
14. Officer records inspection result (PASS/FAIL)
15. Operations remain locally queued (show READY_TO_SYNC state)
16. Network returns (disable airplane mode)
17. Flutter syncs queued operations to /api/v1/sync
18. Backend confirms sync (show SYNCED state)
19. Admin/Backend generates certificate
20. Certificate contains canonical payload hash and QR URL
21. Public user opens verification URL (or scans QR)
22. Certificate verification succeeds (VALID)
23. Optional tamper demonstration: alter a certificate field, show INVALID from backend
```

## Failure Rehearsal

Show an explicit `FAILED` retry and a `CONFLICT` resolution if the happy path is unavailable. Never hide a failed sync or claim local data is server-confirmed.

If the backend certificate or storage implementation is not yet complete, label the corresponding step as a planned contract rather than simulating it as production behavior.

## React Field PWA — Technical Fallback Only

If the Flutter build is unavailable for a specific technical test, the React field PWA may be used as a technical fallback for the field workflow portion. When this fallback is used:

1. **Explicitly label it** — "This is the React field PWA testing client, not the production field application."
2. **Use only for the field portion** (steps 7–18 above); Business and Admin web steps remain the same.
3. **Document it** — record which demo used the fallback and why.

The React field PWA fallback path:

```text
7.  Officer opens React Field PWA (localhost:3000/field)
        ...
17. PWA syncs via /api/v1/sync (same API contract)
```

Only the field client changes. The backend workflow, API contract, certificate, and verification steps do not change.

## Narrative

1. Business signs in, registers a synthetic instrument, and submits an application.
2. Admin assigns an officer, schedules the case, and shows notification/audit effects.
3. Officer opens the Flutter field app, logs in, and caches the assigned work.
4. Officer puts device in airplane mode; completes checklist, readings, captures evidence, records result locally.
5. Show `READY_TO_SYNC`, restore network, sync with the same `clientOperationId`, show `SYNCED`.
6. Show `PASS` as the inspection result and `COMPLETED` as the application state.
7. Generate certificate metadata/PDF/QR, then verify publicly without login.
8. Show instrument history, expiry/notification/admin views, and a tamper fixture returning `INVALID`.

## Demo Environment Limits

- All data is synthetic — no real instruments, businesses, officers, or legal records.
- Prototype cryptography is not an authorized legal signature.
- Demo tolerance values are DEMO/CONFIGURABLE — not statutory.
- No live government integration is present.
