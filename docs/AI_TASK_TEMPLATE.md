# AI Task Template

Copy this template into every task assignment. Write `None` only when a field genuinely does not apply.

```text
TASK ID:
TITLE:
AREA:
OWNER:
AI AGENT:
TARGET CLIENT: WEB | FIELD_PWA | FLUTTER | BACKEND | SECURITY | QA | DOCS | CROSS_CUTTING

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

The agent must not begin when dependencies, allowed/forbidden files, API/data contract, target client, or security requirements are missing. The agent must read the assigned task and current field-client decision; it must not assume the field client is Flutter or PWA. A completed task includes the bottom summary and evidence from the listed commands.
