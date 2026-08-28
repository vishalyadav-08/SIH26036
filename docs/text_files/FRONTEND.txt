# MapanSetu Web Application — PRD, UX, Design System and Frontend Architecture

## 1. Purpose and scope

The web application serves the Business / Instrument Owner, Administrator / Supervisor, and unauthenticated public verifier. Officer field work belongs to `apps/field` and is specified in [OFFLINE_APP.md](OFFLINE_APP.md).

Web objectives are to make status and next action obvious, reduce typing, preserve backend authority, support responsive browser use, and present public verification with minimal disclosure.

## 2. Roles and information architecture

- **Business:** `/app` workspace for dashboard, instruments/passports, applications, certificates, notifications, and profile.
- **Admin:** `/admin` workspace for queue, assignment, scheduling, instruments, officers, certificates, notifications, audit, settings, and operational dashboard.
- **Public:** `/` lookup landing page and `/verify/:certNo` result page; no login and no authenticated `PUBLIC` role.

Authenticated shell: skip link, header with identity/notifications, responsive sidebar/bottom navigation, breadcrumb, page title, primary action, content, and status/feedback region.

## 3. Route map

### Public

`/`  
`/verify/:certNo`

### Business

`/app` · `/app/instruments` · `/app/instruments/new` · `/app/instruments/:id` · `/app/applications` · `/app/applications/new` · `/app/applications/:id` · `/app/certificates` · `/app/certificates/:id` · `/app/notifications` · `/app/profile`

### Admin

`/admin` · `/admin/applications` · `/admin/applications/:id` · `/admin/instruments` · `/admin/officers` · `/admin/schedules` · `/admin/certificates` · `/admin/notifications` · `/admin/audit` · `/admin/settings`

`/login` is the shared web auth entry. No route may be created for an unsupported feature.

## 4. Frontend architecture

```text
apps/web/src/
├── app/             providers, router, error boundary
├── routes/          route guards and route-level loaders
├── layouts/         public, business, admin shells
├── pages/           page composition only
├── components/      reusable app components
├── features/        auth, instruments, applications, certificates,
│                    dashboards, verification, notifications, audit
├── services/        centralized API client and endpoint functions
├── hooks/           reusable query/form/accessibility hooks
├── lib/             query client, formatting, telemetry adapters
├── schemas/         Zod schemas
├── types/           app types imported from packages/types
├── utils/           pure utilities
└── styles/          tokens and global styles
```

Pages compose features. Features own domain UI and query/mutation hooks. Components are reusable and domain-light. Services own HTTP calls, auth headers, cancellation, and normalized errors. Schemas own client validation but do not replace backend validation. TanStack Query owns server state; React local state owns ephemeral UI state; avoid a global store unless a documented cross-route need appears.

## 5. Screen specification rules

Every screen below has purpose, user, entry point, layout/components, data/API, permissions, validation, loading/empty/error/success behavior, responsive/accessibility behavior, and acceptance criteria. Shared behavior is repeated by reference to keep the contract concise.

### Shared screen behavior

- **Loading:** route-level skeleton preserving page shape; disable duplicate submits; expose an accessible status message.
- **Empty:** explain why there is no data and provide the permitted next action.
- **Error:** normalized `requestId`, plain-language cause, retry action, and no sensitive response dump.
- **Success:** server response is rendered; mutation feedback is toast plus durable inline status where important.
- **Validation:** React Hook Form + Zod for field errors, dirty state, and submit state; backend errors map to fields or form-level alert.
- **Permissions:** hide or disable actions for UX, but rely on backend authorization for security.
- **Responsive:** tables become cards or horizontal scroll at narrow widths; no loss of status or primary action.
- **Accessibility:** semantic headings, labels, focus management, keyboard operation, contrast, live-region feedback, and no color-only status.

## 6. Detailed screen specifications

### Login — `/login`

- **Purpose/user/entry:** Authenticate Business or Admin from public entry or protected-route redirect; Officer uses the Field PWA login.
- **Layout/components:** Brand/title, email/password fields, submit button, error alert, loading state, recovery/help placeholder only if backed by an API.
- **Data/API:** `POST /api/v1/auth/login`, then `GET /api/v1/users/me`; no secrets in UI storage/logs.
- **Permissions/validation:** Public entry; valid email and non-empty password; generic invalid-credential error.
- **States:** Loading disables submit; empty is not applicable; error is recoverable; success routes by role to `/app` or `/admin`.
- **Acceptance:** Successful role routing works; invalid credentials do not reveal account existence; keyboard and screen reader flow works.

### Business dashboard — `/app`

