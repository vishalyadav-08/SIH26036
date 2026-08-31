# Testing and Security Specification

Testing is a delivery gate. Use synthetic data only. Test the same business workflow through React Web, Flutter, and React PWA; the backend must not have client-specific security behavior.

## 1. Test Layers and Repository Tools

| Area | Required coverage | Tool / status |
|---|---|---|
| Backend unit/integration | Django app rules, serializers, permissions, transitions, persistence, storage, crypto | Django test runner (`python manage.py test`); app tests are currently scaffolds |
| API/contract | Status codes, DTOs, auth/RBAC, ownership, assignment, pagination, idempotency, public minimization | Django tests + approved API client/contract harness |
| Web unit/component | Forms, loading/error/empty states, guards, accessible rendering | Vitest 4 + Testing Library; test script pending |
| Flutter field | Dart unit/widget/integration, lifecycle, offline persistence, sync, camera/location, secure storage | `flutter test`; Flutter exists at `flutter_field_app/`; test suite pending |
| React PWA (testing client) | Dexie, restart, queue, service worker, evidence, camera/GPS, sync/conflict | Vitest/Testing Library; PWA is testing/prototype client |
| End-to-end | Business → Admin → Flutter field → sync → certificate → public verification | Playwright is a planned gate; no config present |
| Security | Dependency/config/secret scan, auth abuse, file validation, public exposure | Human review and approved tools; no CI security config present |
| Performance/accessibility | Pagination, sync batches, evidence path, verification latency, keyboard/focus/contrast | Measure baselines; do not invent SLAs |

## 2. Critical Security Tests

1. Protected endpoints reject missing, malformed, expired, and wrong-scope JWTs.
2. BUSINESS cannot cross business ownership; OFFICER cannot access unassigned inspections; ADMIN-only actions are enforced server-side.
3. Illegal application transitions, invalid readings, malformed coordinates, invalid MIME, and oversized evidence are rejected.
4. Duplicate `clientOperationId` with the same payload returns the original result; a changed payload is `CONFLICT`.
5. Stale versions are explicit conflicts; no silent overwrite/merge occurs.
6. Local-only data is not labelled server-confirmed and survives approved restart tests.
7. Certificate tampering, wrong key, expired, revoked, missing, and malformed cases return the correct public outcome.
8. Public verification needs no login and exposes minimal fields only.
9. Audit hash-chain recomputation detects modified event content or link.
10. No password, token, private key, or sensitive payload is logged or returned.

## 3. Security Controls

- Django/DRF authentication and permissions enforce JWT, role, ownership, and assignment; UI guards are convenience only.
- Argon2id protects passwords. Secrets are injected through protected configuration and excluded from Git/logs.
- Validate JSON, query, path, multipart, and sync inputs on the backend.
- Allowlist evidence MIME types, bound size, generate object keys, prevent path traversal, and restrict object access.
- Require TLS in deployment, known CORS origins, login/public verification rate limits, safe request IDs, and redaction.
- Keep private certificate signing keys backend-only. Use SHA-256 and RSA-2048/RSA-PSS/SHA-256 fixtures.
- Use transaction boundaries for state changes, sync records, audit events, and certificate creation.

## 4. Client-specific Test Scenarios

### Backend

```bash
cd backend
python manage.py test                        # all apps
python manage.py test authentication         # auth/JWT/RBAC
python manage.py test inspections evidence   # field workflow
python manage.py test sync                   # idempotency/conflict
python manage.py test certificates           # crypto/signing
python manage.py test verification           # public endpoint
```

Tests must cover: JWT validity, role matrix, ownership/assignment negatives, transitions, evidence MIME/size validation, idempotency replay, version conflicts, certificate eligibility, canonical payload/hash/signature fixtures, tamper detection, public minimization.

### React Web

```bash
cd frontend
pnpm exec vitest run
pnpm lint
pnpm build
```

Test: responsive Business/Admin/Public routes, accessible form/error states, API integration, public minimization, role-based route UX. Never treat client rendering as authorization.

### Flutter Field Application (Official)

```bash
cd flutter_field_app
flutter test
```

Test coverage required:

| Area | Tests |
|---|---|
| Unit | Local persistence operations, sync state machine, conflict handling, evidence validation, GPS/timestamp utilities |
| Widget | Checklist, readings form, evidence list, sync status display, conflict resolution UI |
| Integration | Full offline workflow: cache assignment → go offline → inspect → queue operations → reconnect → sync → verify result |
| App lifecycle | Background/foreground transitions, app restart with pending queue, logout with unsynced operations |
| Offline behavior | All workflow steps complete without network after caching |
| Sync | Idempotent replay, changed-payload conflict, version conflict, explicit resolution |
| Camera | Permission grant/deny, capture flow, metadata recording |
| Location | Permission grant/deny, coordinate recording, unavailable state handling |
| Authentication/session | Token storage, expiry, refresh, secure storage, logout/re-auth |
| Secure storage | No secrets in plain storage or logs |

The exact Flutter test packages are open decisions until their ADRs are accepted.

### React Field PWA — Testing Client

The PWA is a **testing/prototype client**. Its tests validate field workflow logic and API contract mechanics for prototype purposes.

```bash
cd frontend
pnpm exec vitest run
```

Test: airplane mode, app close/restart, IndexedDB/Dexie persistence, service-worker cache fallback, camera/file input, GPS denial/timeout, queue batching, transient retry, auth expiry, duplicate replay, changed-payload conflict, version conflict, and unsynced logout.

IndexedDB, Dexie, and Service Worker tests apply **only to the React PWA**. They are not required for Flutter (which uses native local persistence).

### Cross-client Contract Tests

Verify that Flutter, React PWA, and React Web produce consistent backend behavior through the same endpoints:

| Scenario | Flutter | React PWA | React Web |
|---|---|---|---|
| Login and profile | ✓ | ✓ | ✓ |
| Cached inspection fetch | ✓ | ✓ | — |
| Evidence upload | ✓ | ✓ | — |
| Sync idempotency | ✓ | ✓ | — |
| Certificate verification | ✓ | ✓ | ✓ |
| Conflict detection | ✓ | ✓ | — |

The backend must produce the same authorization, state transitions, and responses regardless of which client makes the request.
