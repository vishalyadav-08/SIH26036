# Task Board

All tasks use the repository-confirmed Python/Django/DRF backend, Next.js/React web frontend, and Flutter field application. `BACKLOG` means not started; `READY` means dependencies and contracts are available; `BLOCKED` requires evidence and an owner. No task may instruct work in an absent project path.

> [!IMPORTANT]
> Flutter (`flutter_field_app/`) is the **official field application**. Flutter tasks are active — not conditional.
> React PWA tasks are **testing/prototype** tasks only and must be labelled `FIELD_PWA_TESTING`.
> Java, Spring Boot, and Maven are **retired** — no task may reference them.

## Task Records

### DOC-001 — Documentation architecture freeze

- **Area/Owner/AI agent:** DOCS / Project Lead / doc-agent
- **Target client:** DOCS
- **Objective:** Freeze active docs to final architecture: Django + DRF backend, Next.js/React web, Flutter official field app, React PWA testing-only.
- **Dependencies:** Repository inspection.
- **Allowed files:** `docs/**`
- **Forbidden files:** `backend/**`, `frontend/**`, `flutter_field_app/**`, database/infra source.
- **API dependency:** Preserve `/api/v1` contract.
- **Data dependency:** Preserve canonical entities and state enums.
- **Security requirements:** Preserve backend authority and crypto primitives.
- **Acceptance criteria:** All active docs agree; `docs/reference/` holds historical material; no stale changelog or consistency report in active docs; no Java/Spring/Maven implementation instructions; Flutter is official; PWA is testing-only.
- **Tests:** Obsolete-term search and cross-document review.
- **Verification command:** `rg -n -i --glob "*.md" --glob "!docs/reference/**" "Java|Spring Boot|Maven|JPA|Hibernate|Flyway|com.mapansetu" docs`
- **Expected output:** Zero matches or only classified historical/exclusion references.
- **Status:** DONE

---

### BOOT-001 — Backend bootstrap and health baseline

- **Area/Owner/AI agent:** BACKEND / Backend Team / coding-agent
- **Target client:** BACKEND
- **Objective:** Make the Django project check, migration baseline, URL mounts, and test runner reproducible.
- **Dependencies:** DOC-001.
- **Allowed files:** `backend/root/**`, `backend/manage.py`, `backend/requirements.txt`, approved backend tests.
- **Forbidden files:** `frontend/**`, `flutter_field_app/**`, `docs/reference/**`, unapproved schema changes.
- **API dependency:** `/api/v1`, schema, and Swagger mounts.
- **Data dependency:** Django migration plan for canonical entities.
- **Security requirements:** Safe settings, no secrets in Git, CORS/DEBUG defaults reviewed.
- **Acceptance criteria:** Check and baseline tests pass; implementation/scaffold status is documented.
- **Tests:** Django checks and backend tests.
- **Verification command:** `cd backend; python manage.py check; python manage.py test`
- **Expected output:** No check errors; test command completes with reported result.
- **Status:** READY

---

### WEB-001 — Next.js web bootstrap

- **Area/Owner/AI agent:** WEB / Web Team / coding-agent
- **Target client:** WEB
- **Objective:** Keep Next.js App Router, TypeScript, pnpm, lint/build, and test command reproducible.
- **Dependencies:** DOC-001.
- **Allowed files:** `frontend/package.json`, `frontend/src/**`, `frontend/vitest.config.ts`, approved frontend config/tests.
- **Forbidden files:** `backend/**`, `flutter_field_app/**`, field persistence contract, private key material.
- **API dependency:** API_CONTRACT endpoints only.
- **Data dependency:** DATA_MODEL response types.
- **Security requirements:** UI guards are not authorization; no sensitive data in public views.
- **Acceptance criteria:** Existing route tree builds/lints; test command is explicit.
- **Tests:** Vitest/Testing Library, lint, production build.
- **Verification command:** `cd frontend; pnpm lint; pnpm exec vitest run; pnpm build`
- **Expected output:** Lint/tests/build exit successfully or known failures are recorded.
- **Status:** READY

---

### FLUTTER-001 — Flutter field application foundation

