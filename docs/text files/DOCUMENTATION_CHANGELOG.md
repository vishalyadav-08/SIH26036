# Documentation Changelog

## 2026-08-28 — Documentation finalization

### Created

- `docs/README.md`
- `docs/PRD.md`
- `docs/TASK_BOARD.md`
- `docs/DEVELOPMENT_WORKFLOW.md`
- `docs/DEFINITION_OF_DONE.md`
- `docs/AI_TASK_TEMPLATE.md`

### Rewritten

- `docs/ARCHITECTURE_DECISIONS.md` — completed ADR-001 through ADR-020.
- `docs/ARCHITECTURE.md` — added context/container/component, trust, sync, auth, audit, deployment, security, ownership, and extension views.
- `docs/TECH_STACK.md` — froze stack, exclusions, version/build policy, and ports.
- `docs/DATA_MODEL.md` — added canonical fields, relationships, constraints, lifecycle, ownership, and separated state enums.
- `docs/API_CONTRACT.md` — added endpoint-level auth, role, request/response, errors, validation, pagination, examples, and idempotency.
- `docs/FRONTEND.md` — expanded into web PRD, route/screen contract, design system, state/API/security/accessibility architecture.
- `docs/OFFLINE_APP.md` — expanded into field PWA PRD, screen contract, IndexedDB model, sync/conflict/evidence/device/security specification.
- `docs/CRYPTOGRAPHY.md` — defined threat model, canonical certificate pipeline, RSA-PSS/SHA-256 verification, QR boundary, key handling, and audit chain.
- `docs/TESTING_SECURITY.md` — added test layers, critical acceptance tests, security controls, review gates, performance, observability, and AI evaluation requirements.
- `docs/EXECUTION_PLAN.md` — replaced the six-phase outline with dependency-aware M0–M13 roadmap and gates.
- `docs/TEAM_AND_AI_AGENTS.md` — defined six team slots, ownership boundaries, merge recommendations, and AI process.
- `docs/DEMO_PLAN.md` — added repeatable synthetic end-to-end flow, backup paths, and non-claim guardrails.
- `docs/DOCUMENTATION_CONSISTENCY_REPORT.md` — recorded findings, classifications, cross-document checks, and open decisions.

### Corrected

- Removed active references to the nonexistent `MASTER_PROMPT.md`.
- Removed non-canonical `PENDING_SYNC` terminology.
- Centralized public verification at `/verify/:certNo` and `GET /api/v1/certificates/verify?certNo=...`.
- Standardized roles to `ADMIN`, `OFFICER`, `BUSINESS`; public access is unauthenticated.
- Standardized application states, inspection results, certificate statuses, offline states, algorithms, ports, and repository paths.
- Made prototype, synthetic-data, statutory, government-integration, legal-signature, and absolute-immutability limitations explicit.

## Scope note

This changelog covers documentation only. No web, field, backend, authentication, certificate-signing, AI, or offline-sync feature was implemented by this finalization task.

