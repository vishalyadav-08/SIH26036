# Technology Stack

This is the frozen MVP/SIH prototype stack. A change requires an approved ADR before implementation work starts.

## Stack

| Area | Technology | MVP use | Future note |
|---|---|---|---|
| Web | React + TypeScript + Vite | Business/admin/public web app | Continue unless a new ADR replaces it |
| Web styling | Tailwind CSS + shadcn/ui | Accessible, consistent components | Keep design tokens centralized |
| Web routing/data/forms | React Router, TanStack Query, React Hook Form, Zod | Navigation, server state, forms, validation | No alternate state framework by default |
| Web charts | Recharts | Admin/dashboard charts | Use only for actionable metrics |
| Field | React + TypeScript + Vite | Officer field PWA | No separate native client in MVP |
| Field offline | PWA, Service Worker, Workbox where useful, IndexedDB, Dexie | Cached cases, drafts, evidence, sync queue | Storage and update strategy remain explicit |
| Device APIs | Browser Camera API, Browser Geolocation API | Evidence and location capture | Permission and denial paths are mandatory |
| Backend | Java 21 LTS + Spring Boot 3.x + Maven | One modular monolith API | Modular boundaries precede any later extraction decision |
| Backend libraries | Spring Web, Spring Security, Spring Data JPA, Hibernate, Bean Validation, Flyway, MapStruct, springdoc OpenAPI | HTTP, auth, persistence, migrations, mapping, API docs | Versions follow supported Spring Boot 3.x line |
| Database | PostgreSQL 16+ | Transactional system of record | Managed PostgreSQL is a future deployment concern |
| Object storage | MinIO | Local/SIH evidence and PDF storage | S3-compatible production adapter later |
| Auth | JWT access tokens, Spring Security, Argon2id | Authenticated API access | Token storage strategy must follow security review |
| Integrity/signing | SHA-256; RSA 2048 with RSA-PSS and SHA-256 | Certificate payload integrity and signature | Production key custody requires authorized PKI/HSM decision |
| QR/PDF | ZXing; maintained Java PDF library compatible with license | Certificate discovery QR and PDF artifact | Library version is selected during bootstrap review |
| Testing | JUnit 5, Mockito, Testcontainers, Vitest, Testing Library, Playwright, Bruno or Postman, OWASP ZAP, k6 | Unit through security/performance gates | Tool-specific scripts are implementation deliverables |
| Delivery | Git, GitHub, Docker, Docker Compose, GitHub Actions, Nginx | Local/SIH repeatable environments and CI | No Kubernetes in MVP |

## Explicit exclusions

The MVP does not use Node.js as the backend, Express, NestJS, Prisma, Flutter, Dart, React Native, MongoDB, MySQL, Firebase, Supabase, Turborepo, Kafka, Redis, Kubernetes, or blockchain as core architecture. A future alternative may be considered only through an ADR; it is not an active implementation option.

## Version policy

- Pin major versions in package manifests and Maven parent/dependency management.
- Prefer the latest compatible patch release within the selected major line after security review.
- Java 21 and PostgreSQL 16+ are minimums.
- Spring Boot remains on a supported 3.x release.
- Dependency upgrades must include regression tests and a documentation/ADR impact check.

## Package/build rules

- Root `package.json` owns npm workspaces for `apps/*` and `packages/*`.
- `package-lock.json` is the npm lockfile and is updated with workspace dependency changes.
- `services/api` is independently built by Maven using `pom.xml` and Maven Wrapper.
- Database changes are Flyway migrations under `services/api/src/main/resources/db/migration` once implementation begins.
- No SQL schema is maintained in this documentation set.

## Development ports

| Service | Port |
|---|---:|
| Web | 5173 |
| Field | 5174 |
| Backend | 8080 |
| PostgreSQL | 5432 |
| MinIO API | 9000 |
| MinIO console | 9001 |

