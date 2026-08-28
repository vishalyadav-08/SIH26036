# Architecture Decision Records

All records are accepted for the MVP unless a later, explicit ADR supersedes them. Each record includes Context, Decision, Reason, Consequences, and Status as required by the documentation freeze.

## ADR-001 — Modular monolith

- **Context:** The prototype needs several related domains but a small team and simple deployment.
- **Decision:** Build one Java/Spring Boot modular monolith with explicit domain packages.
- **Reason:** Transactional workflow, low operational overhead, and clear ownership are more valuable than independent deployment in the MVP.
- **Consequences:** Modules must not bypass ownership boundaries; extraction is a future decision, not an MVP requirement.
- **Status:** Accepted

## ADR-002 — Java 21 + Spring Boot

- **Context:** The API needs durable security, validation, transactions, and relational persistence.
- **Decision:** Use Java 21 LTS, Spring Boot 3.x, and Maven.
- **Reason:** Mature enterprise security and persistence ecosystem with strong long-term support.
- **Consequences:** Backend modules, tests, and build automation are Java/Maven based.
- **Status:** Accepted

## ADR-003 — React + TypeScript web

- **Context:** Business, admin, and public verification need a responsive browser experience.
- **Decision:** Use React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod, and Recharts.
- **Reason:** Shared type-safe frontend foundation and productive component architecture.
- **Consequences:** Server state is managed with TanStack Query; reusable UI belongs in shared packages where appropriate.
- **Status:** Accepted

## ADR-004 — React + TypeScript field PWA

- **Context:** Officers need camera, location, installability, and offline operation.
- **Decision:** Use a React/TypeScript/Vite PWA with Service Worker, Workbox where useful, IndexedDB/Dexie, Camera API, and Geolocation API.
- **Reason:** One browser technology path supports the required offline workflow and team skills.
- **Consequences:** Device permissions, storage quota, cache updates, and sync conflicts are product requirements.
- **Status:** Accepted

## ADR-005 — PostgreSQL

- **Context:** The lifecycle has relational ownership, state, history, and audit relationships.
- **Decision:** Use PostgreSQL 16+ as the system of record.
- **Reason:** Transactions, constraints, querying, and mature operational support.
- **Consequences:** Domain integrity is enforced through service logic and database constraints.
- **Status:** Accepted

## ADR-006 — Flyway migrations

- **Context:** Database changes need an ordered, reviewable history.
- **Decision:** Use Flyway migrations in the backend.
- **Reason:** Versioned schema evolution fits CI and controlled deployment.
- **Consequences:** No manual or competing schema source is authoritative.
- **Status:** Accepted

## ADR-007 — MinIO for local/SIH object storage

- **Context:** Evidence and certificate PDFs are binary artifacts.
- **Decision:** Use MinIO locally and for the SIH prototype behind an S3-compatible storage abstraction.
- **Reason:** Repeatable local deployment with a future production path.
- **Consequences:** Object keys, MIME validation, size limits, and access policy are part of the API design.
- **Status:** Accepted

## ADR-008 — Spring Security + JWT

- **Context:** Web and field clients need authenticated API access.
- **Decision:** Use Spring Security with JWT access tokens.
- **Reason:** Standard integration with a stateless REST API and role/ownership checks.
- **Consequences:** Token issuance, expiry, revocation strategy, and client storage require security review.
- **Status:** Accepted

## ADR-009 — Argon2id

- **Context:** Passwords must not be stored reversibly or with a fast hash.
- **Decision:** Hash passwords with Argon2id using reviewed parameters.
- **Reason:** Memory-hard password hashing appropriate for credential protection.
- **Consequences:** Parameters must be centrally configured and migration strategy documented if changed.
- **Status:** Accepted

## ADR-010 — SHA-256 integrity hashing

- **Context:** Certificate payloads and selected evidence/audit records need stable fingerprints.
- **Decision:** Use SHA-256 over canonical UTF-8 bytes.
- **Reason:** Widely supported and suitable for integrity fingerprints.
- **Consequences:** Canonical serialization is mandatory; hashes do not by themselves prove issuer identity.
- **Status:** Accepted

