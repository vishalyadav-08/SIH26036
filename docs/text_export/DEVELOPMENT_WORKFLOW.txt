# Development Workflow

This workflow applies after documentation freeze (M0). Use this document for all implementation tasks.

## Standard Flow

```text
Task (READY from TASK_BOARD.md)
     │
     ▼
Read dependencies and canonical docs
     │
     ▼
Inspect repository evidence (do not invent technology)
     │
     ▼
Create feature/docs branch
     │
     ▼
Implement smallest scoped change
     │
     ▼
Run verification commands (record exact output)
     │
     ▼
Pull request — state task ID, scope, allowed files, impact, results, risks
     │
     ▼
Human review (mandatory for auth/crypto/API/migration/architecture)
     │
     ▼
Merge
     │
     ▼
Integration verification
     │
     ▼
DONE
```

## Repository Commands

### Backend (Python / Django 6.1 / DRF)

```bash
cd backend
python -m pip install -r requirements.txt   # install dependencies
python manage.py check                       # validate settings and config
python manage.py migrate                     # apply migrations (approved task only)
python manage.py test                        # run all backend tests
python manage.py test <app>                  # run tests for a specific app
python manage.py runserver 8000              # local development server
```

Use `python manage.py migrate` only for an approved database task. Django migrations are the only active schema migration mechanism — Flyway and Liquibase are retired.

### Web Frontend (Next.js / React / TypeScript / pnpm)

```bash
cd frontend
pnpm install                  # install dependencies
pnpm dev                      # local development server (port 3000)
pnpm lint                     # ESLint check
pnpm exec vitest run          # run Vitest tests
pnpm build                    # production build
```

### Flutter Field Application (Official Field Client)

```bash
cd flutter_field_app
flutter pub get               # install dependencies
flutter run                   # run on connected device/emulator
flutter test                  # run Dart unit, widget, and integration tests
flutter analyze               # static analysis
flutter build apk             # Android release build
flutter build ios             # iOS release (macOS + Xcode required)
```

**Flutter toolchain must be installed.** Run `flutter doctor` to verify the environment. New Flutter packages require an ADR before they are added to `pubspec.yaml`.

### React Field PWA (Testing / Prototype Client)

The React PWA shares the frontend toolchain. PWA-specific testing:

```bash
cd frontend
pnpm exec vitest run          # includes PWA offline/Dexie tests
```

Label all PWA tasks as `FIELD_PWA_TESTING`. Do not treat PWA improvements as production field client work.

## Task, Branch, and Review Rules

- Select a `READY` task from [TASK_BOARD.md](TASK_BOARD.md); do not invent scope.
- Confirm dependencies are `DONE`, or record an approved exception.
- Read ADRs, PRD, DATA_MODEL, API_CONTRACT, and the relevant specialist document before acting.
- Use one implementation owner and a dedicated branch: `feature/<TASK-ID>-<short-name>` or `docs/<short-name>`.
- Keep commits small and conventional. Do not commit application code for a documentation-only task.
- A PR states task ID, scope, allowed files, API/data/security impact, commands/results, screenshots where relevant, migration notes, and known risks.

## Architecture and API Changes

Architecture changes require an ADR with context, alternatives, decision, consequences, and migration impact **before implementation**. API/data changes update API_CONTRACT, DATA_MODEL, frontend/offline/Flutter docs, tests, and task dependencies together. React Web, React PWA, and Flutter never receive separate business contracts.

## Flutter Package Decisions

Any new Flutter package (local persistence, state management, HTTP, camera, GPS, secure storage, background sync) requires:
1. Research and comparison in an ADR.
2. ADR accepted by Project Lead before `pubspec.yaml` changes.
3. Integration task on TASK_BOARD.md.

Do not add Flutter packages speculatively.

## Database Changes

Database changes require an approved task, Django model/migration plan, rollback or forward-recovery plan, ownership review, integration tests, and documentation alignment. Django migrations are the only active schema migration mechanism.

## Security and Completion

Auth, ownership, evidence, public data, sync, certificate, key, and cryptography changes require security review. If source and docs disagree, stop and record the conflict instead of silently selecting a new architecture. The owner reports files, tests, verification output, risks, and follow-ups. QA confirms critical tests before the task is marked `DONE`.
