# docs/reference — Historical and Non-Active Material

This directory contains historical, superseded, and non-active documentation for MapanSetu (SIH26036).

## Purpose

This directory exists for **traceability and preservation only**.

It is **NOT** authoritative documentation. Nothing in this directory may be used as:

- an implementation instruction
- an active architecture decision
- a task requirement
- a build or deployment command
- a technology dependency

## Contents

| Directory | Contents |
|---|---|
| `archive/` | Historical Markdown files from earlier architecture phases (old index, old PRD, old tech stack, Java/Spring documents, previous execution plans, etc.) |
| `text/` | Reserved for old `.txt` documentation files |

## How to use

**Do not read these files to determine what to build.**

Read only the Markdown files directly under `docs/` for active architecture, decisions, and implementation guidance.

## AI Agent Notice

> [!CAUTION]
> AI agents **MUST NOT** use `docs/reference/**` as architectural authority.
> Historical documents may describe retired technologies (Java, Spring Boot, Maven, React PWA as final field app) that are **no longer active**.
> If an agent finds a conflict between `docs/reference/` and active `docs/*.md`, the active `docs/*.md` files win unconditionally.

## Active documentation

All active specification lives in `docs/*.md` — the Markdown files directly under `docs/`, **not** in any subdirectory.

The active documentation hierarchy is:

```text
docs/README.md
      ↓
docs/PRD.md
      ↓
docs/ARCHITECTURE.md + docs/ARCHITECTURE_DECISIONS.md
      ↓
docs/TECH_STACK.md
      ↓
docs/DATA_MODEL.md + docs/API_CONTRACT.md
      ↓
docs/FRONTEND.md + docs/OFFLINE_APP.md + docs/CRYPTOGRAPHY.md + docs/TESTING_SECURITY.md
      ↓
docs/EXECUTION_PLAN.md + docs/TASK_BOARD.md + docs/DEVELOPMENT_WORKFLOW.md
      ↓
docs/DEFINITION_OF_DONE.md + docs/DEMO_PLAN.md
```

## Modification policy

**Do not modify the historical files in this directory.**

The preservation is intentional. Historical files may describe superseded decisions, old technology choices, and earlier product thinking — these remain for context and traceability, not for implementation.

The only file that may be added or modified here is this `README.md`.
