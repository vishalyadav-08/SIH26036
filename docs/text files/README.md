# MapanSetu Documentation

This directory is the active engineering specification for MapanSetu (SIH26036). It describes a documentation-frozen modular-monolith prototype for managing the lifecycle of regulated weighing and measuring instruments.

## Read first

1. [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) — accepted architectural decisions.
2. [PRD.md](PRD.md) — product scope and requirements.
3. [DATA_MODEL.md](DATA_MODEL.md) — canonical entities, fields, ownership, and states.
4. [API_CONTRACT.md](API_CONTRACT.md) — canonical `/api/v1` interface.
5. [TECH_STACK.md](TECH_STACK.md) — frozen technology, versions policy, ports, and commands.

The remaining documents provide the web UX, field PWA/offline contract, cryptography, test strategy, delivery plan, team boundaries, AI-agent process, and demo plan.

## Source-of-truth rules

- Documents in this directory are active implementation guidance.
- `docs/archive/` is historical reference only; it is not an implementation authority.
- If active documents conflict, resolve the conflict in this order: ADRs, PRD, data model, API contract, stack, frontend/offline/crypto/testing, execution/team/task/workflow/DoD/demo documents.
- Database structure will be implemented later through Flyway migrations. This documentation intentionally defines a logical data model, not a competing SQL schema.
- The current repository is in M0, Documentation Freeze. Application features are not part of this task.

## Frozen product boundary

MapanSetu digitizes registration, verification applications, assignment, scheduling, field inspection records, evidence, decisions, certificate lifecycle, public lookup, notifications, audit history, and re-verification workflow. It does not itself perform physical statutory verification, grant legal approval, provide an authorized legal signature, or claim live government integration.

## Canonical repository layout

```text
apps/web                 React web portal
apps/field               React field PWA
services/api             Java/Spring modular monolith
packages/types           shared TypeScript domain/API types
packages/ui              shared UI primitives
packages/config          shared frontend configuration
infra                    Docker/Nginx deployment support
scripts                  development and synthetic-data utilities
tests/e2e                Playwright end-to-end tests
docs                     active and archived documentation
```

## Port map

| Component | Port |
|---|---:|
| Web | 5173 |
| Field PWA | 5174 |
| API | 8080 |
| PostgreSQL | 5432 |
| MinIO API | 9000 |
| MinIO console | 9001 |