- **Area/Owner/AI agent:** FIELD / Field Team / coding-agent
- **Target client:** FLUTTER
- **Objective:** Establish the Flutter field app architecture, routing, auth integration, and baseline test suite. Select and document packages (local persistence, state management, HTTP, camera, GPS, secure storage) through ADRs before adoption.
- **Dependencies:** DOC-001, API-001 (or draft contract).
- **Allowed files:** `flutter_field_app/**`, `docs/` for new ADRs.
- **Forbidden files:** `backend/**`, `frontend/**`, client-specific server endpoints.
- **API dependency:** Same `/api/v1` contract as React Web and PWA.
- **Data dependency:** Same canonical entities, states, operation envelope.
- **Security requirements:** Secure token storage, no private keys, permission denial handling, no local authorization authority.
- **Acceptance criteria:** `flutter run` succeeds; auth flow connects to API; baseline `flutter test` passes; at least one ADR filed for package selections.
- **Tests:** `flutter test` unit and widget tests.
- **Verification command:** `cd flutter_field_app; flutter pub get; flutter test`
- **Expected output:** Tests pass; app builds.
- **Status:** READY

---

### FLUTTER-002 — Flutter offline inspection workflow

- **Area/Owner/AI agent:** FIELD / Field Team / coding-agent
- **Target client:** FLUTTER
- **Objective:** Implement the full offline field workflow: cache assigned inspection, offline checklist/readings/evidence, sync queue, conflict handling. Packages selected and approved by ADR.
- **Dependencies:** FLUTTER-001, OFF-001, API-001.
- **Allowed files:** `flutter_field_app/**`, approved Flutter packages per ADR.
- **Forbidden files:** Backend contract changes for Flutter; client-specific server states; private keys.
- **API dependency:** Assigned inspections, evidence, decision, `/api/v1/sync`.
- **Data dependency:** Inspection, Measurement, Evidence, SyncRecord, local states.
- **Security requirements:** Secure local handling, permission denial, logout/re-auth, no local authorization authority.
- **Acceptance criteria:** Full offline inspection workflow passes; sync idempotency verified; conflict resolution explicit; camera/GPS permission flows tested.
- **Tests:** Dart unit/widget/integration tests including offline/sync/camera/location cases.
- **Verification command:** `cd flutter_field_app; flutter test`
- **Expected output:** Flutter test suite passes including offline and sync cases.
- **Status:** BACKLOG

---

### FIELD-001 — React PWA testing path (FIELD_PWA_TESTING)

- **Area/Owner/AI agent:** FIELD / Field Team / coding-agent
- **Target client:** FIELD_PWA_TESTING
- **Objective:** Complete the current browser field flow for cached inspection, checklist, readings, evidence, review, and visible sync state. **This is a testing/prototype client — not the production field application.**
- **Dependencies:** WORK-001, API-001, WEB-001.
- **Allowed files:** `frontend/src/app/field/**`, `frontend/src/offline/**`, `frontend/src/services/field/**`, `frontend/public/sw.js`, tests.
- **Forbidden files:** Backend authorization, `flutter_field_app/**`, private keys, new business API semantics.
- **API dependency:** Assigned inspections, evidence, decision, `/api/v1/sync`.
- **Data dependency:** Inspection, Measurement, Evidence, SyncRecord and local states.
- **Security requirements:** Local data is not server-confirmed; camera/GPS/file errors visible; no secrets in Dexie.
- **Acceptance criteria:** Online/offline field route supports restart persistence and visible recovery paths.
- **Tests:** Vitest/browser tests for offline, service worker, evidence, camera/GPS, and auth expiry.
- **Verification command:** `cd frontend; pnpm exec vitest run`
- **Expected output:** Field tests pass with queue transitions asserted.
- **Status:** BACKLOG

---

### API-001 — Implement client-independent API contract

- **Area/Owner/AI agent:** BACKEND / Backend Team / coding-agent
- **Target client:** BACKEND
- **Objective:** Implement documented auth, registry, workflow, certificate, public verification, notification, audit, and sync routes in Django/DRF.
- **Dependencies:** BOOT-001, WEB-001, DOC-001.
- **Allowed files:** Relevant `backend/*/serializers.py`, `services.py`, `views.py`, `urls.py`, models/migrations by approved subtask, tests.
- **Forbidden files:** Client-specific duplicate business APIs; frontend auth authority.
- **API dependency:** `docs/API_CONTRACT.md` is canonical.
- **Data dependency:** `docs/DATA_MODEL.md` entities/states.
- **Security requirements:** Backend validation, RBAC, ownership, assignment, safe errors, idempotency.
- **Acceptance criteria:** Route behavior, errors, pagination, and permissions match contract; OpenAPI schema is inspectable.
- **Tests:** API/contract/security tests.
- **Verification command:** `cd backend; python manage.py test`
- **Expected output:** Contract tests pass and schema route responds.
- **Status:** BACKLOG

---

### AUTH-001 — Authentication, JWT, RBAC, and ownership

