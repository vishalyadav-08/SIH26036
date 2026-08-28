# MapanSetu Demo Plan

## Purpose and guardrails

Demonstrate the end-to-end prototype with synthetic users/data. The demo shows workflow digitization and certificate verification mechanics; it must not claim statutory approval, government integration, legal-signature authority, or real regulatory tolerances.

## Pre-demo setup

- Start the documented Web `5173`, Field `5174`, API `8080`, PostgreSQL `5432`, MinIO API `9000`, and MinIO console `9001` services.
- Seed synthetic Business, ADMIN, OFFICER, instrument, and configurable DEMO certificate data.
- Confirm reset/reseed works and critical tests have passed.
- Prepare one valid active certificate, one expired certificate, one revoked certificate, and one tamper fixture.
- Keep a no-AI run path; AI is optional advisory only.

## Preferred narrative

1. **Business login:** Sign in as a synthetic BUSINESS user and show own dashboard.
2. **Instrument registration:** Register a synthetic electronic scale with instrument/serial identity and DEMO-labelled configuration.
3. **Application:** Submit a verification Application and show `SUBMITTED` status/timeline.
4. **Assignment/scheduling:** Sign in as ADMIN, assign an active OFFICER, schedule the visit, and show the audit/notification effect.
5. **Field app:** Open the Field PWA as the assigned officer and cache the assigned case.
6. **Offline switch:** Enable airplane mode or network blocking; show cached case and explicit offline banner.
7. **Inspection:** Complete checklist, enter synthetic readings, capture a synthetic evidence photo, and capture GPS if permitted.
8. **Local save:** Review and queue the decision; show `READY_TO_SYNC`, not server completion.
9. **Reconnect/sync:** Restore network, run sync, and show `SYNCED` with the same UUID if retried.
10. **Decision:** Show officer result `PASS` and the backend application state transition to `COMPLETED`.
11. **Certificate:** Generate certificate, SHA-256 payload hash, RSA-PSS/SHA-256 signature metadata, PDF reference, and QR URL.
12. **Public verifier:** Scan/open `/verify/<certificateNo>` and show `VALID` without login.
13. **Passport:** Return to the instrument passport and show chronological application/certificate history.
14. **Admin dashboard:** Show queue, workload, expiry bucket, notifications, and audit chain fields.
15. **Tamper demonstration:** Use the isolated synthetic tamper fixture and show public verification returning `INVALID`.

## Backup paths

able path and continue with synthetic permitted evidence metadata.
- If offline sync fails, show `FAILED`, retry, and explain the recovery path rather than hiding the failure.
- If a live deployment is unavailable, use a local Compose environment and state that it is a prototype environment.

## Demo acceptance

- Every step uses a documented route/API/entity/state.
- Public verification exposes minimal data and no login.
- Certificate status and signature outcomes are explained separately.
- Synthetic/demo labels are visible where values could be mistaken for statutory data.
- No fake government integration, legal signature, statutory tolerance, or absolute immutability claim is made.
- Reset and rehearsal are repeatable; no critical/high test defect remains.

