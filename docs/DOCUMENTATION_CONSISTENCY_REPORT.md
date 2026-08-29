# Documentation Consistency Report

**Review date:** 2026-08-30
**Scope:** Active root `docs/*.md`; archive reviewed as historical reference only.
**Application code changed:** NONE.

## 1. Architecture migration summary

| Area | Old documented architecture | Repository-confirmed active architecture |
|---|---|---|
| Backend | Java + Spring Boot + Maven modular monolith | Python + Django 6.1 + Django REST Framework 3.18 modular monolith under `backend/` |
| Web | React + TypeScript + Vite/React Router | Next.js 16.3.3 App Router + React 19.2.8 + TypeScript + pnpm |
| Field | React PWA presented as mandatory final client | React field PWA in the current Next.js app is testing/fallback; Flutter/Dart is the native target if ready before the internal hackathon |
| Persistence | PostgreSQL + Flyway | PostgreSQL target via Django ORM/migrations; SQLite fallback when `DATABASE_URI` is absent |
| Object storage | MinIO | MinIO/S3-compatible through `django-storages`/boto3 when `MINIO_ENDPOINT` is configured |
| Auth | Spring-specific JWT description | Django/DRF auth boundary with SimpleJWT configured; Argon2id first in Django password hashers |

## 2. Repository evidence

- `backend/manage.py`, `backend/root/settings.py`, `backend/root/urls.py`, Django app directories, and `backend/requirements.txt` establish the backend stack.
- `frontend/package.json`, `frontend/next.config.ts`, `frontend/src/app/**`, and `pnpm-lock.yaml` establish the Next.js frontend.
- `frontend/src/offline/db.ts`, `frontend/src/offline/types.ts`, `frontend/src/services/field/**`, and `frontend/public/sw.js` establish the current PWA offline path.
- No Flutter/Dart project, Dockerfile, Compose file, Nginx config, CI workflow, or deployed-infrastructure manifest is present.
- Backend domain models/views/services/tests and migrations are largely scaffolds; documentation now labels intended contract versus implementation status.

## 3. Obsolete-term scan classification

The following command was run against active root documents:

```text
rg -n -i --glob "*.md" --glob "!docs/archive/**" "Java|Java 21|Spring Boot|Spring|Maven|pom.xml|JPA|Hibernate|com.mapansetu|Spring Security|Flyway|React Field PWA|native client|Flutter|Dart" docs
```

Classification of remaining matches:

| Term/category | Classification | Reason |
|---|---|---|
| Java, Spring Boot, Maven | EXPLICIT EXCLUSION / HISTORICAL | Retained only in migration ADR, AI prohibitions, changelog, or report to prevent reintroduction and explain the change. |
| JPA, Hibernate, `com.mapansetu`, `pom.xml`, Flyway | EXPLICIT EXCLUSION / HISTORICAL | Retained only as superseded references or search/report vocabulary; not active implementation instructions. |
| Spring Security | HISTORICAL / EXPLICIT EXCLUSION | Superseded in ADR-008 and replaced by Django/SimpleJWT wording in active operational docs. |
| `React Field PWA` | ACTIVE DESCRIPTION | Used only to identify the current testing/fallback field client. |
| `native client` | ACTIVE STRATEGY | Refers to the conditional Flutter target, never an unverified implemented dependency. |
| Flutter, Dart | ACTIVE CONDITIONAL / OPEN DECISION | Target strategy and readiness task only; no package or implementation is invented. |

No obsolete technology remains as an accidental active implementation instruction.

## 4. Cross-document consistency matrix

Legend: `ALIGNED` = explicitly consistent; `N/A` = intentionally not a primary concern; `CONFLICT` = unresolved inconsistency.

