# AI Task Template

Copy this template into every task assignment. Write `None` only when a field genuinely does not apply.

```text
TASK ID:
TITLE:
AREA:
OWNER:
AI AGENT:
TARGET CLIENT: WEB | FLUTTER | FIELD_PWA_TESTING | BACKEND | SECURITY | QA | DOCS | CROSS_CUTTING

OBJECTIVE:
CONTEXT:
DOCS TO READ:
DEPENDENCIES:

ALLOWED FILES:
FORBIDDEN FILES:
API CONTRACT:
DATA CONTRACT:
SECURITY REQUIREMENTS:

ACCEPTANCE CRITERIA:
TEST REQUIREMENTS:
VERIFICATION COMMANDS:
EXPECTED OUTPUT:
COMMIT MESSAGE:

IMPLEMENTATION SUMMARY:
FILES CHANGED:
TEST RESULTS:
KNOWN RISKS / OPEN DECISIONS:
HUMAN REVIEWER:
```

## TARGET CLIENT Reference

| Value | Meaning |
|---|---|
| `WEB` | React web application — Business/Admin/Public routes in `frontend/src/app/app`, `admin`, `verify` |
| `FLUTTER` | **Official field application** — Flutter/Dart at `flutter_field_app/`. This is the production field client. |
| `FIELD_PWA_TESTING` | React field PWA — **testing/prototype client only** — routes at `frontend/src/app/field/`. Not the final field application. |
| `BACKEND` | Django + DRF — `backend/**` |
| `SECURITY` | Cross-cutting security, crypto, key management |
| `QA` | Test infrastructure, fixtures, acceptance |
| `DOCS` | `docs/**` documentation only |
| `CROSS_CUTTING` | Two or more client areas sharing a common concern |

> [!IMPORTANT]
> **`FLUTTER`** = official field production client.
> **`FIELD_PWA_TESTING`** = testing/prototype validation client only.
> Never use `FIELD_PWA` as an ambiguous unqualified production field client designation.

## Rules for Agents

The agent must not begin when dependencies, allowed/forbidden files, API/data contract, target client, or security requirements are missing.

The agent must:
- Read the assigned task and current canonical docs before acting.
- Not assume the field client is Flutter or PWA without reading the task TARGET CLIENT.
- Understand that `FLUTTER` = official field client and `FIELD_PWA_TESTING` = testing only.
- Not reintroduce Java, Spring Boot, or Maven for any target client.
- Not use `docs/reference/**` as an implementation authority.

A completed task includes the bottom summary section and evidence from the listed verification commands.
