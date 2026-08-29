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

## Client-specific checks

### Web

Responsive layouts, keyboard/focus/accessibility behavior, loading/empty/error states, and documented API integration are verified. UI guards do not replace backend authorization.

### React PWA

Offline banner and recovery are clear; cached work survives restart; Dexie persistence and queue states are correct; sync is idempotent; conflicts are explicit; service worker behavior, camera/file, GPS permission, and unsynced logout paths are tested.

### Flutter

Only when the native client is approved: mobile lifecycle, approved local persistence, offline queue/sync/conflict behavior, camera/location handling, and secure local handling are tested. Flutter packages and storage must be backed by an ADR.

## Module checks

| Module | Required evidence |
|---|---|
| Auth | JWT expiry/rejection, Argon2id, inactive user, rate limit, no secret leakage |
| Instrument/Application | Canonical fields, duplicate/ownership rules, state transitions, negative API tests |
| Scheduling/Inspection | Assignment prerequisite, UTC schedule, readings/result separation, timestamps/GPS availability |
| Evidence | MIME/size/object-key validation, safe storage, failure/retry tests |
| Certificate | Eligibility, canonical payload/hash, RSA-PSS/SHA-256 fixtures, PDF/QR metadata, tamper tests |
| Public verification | No login, minimal response, `VALID`/`EXPIRED`/`REVOKED`/`INVALID`, rate limiting |
| Offline sync | UUID idempotency, restart, retry, version conflict, explicit resolution, no silent overwrite |
| Audit/AI | Tamper-evident chain/redaction; optional AI remains advisory and human-reviewed |
