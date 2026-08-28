# Team and AI Agents

## 1. Operating model

The six team slots preserve ownership boundaries even if one person fills multiple slots. A task has one human owner slot and one implementation owner. Other agents may review but do not edit the same implementation area concurrently.

## 2. Team slots

### Team 1 — Project Lead / Architect

- **Responsibilities:** product decisions, ADRs, cross-document consistency, milestone gates, legal/prototype wording, priority.
- **Outputs:** ADRs, PRD decisions, freeze reports, approvals, release/demo sign-off.
- **Owned paths:** `docs/*`, root `README.md` for project-level guidance, cross-cutting review.
- **Dependencies:** all teams; receives API/data/security changes before approval.
- **Reviews:** architecture, scope, cross-module contracts, open decisions.
- **Prohibited changes:** feature implementation, unapproved stack/schema/API changes.

### Team 2 — Backend / Domain

- **Responsibilities:** Java/Spring modular monolith, domain rules, API, persistence, migrations, notifications, sync server behavior.
- **Outputs:** `services/api`, OpenAPI/contract alignment, backend tests and fixtures.
- **Owned paths:** `services/api/src/main/java/com/mapansetu`, `services/api/src/main/resources`, backend tests, backend README.
- **Dependencies:** ADRs, PRD, DATA_MODEL, API_CONTRACT, Security review.
- **Reviews:** Web/Field API usage, migration compatibility, state/ownership rules.
- **Prohibited changes:** frontend UX, private key exposure, undocumented endpoints, direct schema edits outside approved migration task.

### Team 3 — Web Frontend

- **Responsibilities:** Business/Admin/Public web UX, routes, forms, queries, accessibility, responsive design.
- **Outputs:** `apps/web`, shared UI/type requests, component/E2E tests.
- **Owned paths:** `apps/web`, web-specific tests; shared packages only through coordinated task.
- **Dependencies:** API_CONTRACT, DATA_MODEL, FRONTEND, packages/types/ui/config.
- **Reviews:** Backend DTO alignment, accessibility, security-sensitive rendering.
- **Prohibited changes:** backend state/authorization, field offline stores, undocumented routes.

### Team 4 — Field PWA

- **Responsibilities:** officer workflow, PWA shell, camera/GPS UX, Dexie local stores, queue, conflict UI.
- **Outputs:** `apps/field`, field tests, offline diagnostics.
- **Owned paths:** `apps/field`, field-specific tests; shared packages only through coordination.
- **Dependencies:** OFFLINE_APP, API_CONTRACT, DATA_MODEL, Backend sync contract, Security review.
- **Reviews:** backend sync semantics, storage/privacy, permission/error behavior.
- **Prohibited changes:** server authorization, certificate private keys, silent conflict resolution, alternative client technology.

### Team 5 — Security / Crypto / DevOps

- **Responsibilities:** threat model, JWT/Argon2id review, certificate signing/verification, audit chain, storage/TLS/CORS, CI/Compose/Nginx, ZAP/k6 support.
- **Outputs:** crypto fixtures, security checks, infrastructure configuration, findings and remediation guidance.
- **Owned paths:** `infra`, `.github`, security/crypto test support, relevant backend crypto modules with Backend coordination.
- **Dependencies:** ADRs, CRYPTOGRAPHY, TESTING_SECURITY, API_CONTRACT, deployment constraints.
- **Reviews:** all high-risk auth/file/crypto/deployment changes.
- **Prohibited changes:** inventing algorithms, placing secrets in Git, claiming legal signatures/absolute immutability, unreviewed production key custody.

### Team 6 — AI / Data / QA

- **Responsibilities:** synthetic data, test strategy, evaluation fixtures, regression/E2E/accessibility/performance, optional advisory AI.
- **Outputs:** `tests`, scripts/seed fixtures, QA reports, AI evaluation and fallback checks.
- **Owned paths:** `tests`, `scripts/seed`, QA artifacts; AI code only in an approved task.
- **Dependencies:** all canonical docs and stable API/data fixtures.
- **Reviews:** acceptance coverage, demo data privacy, AI non-decision behavior.
- **Prohibited changes:** real personal data, statutory rule invention, autonomous legal decision, fixing another team’s module without owner coordination.

## 3. Merge recommendations for smaller teams

- One developer may combine Teams 1 and 5 only with independent review of security/crypto changes.
- Teams 2 and 6 may share a person for backend tests, but domain ownership remains Team 2.
- Teams 3 and 4 may share frontend expertise, but web and offline stores remain separate task areas.
- The project lead must remain the final reviewer for cross-boundary changes.

## 4. AI-agent process

An AI agent reads the assigned task and relevant canonical docs, checks dependencies and allowed files, proposes a small change, writes tests, runs the listed verification commands, and reports files changed, tests, risks, and remaining decisions. It must not infer requirements from archived material or implement adjacent features “for completeness.”

Every task uses [AI_TASK_TEMPLATE.md](AI_TASK_TEMPLATE.md) and the rules in [AI_AGENT_RULES.md](AI_AGENT_RULES.md). Human review is mandatory.

