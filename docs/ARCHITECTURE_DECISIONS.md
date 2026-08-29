# Architecture Decision Records

Active authority follows this file, then PRD, data model, API contract, stack, and specialist documents. Historical decisions remain visible when they explain migration context, but a superseded ADR is not an implementation instruction.

## ADR-001 — Modular monolith

- **Context:** The prototype has related domains, one delivery team, and strong transactional relationships.
- **Decision:** Keep one modular monolith with explicit domain-app boundaries.
- **Consequence:** Modules share one deployment/database boundary but must not bypass service and authorization boundaries.
- **Status:** Accepted.

## ADR-002 — Java/Spring backend

- **Context:** This was the original documentation architecture.
- **Decision:** Use Java/Spring/Maven.
- **Consequence:** The old package, build, and security assumptions no longer describe this repository.
- **Status:** Superseded by ADR-021; retained only as historical context.

## ADR-003 — React web

- **Context:** Business, admin, and public verification need responsive browser workflows.
- **Decision:** Use React and TypeScript in the current Next.js App Router application. Use the dependencies actually present: Next.js, TanStack Query, Axios, React Hook Form, Zod, Tailwind CSS, shadcn/Radix primitives, and Vitest/Testing Library support.
- **Status:** Accepted and refined by repository evidence.

## ADR-004 — React PWA field path

- **Context:** Field workflow testing needs browser-installable offline behavior now.
- **Decision:** Keep the current field routes inside `frontend/` as a React/TypeScript PWA using the existing service worker, Dexie/IndexedDB, browser camera input, and browser geolocation.
- **Consequence:** It is a testing/fallback client, not an automatic final native-production commitment.
- **Status:** Accepted as current path; conditional strategy is ADR-022.

## ADR-005 — PostgreSQL target with SQLite fallback

- **Context:** Ownership, lifecycle, history, and audit require relational persistence.
- **Decision:** PostgreSQL is the target system of record. Django settings use SQLite only when `DATABASE_URI` is absent so a fresh clone can run.
- **Status:** Accepted.

## ADR-006 — Flyway migrations

- **Context:** The old documentation chose a migration tool from the old backend ecosystem.
- **Decision:** Use Flyway.
- **Status:** Superseded by ADR-021. Django migrations are the active schema migration mechanism.

## ADR-007 — MinIO/S3-compatible object storage

- **Context:** Evidence images and certificate PDFs are binary artifacts.
- **Decision:** Use `django-storages` + `boto3` against MinIO/S3-compatible storage when `MINIO_ENDPOINT` is configured; retain local filesystem behavior until object storage is configured.
- **Status:** Accepted, implementation of domain uploads pending.

## ADR-008 — Spring Security authentication

- **Context:** The old backend used a framework-specific security boundary.
- **Decision:** Use Spring Security.
- **Status:** Superseded by ADR-021. SimpleJWT/Django authentication is active configuration.

## ADR-009 — Argon2id passwords

- **Context:** Passwords must be protected with a memory-hard one-way hash.
- **Decision:** Use Argon2id through Django's `Argon2PasswordHasher`, first in the configured hasher list.
- **Status:** Accepted.

## ADR-010 — SHA-256 integrity hashing

- **Decision:** Hash canonical UTF-8 certificate/audit material with SHA-256. Canonical serialization is mandatory.
- **Status:** Accepted.

## ADR-011 — RSA-2048/RSA-PSS/SHA-256 certificate signing

- **Decision:** Preserve RSA-2048 with RSA-PSS and SHA-256. The private key stays backend-only; implementation library details require deterministic fixtures.
- **Status:** Accepted; signing implementation pending.

## ADR-012 — Tamper-evident audit chain

- **Decision:** Audit events carry canonical event data, `previousHash`, and `currentHash`; verification detects altered content or links. This is tamper evidence, not absolute immutability.
- **Status:** Accepted.

## ADR-013 — No blockchain for MVP

