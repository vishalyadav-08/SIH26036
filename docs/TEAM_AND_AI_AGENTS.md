# Team and AI Agents

Ownership is by boundary. One task has one human owner and one implementation agent; reviewers may inspect but do not edit the same area concurrently.

## Team slots

### Team 1 — Project Lead / Architecture

Owns ADRs, PRD scope, documentation authority, milestone gates, legal/prototype wording, and cross-boundary decisions. Owned paths: `docs/**` and project-level README guidance. Reviews API/data/security changes.

### Team 2 — Backend / Domain

Owns the Python/Django/DRF modular monolith under `backend/**`: Django models/migrations, serializers, services, views, URLs, API tests, authentication integration, domain rules, notifications, and server-side sync. Does not own web UX, client storage, private keys, or undocumented API changes.

### Team 3 — Web Application

Owns the Next.js/React/TypeScript Business, Admin, and Public web routes under `frontend/src/app/app`, `frontend/src/app/admin`, and `frontend/src/app/verify`, plus web components and tests. Does not own backend authorization or field-client persistence.

### Team 4 — Field Client

Owns the current PWA field routes, Dexie/IndexedDB stores, service worker, camera/GPS UX, queue, and conflict UI. The same team evaluates or implements Flutter if ADR-022's readiness gate approves it. PWA and Flutter are sub-paths of one Field Client boundary; neither may redefine the API.

### Team 5 — Security / Crypto / Operations

Owns threat-model review, JWT/Argon2id review, certificate signing/verification, audit chain, evidence/storage controls, CORS/TLS/secret guidance, and security/performance test support. No private keys in clients or Git. Deployment automation is not currently present and may be added only through an approved task.

### Team 6 — QA / Data / AI

Owns synthetic fixtures, regression/API/E2E/accessibility/performance testing, acceptance reports, and optional advisory AI evaluation. AI cannot make a legal or workflow final decision.

## Coordination rules

- The Project Lead owns the canonical API/data contract decision; Backend implements it; Web, PWA, and Flutter consume it.
- Backend remains the security authority for auth, role, ownership, assignment, state transitions, certificate status, and sync acceptance.
- No two teams independently create endpoint semantics or duplicate domain logic.
- Cross-cutting work must name allowed files and dependencies in [TASK_BOARD.md](TASK_BOARD.md).
- Human review is mandatory for auth, ownership, files, public responses, offline sync, crypto, migrations, and architecture.

## AI process

Agents read the assigned task and canonical docs, inspect repository evidence, check dependencies and allowed files, make the smallest scoped change, run listed verification commands, and report files/results/risks. They do not infer requirements from `docs/archive/`. Every assignment uses [AI_TASK_TEMPLATE.md](AI_TASK_TEMPLATE.md) and [AI_AGENT_RULES.md](AI_AGENT_RULES.md).
