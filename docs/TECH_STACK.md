# Technology Stack

This document records technology evidenced by the current repository. It is not a license to add alternative frameworks. A material change requires an ADR.

## Runtime and backend

| Concern | Repository-confirmed choice | Evidence/status |
|---|---|---|
| Runtime/language | Python | `backend/manage.py`, Python modules |
| Web/API framework | Django 6.1 + Django REST Framework 3.18 | `backend/requirements.txt`, settings |
| Project shape | One Django modular monolith | `backend/root/urls.py` and domain-app directories |
| Package/install | Python virtual environment + `backend/requirements.txt` | Present; no alternative lockfile |
| Validation/serialization | DRF serializers | Module serializer scaffolds and API contract |
| Authentication | Django auth boundary with `djangorestframework-simplejwt` 5.5.1 configured | JWT settings exist; auth URLs/views are still scaffolded |
| Authorization | DRF/backend permission and service rules; role, ownership, and assignment checks | Contract requirement; implementation gap to close |
| ORM | Django ORM | Django is installed; domain models are currently stubs |
| Schema migration | Django migrations under each app's `migrations/` directory | Directories exist; only initializers are present in this checkout |
| API documentation | drf-spectacular 0.30.0; schema `/api/v1/schema/`, Swagger `/api/v1/docs/` | Mounted in `backend/root/urls.py` |
| Backend tests | Django test runner (`python manage.py test`) | Test modules are scaffolded; no pytest dependency is present |
| Email/notifications | Django email settings and in-product notification domain boundary | Console email fallback configured; delivery is prototype scope |

## Web frontend

| Concern | Repository-confirmed choice | Evidence/status |
|---|---|---|
| Framework | Next.js 16.3.3 with React 19.2.8 | `frontend/package.json`, App Router tree |
| Language | TypeScript 5 | `package.json`, `.tsx`/`.ts` sources |
| Package manager | pnpm 11.9.0 | `packageManager`, `pnpm-lock.yaml` |
| Routing | Next.js App Router | `frontend/src/app/**` |
| Server state/API | TanStack Query 5, Axios | Dependencies and providers/services |
| Forms/validation | React Hook Form, `@hookform/resolvers`, Zod 4 | Dependencies and readings form |
| Styling/UI | Tailwind CSS 4, shadcn package, Radix primitives, `tailwind-merge`, Lucide | Dependencies and `globals.css`/components |
| Testing | Vitest 4 + Testing Library packages + jsdom | `vitest.config.ts` and package manifest; no test script yet |
| Lint/build | ESLint 9, `pnpm lint`, `pnpm build` | `package.json`; Next config currently ignores TypeScript build errors |

Vite and React Router are not used by the current frontend and must not be documented as active dependencies.

## Current field PWA

The field client is a route group inside the Next.js app at `frontend/src/app/field/`, not a separate `apps/field` project. It is the current testing/prototype and fallback client. It uses:

- Next.js/React/TypeScript UI routes;
- `public/sw.js` for the current app-shell/static cache behavior;
- IndexedDB through Dexie 4 and `dexie-react-hooks`;
- browser file input for evidence (the current UI labels a camera action; no standalone camera API integration is present) and browser Geolocation API;
- a local sync queue with `LOCAL_DRAFT`, `READY_TO_SYNC`, `SYNCING`, `SYNCED`, `FAILED`, and `CONFLICT`;
- Axios services, with a mock sync adapter currently present because the backend sync endpoint is not implemented.

PWA storage, browser permissions, cache freshness, and offline recovery are implementation constraints, not backend authority.

## Native field application — Flutter

Flutter/Dart is not present in the repository and is not a current implementation dependency. It is the target native field client if it is ready before the internal hackathon. Its local database, state-management, networking, camera, location, secure-storage, and background-sync packages are open implementation decisions and require a dedicated ADR before adoption.

Flutter and the PWA must consume the same API and data contracts. They are alternative field-client paths, not simultaneously required production clients.

## Data, storage, and infrastructure

| Concern | Choice | Evidence/status |
|---|---|---|
| System of record | PostgreSQL via `psycopg` and `dj-database-url` | Target in settings; SQLite fallback for fresh clone |
| Development fallback | SQLite at `backend/db.sqlite3` when `DATABASE_URI` is absent | Explicit settings behavior |
| Object storage | MinIO/S3-compatible storage through `django-storages` and `boto3` when `MINIO_ENDPOINT` is set | Evidence/PDF storage configuration exists; local filesystem otherwise |
| Certificate/PDF | ReportLab 5.0.1 and Segno 1.6.6 are installed | Certificate implementation is not yet present |
| Crypto library | `cryptography` 50.0.1 | Primitive intent is specified; signing code is not present |
| Deployment | No Dockerfile, Compose, Nginx, or CI/CD configuration is present | Keep deployment as a future implementation task; do not claim it exists |

## Authentication and cryptography

- JWT access/refresh behavior is configured through SimpleJWT; the API remains authoritative for authentication, RBAC, ownership, assignment, and state transitions.
- Password hashing is Argon2id first, with Django's PBKDF2 fallback currently listed in settings; parameters and migration policy require security review.
- Certificate trust remains SHA-256 plus RSA-2048/RSA-PSS/SHA-256, with the private signing key backend-only. The concrete signing implementation is not yet in the checkout.
- QR encodes a lookup URL only; it is discovery, not proof.

## Commands

```bash
# Backend
cd backend
python -m pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py test
python manage.py runserver 8000

# Frontend
cd frontend
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm exec vitest run
```

The repository does not provide a root workspace command, a backend pytest command, a Flutter command, or a Docker Compose command. Do not add those commands to task instructions until the corresponding files exist.
