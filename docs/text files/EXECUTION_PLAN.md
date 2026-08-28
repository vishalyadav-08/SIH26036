# Execution Plan

This is a dependency-aware roadmap from documentation freeze to SIH prototype hardening. Implementation has not begun as part of this documentation task.

## Milestone gates

| ID | Goal | Dependencies | Owner | Deliverables | Acceptance/test gate |
|---|---|---|---|---|---|
| M0 | Freeze coherent requirements | None | Project Lead/Architect | Active docs, ADRs, report, task board | Cross-document checks pass; no feature code changed |
| M1 | Bootstrap repository/tooling | M0 | Backend, Web, Field, DevOps | npm workspaces, Maven baseline, Compose, CI skeleton | Builds/typechecks/health checks run on frozen ports |
| M2 | Authentication and RBAC | M1 | Backend + Security | users, roles, JWT, Argon2id, ownership guards | Auth/RBAC/ownership tests pass |
| M3 | Business and instrument registry | M2 | Backend + Web | business/profile/instrument APIs and UI | CRUD/duplicate/ownership tests pass |
| M4 | Verification applications | M3 | Backend + Web | application draft/submit/list/detail/state rules | Every application transition test passes |
| M5 | Assignment and scheduling | M4 | Backend + Web | officer list, assignment, schedules, notifications | Unauthorized/conflict/schedule tests pass |
| M6 | Online field inspection | M5 | Backend + Field | inspection, checklist, readings, evidence, decision | Online officer E2E and file-security tests pass |
| M7 | Offline field workflow | M6 | Field + Backend | PWA shell, Dexie stores, queue, sync/conflict | Restart/airplane/duplicate/conflict tests pass |
| M8 | Certificate/crypto/QR | M6; M7 for offline decision path | Backend + Security | canonical payload, hash/signature, PDF, QR | Tamper/signature/status tests pass |
| M9 | Public verification | M8 | Web + Backend | landing/result page and public API | VALID/EXPIRED/REVOKED/INVALID E2E and minimization pass |
| M10 | Dashboards/notifications/audit | M5, M8, M9 | Backend + Web + Security | admin views, expiry, audit chain UI | Metrics, audit, notification authorization tests pass |
| M11 | Integration hardening | M1–M10 | QA + Security/DevOps | full test suite, ZAP, k6, accessibility, runbook | No unresolved critical/high defect; DoD complete |
| M12 | AI enhancements | M11; explicit product/security approval | AI/Data + QA | advisory OCR/extraction/quality proof-of-concept | Human review, confidence, fallback, no-decision tests pass |
| M13 | Final demo/SIH hardening | M11; M12 optional | All teams + Project Lead | seeded synthetic demo, rehearsal, limitations script | Demo plan executes without false claims; release review signed |

## Milestone detail

### M0 — Documentation Freeze

- **Tasks:** DOC-001 through DOC-006 in [TASK_BOARD.md](TASK_BOARD.md).
- **AI involvement:** Documentation agent may draft; human architect owns acceptance.
- **Deliverables:** This active set, archive boundary, consistency report/changelog.
- **Acceptance:** Required files exist; canonical roles/states/routes/algorithms agree; no application feature implementation.
- **Test gate/DoD:** Repository scans and cross-document validation in the report pass.

### M1 — Repository Bootstrap

- **Tasks:** BOOT-001 through BOOT-004.
- **AI involvement:** Agents may scaffold only assigned files and tests.
- **Deliverables:** Workspace/toolchain, service containers, baseline CI, port map.
- **Acceptance:** Web/field build, API test, Compose dependencies, and CI checks are reproducible.
- **Test gate/DoD:** No undocumented dependency or port; global DoD.

### M2 — Authentication & RBAC

- **Tasks:** AUTH-001 through AUTH-004.
- **AI involvement:** Backend/security agents implement with tests and review.
- **Deliverables:** Login/profile, Argon2id, JWT validation, role/ownership guards.
- **Acceptance:** Critical auth/RBAC tests in `TESTING_SECURITY.md` pass.
- **Test gate/DoD:** Unit, integration, API, and negative authorization tests.

### M3 — Business + Instrument Registry

- **Tasks:** REG-001 through REG-004.
- **AI involvement:** Backend and Web agents work against API contract; shared types reviewed.
- **Deliverables:** Business/instrument data paths, responsive screens, passport read model.
- **Acceptance:** Synthetic business can register and retrieve an instrument without cross-owner access.
- **Test gate/DoD:** API/component/E2E and duplicate identity tests.

### M4 — Verification Applications

