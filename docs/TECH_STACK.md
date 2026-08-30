# Technology Stack

This document records technologies evidenced by the current repository. It is not a license to add alternative frameworks. A material change requires an ADR.

## 1. Architecture Overview

```
React Web (Next.js)
      |
      v
Backend API (Django 6.1 + DRF)
      |
  ┌───┴───────────────┐
  v                   v
PostgreSQL        MinIO / S3
                       ^
                       |
            Flutter Field App (Dart)   ← OFFICIAL FIELD APP
            React Field PWA            ← TESTING / PROTOTYPE ONLY
```

## 2. Backend

| Concern | Repository-confirmed choice | Evidence / status |
|---|---|---|
| Runtime / language | Python | `backend/manage.py`, Python modules |
| Web / API framework | Django 6.1 + Django REST Framework 3.18 | `backend/requirements.txt`, settings |
| Project shape | One Django modular monolith | `backend/root/urls.py` and domain-app directories |
| Package management | Python virtual environment + `backend/requirements.txt` | Present; no alternative lockfile |
| Validation / serialization | DRF serializers | Serializer scaffolds and API contract |
| Authentication | `djangorestframework-simplejwt` 5.5.1 | Settings configured; auth URLs/views scaffolded |
| Authorization | DRF permission + service rules; role, ownership, assignment checks | Contract requirement; implementation pending |
| ORM | Django ORM | Django installed; domain models are stubs |
| Schema migration | Django migrations under each app's `migrations/` | Directories present; initializers only in this checkout |
| API documentation | `drf-spectacular` 0.30.0; schema at `/api/v1/schema/`, Swagger at `/api/v1/docs/` | Mounted in `backend/root/urls.py` |
| Backend tests | Django test runner (`python manage.py test`) | Test modules scaffolded |
| Email / notifications | Django email settings; console backend configured | Console email fallback; delivery is prototype scope |
| PDF generation | ReportLab 5.0.1 | Installed; certificate implementation pending |
| QR generation | Segno 1.6.6 | Installed; QR URL generation pending |
| Crypto | `cryptography` 50.0.1 | Installed; signing code pending |

## 3. Web Frontend

| Concern | Repository-confirmed choice | Evidence / status |
|---|---|---|
| Framework | Next.js 16.3.3 with React 19.2.8 | `frontend/package.json`, App Router tree |
| Language | TypeScript 5 | `package.json`, `.tsx` / `.ts` sources |
| Package manager | pnpm 11.9.0 | `packageManager` field, `pnpm-lock.yaml` |
| Routing | Next.js App Router | `frontend/src/app/**` |
| Server state / API | TanStack Query 5, Axios | Dependencies and providers / services |
| Forms / validation | React Hook Form + `@hookform/resolvers` + Zod 4 | Dependencies and form schemas |
| Styling / UI | Tailwind CSS 4, shadcn, Radix UI primitives, `tailwind-merge`, Lucide | Dependencies and `globals.css` / components |
| Testing | Vitest 4 + Testing Library + jsdom | `vitest.config.ts`; test script pending |
| Lint / build | ESLint 9, `pnpm lint`, `pnpm build` | `package.json`; Next config ignores TS build errors currently |

Vite and React Router are not used by the current frontend and must not be documented as active dependencies.

## 4. Flutter Field Application

**Flutter/Dart is the official field application.** The project exists at `flutter_field_app/` in the repository.

| Concern | Repository-confirmed choice | Evidence / status |
|---|---|---|
| Framework | Flutter | `flutter_field_app/pubspec.yaml` |
| Language | Dart SDK ^3.13.2 | `flutter_field_app/pubspec.yaml` |
| Icons | `cupertino_icons ^1.0.8` | `flutter_field_app/pubspec.yaml` |
| Local persistence | Open implementation decision | No local DB package selected yet; requires ADR before adoption |
| State management | Open implementation decision | No state management package selected yet; requires ADR |
| Networking | Open implementation decision | HTTP client package requires ADR |
| Camera | Open implementation decision | Camera package requires ADR |
| Location / GPS | Open implementation decision | Location package requires ADR |
| Secure storage | Open implementation decision | Secure storage package requires ADR |
| Background sync | Open implementation decision | Background sync mechanism requires ADR |
| Testing | `flutter_test` (SDK) + `flutter_lints ^6.0.0` | `flutter_field_app/pubspec.yaml` |

The Flutter app must implement the common offline operation envelope, canonical sync states, conflict handling, evidence metadata, session behavior, and `/api/v1` contract defined in [OFFLINE_APP.md](OFFLINE_APP.md) and [API_CONTRACT.md](API_CONTRACT.md). Do not invent packages or create Flutter-specific server endpoints.

## 5. React Field PWA — Testing Client

The React field PWA is the **testing / prototype client** only. It is not the final field application.

It is a route group inside the Next.js app at `frontend/src/app/field/`:

- Next.js / React / TypeScript routes
- `public/sw.js` — app-shell / static cache behavior
- IndexedDB through Dexie 4 + `dexie-react-hooks`
- Sync queue with states `LOCAL_DRAFT`, `READY_TO_SYNC`, `SYNCING`, `SYNCED`, `FAILED`, `CONFLICT`
- Browser file input for evidence (camera-labelled action; no native camera API integration)
- Browser Geolocation API
- Axios services with a mock sync adapter (backend sync endpoint not yet implemented)

PWA storage, browser permissions, cache freshness, and offline recovery are PWA-specific implementation constraints. They do not define the canonical offline contract — that contract is shared with Flutter through [OFFLINE_APP.md](OFFLINE_APP.md).

## 6. Database

| Concern | Choice | Evidence / status |
|---|---|---|
| System of record | PostgreSQL via `psycopg` 3.3.4 and `dj-database-url` 3.1.2 | Target in settings; `psycopg-binary` installed |
| Development fallback | SQLite at `backend/db.sqlite3` when `DATABASE_URI` is absent | Explicit settings behavior |
| Schema migration | Django migrations under each app's `migrations/` | Active mechanism; no external migration tool |

## 7. Object Storage

| Concern | Choice | Evidence / status |
|---|---|---|
| Binary artifacts | MinIO / S3-compatible via `django-storages` 1.14.6 + `boto3` 1.43.82 | Configured; local filesystem otherwise |
| Evidence / PDF storage | Object storage when `MINIO_ENDPOINT` is set | Configuration present; domain upload pending |

## 8. Authentication

| Concern | Choice | Evidence |
|---|---|---|
| API authentication | JWT access + refresh | SimpleJWT 5.5.1 configured |
| Password hashing | Argon2id first (`argon2-cffi` 25.1.0), Django PBKDF2 fallback | Settings; parameters require security review |
| Token library | `djangorestframework-simplejwt` 5.5.1 | `requirements.txt` |

## 9. Cryptography

| Primitive | Choice |
|---|---|
| Integrity hashing | SHA-256 (canonical UTF-8 bytes) |
| Certificate signing | RSA-2048 + RSA-PSS + SHA-256 |
| Password storage | Argon2id |
| API authentication | JWT (SimpleJWT) |
| Audit chain | SHA-256 tamper-evident hash chain |
| Library | `cryptography` 50.0.1 |

Private signing key is backend-only. Never placed in Flutter, PWA, React Web, or version control.

## 10. API

| Concern | Choice |
|---|---|
| Base path | `/api/v1/` |
| Schema endpoint | `/api/v1/schema/` |
| Swagger UI | `/api/v1/docs/` |
| Clients | React Web, Flutter Field App, React Field PWA — all use the same `/api/v1/` contract |
| Idempotency | `clientOperationId` UUID for retriable / offline mutations |

## 11. Testing

| Area | Tool | Status |
|---|---|---|
| Backend | Django test runner (`python manage.py test`) | Scaffolded |
| Web | Vitest 4 + Testing Library + jsdom | Dependencies present; script pending |
| Flutter | `flutter test` (Dart unit, widget, integration) | Framework present; tests pending |
| React PWA | Vitest / Testing Library + browser automation | Same toolchain as Web |
| E2E | Playwright (planned) | Not yet configured |

## 12. Infrastructure

No Docker, Compose, Nginx, or CI/CD configuration is present in the repository. Local development is backend process + frontend process + Flutter toolchain, with PostgreSQL and MinIO optional. Deployment automation is an open implementation task.

## 13. Development Tooling

| Tool | Purpose | Evidence |
|---|---|---|
| pnpm 11.9.0 | Frontend package manager | `frontend/packageManager` |
| ESLint 9 | Frontend linting | `frontend/eslint.config.mjs` |
| Vitest 4 | Frontend + PWA testing | `frontend/vitest.config.ts` |
| `flutter` CLI | Flutter build / run / test | `flutter_field_app/` directory |
| `python manage.py` | Django management | `backend/manage.py` |
| `drf-spectacular` | OpenAPI schema generation | `backend/requirements.txt` |

## 14. Explicitly Excluded Technologies

The following technologies are **retired** and must not appear as active implementation dependencies:

| Technology | Status |
|---|---|
| Java | **RETIRED** — superseded by ADR-021 |
| Spring Boot | **RETIRED** — superseded by ADR-021 |
| Maven (`pom.xml`) | **RETIRED** — superseded by ADR-021 |
| JPA / Hibernate | **RETIRED** — Django ORM is active |
| Flyway | **RETIRED** — superseded by ADR-021; Django migrations are active |
| `com.mapansetu.*` | **RETIRED** — old Java package namespace |
| Spring Security | **RETIRED** — superseded by ADR-021; SimpleJWT + DRF permissions are active |

Do not introduce these as build commands, dependencies, task requirements, or implementation instructions in any active document or task.

## Commands

```bash
# Backend
cd backend
python -m pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py test
python manage.py runserver 8000

# Web frontend
cd frontend
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm exec vitest run

# Flutter field application
cd flutter_field_app
flutter pub get
flutter run
flutter test
flutter build apk        # Android release
flutter build ios        # iOS release (macOS + Xcode required)
```

The repository does not provide a root workspace command, a backend pytest command, or a Docker Compose command. Do not add those commands to task instructions until the corresponding files exist.
