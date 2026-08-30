# Execution Plan

The plan follows the repository-confirmed Django + Next.js + Flutter architecture and preserves one client-independent domain workflow.

## Milestone Gates

| Milestone | Goal | Owners | Exit gate |
|---|---|---|---|
| M0 | Documentation and contract freeze | Architecture | ADRs, PRD, data, API, security, task board aligned; Flutter official; PWA testing-only |
| M1 | Backend bootstrap | Backend + Security | `python manage.py check` and backend test baseline pass; app URL mounts verified |
| M2 | Web bootstrap | Web | `pnpm lint`, `pnpm build`, and frontend test baseline pass |
| M3 | Auth, roles, and ownership | Backend + Security | JWT, Argon2id, role matrix, ownership/assignment negative tests |
| M4 | Business and instrument registry | Backend + Web | CRUD, duplicate, passport, and ownership contract tests |
| M5 | Applications, assignment, and scheduling | Backend + Web | Canonical transitions, assignment history, scheduling conflict rules |
| M6 | Flutter field foundation | Field + Backend | `flutter pub get`; auth flow connects to API; package ADRs filed; baseline `flutter test` passes |
| M7 | Flutter offline workflow | Field + Backend | Offline inspection, evidence capture, sync queue, and restart behavior verified |
| M8 | Offline sync server | Backend + QA | `/api/v1/sync` idempotency, version conflict, retry, and audit behavior verified |
| M9 | React PWA testing path | Field | PWA online/offline flow, Dexie persistence, evidence, queue UI — testing/prototype only |
| M10 | Evidence and object storage | Backend + Security | Evidence validation, MIME/size, object-key, storage, failure/retry tests |
| M11 | Certificate, crypto, and public verification | Backend + Security + Web | Hash/signature/status/PDF/QR/public minimization tests |
| M12 | Notifications, audit, dashboards, hardening | Backend + Web + QA | Security, accessibility, performance, and regression gates pass |
| M13 | Demo readiness | All | Flutter field path rehearsed; synthetic reset works; limitations stated |

> [!IMPORTANT]
> There is **no "Is Flutter ready?" decision gate**. Flutter is the official field application and is present in the repository at `flutter_field_app/`. M6 and M7 are active Flutter implementation milestones, not conditional evaluation gates.

## Dependency and Delivery Rules

- M0 precedes implementation. M1, M2, and M6 can proceed in parallel after M0.
- Auth/ownership precedes every protected domain feature.
- API and data contract changes update all dependent docs and tasks before implementation.
- Certificate issuance depends on a completed inspection and security fixtures; public verification depends on certificate semantics.
- React PWA testing (M9) is parallel support work — it does not block Flutter milestones.
- No milestone may claim Docker, Compose, Nginx, CI, or a deployed service until those files exist and are tested.

## Field Application Plan

The Flutter field application is the **official field client**. Implementation follows a parallel track with backend development.

```text
M0 Documentation / architecture freeze
     │
     ├── M1 Backend bootstrap
     │     ├── M3 Auth / roles / ownership
     │     │     ├── M4 Registry
     │     │     │     └── M5 Applications / assignment / scheduling
     │     │     └── M8 Offline sync server
     │     └── M10 Evidence + object storage
     │
     ├── M2 Web bootstrap
     │     └── (Web routes proceed in parallel with backend milestones)
     │
     ├── M6 Flutter field foundation         ← Active milestone
     │     └── M7 Flutter offline workflow   ← Active milestone
     │
     ├── M9 React PWA testing path           ← Testing/prototype parallel support
     │
     └── M11 Certificate / crypto / public verification
           └── M12 Notifications / audit / hardening
                 └── M13 Demo readiness
```

The React PWA (M9) remains available as a technical fallback while Flutter milestones progress. It must not become a substitute for Flutter implementation milestones.

## Verification Baseline

```bash
# Backend
cd backend
python manage.py check
python manage.py test

# Web frontend
cd frontend
pnpm lint
pnpm exec vitest run
pnpm build

# Flutter field application
cd flutter_field_app
flutter pub get
flutter test
```

Commands for a milestone must be recorded with expected output in its task board entry.
