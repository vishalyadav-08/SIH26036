# Architecture Decision Records

Active authority follows this file, then PRD, data model, API contract, stack, and specialist documents. Historical decisions remain visible when they explain migration context, but a superseded ADR is not an implementation instruction.

---

## ADR-001 — Modular monolith

- **Context:** The prototype has related domains, one delivery team, and strong transactional relationships.
- **Decision:** Keep one modular monolith with explicit domain-app boundaries.
- **Consequence:** Modules share one deployment/database boundary but must not bypass service and authorization boundaries.
- **Status:** Accepted.

---

## ADR-002 — Java/Spring backend *(SUPERSEDED)*

- **Context:** This was the original documentation architecture.
- **Decision:** Use Java/Spring/Maven.
- **Consequence:** The old package, build, and security assumptions no longer describe this repository.
- **Status:** **Superseded by ADR-021.** Retained only as historical context. Java/Spring/Maven must not appear in active architecture.

---

## ADR-003 — React web

- **Context:** Business, admin, and public verification need responsive browser workflows.
- **Decision:** Use React and TypeScript in the current Next.js App Router application. Use the dependencies actually present: Next.js 16.3.3, React 19.2.8, TanStack Query 5, Axios, React Hook Form, Zod 4, Tailwind CSS 4, shadcn/Radix UI primitives, and Vitest/Testing Library support.
- **Status:** Accepted and confirmed by repository evidence.

---

## ADR-004 — React PWA field path — Testing/Prototype Client

- **Context:** Field workflow testing needs browser-installable offline behavior for prototype validation.
- **Decision:** Keep the current field routes inside `frontend/src/app/field/` as a React/TypeScript PWA using the existing service worker, Dexie/IndexedDB, browser file input, and browser Geolocation API as a **testing and prototype client**.
- **Consequence:** The React PWA is a testing/prototype client only. It is **not** the final field application. Flutter/Dart is the official field application (ADR-023).
- **Status:** Accepted as testing/prototype path; ADR-023 finalizes the field client decision.

---

## ADR-005 — PostgreSQL target with SQLite fallback

- **Context:** Ownership, lifecycle, history, and audit require relational persistence.
- **Decision:** PostgreSQL is the target system of record. Django settings use SQLite only when `DATABASE_URI` is absent so a fresh clone can run.
- **Status:** Accepted.

---

## ADR-006 — Flyway migrations *(SUPERSEDED)*

- **Context:** The old documentation chose a migration tool from the old backend ecosystem.
- **Decision:** Use Flyway.
- **Status:** **Superseded by ADR-021.** Django migrations are the active schema migration mechanism.

---

## ADR-007 — MinIO/S3-compatible object storage

- **Context:** Evidence images and certificate PDFs are binary artifacts.
- **Decision:** Use `django-storages` + `boto3` against MinIO/S3-compatible storage when `MINIO_ENDPOINT` is configured; retain local filesystem behavior until object storage is configured.
- **Status:** Accepted; implementation of domain uploads pending.

---

## ADR-008 — Spring Security authentication *(SUPERSEDED)*

- **Context:** The old backend used a framework-specific security boundary.
- **Decision:** Use Spring Security.
- **Status:** **Superseded by ADR-021.** SimpleJWT + Django/DRF permissions are the active authentication and authorization mechanism.

---

## ADR-009 — Argon2id passwords

- **Context:** Passwords must be protected with a memory-hard one-way hash.
- **Decision:** Use Argon2id through Django's `Argon2PasswordHasher`, first in the configured hasher list.
- **Status:** Accepted.

---

## ADR-010 — SHA-256 integrity hashing

- **Decision:** Hash canonical UTF-8 certificate/audit material with SHA-256. Canonical serialization is mandatory.
- **Status:** Accepted.

---

## ADR-011 — RSA-2048/RSA-PSS/SHA-256 certificate signing