| Area | README | PRD | Architecture | ADR | Tech Stack | API | Data Model | Frontend | Offline | Testing | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Backend stack | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | N/A | N/A | N/A | ALIGNED | ALIGNED |
| Web stack | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | N/A | N/A | ALIGNED | N/A | ALIGNED | ALIGNED |
| Field strategy | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED |
| Flutter | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | N/A | N/A | ALIGNED | ALIGNED | ALIGNED |
| PWA fallback | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | N/A | ALIGNED | ALIGNED | ALIGNED | ALIGNED |
| API routes | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED |
| Data entities | ALIGNED | ALIGNED | ALIGNED | ALIGNED | N/A | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED |
| Offline states | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | N/A | ALIGNED | ALIGNED | ALIGNED |
| Cryptography | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | N/A | N/A | ALIGNED | ALIGNED |
| Security | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED | ALIGNED |

No `CONFLICT` remains in the active matrix.

## 5. Domain and security invariants checked

- Roles remain exactly `ADMIN`, `OFFICER`, and `BUSINESS`; public verification is unauthenticated.
- Application states remain `DRAFT`, `SUBMITTED`, `ASSIGNED`, `SCHEDULED`, `INSPECTION_IN_PROGRESS`, `COMPLETED`, `REJECTED`, and `CANCELLED`.
- Inspection results remain `PASS`, `FAIL`, and `REQUIRES_CORRECTION`.
- Certificate states remain `ACTIVE`, `EXPIRED`, and `REVOKED`.
- Offline states remain `LOCAL_DRAFT`, `READY_TO_SYNC`, `SYNCING`, `SYNCED`, `FAILED`, and `CONFLICT`.
- Backend authority remains responsible for auth, authorization, ownership, assignment, transitions, certificates, sync acceptance, conflict resolution, and public verification.
- SHA-256, RSA-2048, RSA-PSS/SHA-256, Argon2id, audit hash chain, backend-only private key, and QR-as-discovery-only intent remain unchanged.

## 6. Files changed

`README.md`, `PRD.md`, `ARCHITECTURE.md`, `ARCHITECTURE_DECISIONS.md`, `TECH_STACK.md`, `DATA_MODEL.md`, `API_CONTRACT.md`, `FRONTEND.md`, `OFFLINE_APP.md`, `CRYPTOGRAPHY.md`, `TESTING_SECURITY.md`, `EXECUTION_PLAN.md`, `TEAM_AND_AI_AGENTS.md`, `AI_TASK_TEMPLATE.md`, `AI_AGENT_RULES.md`, `DEVELOPMENT_WORKFLOW.md`, `DEFINITION_OF_DONE.md`, `TASK_BOARD.md`, `DEMO_PLAN.md`, `DOCUMENTATION_CONSISTENCY_REPORT.md`, `DOCUMENTATION_CHANGELOG.md`, and `archive/README.md`.

## 7. Files created

None. Existing active filenames were rewritten in place.

## 8. Open decisions

- Whether Flutter reaches the readiness gate before the internal hackathon.
- Flutter local persistence/state-management/device packages and project path, pending approval and a dedicated ADR.
- Backend implementation of currently scaffolded models, views, services, auth, migrations, sync, evidence, certificates, and tests.
- Exact production key custody, object-storage deployment, notification delivery, CI/CD, and deployment environment.
- The frontend has no committed Playwright configuration or test script; test harness integration remains an implementation task.

## 9. Final status

**READY for documentation migration completion.** Implementation work remains governed by the task board and open decisions above.

## 10. Verification performed

- `backend/venv/Scripts/python.exe manage.py check` — passed with no issues.
- `backend/venv/Scripts/python.exe manage.py test` — exited successfully; reported `0 tests` because current backend test modules are scaffolds.
- Relative-link scan across active root docs — no broken relative links.
- `git diff --check` — no whitespace errors; Git reported only its normal LF/CRLF conversion warnings.
- Direct frontend ESLint invocation — reports 2 existing errors and 14 warnings in application source; no source was changed because this migration is documentation-only.
- Frontend Vitest/Next build — not completed: the checkout's `node_modules` lacks Vitest and pnpm attempted a non-interactive dependency refresh, which aborted before scripts ran.
- Changed-path scan — all changes are under `docs/`; no application code changed.