- **Purpose/user/entry:** Give Business a status-first overview after login.
- **Layout/components:** KPI cards for active applications/certificates/expiring items, recent applications table, primary actions, notification preview.
- **Data/API:** `GET /api/v1/applications`, `GET /api/v1/certificates`, `GET /api/v1/notifications`; no undocumented dashboard API required.
- **Permissions/validation:** Own business scope; no mutation except navigation.
- **States:** Skeleton cards/table; empty actions to register/apply; retryable errors; success links use server IDs.
- **Responsive/acceptance:** Cards stack on mobile; user can reach every pending item and its next action without guessing.

### Instrument list — `/app/instruments`

- **Purpose/user/entry:** Find and manage owned instruments; dashboard or nav entry.
- **Layout/components:** Search, status/type filters, paginated table/cards, register button, row actions.
- **Data/API:** `GET /api/v1/instruments?page&pageSize&search&status&instrumentType`.
- **Permissions/validation:** BUSINESS own scope; ADMIN may use admin route; search is bounded and debounced.
- **States/acceptance:** Loading/empty/error shared rules; duplicate registration errors link back to existing identity; list pagination preserves filters.

### Register instrument — `/app/instruments/new`

- **Purpose/user/entry:** Create an owned Instrument.
- **Layout/components:** Form sections for identity, classification, capacity/unit, location, review, submit/cancel.
- **Data/API:** Zod form; `POST /api/v1/instruments`.
- **Permissions/validation:** BUSINESS or ADMIN; required instrument number, serial where available, type, manufacturer/model, positive capacity/unit, location; duplicate identity shown inline.
- **States/acceptance:** Unsaved dirty warning; submit loading; server error mapped; success routes to `/app/instruments/:id` and shows server record.

### Instrument detail/passport — `/app/instruments/:id`

- **Purpose/user/entry:** Show identity and lifecycle history.
- **Layout/components:** Identity summary, current status/next due date, certificate badge, application/inspection timeline, evidence references, re-verify action.
- **Data/API:** `GET /api/v1/instruments/{id}/passport`; re-verification starts the documented Application form.
- **Permissions/validation:** Owner BUSINESS, authorized OFFICER, ADMIN; no editable foreign data.
- **States/acceptance:** Not found/forbidden are distinct UX-safe outcomes; timeline empty state explains no recorded verification; re-verify creates a new Application and does not overwrite history.

### Business application list — `/app/applications`

- **Purpose/user/entry:** Track owned Applications.
- **Layout/components:** Status filter using canonical states, date/search filters, paginated table/cards, new application button.
- **Data/API:** `GET /api/v1/applications?page&pageSize&search&state&from&to`.
- **Permissions/validation:** BUSINESS own scope; filters validated and URL-addressable.
- **States/acceptance:** Empty state links to owned instruments; state badges include text; clicking a row opens detail.

### New verification application — `/app/applications/new`

- **Purpose/user/entry:** Create draft or submit verification request.
- **Layout/components:** Instrument selector, reason, review, save draft, submit.
- **Data/API:** `GET /api/v1/instruments`; `POST /api/v1/applications` with `submit` flag.
- **Permissions/validation:** BUSINESS own instrument; instrument required; reason required on submit; no invented tolerance fields.
- **States/acceptance:** Draft save confirms `DRAFT`; submit confirms `SUBMITTED`; dirty navigation warning; server ownership error is shown without leaking data.

### Business application detail/timeline — `/app/applications/:id`

- **Purpose/user/entry:** Explain current state and next action.
- **Layout/components:** State badge/timeline, instrument summary, assignment/schedule, inspection/result, certificate link, cancellation where permitted.
- **Data/API:** `GET /api/v1/applications/{id}`; related details use response links/embedded summaries.
- **Permissions/validation:** Owner BUSINESS read; actions enabled only for backend-permitted state.
- **States/acceptance:** Loading/error/empty sections are local; terminal states explain why no further action exists; timeline uses canonical state names and server timestamps.

### Certificates list — `/app/certificates`

- **Purpose/user/entry:** Find owned certificate records and status.
- **Layout/components:** Search/status/date filters, paginated table/cards, download/detail actions.
- **Data/API:** `GET /api/v1/certificates`.
- **Permissions/validation:** BUSINESS own scope; `ACTIVE`, `EXPIRED`, `REVOKED` badges are text plus color.
- **States/acceptance:** Empty explains how certificate is created; expired/revoked records remain discoverable; no private storage URL is exposed directly.

### Certificate detail/download — `/app/certificates/:id`

