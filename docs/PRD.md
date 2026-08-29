# MapanSetu Product Requirements Document

**Product:** MapanSetu  
**Problem statement:** SIH26036 — Development of an Online Verification System for Weighing and Measuring Instruments.  
**Document status:** Documentation Freeze / implementation-ready specification  
**Prototype boundary:** Internal college/SIH prototype using synthetic data and configurable demo values.

## 1. Executive summary

MapanSetu is a digital lifecycle management platform for regulated weighing and measuring instruments. It coordinates business registration, instrument identity, verification applications, officer assignment, scheduling, field inspection, evidence capture, decisions, certificate generation, public certificate lookup, expiry monitoring, and re-verification history.

The software manages records and workflow. It does not physically verify an instrument, replace an authorized Legal Metrology Officer, grant statutory approval, or claim a live government integration.

### Client strategy

Business and Administrator/Supervisor workflows are delivered through the React/Next.js web application. Officer field work is client-independent: the current testing/fallback path is the React field PWA, while Flutter is the preferred native field client if it is ready before the internal hackathon. The officer must be able to continue previously cached inspection work without network connectivity; the PRD does not prescribe browser storage or a mobile database.

## 2. Problem definition and background

Regulated weighing and measuring instruments require periodic verification or re-verification by authorized personnel under applicable Legal Metrology rules. In the target problem context, requests, schedules, inspection notes, evidence, certificates, and expiry follow-up may be manual or fragmented. This creates uncertainty about queue status, officer workload, evidence completeness, certificate retrieval, and whether a record is current.

The platform addresses the digital coordination problem: one traceable record from instrument registration through inspection and certificate lifecycle, with public lookup for a certificate number and a field workflow that remains usable when connectivity is poor.

### Existing workflow and pain points

1. A business identifies an instrument requiring verification.
2. It submits information and supporting material through a manual or fragmented channel.
3. An administrator reviews, assigns, and schedules work.
4. An officer visits the site, records readings and evidence, and makes an authorized decision.
5. A certificate is issued and later retrieved or checked.
6. Expiry and re-verification must be monitored.

Pain points are duplicated typing, unclear status, missed schedules, difficult certificate retrieval, weak evidence traceability, limited field connectivity, and no convenient public lookup. These are product assumptions to validate in the prototype, not claims about every jurisdiction.

## 3. Product vision and goals

### Vision

Provide a credible, traceable digital bridge between businesses, authorized officers, supervisors, and the public for instrument verification records.

### Measurable product goals

- Digitize the lifecycle from registration to re-verification without requiring paper as the primary workflow record.
- Make current application state, assignment, schedule, result, and certificate status visible to permitted users.
- Preserve evidence, actor, time, and audit context for each important action.
- Improve certificate trust through canonical payload hashing, prototype digital signature verification, and QR lookup.
- Enable field users to capture an accepted draft, readings, evidence, and available location offline.
- Make expiry and re-verification candidates discoverable through dashboards and notifications.
- Measure processing time, data-entry time, sync reliability, duplicate prevention, evidence upload success, and public verification latency without inventing target percentages.

### Product boundaries and non-goals

The MVP does not perform physical measurement itself, determine statutory tolerances, make an autonomous legal decision, provide real legal-signature authority, connect to unavailable government systems, or use real personal datasets. Prototype tolerance and validity values are DEMO/CONFIGURABLE.

## 4. Stakeholders and personas

| Persona | Responsibilities | Pain points | Goals | Permissions | Key workflows |
|---|---|---|---|---|---|
| Business / Instrument Owner | Maintain business and instrument information; request verification; track records | Repeated entry, unclear status, hard-to-find certificate | Submit once, see progress, retrieve history | Own business profile, instruments, applications, released certificates/notifications | Register, apply, monitor, download, re-verify |
| Legal Metrology Officer (LMO) | Perform authorized field inspection and record evidence/decision | Poor connectivity, time pressure, evidence capture | Complete accurate work with resilient capture | Assigned inspection data; create readings/evidence; submit result | Open assignment, inspect, save offline, sync, decide |
| Administrator / Supervisor | Manage users, queue, assignment, schedule, certificates, audit, expiry monitoring | Fragmented queue and limited oversight | Allocate work, resolve exceptions, monitor lifecycle | Prototype-wide administration, subject to audit | Assign, schedule, review, revoke, monitor |
| Public verifier / consumer | Check whether a certificate number is valid/current | No account or trusted source | Fast, minimal, understandable result | Unauthenticated minimal certificate verification only | Scan QR or enter certificate number |

## 5. User journeys

### A. Business registration

The user logs in or begins registration, enters required business/contact data, receives validation feedback, and obtains a business record. The system does not claim external registration validation.

### B. Instrument registration