- **Decision:** Preserve RSA-2048 with RSA-PSS and SHA-256. The private key stays backend-only; implementation library details require deterministic fixtures.
- **Status:** Accepted; signing implementation pending.

---

## ADR-012 — Tamper-evident audit chain

- **Decision:** Audit events carry canonical event data, `previousHash`, and `currentHash`; verification detects altered content or links. This is tamper evidence, not absolute immutability.
- **Status:** Accepted.

---

## ADR-013 — No blockchain for MVP

- **Decision:** Do not add blockchain or a distributed ledger to the prototype.
- **Status:** Accepted.

---

## ADR-014 — No microservices for MVP

- **Decision:** Do not split the Django modular monolith into separately deployed services for the prototype.
- **Status:** Accepted.

---

## ADR-015 — AI advisory only

- **Decision:** Optional AI may extract or suggest information, but humans and backend rules retain final legal/workflow decisions.
- **Status:** Accepted.

---

## ADR-016 — Synthetic demo data

- **Decision:** Prototype fixtures use synthetic identities, businesses, instruments, certificates, and evidence.
- **Status:** Accepted.

---

## ADR-017 — Public verification without authentication

- **Decision:** Public certificate lookup is unauthenticated, rate-limited, and minimized. Protected certificate management remains authenticated.
- **Status:** Accepted.

---

## ADR-018 — Shared contracts, no duplicated domain logic

- **Decision:** React Web, React PWA, and Flutter all use the same API and logical data contracts. Clients may validate for usability, but backend validation is authoritative. Business logic and domain state remain backend/data-model concerns; they must not be duplicated per client.
- **Status:** Accepted.

---

## ADR-019 — npm workspaces plus Maven *(SUPERSEDED)*

- **Context:** The old repository plan assumed a Java backend and a different frontend layout.
- **Decision:** Use npm workspaces and Maven.
- **Status:** **Superseded by ADR-021.** The current repository uses standalone `frontend/` pnpm and `backend/requirements.txt`.

---

## ADR-020 — PWA instead of Flutter *(SUPERSEDED)*

- **Context:** The PWA was previously treated as the mandatory final field client.
- **Decision:** Use only the PWA.
- **Status:** **Superseded by ADR-023.** Flutter/Dart is the official field application. The PWA is retained as testing/prototype client only.

---

## ADR-021 — Backend technology migration to Django

- **Context:** The repository contains `backend/manage.py`, Django 6.1, Django REST Framework 3.18, Django app modules, SimpleJWT configuration, Django ORM settings, and `requirements.txt`. It contains no Java source, Maven project, or Spring runtime.
- **Previous architecture:** Java/Spring/Maven modular monolith — **RETIRED**.
- **New architecture:** Python + Django 6.1 + Django REST Framework 3.18 modular monolith under `backend/`, with Django ORM/migrations, SimpleJWT configuration, drf-spectacular, PostgreSQL target, SQLite fallback, and MinIO/S3-compatible storage configuration.
- **Decision:** Treat the repository-confirmed Django stack as the only active backend architecture. API paths, domain boundaries, client independence, sync semantics, and security primitives remain stable unless separately decided.
- **Why:** It matches the current source tree and manifests, avoids invented technology, and preserves the prototype's transactional domain boundaries.
- **Consequences:** Backend work uses Python/Django commands and app-local migrations; old package/build/security references must not be copied into new tasks. Several Django modules are still scaffolds, so implementation status must be explicit.
- **Status:** Accepted; active implementation baseline.

---

## ADR-022 — Conditional Flutter/native field-client strategy *(SUPERSEDED)*

- **Context:** This ADR previously created a readiness gate before committing to Flutter.
- **Decision:** Keep PWA as primary; Flutter conditional.
- **Status:** **Superseded by ADR-023.** The Flutter field app exists in the repository (`flutter_field_app/`). There is no readiness gate. Flutter is the official field application.

---

## ADR-023 — Flutter/Dart is the official field application *(FINAL)*

