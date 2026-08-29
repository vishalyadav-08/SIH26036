# Testing and Security Specification

Testing is a delivery gate. Use synthetic data only. Test the same business workflow through Web, PWA, and Flutter where Flutter is approved; the backend must not have client-specific security behavior.

## 1. Test layers and repository tools

| Area | Required coverage | Tool/status |
|---|---|---|
| Backend unit/integration | Django app rules, serializers, permissions, transitions, persistence, storage, crypto | Django test runner; app tests are currently scaffolds |
| API/contract | Status codes, DTOs, auth/RBAC, ownership, assignment, pagination, idempotency, public minimization | Django tests plus an approved API client/contract harness |
| Web unit/component | Forms, loading/error/empty states, guards, accessible rendering | Vitest + Testing Library dependencies present; test script pending |
| PWA/offline | Dexie, restart, queue, service worker, evidence, camera/GPS, sync/conflict | Vitest/Testing Library and browser automation when configured |
| Flutter | Dart unit/widget/integration, lifecycle, persistence, sync, camera/location, secure storage | Conditional; Flutter is not in this checkout |
| End-to-end | Business → Admin → field client → sync → certificate → public verification | Playwright is a planned gate; no config is present |
| Security | dependency/config/secret scan, auth abuse, file validation, public exposure | Human review and approved tools; no CI security config is present |
| Performance/accessibility | pagination, sync batches, evidence path, verification latency, keyboard/focus/contrast | Measure baselines; do not invent SLAs |

## 2. Critical security tests

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

## 3. Security controls

- Django/DRF authentication and permissions enforce JWT, role, ownership, and assignment; UI guards are convenience only.
- Argon2id protects passwords. Secrets are injected through protected configuration and excluded from Git/logs.
- Validate JSON, query, path, multipart, and sync inputs on the backend.
- Allowlist evidence MIME types, bound size, generate object keys, prevent path traversal, and restrict object access.
- Require TLS in deployment, known CORS origins, login/public verification rate limits, safe request IDs, and redaction.
- Keep private certificate signing keys backend-only. Use SHA-256 and RSA-2048/RSA-PSS/SHA-256 fixtures.
- Use transaction boundaries for state changes, sync records, audit events, and certificate creation.

## 4. Client-specific scenarios

### PWA

Test airplane mode, app close/restart, IndexedDB/Dexie persistence, service-worker cache fallback, camera/file input, GPS denial/timeout, queue batching, transient retry, auth expiry, duplicate replay, changed-payload conflict, version conflict, and unsynced logout.

### Flutter

If approved, test background/foreground lifecycle, local database failure/quota, native camera/location permissions, secure storage, queue recovery, re-authentication, and all common API contract cases. The exact Flutter tools/packages are an open decision until an ADR exists.

### Web

Test responsive Business/Admin/Public routes, accessible form/error states, API integration, public minimization, and role-based route UX. Never treat client rendering as authorization.
