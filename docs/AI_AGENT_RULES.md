# AI Agent Rules

These rules apply to all coding and documentation agents working on MapanSetu.
They are **non-negotiable** and must be followed in every task.

## General Process Rules

1. Read the assigned task and relevant active `docs/*.md` files before acting.
2. Inspect repository source and manifests to confirm technology choices. Do not invent or assume a technology.
3. Make the smallest scoped change. Do not modify unrelated paths or application code during a documentation-only task.
4. Run the task's verification commands and report exact results.
5. If documentation and repository architecture disagree, **stop and report the conflict with evidence** before taking action.
6. Human review is mandatory for auth, ownership, files, crypto, public data, migrations, API changes, and architecture.

## Backend Technology Rules (Non-Negotiable)

7. **Java is not part of the active architecture.** Never implement, reference, or instruct Java.
8. **Spring Boot is not part of the active architecture.** Never implement, reference, or instruct Spring Boot.
9. **Maven is not part of the active architecture.** Never reference or use `pom.xml`.
10. **Never reintroduce the retired backend architecture** (Java, Spring Boot, Maven, JPA, Hibernate, Flyway, Spring Security, `com.mapansetu.*`).
11. The active backend is **Python + Django 6.1 + Django REST Framework 3.18**. Use only repository-confirmed Python/Django commands and packages.

## Flutter Field Application Rules (Non-Negotiable)

12. **Flutter/Dart is the official field application.** The project exists at `flutter_field_app/` in the repository.
13. **Never describe Flutter as "planned", "conditional", "if ready", or "future target"** — it is present and official.
14. **Never replace Flutter with the React PWA** in architecture decisions, task targets, or demo paths.
15. **Never treat the React PWA as the production field application.**
16. The Flutter field app must use the same `/api/v1/` API contract as all other clients. Do not create Flutter-specific endpoints or server states.
17. **Do not invent Flutter packages.** All Flutter package choices require an ADR before adoption.
18. Do not modify `flutter_field_app/` in a documentation-only task.

## React PWA Rules (Non-Negotiable)

19. The **React field PWA** (`frontend/src/app/field/`) is a **testing / prototype client only**.
20. Never describe the React PWA as the final field architecture, primary mobile application, or production field client.
21. Label all React PWA tasks as `FIELD_PWA_TESTING` — never as an unqualified production client designation.
22. IndexedDB, Dexie, and Service Worker are **PWA-specific** implementation details. They are not the canonical offline storage mechanism.
23. The React PWA may be used as a technical demo fallback only when Flutter is unavailable for a specific test — and must be **explicitly labelled** as such.

## API and Domain Rules

24. React Web, Flutter, and React PWA all use the **same `/api/v1/` API contract**. The backend exposes no client-specific routes.
25. Business logic, state machines, permissions, ownership, and certificate semantics are **backend concerns**. Do not duplicate them in any client.
26. Do not create separate server states or endpoints for Flutter vs. PWA.
27. The backend is authoritative for authentication, authorization, ownership, assignment, transitions, certificates, sync, and public verification.
28. Use UUID `clientOperationId` and idempotent replay semantics for retriable/offline mutations.
29. Never silently overwrite, merge unsafe changes, or report local data as server-confirmed.

## Data Model Rules

30. Preserve the canonical roles, application states, inspection results, certificate statuses, and offline states in [DATA_MODEL.md](DATA_MODEL.md).
31. Client models are representations of the API/data contract — no client becomes a canonical data authority.

## Security Rules (Non-Negotiable)

32. **Never expose secrets, JWTs, password hashes, private keys, or unnecessary public data.**
33. **Never place private signing keys in Flutter, React PWA, React Web, or version control.**
34. Never change SHA-256, RSA-2048, RSA-PSS, or Argon2id primitives without a security ADR.
35. Never expose internal IDs, credentials, or certificate signing material through public endpoints.

## Documentation Rules (Non-Negotiable)

36. **Do not use `docs/reference/**` as active architectural authority.** It is historical/non-active material.
37. **Do not modify historical files in `docs/reference/`.** They are preserved for traceability only.
38. Active architecture is defined only by Markdown files directly under `docs/` (not in subdirectories).
39. If active `docs/*.md` documents conflict with each other, resolve in this order: ADRs → PRD → DATA_MODEL → API_CONTRACT → TECH_STACK → specialist docs → delivery docs.
40. If documentation conflicts with repository source, stop and record the conflict before acting.
