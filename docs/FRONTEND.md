# Web Frontend Contract

## 1. Scope

The web frontend is the Next.js application in `frontend/`. It serves Business users, Administrators/Supervisors, and public certificate verifiers. It also contains the current browser field PWA under `/field`; that route group is documented separately in [OFFLINE_APP.md](OFFLINE_APP.md) and must not be treated as the native mobile application.

The web UI is a client of the Django REST API. It may provide client-side validation and route guards for usability, but the backend controls permissions, ownership, assignment, transitions, certificate status, and sync acceptance.

## 2. Confirmed frontend stack

- Next.js 16.3.3 App Router, React 19.2.8, TypeScript 5.
- pnpm 11.9.0 with `frontend/pnpm-lock.yaml`.
- TanStack Query for server state and Axios for HTTP.
- React Hook Form + Zod for forms and client feedback.
- Tailwind CSS 4, shadcn/Radix primitives, `tailwind-merge`, and Lucide icons.
- Vitest + Testing Library + jsdom support through `vitest.config.ts`.

Vite and React Router are not part of this implementation. Use Next.js file-system routing and `next/link`/`next/navigation`.

## 3. Repository structure

```text
frontend/src/
  app/
    (auth)/             login layout and route
    app/                Business portal
    admin/              Administrator portal
    field/              current browser field PWA
    verify/[certNo]/    public verification
  components/           guards, providers, shared UI
  contexts/             auth context
  hooks/                client hooks
  lib/                  Axios/API utilities and mock data
  offline/              Dexie schema and field sync types
  schemas/              client form schemas
  services/             API service boundaries
  types/                API-facing TypeScript types
```

## 4. Route map

| Audience | Route(s) | Contract |
|---|---|---|
| Public | `/`, `/verify/[certNo]` | No login; call minimized public verification API |
| Auth | `/login` | Submit credentials to backend auth contract; generic errors |
| Business | `/app`, `/app/instruments`, `/app/instruments/new`, `/app/instruments/[id]`, `/app/applications`, `/app/applications/new`, `/app/applications/[id]`, `/app/certificates`, `/app/certificates/[id]`, `/app/notifications`, `/app/profile` | Own business scope only |
| Admin | `/admin`, `/admin/applications`, `/admin/applications/[id]`, `/admin/instruments`, `/admin/officers`, `/admin/schedules`, `/admin/certificates`, `/admin/notifications`, `/admin/audit`, `/admin/settings` | Backend-enforced administrative scope |
| Field PWA | `/field`, `/field/inspections`, `/field/inspections/[id]`, `/field/inspections/[id]/checklist`, `/field/inspections/[id]/readings`, `/field/inspections/[id]/evidence`, `/field/inspections/[id]/review`, `/field/sync`, `/field/sync/conflict/[id]`, `/field/profile` | Current testing/fallback field client; see offline specification |

## 5. Layout and state rules

The root layout provides global styles and providers. Auth, Business, Admin, and Field layouts own navigation and user context. TanStack Query owns server state and invalidation; local React state owns ephemeral UI state. Do not add a global store for domain state without an ADR.

Every data screen defines loading, empty, error, unauthorized, and success states. Mutations show pending and result state. A local optimistic state must never be labelled server-confirmed until the API responds.

## 6. API integration

Keep HTTP calls in `src/lib`/`src/services`, normalize API errors, and use `/api/v1` as the canonical backend base path. Web, PWA, and eventual Flutter clients use the same endpoint semantics. Public verification calls only the public verification endpoint. Multipart evidence upload must obey server MIME and size checks.

The frontend may use Zod/React Hook Form to improve feedback. It must not rely on those checks for security, ownership, authorization, certificate validity, or state transitions.

## 7. UX requirements by area

### Business portal

Show instrument identity, applications, current state, next action, assignment/schedule visibility allowed by policy, certificates, notifications, and profile. Prevent cross-business identifiers from being selected by the UI; the API must enforce the same rule.

### Admin portal

Show queues, assignment/scheduling, instrument/application/certificate management, notifications, audit viewing, and settings. Destructive or status-changing actions require clear confirmation and reason fields where the API requires them.

### Public verification

Show certificate number, minimal instrument/business information, issue/valid-until dates, status, and signature verification result returned by the API. Do not calculate trust in the browser, expose internal IDs, or imply statutory/legal approval.

## 8. Accessibility and responsive design

Use semantic landmarks, labelled controls, visible focus, keyboard operation, meaningful validation messages, sufficient contrast, and text alternatives. Responsive layouts must preserve the next action and status on small screens. Avoid hover-only information and do not hide security/error states behind color alone.

## 9. Web testing

Use Vitest/Testing Library for components, forms, API-state rendering, accessibility states, and pure client utilities. Use Playwright when it is added to the repository for Business/Admin/Public journeys and the client-independent field workflow. A test command must be added to `package.json` before tasks claim a standard frontend test script.

The web frontend is not the authority for security and is not the final native field-client implementation.
