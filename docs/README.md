# MapanSetu Documentation

This directory is the active specification for MapanSetu (SIH26036), a prototype for the digital lifecycle of regulated weighing and measuring instruments. The repository currently contains a Django API scaffold and a Next.js web application with a browser field workflow.

## Architecture at a glance

```text
MapanSetu
|
+-- Web application       Next.js + React + TypeScript
|   +-- Business/admin/public routes
|   +-- Field PWA routes (current testing/fallback client)
|
+-- Backend API            Python + Django 6.1 + Django REST Framework
|   +-- Modular monolith under backend/
|   +-- PostgreSQL target; SQLite development fallback
|   +-- MinIO/S3-compatible object storage when configured
|
+-- Native field client    Flutter/Dart target, not present in this checkout
+-- docs/                   Active specification
+-- docs/archive/           Historical reference only
```

The architecture no longer uses Java, Spring Boot, or Maven. The React PWA is currently used for field workflow testing. Flutter is the target native field client if it is ready before the internal hackathon; otherwise the PWA remains the primary field demo and fallback path.

## Read in this order

1. [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) — accepted decisions and superseded history.
2. [PRD.md](PRD.md) — product scope and requirements.
3. [DATA_MODEL.md](DATA_MODEL.md) — canonical logical entities and states.
4. [API_CONTRACT.md](API_CONTRACT.md) — canonical `/api/v1` interface.
5. [TECH_STACK.md](TECH_STACK.md) — repository-confirmed technologies and commands.
6. [FRONTEND.md](FRONTEND.md), [OFFLINE_APP.md](OFFLINE_APP.md), [CRYPTOGRAPHY.md](CRYPTOGRAPHY.md), and [TESTING_SECURITY.md](TESTING_SECURITY.md).
7. Delivery, ownership, AI-agent, task, workflow, DoD, and demo documents.

## Authority rules

- Root `docs/*.md` files are active implementation guidance.
- `docs/archive/` is historical reference only and is never an implementation authority.
- If active documents conflict, resolve the conflict in this order: ADRs, PRD, data model, API contract, stack, frontend/offline/crypto/testing, then delivery/process documents.
- The API, logical data model, authorization rules, certificate trust model, and sync semantics are shared by Web, PWA, and Flutter. A field-client choice must not create a second business workflow.
- This documentation describes the intended product contract even where the current checkout is still scaffolded. Implementation status and open gaps are called out explicitly.

## Product boundary

MapanSetu coordinates business registration, instrument records, verification applications, assignment, scheduling, field inspection records, evidence, certificate lifecycle, public lookup, notifications, audit history, and re-verification. It does not perform physical statutory verification, grant legal approval, provide an authorized legal signature, or claim live government integration. Use synthetic data for the prototype.

## Repository map

```text
backend/                 Django project and domain apps
  root/                  settings, ASGI/WSGI, URL composition
  authentication/        auth boundary
  businesses/            business domain
  instruments/            instrument registry
  applications/          verification requests
  scheduling/            assignment/scheduling boundary
  inspections/            field inspection domain
  evidence/               binary evidence boundary
  certificates/           certificate boundary
  verification/           public verification boundary
  notifications/          in-product notifications
  audit/                  audit boundary
  sync/                   offline mutation boundary
frontend/                Next.js app for web and current field PWA
  src/app/app/           business routes
  src/app/admin/         administrator routes
  src/app/field/         current browser field workflow
  src/app/verify/        public verification route
  src/offline/           Dexie local schema and shared field types
  public/sw.js           current service worker
docs/                    active and historical documentation
```

## Local ports

| Component | Port | Evidence |
|---|---:|---|
| Next.js web/PWA | 3000 | `frontend/package.json`, frontend README |
| Django API | 8000 | `backend/root/settings.py`, root README |
| PostgreSQL | configured by `DATABASE_URI` | backend settings |
| MinIO/S3 | configured by `MINIO_ENDPOINT` | backend settings |

## Current implementation caveat

The backend app files and URL mounts are scaffolds: most `models.py`, `views.py`, `services.py`, and `tests.py` files do not yet implement the full contract. The frontend contains the current field PWA shell, Dexie persistence, service worker, mock sync adapter, and route structure. Do not treat a documented endpoint as implemented until the backend and contract tests prove it.