## ADR-011 — RSA-2048 + RSA-PSS + SHA-256 certificate signing

- **Context:** A certificate artifact needs a verifiable signature in the prototype.
- **Decision:** Sign the canonical certificate payload with RSA 2048 using RSA-PSS and SHA-256.
- **Reason:** The required prototype algorithm is supported by Java tooling and public-key verification.
- **Consequences:** The private key stays server-side and key custody is a production open decision.
- **Status:** Accepted

## ADR-012 — Tamper-evident audit hash chain

- **Context:** Audit history should reveal alteration or deletion within the recorded chain.
- **Decision:** Chain events with `currentHash = SHA-256(canonical(previousHash + canonicalEventData))`.
- **Reason:** Provides explainable tamper evidence without introducing a distributed ledger.
- **Consequences:** It is not absolute immutability; access control, backups, and operational controls remain necessary.
- **Status:** Accepted

## ADR-013 — No blockchain for MVP

- **Context:** A distributed ledger would add complexity without solving the prototype’s primary workflow problem.
- **Decision:** Do not use blockchain as a core dependency.
- **Reason:** The modular monolith plus audit hash chain is sufficient for the scoped prototype.
- **Consequences:** Strong claims of immutability are prohibited.
- **Status:** Accepted

## ADR-014 — No microservices for MVP

- **Context:** The domain is broad but the delivery team and prototype scale are limited.
- **Decision:** Do not split the backend into microservices.
- **Reason:** Avoids distributed transactions, deployment overhead, and premature operational complexity.
- **Consequences:** Module boundaries and contract tests must be strong inside one process.
- **Status:** Accepted

## ADR-015 — AI advisory only

- **Context:** OCR and quality assistance may reduce data-entry effort but can be wrong.
- **Decision:** AI outputs are optional advisory signals; an authorized officer remains responsible for the final decision.
- **Reason:** Legal/statutory decisions must not be delegated to an unreviewed model.
- **Consequences:** Confidence, explanation, fallback, and human review are required in any AI feature.
- **Status:** Accepted

## ADR-016 — Synthetic demo data

- **Context:** No authorized live government dataset or integration is available for this prototype.
- **Decision:** Use synthetic businesses, instruments, inspections, certificates, and AI demo inputs.
- **Reason:** Avoids privacy and access claims while keeping the demo reproducible.
- **Consequences:** Prototype outputs must be labelled synthetic/demo and regulatory values configurable.
- **Status:** Accepted

## ADR-017 — Public verification without authentication

- **Context:** A consumer should be able to check a certificate without an account.
- **Decision:** `GET /api/v1/certificates/verify?certNo={certificateNo}` and `/verify/:certNo` are unauthenticated, rate-limited public access paths.
- **Reason:** Frictionless lookup with minimal public disclosure.
- **Consequences:** There is no authenticated `PUBLIC` role; response minimization and abuse controls are mandatory.
- **Status:** Accepted

## ADR-018 — Shared TypeScript packages

- **Context:** Web and field clients need aligned API/domain types and UI/config conventions.
- **Decision:** Share non-secret types, UI primitives, and configuration through `packages/types`, `packages/ui`, and `packages/config`.
- **Reason:** Reduces contract drift while preserving app-specific features.
- **Consequences:** Shared packages must not contain server secrets or field-only business logic.
- **Status:** Accepted

## ADR-019 — npm workspaces + Maven

- **Context:** Frontend packages have one JavaScript dependency graph; the API has a Java dependency graph.
- **Decision:** Use npm workspaces for `apps/*` and `packages/*`; use Maven for `services/api`.
- **Reason:** Native tooling for each ecosystem with a small, understandable monorepo.
- **Consequences:** CI runs both toolchains and root scripts must make boundaries obvious.
- **Status:** Accepted

## ADR-020 — React PWA instead of Flutter

- **Context:** The active field requirement is a browser-installable offline app.
- **Decision:** Implement the field app in React/TypeScript as a PWA; Flutter and Dart are not active architecture.
- **Reason:** Aligns the field app with the web skillset, shared packages, and browser device APIs.
- **Consequences:** PWA limitations and browser permission behavior must be tested explicitly.
- **Status:** Accepted