The business enters instrument number, serial number where available, type, manufacturer, model, capacity/unit, and location. Duplicate identity checks return a clear error. The instrument becomes available in the passport and application form.

### C. Verification application

The business selects an owned instrument, enters the request reason and required details, saves a draft if needed, then submits. Backend validation changes state from `DRAFT` to `SUBMITTED` and records the actor/time.

### D. Officer assignment

An administrator views the queue, selects an eligible officer, confirms assignment, and the backend changes state to `ASSIGNED`. Assignment history and audit event are recorded.

### E. Scheduling

The administrator selects date/time and schedule note, confirms conflicts visibly, and submits. The backend changes state to `SCHEDULED` and notifies permitted users.

### F. Field inspection

The assigned officer opens the case, starts the session, completes the checklist, records measurements, captures evidence, confirms available GPS/time metadata, reviews, and records `PASS`, `FAIL`, or `REQUIRES_CORRECTION`. The application state is then completed only by valid backend rules.

### G. Offline inspection

While online, the officer caches assigned case data. Without network, the officer can reopen cached data, edit the inspection, capture photos/readings/location when available, and save a local draft. The client never presents local state as server-confirmed.

### H. Sync

When connectivity returns, queued operations are sent to `POST /api/v1/sync` with a UUID `clientOperationId`. The server is idempotent. Results are shown as `SYNCED`, `FAILED`, or `CONFLICT`; conflicts are never silently overwritten.

### I. Pass/fail decision

The officer reviews readings and evidence, chooses the separate inspection result, enters required notes, and submits. A result does not replace the application state enum.

### J. Certificate generation

For an eligible completed pass, the backend builds the canonical payload, hashes and signs it, generates a PDF, stores the artifact, and returns certificate metadata and QR verification URL. Prototype signing is not an authorized legal signature.

### K. Public certificate verification

An unauthenticated person scans the QR or enters a certificate number at `/verify/:certNo`. The page calls the public API and displays `VALID`, `EXPIRED`, `REVOKED`, or `INVALID` with minimal disclosure.

### L. Expiry notification

The system identifies certificates approaching `validUntil`, creates in-product notifications for permitted recipients, and shows the item in admin monitoring. Notification timing is configurable for the prototype.

### M. Re-verification

The business starts a new Application for the existing Instrument. The new record links to the instrument passport and prior certificate history; the old application/certificate is not overwritten.

### N. Instrument history/passport

Permitted users see identity, current status, applications, inspections, certificates, and relevant evidence links in chronological order, with ownership and disclosure rules applied.

## 6. Functional requirements

### Identity and access

- **FR-001:** The system shall authenticate users through the Django/DRF API using the configured JWT authentication boundary.
- **FR-002:** The system shall support exactly the authenticated roles `ADMIN`, `OFFICER`, and `BUSINESS`; public verification shall not require an authenticated role.
- **FR-003:** The system shall enforce both role authorization and object ownership/assignment on the backend.
- **FR-004:** The system shall provide the authenticated user profile through `GET /api/v1/users/me`.
- **FR-005:** The system shall record security-relevant login and access events without logging credentials or tokens.

### Business and instrument registry

- **FR-006:** A permitted business user shall create and update its business profile.
- **FR-007:** A business user shall register an instrument with canonical identity fields from `DATA_MODEL.md`.
- **FR-008:** The system shall reject duplicate instrument identity within the applicable business scope.
- **FR-009:** Permitted users shall search/list instruments with pagination and safe filters.
- **FR-010:** The system shall present an instrument passport with lifecycle history and linked certificates.

### Applications, assignment, and scheduling

- **FR-011:** A business user shall create, save, edit, and submit an Application for an owned Instrument.
- **FR-012:** The backend shall enforce only the canonical application states and allowed transitions in `DATA_MODEL.md`.
- **FR-013:** An administrator shall assign an Application to an eligible officer and preserve assignment history.
- **FR-014:** An administrator shall schedule an assigned Application with date/time and audit data.
- **FR-015:** Permitted users shall view application status, timeline, assignment, schedule, and decision information.
- **FR-016:** The system shall reject unauthorized cross-business or unassigned-officer access.

### Inspection and evidence

- **FR-017:** An assigned officer shall start and inspect an assigned Application.
- **FR-018:** The inspection form shall support checklist items, Measurements, notes, and the separate inspection result enum.
- **FR-019:** The system shall validate numeric readings, units, required fields, and configurable DEMO/CONFIGURABLE rules without inventing statutory values.
- **FR-020:** The officer shall capture Evidence metadata and binary content through the field workflow.
- **FR-021:** The system shall record capture/server timestamps and available GPS accuracy metadata honestly, including unavailable/denied states.
- **FR-022:** The API shall validate file MIME type, size, generated object key, ownership, and upload result.