- **Context:** The `flutter_field_app/` project exists in the repository (Dart SDK ^3.13.2, `cupertino_icons`). ADR-022 previously created a conditional gate; that gate is now resolved. The Flutter field app is present and is the intended production client for field officers.
- **Decision:** Flutter/Dart (`flutter_field_app/`) is the **official field application**. There is no "if ready" condition. The React field PWA is retained only as a testing/prototype client for field workflow validation.
- **Why:** The repository evidence confirms Flutter is present. Conditional language creates confusion about architecture authority and leads agents to treat PWA as a production client.
- **Consequences:**
  - All documentation must state Flutter as the official field application without conditional language.
  - The React field PWA must be clearly labelled "testing / prototype client."
  - The PWA must not be positioned as the primary demo field application.
  - Flutter packages (local DB, state management, camera, location, secure storage, background sync) remain open implementation decisions and require separate ADRs before adoption.
  - Flutter and PWA must use the same `/api/v1/` API contract with no client-specific server states.
  - Task board and execution plan must not contain a "Flutter readiness gate."
- **Status:** Accepted; **FINAL**.

---

## ADR-024 — React PWA is testing/prototype client

- **Context:** ADR-023 finalizes Flutter as the official field application. The React field PWA's role must be explicitly documented.
- **Decision:** The React field PWA at `frontend/src/app/field/` is retained **only** as a testing and prototype validation client. It is used to test field workflow logic, API contract integration, offline behavior, and sync mechanics before or during Flutter development. It must not be described as the final field architecture, the primary mobile application, or the production field client.
- **Consequences:**
  - The PWA continues to serve field workflow testing. It must not be removed while Flutter development is in progress.
  - IndexedDB/Dexie and Service Worker are PWA-specific implementation details. They are not the canonical offline storage mechanism — that is a Flutter implementation decision (ADR-023 open items).
  - The demo plan uses Flutter unless Flutter is unavailable for a specific technical test, in which case the PWA may be used as an explicitly-labelled fallback.
  - Agents must label PWA tasks as `FIELD_PWA_TESTING` not as a production client designation.
- **Status:** Accepted; **FINAL**.

---

## ADR-025 — Shared API contract for all clients

- **Context:** Three clients exist: React Web, Flutter Field App, React Field PWA. The API must serve all three without per-client business logic.
- **Decision:** All clients consume the same `/api/v1/` API contract. The backend exposes no `/flutter/*`, `/pwa/*`, or `/react-field/*` namespaces unless there is an explicit technical requirement. Common paths, payloads, error codes, auth mechanism, and idempotency semantics apply to all clients equally.
- **Status:** Accepted.

---

## ADR-026 — Client-independent domain model

- **Context:** Business logic must remain backend/data-model concerns to prevent drift.
- **Decision:** Business logic, state machines, permission rules, ownership, assignment, and certificate semantics are implemented in the backend and expressed through the API contract and logical data model. No client (Flutter, React PWA, or React Web) becomes a canonical data authority. Client models are representations of the API/data contract, not independent domain definitions.
- **Status:** Accepted.

---

## ADR-027 — Secure token storage with `flutter_secure_storage`

- **Status:** Accepted
- **Date:** 2026-08-30
- **Context:** The application needs a safe mechanism to store JWT access and refresh tokens, as well as session secrets, without exposing them to device backup mechanisms, local databases, or logging tools.
- **Problem:** Native Android/iOS preferences (like `SharedPreferences`) store values in plain text, making tokens vulnerable if a device is compromised.
- **Decision:** Use `flutter_secure_storage` for securely storing authentication tokens.
- **Package:** `flutter_secure_storage` (Version ^9.2.2)
- **Why this package is needed:** Provides AES encryption on Android (via Keystore) and Keychain services on iOS. It is the de-facto standard in Flutter for cryptographic storage.
- **Alternatives considered:** Writing custom platform channels (rejected due to high maintenance overhead). `shared_preferences` (rejected due to lack of encryption).
- **Security implications:** Tokens are encrypted at rest. We must ensure `flutter_secure_storage` is cleared correctly on explicit logout.
- **Offline implications:** Offline startup relies on the cached token in secure storage to identify the last logged-in user.
- **Performance implications:** Negligible for storing small string pairs.
- **Impact on Flutter architecture:** Intercepts API requests to inject tokens. 
- **Impact on existing API contract:** None.

