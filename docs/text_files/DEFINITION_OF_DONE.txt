# Definition of Done

## Global DoD

A task is `DONE` only when:

- requirement and acceptance criteria are implemented;
- API contract and canonical data model are satisfied;
- validation, authorization, ownership, and error handling are present;
- tests pass at the appropriate unit/integration/component/E2E/security layer;
- no known critical/high defect remains, or an explicit project-lead risk acceptance exists;
- documentation, task board, migrations, and examples are updated;
- logs and metrics are appropriate and redact secrets;
- security review is complete for the risk level;
- pull request has human review and comments are resolved;
- integration with dependent modules is confirmed;
- verification commands and expected output are recorded in the task.

## Module DoD

| Module | Additional completion checks |
|---|---|
| Auth | Login/profile work; JWT expiry/rejection; Argon2id; no secret leakage; inactive user and rate-limit tests |
| Instrument | Canonical identity fields; duplicate and ownership rules; list/detail/passport; API and component tests |
| Application | Draft/submit/list/detail; every canonical transition; server-authoritative state; ownership tests |
| Scheduling | Assignment prerequisite; valid UTC schedule; conflict/retry behavior; admin-only tests |
| Inspection | Assigned officer boundary; checklist/readings/result; timestamps/GPS availability; completion tests |
| Evidence | MIME/size/object-key validation; safe storage; hash where required; upload/failure/retry tests |
| Certificate | Eligibility; canonical payload/hash; RSA-PSS/SHA-256 verification; PDF/QR metadata; tamper tests |
| Public Verification | Single route/API; no login; `VALID`/`EXPIRED`/`REVOKED`/`INVALID`; minimal data/rate-limit tests |
| Offline Sync | Dexie stores; restart; UUID idempotency; `FAILED`/`CONFLICT`; explicit resolution; no silent overwrite |
| AI | Optional/advisory; confidence/explanation/fallback; human review; core works when disabled; evaluation report |
| Dashboard | Documented API data; pagination/filters; accessible chart summaries; loading/empty/error tests |
| Audit | Actor/action/entity/time; hash-chain fields; redaction; recomputation detects tampering; admin-only viewer |

