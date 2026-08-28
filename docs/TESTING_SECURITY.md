# Testing and Security Specification

Testing is a delivery gate, not a post-demo activity. All tests use synthetic data unless a future approved test-data policy says otherwise.

## 1. Test layers and tools

| Layer | Scope | Tool/requirement |
|---|---|---|
| Backend unit | Domain rules, state transitions, validation, mapping, crypto helpers | JUnit 5 + Mockito |
| Backend integration | Spring context, PostgreSQL behavior, Flyway, object-storage adapter | JUnit 5 + Testcontainers |
| API/contract | Status codes, DTOs, auth/role/ownership, idempotency, pagination | Bruno or Postman plus automated contract assertions |
| Web unit/component | Forms, filters, state badges, error/loading/empty/accessibility states | Vitest + Testing Library |
| Field/offline | Dexie stores, queue transitions, restart, permissions, conflicts | Vitest + Testing Library; browser automation where practical |
| E2E | Business/admin/officer/public journeys | Playwright |
| Security | Dependency/config/API attack paths and public minimization | OWASP ZAP, code review, secret scan |
| Performance | Verification latency, list pagination, sync batches, evidence path | k6 with recorded thresholds, not invented product claims |
| Accessibility | Keyboard, focus, labels, contrast, screen-reader semantics | Testing Library checks plus manual review |

## 2. Critical acceptance tests

1. Unauthenticated access to protected endpoints is rejected.
2. A BUSINESS user cannot read or mutate another business’s records.
3. An OFFICER cannot access an unassigned inspection.
4. An unauthorized role cannot assign, schedule, revoke, or view audit data.
5. Illegal application state transitions are rejected with `409` or documented validation error.
6. Inspection result (`PASS`, `FAIL`, `REQUIRES_CORRECTION`) is not confused with application state.
7. A tampered certificate payload returns `INVALID`.
8. Expired certificate returns `EXPIRED`; revoked certificate returns `REVOKED`.
9. Duplicate `clientOperationId` is idempotent and produces one server action.
10. Same operation ID with a changed payload becomes `CONFLICT`.
11. Accepted offline data survives app close/restart.
12. Invalid MIME type, oversized evidence, malformed coordinates, and invalid readings are rejected.
13. Public verification requires no login and exposes only minimal data.
14. Audit hash-chain recomputation detects changed event data or link.
15. Certificate signing/verification uses RSA 2048 + RSA-PSS + SHA-256 and fails on changed canonical bytes.

## 3. Test scenarios by capability

### Auth/RBAC/ownership

Test valid/invalid login, inactive user, expired token, role matrix, business isolation, officer assignment scope, admin boundary, rate limiting, CORS, and safe error messages. Verify no password, token, or key appears in logs or API responses.

### Applications and lifecycle

Test every transition in [DATA_MODEL.md](DATA_MODEL.md), missing reasons, duplicate requests, cancellation/rejection policy, concurrent updates, and server-authoritative state after client refresh.

### Inspection and evidence

Test required checklist/readings, numeric precision, configurable demo rules, capture/server timestamps, GPS denied/unavailable, MIME/size checks, generated object keys, upload failure, retry, and evidence ownership.

### Offline and sync

Test online cache, airplane mode, app restart, queue ordering, batch limits, interrupted request, server retry, duplicate replay, changed-payload replay, version conflict, explicit resolution, storage pressure, and logout with unsynced work. Verify local states exactly `LOCAL_DRAFT`, `READY_TO_SYNC`, `SYNCING`, `SYNCED`, `FAILED`, `CONFLICT`.

### Certificates and public verification

Test canonical serialization fixtures, hash fixtures, signature fixture, wrong public key, changed payload, status precedence, PDF/object-storage failure, QR URL shape, rate limit, and public-field minimization.

### AI advisory

If enabled after MVP, test OCR/extraction inputs, confidence and explanation, bad/empty input, human override, fallback, privacy, and proof that AI cannot submit a legal final decision.

## 4. Security controls

- Spring Security authenticates JWTs; backend enforces RBAC plus ownership/assignment.
- Argon2id protects passwords; secrets are injected through approved configuration and excluded from Git/logs.
- Validate all JSON, query, path, multipart, and sync payloads server-side.
- Allowlist evidence MIME types; bound size; generate object keys; prevent path traversal; restrict object access.
- Require TLS in production; configure CORS to known frontend origins.
- Rate-limit login and public verification; monitor abuse without logging certificate payload secrets.
- Require idempotency for retriable mutations, especially offline sync and certificate generation.
- Use transaction boundaries for state changes, sync records, audit events, and certificate creation.
- Use safe structured logging with request IDs and redaction.
- Minimize public data and avoid exposing internal IDs when not needed.

## 5. Security review gates

Before a task is marked DONE: unit/integration tests pass; API role/ownership tests exist; evidence and input validation are covered; secrets scan is clean; dependency vulnerabilities are reviewed; public responses are checked; crypto changes have deterministic fixtures; and a human reviewer signs off high-risk code. Critical/high findings block merge unless explicitly accepted by the project lead with an expiry.

## 6. Performance and observability

Measure public verification latency, application list latency under pagination, sync success/error/retry counts, evidence upload time/size failures, and certificate generation time. Use baseline fixtures and record environment/configuration with results. Do not turn a local benchmark into an unqualified production SLA.