---

## ADR-028 — Operation idempotency with `uuid`

- **Status:** Accepted
- **Date:** 2026-08-30
- **Context:** The `/api/v1/sync` contract requires unique, idempotent operation IDs (`clientOperationId`) to ensure offline actions are safely retried without duplication on the backend.
- **Problem:** Dart SDK does not have a built-in cryptographically secure UUID generator that adheres strictly to RFC 4122.
- **Decision:** Adopt the `uuid` package.
- **Package:** `uuid` (Version ^4.4.0)
- **Why this package is needed:** We need to generate RFC 4122 v4 UUIDs for every distinct offline operation (measurements, decisions, evidence) and persist them locally until synced.
- **Alternatives considered:** Custom string generation with `DateTime` and `Random` (rejected due to collision risks and non-compliance with UUID standards).
- **Security implications:** Secure PRNG generation ensures unpredictable IDs.
- **Offline implications:** UUIDs must be generated locally when disconnected, and stored with the pending sync item.
- **Impact on existing API contract:** Fulfills the `clientOperationId` parameter required by the existing backend API.

---

## ADR-029 — Offline persistence with `hive`

- **Status:** Accepted
- **Date:** 2026-08-30
- **Context:** The app requires robust offline storage for assigned inspections, draft work, evidence metadata, and a robust offline sync queue.
- **Problem:** SQLite (`sqflite`) requires complex table schemas, migrations, and high boilerplate for a document-centric API response.
- **Decision:** Use `hive` and `hive_flutter` for local persistence.
- **Package:** `hive` (^2.2.3), `hive_flutter` (^1.1.0)
- **Why this package is needed:** Hive is a fast, lightweight, NoSQL document store that perfectly mirrors the JSON API contracts provided by the backend. It avoids schema impedance mismatch and allows rapid reads/writes suitable for mobile.
- **Alternatives considered:** `sqflite` (too much boilerplate, rigid schema), `shared_preferences` (not designed for querying structured queues), `isar` (complex setup).
- **Security implications:** Hive boxes can be encrypted using AES-256 by passing an encryption key derived from `flutter_secure_storage`. Sensitive data is protected.
- **Offline implications:** The core driver of offline capabilities. Data stored in Hive is explicitly NOT authoritative, but represents `LOCAL_DRAFT` and `READY_TO_SYNC` states.
- **Impact on existing API contract:** None. Data is mapped 1:1 with API models.

---

## ADR-030 — API Networking with `dio`

- **Status:** Accepted
- **Date:** 2026-08-30
- **Context:** The app must communicate with the Django backend at `/api/v1/`.
- **Problem:** The built-in `http` package is low-level and requires manual implementation of interceptors, token refresh logic, timeout handling, and file-upload (multipart/form-data) capabilities.
- **Decision:** Adopt `dio`.
- **Package:** `dio` (^5.7.0)
- **Why this package is needed:** Provides native support for interceptors (critical for JWT injection and transparent token refresh), robust multipart uploads (for evidence images), and granular timeout controls.
- **Alternatives considered:** `http` package (requires writing custom interceptor wrappers).
- **Security implications:** Interceptors must be carefully configured to NEVER log authorization headers or response bodies containing PII in production.
- **Impact on existing API contract:** Conforms exactly to the existing backend API.

---

## ADR-031 — Field Location with `geolocator`