- **Purpose/user/entry:** Review certificate metadata and download PDF through authorized server policy.
- **Layout/components:** Certificate number/status, instrument summary, dates, hash/signature metadata, QR preview, download button, verification link.
- **Data/API:** `GET /api/v1/certificates/{id}`; download action uses server-provided authorized mechanism.
- **Permissions/validation:** Owning BUSINESS, permitted OFFICER, ADMIN; status is read-only to Business.
- **States/acceptance:** Missing PDF shows recoverable error; success download is acknowledged; public link is exactly `/verify/:certNo`.

### Notifications — `/app/notifications` and `/admin/notifications`

- **Purpose/user/entry:** View and acknowledge in-product notifications.
- **Layout/components:** Unread filter, list, related link, mark-read action.
- **Data/API:** `GET /api/v1/notifications`; `POST /api/v1/notifications/{id}/read`.
- **Permissions/validation:** Recipient-only; no cross-user IDs in client route.
- **States/acceptance:** Empty state; retryable load error; mark-read is idempotent and updates from server response.

### Profile/settings — `/app/profile` and `/admin/settings`

- **Purpose/user/entry:** View permitted profile or admin configuration.
- **Layout/components:** Identity, contact fields, session/security information; admin demo/configuration panel only for documented reference data.
- **Data/API:** `GET /api/v1/users/me`, `GET /api/v1/businesses/me`; any mutation must receive an explicit API contract entry before implementation.
- **Permissions/validation:** Own profile/business; admin settings cannot silently change statutory rules.
- **States/acceptance:** Read-only where no mutation contract exists; no secrets rendered.

### Admin dashboard — `/admin`

- **Purpose/user/entry:** Operational overview of queue, workload, expiry, certificates, and sync exceptions.
- **Layout/components:** KPI cards, Recharts trends/buckets, queue links, exception list.
- **Data/API:** `GET /api/v1/dashboards/admin`.
- **Permissions/validation:** ADMIN only; date filters bounded.
- **States/acceptance:** Chart alternatives have accessible tables/summaries; empty data is meaningful; clicking a metric applies a documented filter.

### Admin application queue/detail — `/admin/applications`, `/admin/applications/:id`

- **Purpose/user/entry:** Triage, inspect, assign, schedule, and review applications.
- **Layout/components:** Filtered queue; detail timeline; officer selector; schedule dialog; audit/status history.
- **Data/API:** `GET /api/v1/applications`; detail `GET /api/v1/applications/{id}`; officers `GET /api/v1/officers`; assign/schedule POST endpoints.
- **Permissions/validation:** ADMIN only; assignment requires active officer; schedule requires `ASSIGNED`; reason required for rejection/cancellation if those future admin actions are added.
- **States/acceptance:** Loading/empty/error; mutation conflicts preserve server state; success shows new canonical state and notification.

### Admin officer list — `/admin/officers`

- **Purpose/user/entry:** Select eligible officers for assignment.
- **Layout/components:** Search, active filter, paginated table, workload summary.
- **Data/API:** `GET /api/v1/officers`; application detail owns assignment mutation.
- **Permissions/validation:** ADMIN only; no credentials or private data.
- **States/acceptance:** Empty/no eligible officer blocks assignment with a clear reason; keyboard selection works.

### Admin schedules — `/admin/schedules`

- **Purpose/user/entry:** Review scheduled work and appointment conflicts.
- **Layout/components:** Date range/list view, schedule cards, link to application detail.
- **Data/API:** `GET /api/v1/applications` with `state=SCHEDULED` and date filters; no separate schedule API required.
- **Permissions/validation:** ADMIN only; UTC display converted with timezone label.
- **States/acceptance:** Empty date range, retryable error, and responsive list are defined; rescheduling uses documented schedule endpoint and state rules.

### Admin instruments — `/admin/instruments`

- **Purpose/user/entry:** Search instrument records across prototype scope.
- **Layout/components:** Search/filter table, business/instrument detail links.
- **Data/API:** `GET /api/v1/instruments` with admin filters.
- **Permissions/validation:** ADMIN only; no editing unless a future contract explicitly adds it.
- **States/acceptance:** Pagination/filtering and ownership-safe detail links work.

### Admin certificate management — `/admin/certificates`

- **Purpose/user/entry:** Review lifecycle and perform controlled revocation.
- **Layout/components:** Status filter/table, detail, revoke confirmation dialog.
- **Data/API:** `GET /api/v1/certificates`; `GET /api/v1/certificates/{id}`; `POST /api/v1/certificates/{id}/revoke`.
- **Permissions/validation:** ADMIN only; revocation reason required and irreversible confirmation explicit.
- **States/acceptance:** Optimistic status change is not allowed; updated server response drives UI; revoke action is audited.

