# Definition of Done

## Global DoD

A task is `DONE` only when:

- requirements and acceptance criteria are satisfied;
- API contract and canonical logical data model are preserved;
- backend validation, authorization, ownership, and error handling are present;
- appropriate tests pass and verification commands are recorded;
- no unaccepted critical/high defect remains;
- documentation, task board, and Django migrations/examples are aligned where applicable;
- logs and metrics redact secrets;
- security review is complete for the risk level;
- human review comments are resolved;
- integration with dependent modules is verified.

## Client-specific Checks

### Web (React Web — Business/Admin/Public)

Responsive layouts, keyboard/focus/accessibility behavior, loading/empty/error states, and documented API integration are verified. UI guards do not replace backend authorization.

### Flutter Field Application (Official Field Client)

A Flutter field task is not `DONE` unless all applicable items are verified:

- [ ] App builds successfully (`flutter build apk` or equivalent).
- [ ] `flutter test` passes (unit, widget, and integration tests for the task scope).
- [ ] Offline behavior works: workflow steps complete without network after caching.
- [ ] Sync works: queued operations reach the backend with idempotent replay.
- [ ] Conflict handling works: `CONFLICT` state is visible and requires explicit resolution.
- [ ] Camera integration works or a graceful fallback/permission denial path is present.
- [ ] Location/GPS handling works or an unavailable state is recorded explicitly.
- [ ] Secure local handling is verified: no tokens/keys in plain storage or logs.
- [ ] Token expiry and re-authentication path are tested.
- [ ] Flutter package selection is backed by an accepted ADR.
- [ ] API contract used is the same `/api/v1/` contract as React Web and PWA (no Flutter-specific endpoints).

### React Field PWA (Testing / Prototype Client)

PWA tasks are **testing / prototype tasks only**. Their DoD reflects prototype validation, not production readiness.

A PWA field task is `DONE` when:

- [ ] `pnpm exec vitest run` passes for the task scope.
- [ ] Offline banner and recovery path are visible.
- [ ] Cached work survives app restart (Dexie persistence verified).
- [ ] Queue state transitions are correct.
- [ ] Sync is idempotent; conflicts are explicit.
- [ ] Service worker behavior, camera/file input, and GPS permission paths are tested.
- [ ] Unsynced logout path is handled.
- [ ] The task is labelled `FIELD_PWA_TESTING` and does not claim production field architecture status.

## Module Checks

| Module | Required evidence |
|---|---|
| Auth | JWT expiry/rejection, Argon2id, inactive user, rate limit, no secret leakage |
| Instrument/Application | Canonical fields, duplicate/ownership rules, state transitions, negative API tests |
| Scheduling/Inspection | Assignment prerequisite, UTC schedule, readings/result separation, timestamps/GPS availability |
| Evidence | MIME/size/object-key validation, safe storage, failure/retry tests |
| Certificate | Eligibility, canonical payload/hash, RSA-PSS/SHA-256 fixtures, PDF/QR metadata, tamper tests |
| Public verification | No login, minimal response, `VALID`/`EXPIRED`/`REVOKED`/`INVALID`, rate limiting |
| Offline sync | UUID idempotency, restart, retry, version conflict, explicit resolution, no silent overwrite |
| Flutter field | Builds, passes `flutter test`, offline workflow, sync, conflict, camera, GPS, secure storage, ADR-backed packages |
| Audit/AI | Tamper-evident chain/redaction; optional AI remains advisory and human-reviewed |