- **Decision:** Do not add blockchain or a distributed ledger to the prototype.
- **Status:** Accepted.

## ADR-014 — No microservices for MVP

- **Decision:** Do not split the Django modular monolith into separately deployed services for the prototype.
- **Status:** Accepted.

## ADR-015 — AI advisory only

- **Decision:** Optional AI may extract or suggest information, but humans and backend rules retain final legal/workflow decisions.
- **Status:** Accepted.

## ADR-016 — Synthetic demo data

- **Decision:** Prototype fixtures use synthetic identities, businesses, instruments, certificates, and evidence.
- **Status:** Accepted.

## ADR-017 — Public verification without authentication

- **Decision:** Public certificate lookup is unauthenticated, rate-limited, and minimized. Protected certificate management remains authenticated.
- **Status:** Accepted.

## ADR-018 — Shared contracts, no duplicated domain logic

- **Decision:** Web, PWA, and Flutter use the same API and logical data contracts. Clients may validate for usability, but backend validation is authoritative.
- **Status:** Accepted.

## ADR-019 — npm workspaces plus Maven

- **Context:** The old repository plan assumed a Java backend and a different frontend layout.
- **Decision:** Use npm workspaces and Maven.
- **Status:** Superseded by ADR-021. The current repository uses standalone `frontend/` pnpm and `backend/requirements.txt`.

## ADR-020 — PWA instead of Flutter

- **Context:** The PWA was previously treated as the mandatory final field client.
- **Decision:** Use only the PWA.
- **Status:** Superseded by ADR-022. The PWA remains current testing/fallback; Flutter is conditional target.

## ADR-021 — Backend technology migration to Django

- **Context:** The repository contains `backend/manage.py`, Django 6.1, Django REST Framework, Django app modules, SimpleJWT configuration, Django ORM settings, and `requirements.txt`. It contains no Java source, Maven project, or Spring runtime. The old backend documentation therefore no longer matches the implementation baseline.
- **Previous architecture:** Java/Spring/Maven modular monolith.
- **New architecture:** Python + Django 6.1 + Django REST Framework 3.18 modular monolith under `backend/`, with Django ORM/migrations, SimpleJWT configuration, drf-spectacular, PostgreSQL target, SQLite fallback, and MinIO/S3-compatible storage configuration.
- **Decision:** Treat the repository-confirmed Django stack as the only active backend architecture. API paths, domain boundaries, client independence, sync semantics, and security primitives remain stable unless separately decided.
- **Why:** It matches the current source tree and manifests, avoids invented technology, and preserves the prototype's transactional domain boundaries.
- **Consequences:** Backend work uses Python/Django commands and app-local migrations; old package/build/security references must not be copied into new tasks. Several Django modules are still scaffolds, so implementation status must be explicit.
- **Migration impact:** Rewrite active docs, task ownership, tests, workflow, and repository paths; replace Flyway with Django migrations; map security guidance to Django/DRF/SimpleJWT; do not change domain states or API semantics solely because the framework changed.
- **Status:** Accepted; implementation baseline.

## ADR-022 — Conditional Flutter/native field-client strategy

- **Context:** The current repository has a React field PWA with Dexie/offline behavior but no Flutter project. Native mobile capabilities may be preferred for the internal hackathon if a Flutter implementation becomes ready.
- **Decision:** Keep the PWA as the current testing/fallback field client. If Flutter is ready before the internal hackathon, use Flutter as the primary field demo/native target; otherwise use the PWA as the primary demo and keep Flutter future/conditional. Both clients consume the same `/api/v1` contract and canonical data/sync states.
- **Why:** It preserves current testability while leaving a clear native path without inventing Flutter packages or duplicating domain logic.
- **Consequences:** A readiness gate is required before the internal hackathon. Flutter storage, state management, device packages, and background sync remain open until a separate implementation ADR. No Flutter-specific server states or endpoints are allowed.
- **Status:** Accepted, conditional milestone.