- **Tasks:** APP-001 through APP-004.
- **AI involvement:** Domain agent owns state machine; Web agent owns screens.
- **Deliverables:** Draft/submit/list/detail/timeline.
- **Acceptance:** All canonical transitions and rejection/cancellation rules are backend-enforced.
- **Test gate/DoD:** Transition matrix and ownership tests.

### M5 — Assignment + Scheduling

- **Tasks:** OPS-001 through OPS-004.
- **AI involvement:** Backend/API agent and Web admin agent; QA writes negative tests.
- **Deliverables:** Officer list, queue, assignment, schedules, notifications.
- **Acceptance:** Only eligible admin can assign/schedule; assigned case visible to officer.
- **Test gate/DoD:** Concurrent assignment/schedule and notification recipient tests.

### M6 — Online Field Inspection

- **Tasks:** FIELD-001 through FIELD-005.
- **AI involvement:** Field agent implements UI; backend agent implements API; Security reviews evidence.
- **Deliverables:** Online field routes, checklist, readings, evidence, decision.
- **Acceptance:** Assigned officer completes an online synthetic inspection and server stores canonical records.
- **Test gate/DoD:** Playwright happy path plus file/permission/error tests.

### M7 — Offline Field Workflow

- **Tasks:** OFF-001 through OFF-006.
- **AI involvement:** Field agent may implement Dexie/service worker; backend agent owns sync contract.
- **Deliverables:** Cached assigned cases, local drafts/blobs, queue, retry/conflict UI.
- **Acceptance:** Airplane-mode workflow survives restart and sync replay is idempotent.
- **Test gate/DoD:** Offline test matrix and no-silent-overwrite review.

### M8 — Certificate + Cryptography + QR

- **Tasks:** CERT-001 through CERT-005.
- **AI involvement:** Security/crypto agent implements helpers with fixtures; backend owns issuance transaction.
- **Deliverables:** Certificate payload/hash/signature/PDF/QR metadata.
- **Acceptance:** Changed payload fails verification; private key is not exposed; prototype limitations are visible.
- **Test gate/DoD:** Deterministic hash/signature/tamper tests and artifact access tests.

### M9 — Public Verification

- **Tasks:** PUB-001 through PUB-003.
- **AI involvement:** Web and API agents implement only the single public route/API.
- **Deliverables:** `/` and `/verify/:certNo` UX, minimal response, rate limit.
- **Acceptance:** Four public states are distinct and no login is needed.
- **Test gate/DoD:** Public E2E, privacy, rate-limit, and invalid-input tests.

### M10 — Dashboards + Notifications + Audit

- **Tasks:** OPS-005 through OPS-007.
- **AI involvement:** Web dashboard agent and security/audit agent; no autonomous decisions.
- **Deliverables:** Admin metrics, expiry monitoring, notification views, audit viewer/hash validation.
- **Acceptance:** Metrics are traceable to API data; audit events show chain fields; no secret leakage.
- **Test gate/DoD:** API/component/security tests.

### M11 — Integration Testing + Hardening

- **Tasks:** QA-001 through QA-005.
- **AI involvement:** QA agents may add tests/fixtures; fixes remain with owning team.
- **Deliverables:** CI matrix, ZAP report, k6 baseline, accessibility findings, release checklist.
- **Acceptance:** Critical tests pass and critical/high vulnerabilities are closed or explicitly accepted.
- **Test gate/DoD:** Global DoD and module DoD all pass.

### M12 — AI Enhancements

- **Tasks:** AI-001 through AI-003.
- **AI involvement:** AI/Data team owns advisory feature; officer decision remains human.
- **Deliverables:** Optional OCR/extraction/image-quality demo with confidence/explanation/fallback.
- **Acceptance:** Core workflow remains fully functional when AI is disabled.
- **Test gate/DoD:** Evaluation, privacy, fallback, and non-decision tests.

### M13 — Final Demo / SIH Hardening

- **Tasks:** DEMO-001 through DEMO-003.
- **AI involvement:** Agents may prepare synthetic seed/reset scripts and test rehearsal; project lead approves narrative.
- **Deliverables:** Repeatable demo environment, synthetic data, limitations script, tamper demonstration.
- **Acceptance:** [DEMO_PLAN.md](DEMO_PLAN.md) completes with explicit prototype labels and no fake claims.
- **Test gate/DoD:** Full smoke suite, reset/rehearsal, human sign-off.

## Dependency rules

No milestone may skip its predecessor’s acceptance gate. API, data-model, crypto, and security changes update the relevant documents before code review. AI work is optional and cannot block the core MVP except where its presence changes security/privacy behavior.

