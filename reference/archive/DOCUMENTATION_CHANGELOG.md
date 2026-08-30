# Documentation Changelog

## 2026-08-30 — Architecture and field-client migration

### Changed

- Migrated active architecture documentation from the obsolete Java/Spring/Maven description to the repository-confirmed Python/Django 6.1 + Django REST Framework 3.18 backend.
- Replaced old backend paths and Flyway assumptions with `backend/`, Django ORM, and Django migrations.
- Corrected the web stack to Next.js 16.3.3 + React 19.2.8 + TypeScript + pnpm; removed Vite/React Router as active claims.
- Reframed the existing React field workflow as the current testing/fallback PWA, backed by Dexie/IndexedDB and the current service worker.
- Added the conditional Flutter/Dart native target and the readiness gate without inventing packages, paths, or server states.
- Aligned API, logical data, offline sync, cryptography, testing, ownership, task, workflow, DoD, and demo documents.
- Updated security guidance to Django/SimpleJWT/Argon2id while preserving SHA-256 and RSA-2048/RSA-PSS/SHA-256 certificate intent.
- Documented the absence of Docker/Compose/Nginx/CI and the scaffold status of most backend domain implementations.
- Updated `docs/archive/README.md` so the archive explicitly points to the current authority and cannot be mistaken for the final architecture.

### Files reviewed and rewritten/aligned

All 21 active root documents were reviewed; the migration changed every active document listed in [README.md](README.md)'s reading order and the task brief. `docs/archive/` remains historical and was not treated as authority.

### Scope

Documentation only. No backend, frontend, database, infrastructure, or application source was changed.