### Audit viewer — `/admin/audit`

- **Purpose/user/entry:** Inspect workflow/security history and chain fields.
- **Layout/components:** Filter form, paginated table, event detail drawer.
- **Data/API:** `GET /api/v1/audit`.
- **Permissions/validation:** ADMIN only; metadata rendered safely, no arbitrary HTML.
- **States/acceptance:** Empty/filter errors are clear; previous/current hash fields are copyable without secrets; no absolute immutability claim.

### Public verification landing — `/`

- **Purpose/user/entry:** Explain certificate lookup and provide certificate-number input.
- **Layout/components:** Short explanation, input, submit, QR/camera guidance without requiring camera on web.
- **Data/API:** Navigation to `/verify/:certNo`; API call occurs on result page.
- **Permissions/validation:** No login; bounded certificate number; no owner data collection.
- **States/acceptance:** Invalid input is local; successful submit routes to the single public verification route.

### Public certificate verification — `/verify/:certNo`

- **Purpose/user/entry:** Show the trust/status result for a certificate number from QR or landing page.
- **Layout/components:** Large status panel, certificate number, instrument summary, issue/valid-until dates, signature verification message, limited next steps, retry/new lookup.
- **Data/API:** `GET /api/v1/certificates/verify?certNo={certificateNumber}`.
- **Permissions/validation:** Unauthenticated; no private data; response states exactly `VALID`, `EXPIRED`, `REVOKED`, or `INVALID`.
- **States/acceptance:** Loading skeleton; `INVALID` for missing/malformed/tampered/unverifiable record; `EXPIRED`/`REVOKED` are distinct; no color-only meaning; page works on mobile and with screen readers.

## 7. UX principles and patterns

Use a credible government/public-service SaaS hybrid: clear hierarchy, restrained color, status first, progressive disclosure, minimal typing, explicit confirmations for revoke/cancel, and actionable errors. Tables use server pagination, filter chips, stable column labels, and mobile card fallback. Toasts confirm transient success; critical status persists inline. Charts always have accessible text summaries.

## 8. Design system

- **Typography:** System sans stack; 1.25 ratio type scale; body 16px baseline; headings semibold, not decorative.
- **Spacing:** 4px base scale; standard field gap 12px; card padding 16–24px; page gutters responsive.
- **Radii/shadows:** 6–10px radii; one subtle elevation level; no excessive depth.
- **Colors:** Neutral slate surfaces/text; primary blue/indigo for actions; success green, warning amber, danger red, info blue. Every status includes text/icon.
- **Buttons:** Primary for one page action, secondary for alternatives, destructive only with confirmation, disabled with explanation where possible.
- **Forms:** Visible labels, hint/error text, grouped sections, inline validation on blur/submit, dirty-state guard.
- **Tables/cards:** Sort/filter controls, pagination, sticky labels where useful, responsive card summary.
- **Badges/alerts:** Canonical state/status names; alerts are semantic and dismissible only when safe.
- **Dialogs/drawers/tabs/breadcrumbs:** Focus trapped, Escape behavior, meaningful titles, current tab/route announced.
- **Skeletons/toasts/empty/error states:** Match shared screen behavior and avoid layout shift.

Do not use neon/cyberpunk, gaming visual language, excessive gradients, unnecessary 3D, or decorative animation.

## 9. API/state/form/security rules

- TanStack Query is server state; invalidate/refetch after mutations. Do not fake workflow transitions locally.
- Use a centralized Axios or `fetch` abstraction, with base URL, bearer handling, normalized error mapping, `AbortController` cancellation, and conservative retry only for safe reads.
- Mutations use idempotency where the contract specifies it. Never auto-retry a destructive action without an idempotency key.
- React Hook Form + Zod define client schemas; backend remains authoritative.
- Never store private keys or secrets in the frontend. Avoid sensitive tokens in local storage unless a security ADR explicitly approves it.
- Render server data as text/safe structured content; do not inject arbitrary HTML.
- Protected routes improve UX only; backend authorization is mandatory.

## 10. Accessibility, responsiveness, performance, and testing

Keyboard navigation, visible focus, semantic landmarks, labels, contrast, screen-reader live regions, accessible charts/tables, and text alternatives are acceptance criteria. Desktop uses two-column dashboards and full tables; tablet collapses side navigation and preserves filters; mobile stacks forms/cards and keeps primary actions reachable. Use route-level lazy loading, query caching, pagination, image optimization, and avoid unnecessary re-renders.

Test with Vitest for pure logic, Testing Library for components/forms/accessibility states, Playwright for role journeys and public verification, and API contract tests for all client calls. The web app is not the field offline client.

