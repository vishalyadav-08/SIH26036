# AI Agent Rules

These rules apply to Codex, Claude Code, Antigravity, and other AI agents working on MapanSetu.

1. Read the assigned task and relevant active docs before coding.
2. Treat ADRs, PRD, DATA_MODEL, API_CONTRACT, and TECH_STACK as authoritative in that order.
3. Archived documents are historical only; never use them as active requirements.
4. Do not invent architecture, technologies, roles, routes, endpoints, fields, states, tolerances, integrations, or performance claims.
5. Do not change the frozen stack without an approved ADR.
6. Do not create undocumented endpoints or UI routes.
7. Do not change database structure without an approved task and Flyway migration.
8. Do not modify unrelated modules or files outside the task’s allowed list.
9. Do not expose secrets, credentials, JWTs, private keys, or real personal data.
10. Backend authorization is authoritative; never substitute UI hiding for security.
11. Keep Application state, Inspection result, Certificate status, and offline sync state separate.
12. Use `clientOperationId` UUIDs for offline/retriable operations and preserve idempotency.
13. Never silently overwrite sync conflicts or claim local state is server-confirmed.
14. Use RSA 2048/RSA-PSS/SHA-256 and SHA-256 as documented; verify signatures using the public key.
15. AI features are advisory only; never make the legal final decision.
16. Write tests with implementation and run the task’s verification commands before completion.
17. Use a feature branch and provide a concise change/test/risk summary.
18. Human review is mandatory, especially for auth, ownership, files, crypto, public data, and migrations.
19. Do not work concurrently on the same implementation area without explicit coordination.
20. If requirements conflict or a dependency is missing, stop, record evidence, and escalate through the workflow.