- **Area/Owner/AI agent:** SECURITY/BACKEND / Security Team / security-agent
- **Target client:** SECURITY
- **Objective:** Implement login/profile and server-side role, business ownership, and officer-assignment checks.
- **Dependencies:** BOOT-001, API-001.
- **Allowed files:** `backend/authentication/**`, permission/service modules, targeted tests, approved settings.
- **Forbidden files:** Client-only authorization, private keys, undocumented roles.
- **API dependency:** `/api/v1/auth/login`, `/api/v1/users/me`, protected endpoint rules.
- **Data dependency:** User, Role, Business, ApplicationAssignment.
- **Security requirements:** SimpleJWT, Argon2id, expiry/rejection, rate limiting, redaction, no password/hash/token leakage.
- **Acceptance criteria:** Valid/invalid/inactive login, role matrix, ownership and assignment negatives pass.
- **Tests:** Django API/security tests.
- **Verification command:** `cd backend; python manage.py test authentication`
- **Expected output:** Auth and negative authorization tests pass.
- **Status:** BACKLOG

---

### REG-001 — Business and instrument registry

- **Area/Owner/AI agent:** BACKEND + WEB / Backend and Web Teams / coding-agent
- **Target client:** CROSS_CUTTING
- **Objective:** Implement business profile, instrument CRUD/list/detail/passport, duplicate checks, and ownership.
- **Dependencies:** AUTH-001, API-001.
- **Allowed files:** `backend/businesses/**`, `backend/instruments/**`, relevant `frontend/src/app/app/**`, tests/migrations.
- **Forbidden files:** Field client persistence, certificate keys, undocumented fields.
- **API dependency:** Businesses and instruments sections of API_CONTRACT.
- **Data dependency:** Business, User, Instrument.
- **Security requirements:** Cross-business access denied; validation server-side.
- **Acceptance criteria:** Synthetic business can register/list/detail an instrument and see history scope.
- **Tests:** Django API + Vitest/Testing Library.
- **Verification command:** `cd backend; python manage.py test businesses instruments`
- **Expected output:** Registry and ownership tests pass.
- **Status:** BACKLOG

---

### WORK-001 — Applications, assignment, and scheduling

- **Area/Owner/AI agent:** BACKEND + WEB / Backend and Web Teams / coding-agent
- **Target client:** CROSS_CUTTING
- **Objective:** Implement canonical application transitions, assignment history, schedules, and notifications.
- **Dependencies:** REG-001, AUTH-001.
- **Allowed files:** `backend/applications/**`, `backend/scheduling/**`, `backend/notifications/**`, admin/business routes/tests.
- **Forbidden files:** Client-specific state machines, silent transitions.
- **API dependency:** Applications, assignment, scheduling, notifications endpoints.
- **Data dependency:** Application, ApplicationAssignment, Notification.
- **Security requirements:** Admin-only assignment/scheduling; ownership and audit on transitions.
- **Acceptance criteria:** `DRAFT` through `SCHEDULED` transitions and negative cases are enforced.
- **Tests:** Django transition/concurrency/security tests; web components.
- **Verification command:** `cd backend; python manage.py test applications scheduling notifications`
- **Expected output:** Transition and authorization tests pass.
- **Status:** BACKLOG

---

### OFF-001 — Sync server idempotency and conflict handling

- **Area/Owner/AI agent:** BACKEND + QA / Backend and QA Teams / coding-agent
- **Target client:** BACKEND
- **Objective:** Implement `/api/v1/sync` and server SyncRecord behavior (serves both Flutter and React PWA).
- **Dependencies:** FIELD-001, API-001, AUTH-001.
- **Allowed files:** `backend/sync/**`, targeted inspection/evidence services, tests/migrations.
- **Forbidden files:** Flutter/PWA-specific server states, silent merges.
- **API dependency:** Sync envelope and result contract.
- **Data dependency:** SyncRecord, Inspection, Evidence, version fields.
- **Security requirements:** UUID uniqueness, same-payload replay returns original result, changed-payload/version conflict explicit.
- **Acceptance criteria:** `SYNCED`, `FAILED`, and `CONFLICT` results are deterministic and auditable.
- **Tests:** Django integration/security tests and both client replay tests.
- **Verification command:** `cd backend; python manage.py test sync`
- **Expected output:** Duplicate, retry, and conflict cases pass.
- **Status:** BACKLOG

---

### EVID-001 — Evidence capture and object storage

