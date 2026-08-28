# Development Workflow

This process applies after M0. The current task performs documentation only and does not start Stage 2 implementation.

## Standard flow

```text
Task selected
→ Dependencies checked
→ Relevant docs read
→ Branch created
→ Human/AI owner assigned
→ Implementation
→ Tests
→ Local verification
→ Pull request
→ Human review
→ Fix comments
→ Merge to develop
→ Integration test
→ Task marked DONE
```

## Task and branch rules

- Select a `READY` task from [TASK_BOARD.md](TASK_BOARD.md); do not invent scope.
- Confirm dependency tasks are `DONE`, or record an approved exception.
- Read ADRs, PRD, DATA_MODEL, API_CONTRACT, and the relevant frontend/offline/security document.
- One task has one implementation owner; use `feature/<TASK-ID>-<short-name>`.
- No direct commits to `main`; merge feature branches into `develop`, then release through review.
- Keep commits small and use Conventional Commit style, e.g. `feat(api): add instrument ownership checks` or `test(field): cover restart persistence`.

## Pull requests

PRs must state task ID, problem, scope, files changed, API/data/security impact, tests/commands, screenshots for UI, migration notes, and known limitations. A PR may not add an undocumented endpoint, status, role, field, dependency, or route. Reviewers verify allowed files and task acceptance criteria.

## Review and escalation

Human review is required before merge. Security/crypto/file/auth/public-data changes require Team 5 review. Cross-module/API/data changes require Project Lead review. If implementation conflicts with a canonical document, stop and raise an ADR or clarification task; do not silently choose a new design. If a dependency is blocked, set the task `BLOCKED` with evidence and owner.

## Architecture-change procedure

1. Open an architecture decision task.
2. Describe context, alternatives, decision, consequences, and migration impact.
3. Obtain Project Lead approval.
4. Update the relevant ADR and dependent docs.
5. Update task dependencies and tests.
6. Only then implement.

## API-change procedure

Update `API_CONTRACT.md`, `DATA_MODEL.md` if fields/entities change, frontend/offline docs if behavior changes, security tests, and affected task board entries before code review. Preserve backward compatibility or document migration/versioning.

## Database-change procedure

Database changes require a dedicated approved task, a Flyway migration, rollback/forward-recovery plan, data ownership review, integration tests, and documentation alignment. The logical data model remains the contract; it is not replaced by an unreviewed SQL file.

## Completion and release

The owner reports summary, tests, verification commands, risks, and follow-ups. QA confirms critical acceptance tests. The task is marked `DONE` only when [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) passes and integration checks are green.