- **Status:** Accepted
- **Date:** 2026-08-30
- **Context:** GPS location is required as evidence metadata for inspections.
- **Problem:** Native Android/iOS location APIs are complex to wrap manually.
- **Decision:** Adopt `geolocator`.
- **Package:** `geolocator` (^13.0.2)
- **Why this package is needed:** Exposes accurate location metrics (latitude, longitude, accuracy) and handles the intricacies of permission requests (granted, denied, permanently denied).
- **Alternatives considered:** `location` package (less actively maintained than `geolocator`).
- **Security implications:** Location is treated as PII and metadata. The app handles permission denials gracefully and never uses GPS as an authorization gate.
- **Offline implications:** Can acquire coordinates from GNSS satellites even without internet access.

---

## ADR-032 — Evidence Capture with `image_picker`

- **Status:** Accepted
- **Date:** 2026-08-30
- **Context:** Officers must capture photos of instruments, nameplates, and seals as evidence.
- **Problem:** Directly interfacing with CameraX (Android) and AVFoundation (iOS) requires writing tens of thousands of lines of native code.
- **Decision:** Adopt `image_picker` for native camera invocation.
- **Package:** `image_picker` (^1.1.2)
- **Why this package is needed:** Provides a stable, official Flutter team-supported way to launch the native device camera. We will configure it to prefer live camera capture over gallery selection.
- **Alternatives considered:** `camera` package (building a custom camera UI in Flutter). Rejected because the native OS camera app is more familiar, handles lighting/HDR better, and reduces our maintenance surface.
- **Security implications:** Captured images are temporarily stored in the app's cache directory before being synced to the backend.

---

## ADR-033 — Biometric Re-Authentication with `local_auth`

- **Status:** Accepted
- **Date:** 2026-08-30
- **Context:** Field officers need to quickly unlock the app during a session without repeatedly typing passwords.
- **Problem:** Session security requires re-authentication, but password entry is cumbersome in the field.
- **Decision:** Adopt `local_auth`.
- **Package:** `local_auth` (^2.3.0)
- **Why this package is needed:** Bridges device-level biometric capabilities (Fingerprint, FaceID).
- **Security implications:** Biometrics only unlock the local app session (access to the locally stored JWT). It does NOT replace backend JWT validation and CANNOT be used to bypass backend authorization.
- **Impact on existing API contract:** None.

---

## ADR-034 — State Management with `flutter_riverpod`

- **Status:** Accepted
- **Date:** 2026-08-30
- **Context:** The app requires complex reactive state management for authentication, offline database streams, and the sync queue.
- **Problem:** StatefulWidgets and InheritedWidgets result in extreme boilerplate and tight coupling, making testing difficult.
- **Decision:** Adopt `flutter_riverpod`.
- **Package:** `flutter_riverpod` (^2.6.1)
- **Why this package is needed:** Provides compile-safe, robust dependency injection and reactive state mapping. Crucial for syncing the UI in real-time with the offline Sync Queue.
- **Alternatives considered:** `provider` (deprecated by its creator in favor of Riverpod), `bloc` (too much boilerplate for the current timeline), `getx` (pollutes the navigation tree, violates architectural boundaries).
- **Impact on Flutter architecture:** All repositories and state streams are injected via Riverpod.

---

## ADR-035 — Code Generation for Serialization & Testing

- **Status:** Accepted
- **Date:** 2026-08-30
- **Context:** We need to generate `hive` type adapters and create test mocks.
- **Decision:** Adopt `build_runner`, `hive_generator`, and `mockito` as dev-only dependencies.
- **Packages:** `build_runner` (^2.4.11), `hive_generator` (^2.0.1), `mockito` (^5.4.4)
- **Why this package is needed:** Eliminates error-prone manual binary serialization logic for Hive. `mockito` allows creating robust interface mocks for unit testing the Sync Engine without hitting a real backend.
- **Alternatives considered:** Hand-written mocks (acceptable for small interfaces, but `mockito` is standard for `dio` and repository mocking).
- **Security implications:** Dev dependencies only. Never compiled into the release APK.
