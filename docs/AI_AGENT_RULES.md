# AI Agent Rules

These rules apply to all coding and documentation agents working on MapanSetu.

1. Read the assigned task and relevant active docs before acting.
2. Never assume Java or Spring Boot is active.
3. Never reintroduce Java, Spring Boot, or Maven unless a new ADR explicitly approves it.
4. Treat the Django/DRF backend and Next.js/React frontend as repository-confirmed; verify any proposed dependency in source/manifests first.
5. Never assume Flutter is ready unless the current milestone/task says so.
6. Never assume the PWA is the final production field application.
7. Treat API and logical data contracts as client-independent across Web, PWA, and Flutter.
8. Do not create separate business logic or server states for Flutter and PWA.
9. Do not duplicate backend validation in a client as a security mechanism.
10. The backend is authoritative for authentication, authorization, ownership, assignment, transitions, certificates, sync, and public verification.
11. Preserve the canonical roles, application states, inspection results, certificate statuses, and offline states in `DATA_MODEL.md`.
12. Use UUID `clientOperationId` and idempotent replay semantics for retriable/offline mutations.
13. Never silently overwrite, merge unsafe changes, or report local data as server-confirmed.
14. Never change SHA-256, RSA-2048, RSA-PSS, or Argon2id primitives during a framework migration without a security ADR.
15. Never expose secrets, JWTs, password hashes, private keys, or unnecessary public data.
16. Do not use archived documentation as active architecture.
17. If documentation and repository architecture disagree, stop and report the conflict with evidence.
18. Do not modify unrelated paths or application code during a documentation-only task.
19. Run the task's verification commands and report exact results.
20. Human review is mandatory for auth, ownership, files, crypto, public data, migrations, API changes, and architecture.