### Offline and sync

- **FR-023:** The field app shall cache previously assigned inspection data for offline use.
- **FR-024:** The current PWA field app shall persist drafts, Measurements, Evidence blobs, and sync operations in IndexedDB/Dexie. A future Flutter client shall provide equivalent offline behavior through its approved local persistence implementation.
- **FR-025:** Every offline operation shall include a UUID `clientOperationId`.
- **FR-026:** The server shall process duplicate `clientOperationId` retries idempotently and return the prior result.
- **FR-027:** The field app shall expose `LOCAL_DRAFT`, `READY_TO_SYNC`, `SYNCING`, `SYNCED`, `FAILED`, and `CONFLICT` states.
- **FR-028:** The sync flow shall detect version conflicts and require explicit resolution; it shall never silently overwrite server data.

### Certificate, QR, and public verification

- **FR-029:** The backend shall create a Certificate only through an eligible inspection/application flow.
- **FR-030:** The system shall store certificate payload hash, prototype signature metadata, PDF object key, and QR verification URL.
- **FR-031:** The QR code shall point only to `https://<frontend-domain>/verify/<certificateNo>`.
- **FR-032:** The public API shall expose `VALID`, `EXPIRED`, `REVOKED`, or `INVALID` verification outcome with minimal public data.
- **FR-033:** Authorized administrators shall revoke a certificate with a reason and audit event; no new undocumented route is implied by this requirement.

### Notifications, search, dashboards, and audit

- **FR-034:** The system shall create in-product notifications for submission, assignment, schedule, decision, sync failure, and expiry events where configured.
- **FR-035:** Notification recipients shall view and mark their own notifications read.
- **FR-036:** Business and admin lists shall support pagination, status filters, date filters, and safe text search where documented in the API.
- **FR-037:** The admin dashboard shall show queue, workload, schedule, expiry, certificate, and sync exception summaries from documented API data.
- **FR-038:** The system shall append audit events for state changes, assignment, schedule, evidence, decision, certificate, revocation, and sync outcomes.
- **FR-039:** The admin audit view shall show actor, action, entity, timestamp, and tamper-evident chain fields without exposing secrets.

### Administration and AI

- **FR-040:** An administrator shall manage prototype users/officers and configured demo reference data within approved ownership rules.
- **FR-041:** The system shall label synthetic/demo records and shall not imply live government integration.
- **FR-042:** Optional AI features may return OCR, extraction, missing-field, image-quality, or anomaly advice with confidence, explanation, fallback, and human-review status.
- **FR-043:** AI output shall never make the legal final decision or bypass officer confirmation.

## 7. Non-functional requirements

- **NFR-001 Security:** Enforce JWT authentication, RBAC, ownership/assignment checks, validation, safe file handling, rate limiting, CORS, TLS in production, and secret management.
- **NFR-002 Privacy:** Minimize public certificate data and do not use real personal datasets in the prototype.
- **NFR-003 Integrity:** Canonical certificate payloads and selected audit/evidence records shall have SHA-256 integrity handling.
- **NFR-004 Availability:** A healthy deployed prototype shall expose web, field, API, database, and object storage dependencies with documented health checks.
- **NFR-005 Performance:** List endpoints shall paginate; public verification shall be measured for latency; no unverified performance target is promised.
- **NFR-006 Usability:** Primary workflows shall expose status, progress, clear errors, and recovery actions.
- **NFR-007 Accessibility:** Web and field controls shall support keyboard/focus, labels, semantic structure, contrast, and screen-reader feedback.
- **NFR-008 Offline resilience:** Accepted local data shall survive app close/restart; interrupted sync shall be retryable and visible.
- **NFR-009 Maintainability:** Domain modules, API DTOs, shared types, migrations, and tests shall have clear ownership.
- **NFR-010 Auditability:** Workflow/security events shall be attributable and tamper-evident without claiming absolute immutability.
- **NFR-011 Scalability:** The modular monolith shall support indexed relational queries and object-storage separation without requiring microservices.
- **NFR-012 Observability:** Logs and metrics shall support errors, sync attempts, API latency, certificate verification, and storage failures without secrets.
- **NFR-013 Data integrity:** Backend transactions and idempotency shall prevent duplicate applications, decisions, certificates, and sync actions.

## 8. Roles and authorization matrix

`PUBLIC` is a user category for unauthenticated access, not an authenticated role.

