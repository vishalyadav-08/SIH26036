# Team and AI Agents

Ownership is by boundary. One task has one human owner and one implementation agent; reviewers may inspect but do not edit the same area concurrently.

## Team Slots

### Team 1 — Project Lead / Architecture

Owns ADRs, PRD scope, documentation authority, milestone gates, legal/prototype wording, and cross-boundary decisions. Owned paths: `docs/**` and project-level README guidance. Reviews API/data/security changes.

### Team 2 — Backend / Domain

Owns the Python/Django 6.1/DRF modular monolith under `backend/**`: Django models/migrations, serializers, services, views, URLs, API tests, authentication integration, domain rules, notifications, and server-side sync. Does not own web UX, client storage, private keys, or undocumented API changes.

### Team 3 — Web Application

Owns the Next.js/React/TypeScript Business, Admin, and Public web routes under `frontend/src/app/app`, `frontend/src/app/admin`, and `frontend/src/app/verify`, plus web components and tests. Does not own backend authorization or field-client persistence.

### Team 4 — Flutter Field Application

**Owns the official Flutter field application** at `flutter_field_app/`: Dart architecture, offline-first design, local persistence (once ADR approved), sync queue, conflict handling, camera/GPS integration, secure storage, and field testing. Also maintains the React field PWA at `frontend/src/app/field/` as the testing/prototype client during Flutter development. Neither client may redefine the API.

Field client ownership:
- **Primary:** Flutter Field Application (`flutter_field_app/`) — official production client
- **Secondary:** React Field PWA (`frontend/src/app/field/`) — testing/prototype support only

### Team 5 — Security / Crypto / Operations

Owns threat-model review, JWT/Argon2id review, certificate signing/verification, audit chain, evidence/storage controls, CORS/TLS/secret guidance, and security/performance test support. No private keys in any client or Git. Deployment automation is not currently present and may be added only through an approved task.

### Team 6 — QA / Data / AI

Owns synthetic fixtures, regression/API/E2E/accessibility/performance testing, acceptance reports, and optional advisory AI evaluation. AI cannot make a legal or workflow final decision.

## Field Client Summary

| Client | Location | Role |
|---|---|---|
| Flutter Field App | `flutter_field_app/` | **Official field application** — production target |
| React Field PWA | `frontend/src/app/field/` | **Testing / prototype client** — not final field architecture |

Both clients use the same `/api/v1/` API contract. Neither creates separate business logic.

## Coordination Rules

- The Project Lead owns the canonical API/data contract decision; Backend implements it; Web, Flutter, and React PWA consume it.
- Backend remains the security authority for auth, role, ownership, assignment, state transitions, certificate status, and sync acceptance.
- No two teams independently create endpoint semantics or duplicate domain logic.
- Cross-cutting work must name allowed files and dependencies in [TASK_BOARD.md](TASK_BOARD.md).
- Human review is mandatory for auth, ownership, files, public responses, offline sync, crypto, migrations, and architecture.

## AI Process

Agents read the assigned task and canonical docs, inspect repository evidence, check dependencies and allowed files, make the smallest scoped change, run listed verification commands, and report files/results/risks. They do not infer requirements from `docs/reference/`. Every assignment uses [AI_TASK_TEMPLATE.md](AI_TASK_TEMPLATE.md) and [AI_AGENT_RULES.md](AI_AGENT_RULES.md).

Key agent facts:
- **Flutter = official field client** (present at `flutter_field_app/`)
- **React PWA = testing/prototype client** (present at `frontend/src/app/field/`)
- **Java/Spring Boot/Maven = RETIRED** — never use in any task
- **`docs/reference/` = historical, not authoritative**
