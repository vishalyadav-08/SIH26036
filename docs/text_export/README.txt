# MapanSetu Documentation

This directory is the active specification for **MapanSetu** (SIH26036), a prototype for the digital lifecycle of regulated weighing and measuring instruments.

> [!IMPORTANT]
> `docs/reference/` contains historical and non-active material. It is **not** an implementation authority.
> Active architecture is defined only by the Markdown files directly under `docs/`.

## Architecture at a glance

```
MapanSetu
│
├── React Web Application       Next.js 16.3.3 + React 19.2.8 + TypeScript 5
│   ├── Business portal
│   ├── Administrator portal
│   └── Public verification
│
├── Backend API                 Python + Django 6.1 + Django REST Framework 3.18
│   ├── Modular monolith under backend/
│   ├── PostgreSQL (target); SQLite development fallback
│   ├── MinIO/S3-compatible object storage
│   └── SimpleJWT authentication
│
├── Flutter Field Application   Flutter + Dart SDK ^3.13.2   [OFFICIAL FIELD APP]
│   ├── flutter_field_app/  (present in repository)
│   ├── Offline-first inspection workflow
│   ├── Local persistence + sync queue
│   └── Camera, GPS, evidence capture
│
├── React Field PWA             Next.js/React field routes    [TESTING / PROTOTYPE ONLY]
│   ├── frontend/src/app/field/
│   ├── Dexie/IndexedDB + service worker
│   └── Used for field workflow testing and prototype validation
│
└── docs/                       Active specification (this directory)
    └── reference/              Historical/non-active material — NOT authoritative
```

**The official field application is a Flutter/Dart mobile application** (`flutter_field_app/`).

The React field PWA is retained only as a testing/prototype client and is **not** the final field application.

## Product

**MapanSetu** coordinates business registration, instrument records, verification applications, officer assignment and scheduling, field inspection, evidence capture, certificate generation, public certificate lookup, expiry monitoring, and re-verification. It does not perform physical statutory verification, grant legal approval, provide an authorized legal signature, or claim live government integration. Use synthetic data for the prototype.

## Architecture

```
┌─────────────────────┐
│   React Web App     │
│  Business + Admin   │
└──────────┬──────────┘
           │ HTTPS / API
           ▼
┌─────────────────────┐
│    Backend API      │
│  Django 6.1 + DRF   │
└──────────┬──────────┘
           │
  ┌────────┴──────────┐
  ▼                   ▼
PostgreSQL       MinIO / S3
(System of      Object Storage
  record)

           ▲
           │ HTTPS / API
┌──────────┴──────────┐
│  Flutter Field App  │
│       Dart          │
│  OFFICIAL FIELD APP │
└─────────────────────┘

React Field PWA → Backend API
[TESTING / PROTOTYPE CLIENT ONLY]
```

## Historical documentation

```
docs/reference/
```

contains historical/non-active material and **must not** be treated as architecture authority. Agents must not use `docs/reference/**` as an implementation source.

## Read in this order

1. [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) — final accepted decisions; superseded history.
2. [PRD.md](PRD.md) — product scope and requirements.
3. [DATA_MODEL.md](DATA_MODEL.md) — canonical logical entities and states.
4. [API_CONTRACT.md](API_CONTRACT.md) — canonical `/api/v1` interface.
5. [TECH_STACK.md](TECH_STACK.md) — repository-confirmed technologies and commands.
6. [FRONTEND.md](FRONTEND.md), [OFFLINE_APP.md](OFFLINE_APP.md), [CRYPTOGRAPHY.md](CRYPTOGRAPHY.md), [TESTING_SECURITY.md](TESTING_SECURITY.md).
7. [EXECUTION_PLAN.md](EXECUTION_PLAN.md), [TASK_BOARD.md](TASK_BOARD.md), [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md), [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md), [DEMO_PLAN.md](DEMO_PLAN.md).

## Authority rules

- `docs/*.md` files (directly under `docs/`) are active implementation guidance.
- `docs/reference/` is historical reference only and is **never** an implementation authority.
- If active documents conflict, resolve in this order: ADRs → PRD → data model → API contract → stack → frontend/offline/crypto/testing → delivery/process documents.
- The API, logical data model, authorization rules, certificate trust model, and sync semantics are shared by Web, React PWA, and Flutter. A field-client choice must not create a second business workflow.
- Flutter/Dart is the **official** field application. The React PWA is a testing/prototype client only.

## Repository map

```text
backend/                 Django project and domain apps
  root/                  settings, ASGI/WSGI, URL composition
  authentication/        auth boundary
  businesses/            business domain
  instruments/           instrument registry
  applications/          verification requests
  scheduling/            assignment/scheduling boundary
  inspections/           field inspection domain
  evidence/              file metadata and object-storage boundary
  certificates/          certificate generation and status
  verification/          public verification boundary
  notifications/         in-product notifications
  audit/                 append-only audit boundary
  sync/                  offline mutation boundary

frontend/                Next.js app — Web (Business/Admin/Public) + React Field PWA (testing)
  src/app/app/           business routes
  src/app/admin/         administrator routes
  src/app/field/         React field PWA (testing/prototype client)
  src/app/verify/        public verification route
  src/offline/           Dexie local schema and field sync types (PWA only)
  public/sw.js           service worker (PWA only)

flutter_field_app/       Flutter field application — OFFICIAL FIELD CLIENT
  lib/                   Dart source
  pubspec.yaml           Dart SDK ^3.13.2; cupertino_icons

docs/                    Active specification
docs/reference/          Historical/non-active material — NOT authoritative
```

## Local ports

| Component | Port | Evidence |
|---|---:|---|
| Next.js web/PWA | 3000 | `frontend/package.json` |
| Django API | 8000 | `backend/root/settings.py` |
| PostgreSQL | configured by `DATABASE_URI` | backend settings |
| MinIO/S3 | configured by `MINIO_ENDPOINT` | backend settings |

## Current implementation status

Backend app files and URL mounts are scaffolds: most `models.py`, `views.py`, `services.py`, and `tests.py` do not yet implement the full contract. The Flutter field app exists at `flutter_field_app/` with a minimal scaffold; production field features are implementation tasks. The React web frontend contains the current field PWA shell, Dexie persistence, service worker, mock sync adapter, and route structure. Do not treat a documented endpoint as implemented until backend and contract tests prove it.