| Feature | ADMIN | OFFICER | BUSINESS | PUBLIC |
|---|---|---|---|---|
| Login/profile | Own; manage users | Own | Own | No login |
| Business profile | Administer | Read when needed | Own | No |
| Instrument registry | Read/administer | Assigned/authorized read | Own create/read/update | No |
| Applications | All prototype scope | Assigned read/update workflow | Own create/read/submit | No |
| Assignment/scheduling | Create/update | Read assigned schedule | Read own schedule | No |
| Inspection/readings/evidence | Review | Assigned create/update | Read released results | No |
| Certificate management | Issue/revoke/review | Read assigned/result certificate | Read/download own | Verify minimal result |
| Notifications | Operational view | Own | Own | No |
| Audit | Read | No internal audit administration | No | No |
| Public verification | No login | No login | No login | Lookup by certificate number |

## 9. Lifecycle definitions

Application state, inspection result, certificate status, and offline sync state are separate enums. Their canonical values and transitions are defined in [DATA_MODEL.md](DATA_MODEL.md). The frontend displays backend state and never invents a UI-only workflow state.

## 10. MVP scope

The internal prototype must demonstrate synthetic business/instrument registration, application submission, admin assignment/scheduling, online and offline-capable officer inspection flow, readings/evidence, sync with idempotency, decision recording, certificate artifact metadata, prototype hash/signature verification, QR/public lookup, instrument passport, expiry visibility, notifications, audit view, and testable security boundaries.

## 11. Post-MVP / SIH and future production scope

Post-MVP may add richer offline scheduling, jurisdiction configuration, analytics, AI advisory tools, integration adapters, production key custody/PKI, operational notification channels, retention policies, accessibility refinement, and scale hardening. Such work requires explicit data, legal, security, and integration decisions.

## 12. Out of scope and legal limitations

- No statutory approval by software alone.
- No live government API or identity integration without an available authorized interface.
- No real legal-signature authority from prototype RSA keys.
- No invented statutory tolerances, validity periods, or regulatory claims.
- No real personal datasets.
- No autonomous AI legal decision.

## 13. Acceptance criteria

- **AC-001:** A synthetic business can register an instrument and submit an Application; the API returns canonical IDs and states.
- **AC-002:** An administrator can assign and schedule the Application; unauthorized users cannot perform those actions.
- **AC-003:** An assigned officer can complete the inspection workflow online and record readings, evidence, timestamps, location availability, and a separate result.
- **AC-004:** The field app can reopen cached assigned data, save an accepted local draft after restart, and queue operations without network.
- **AC-005:** Replaying the same `clientOperationId` does not create a duplicate server action.
- **AC-006:** A version conflict is visible and requires explicit resolution.
- **AC-007:** An eligible completed pass creates a certificate payload hash, prototype signature metadata, PDF object reference, and QR URL.
- **AC-008:** Public verification displays correct `VALID`, `EXPIRED`, `REVOKED`, and `INVALID` states while minimizing data and requiring no login.
- **AC-009:** Business ownership, officer assignment, role authorization, input validation, and evidence file rules are enforced by tests.
- **AC-010:** Audit events include actor/action/entity/time and a verifiable tamper-evident chain.
- **AC-011:** The demo uses synthetic/configurable values and makes no statutory or live-integration claim.
- **AC-012:** All implementation tasks meet [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) and the critical gates in [TESTING_SECURITY.md](TESTING_SECURITY.md).

## 14. Product metrics

Measure, rather than pre-claim improvement, the following per synthetic test run and later pilot:

| Metric | Definition |
|---|---|
| Application processing time | `completedAt - submittedAt`, with state timestamps preserved |
| Field data-entry time | Officer inspection start to review-ready time |
| Certificate generation time | Decision accepted to certificate artifact available |
| Public verification latency | Public request received to response returned |
| Sync success rate | Successful sync operations / attempted operations |
| Duplicate sync prevention | Replays that produce one server action and stable result |
| Evidence upload success | Accepted evidence uploads / attempted uploads |
| Expiry visibility | Eligible expiring certificates visible in the configured monitoring view |
| Conflict rate | Sync operations requiring explicit conflict handling |

## 15. Risks, assumptions, and open decisions

### Risks

- Browser storage quotas or device permissions may limit offline evidence capture.
- Prototype cryptography can be misunderstood as legal authority unless clearly labelled.
- Configurable demo values can be mistaken for statutory rules.
- Unavailable external integrations limit real-world verification of jurisdiction workflows.

### Assumptions

- Authorized officers have an account and can cache assigned work while online.
- A controlled SIH environment can run PostgreSQL, MinIO, web, field, and API services.
- Synthetic identities and values are acceptable for the prototype demonstration.

### Open decisions before production

- Authorized PKI/HSM and certificate key rotation/custody.
- Jurisdiction-specific tolerance, validity, retention, and statutory workflow configuration.
- Identity proofing and government integration adapters.
- Production token storage/refresh/revocation policy.
- Notification channels, SLA, and data retention/deletion policy.