- **Area/Owner/AI agent:** BACKEND + FIELD / Backend and Security Teams / security-agent
- **Target client:** CROSS_CUTTING
- **Objective:** Validate, store, and link evidence metadata and binary artifacts from both Flutter and PWA.
- **Dependencies:** FIELD-001, AUTH-001, OFF-001.
- **Allowed files:** `backend/evidence/**`, configured storage settings, field evidence tests.
- **Forbidden files:** Client-controlled object paths, unreviewed storage providers.
- **API dependency:** Evidence upload endpoint and error contract.
- **Data dependency:** Evidence, Inspection, Instrument.
- **Security requirements:** MIME allowlist, 10 MiB prototype limit, object-key generation, access scope, no path traversal.
- **Acceptance criteria:** Valid evidence links to inspection; invalid size/type/access is rejected; storage failure is visible/retryable.
- **Tests:** Django integration/security + PWA and Flutter evidence tests.
- **Verification command:** `cd backend; python manage.py test evidence`
- **Expected output:** Evidence validation and ownership tests pass.
- **Status:** BACKLOG

---

### CRYPTO-001 — Certificate hash, signature, PDF, and QR

- **Area/Owner/AI agent:** SECURITY + BACKEND / Security Team / security-agent
- **Target client:** SECURITY
- **Objective:** Implement deterministic certificate payload, SHA-256, RSA-2048/RSA-PSS/SHA-256 verification, PDF metadata, and QR URL.
- **Dependencies:** WORK-001, EVID-001, AUTH-001.
- **Allowed files:** `backend/certificates/**`, crypto fixtures/tests, approved settings/secrets configuration.
- **Forbidden files:** Frontend/Flutter/private key material, changed primitives, legal-signature claims.
- **API dependency:** Certificate create/list/detail/revoke and public verification contract.
- **Data dependency:** Certificate, Inspection, Instrument, Application.
- **Security requirements:** Private key backend-only; canonical bytes; tamper/expiry/revocation outcomes; no "decrypt signature" language.
- **Acceptance criteria:** Stable fixtures verify; changed bytes fail; PDF/QR metadata is correct.
- **Tests:** Django unit/security/integration tests.
- **Verification command:** `cd backend; python manage.py test certificates`
- **Expected output:** Hash/signature/artifact tests pass.
- **Status:** BACKLOG

---

### PUB-001 — Public verification

- **Area/Owner/AI agent:** BACKEND + WEB / Backend and Web Teams / coding-agent
- **Target client:** CROSS_CUTTING
- **Objective:** Implement minimal unauthenticated certificate verification API and `/verify/[certNo]` UI.
- **Dependencies:** CRYPTO-001.
- **Allowed files:** `backend/verification/**`, certificate public serializer/tests, `frontend/src/app/verify/**`, tests.
- **Forbidden files:** Public internal IDs/secrets, login requirement, client-side trust calculation.
- **API dependency:** `GET /api/v1/certificates/verify?certNo=...`.
- **Data dependency:** Certificate status and public payload subset.
- **Security requirements:** Rate limit, minimized data, valid signature/status precedence, safe output encoding.
- **Acceptance criteria:** `VALID`, `EXPIRED`, `REVOKED`, `INVALID` are correct and accessible.
- **Tests:** Django API/security + Testing Library/Playwright when configured.
- **Verification command:** `cd backend; python manage.py test verification`
- **Expected output:** Public verification and minimization tests pass.
- **Status:** BACKLOG

---

### QA-001 — End-to-end / security acceptance

- **Area/Owner/AI agent:** QA / QA Team / qa-agent
- **Target client:** QA
- **Objective:** Verify the complete client-independent workflow and security gates across Web, Flutter, and React PWA.
- **Dependencies:** API-001, AUTH-001, FLUTTER-002, FIELD-001, OFF-001, CRYPTO-001, PUB-001.
- **Allowed files:** QA tests, fixtures, reports, approved test config.
- **Forbidden files:** Production feature fixes without owner task; real data/secrets.
- **API dependency:** All documented endpoints.
- **Data dependency:** All canonical entities and states.
- **Security requirements:** Auth/RBAC/ownership, idempotency, evidence, crypto, public minimization, audit integrity.
- **Acceptance criteria:** Critical tests cover React Web, Flutter (official), and React PWA (testing); no critical/high finding remains unaccepted.
- **Tests:** Django tests, Vitest/Testing Library, `flutter test`, Playwright when configured, security/accessibility/performance checks.
- **Verification command:** `cd backend; python manage.py test; cd ../frontend; pnpm exec vitest run; pnpm lint; pnpm build; cd ../flutter_field_app; flutter test`
- **Expected output:** All configured suites pass; absent suites are explicitly reported.
- **Status:** BACKLOG
