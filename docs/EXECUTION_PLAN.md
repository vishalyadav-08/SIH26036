# Execution Plan

The plan follows the repository-confirmed Django + Next.js architecture and preserves one client-independent domain workflow.

## Milestone gates

| Milestone | Goal | Owners | Exit gate |
|---|---|---|---|
| M0 | Documentation and contract freeze | Architecture | ADRs, PRD, data, API, security, task board aligned |
| M1 | Backend bootstrap | Backend + Security | `python manage.py check` and backend test baseline pass; app URL mounts verified |
| M2 | Web bootstrap | Web | `pnpm lint`, `pnpm build`, and frontend test baseline pass |
| M3 | Auth, roles, and ownership | Backend + Security | JWT, Argon2id, role matrix, ownership/assignment negative tests |
| M4 | Business and instrument registry | Backend + Web | CRUD, duplicate, passport, and ownership contract tests |
| M5 | Applications, assignment, and scheduling | Backend + Web | Canonical transitions, assignment history, scheduling conflict rules |
| M6 | Field PWA testing path | Field + Backend | Online/offline field workflow, Dexie persistence, evidence, queue UI |
| M7 | Offline sync server | Backend + QA | Idempotency, version conflict, retry, and audit behavior verified |
| M8 | Field Client Decision Gate | Architecture + Field | Record whether Flutter is ready before internal hackathon |
| M9 | Flutter native path if approved | Field + Security | Approved packages/ADR, common contract tests, mobile lifecycle/offline checks |
| M10 | Certificate, crypto, and public verification | Backend + Security + Web | Hash/signature/status/PDF/QR/public minimization tests |
| M11 | Notifications, audit, dashboards, hardening | Backend + Web + QA | Security, accessibility, performance, and regression gates pass |
| M12 | Demo readiness | All | Preferred or fallback field path rehearsed, synthetic reset works, limitations stated |

## Field Client Decision Gate

Before the internal hackathon, ask whether Flutter implementation is ready:

```text
YES -> Flutter becomes the primary demo field app; React PWA remains testing/fallback.
NO  -> React PWA remains the primary field demo; Flutter remains future/native target.
```

This decision cannot change API routes, logical entities, state enums, certificate trust, authentication, authorization, or sync semantics.

## Dependency and delivery rules

- M0 precedes implementation. M1/M2 can proceed in parallel after M0.
- Auth/ownership precedes every protected domain feature.
- API and data contract changes update all dependent docs and tasks before implementation.
- Certificate issuance depends on a completed inspection and security fixtures; public verification depends on certificate semantics.
- Flutter work is conditional and must not block the PWA testing path.
- No milestone may claim Docker, Compose, Nginx, CI, or a deployed service until those files exist and are tested.

## Verification baseline

```bash
cd backend; python manage.py check; python manage.py test
cd ../frontend; pnpm lint; pnpm exec vitest run; pnpm build
```

Commands for a milestone must be recorded with expected output in its task board entry.
