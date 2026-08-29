# Development Workflow

This workflow applies after documentation freeze. The current migration is documentation-only and does not start feature implementation.

## Standard flow

```text
Task
→ Dependencies
→ Canonical docs
→ Branch
→ Implementation
→ Tests
→ Local verification
→ Pull request
→ Human review
→ Merge
→ Integration verification
→ DONE
```

## Repository commands

```bash
# Backend
cd backend
python manage.py check
python manage.py test

# Frontend
cd frontend
pnpm lint
pnpm exec vitest run
pnpm build
```

Use `python manage.py migrate` only for an approved database task. Use `pnpm dev` and `python manage.py runserver 8000` for local development. There is no root workspace command, no pytest command, and no Docker/Compose command in this checkout.

## Task, branch, and review rules

- Select a `READY` task from [TASK_BOARD.md](TASK_BOARD.md); do not invent scope.
- Confirm dependencies are `DONE`, or record an approved exception.
- Read ADRs, PRD, DATA_MODEL, API_CONTRACT, and the relevant frontend/offline/security document.
- Use one implementation owner and a dedicated `feature/<TASK-ID>-<short-name>` branch; docs migrations may use `docs/<short-name>`.
- Keep commits small and conventional. Do not commit application code for a documentation task.
- A PR states task ID, scope, allowed files, API/data/security impact, commands/results, screenshots where relevant, migration notes, and known risks.

## Architecture and API changes

Architecture changes require an ADR with context, alternatives, decision, consequences, and migration impact before implementation. API/data changes update API_CONTRACT, DATA_MODEL, frontend/offline docs, tests, and task dependencies together. Web, PWA, and Flutter never receive separate business contracts.

## Database changes

Database changes require an approved task, Django model/migration plan, rollback or forward-recovery plan, ownership review, integration tests, and documentation alignment. Django migrations are the only active schema migration mechanism; the logical data model remains the technology-independent contract.

## Security and completion

Auth, ownership, evidence, public data, sync, certificate, key, and cryptography changes require security review. If source and docs disagree, stop and record the conflict instead of silently selecting a new architecture. The owner reports files, tests, verification output, risks, and follow-ups. QA confirms critical tests before the task is marked `DONE`.
