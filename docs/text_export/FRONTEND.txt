# Web Frontend Contract

## 1. Scope

The web frontend is the Next.js application in `frontend/`. It serves three audiences:

- **Business users** — instrument registration, verification applications, certificate download, history.
- **Administrators / Supervisors** — queue management, assignment, scheduling, certificates, audit.
- **Public verifiers** — unauthenticated certificate number lookup.

The frontend also contains the **React field PWA** under `/field`. That route group is a **testing / prototype client** — it is not the native mobile field application. The official field application is the Flutter/Dart app at `flutter_field_app/`. See [OFFLINE_APP.md](OFFLINE_APP.md) for the field client specification.

The web UI is a client of the Django REST API. It may provide client-side validation and route guards for usability, but the backend controls permissions, ownership, assignment, transitions, certificate status, and sync acceptance.

## 2. Confirmed Frontend Stack

| Concern | Repository-confirmed choice | Evidence / status |
|---|---|---|
| Framework | Next.js 16.3.3 App Router, React 19.2.8 | `frontend/package.json`, App Router tree |
| Language | TypeScript 5 | `package.json`, `.tsx`/`.ts` sources |
| Package manager | pnpm 11.9.0 | `packageManager`, `pnpm-lock.yaml` |
| Routing | Next.js App Router | `frontend/src/app/**` |
| Server state / API | TanStack Query 5, Axios | Dependencies and providers/services |
| Forms / validation | React Hook Form + `@hookform/resolvers` + Zod 4 | Dependencies and form schemas |
| Styling / UI | Tailwind CSS 4, shadcn, Radix UI primitives, `tailwind-merge`, Lucide icons | Dependencies and `globals.css`/components |
| Testing | Vitest 4 + Testing Library + jsdom | `vitest.config.ts`; test script pending |
| Lint / build | ESLint 9, `pnpm lint`, `pnpm build` | `package.json` |

Vite and React Router are not part of this implementation. Use Next.js file-system routing and `next/link` / `next/navigation`.

## 3. Repository Structure

```text
frontend/src/
  app/
    (auth)/              login layout and route
    app/                 Business portal
    admin/               Administrator portal
    field/               React field PWA — TESTING/PROTOTYPE CLIENT ONLY
    verify/[certNo]/     public verification
  components/            guards, providers, shared UI
  contexts/              auth context
  hooks/                 client hooks
  lib/                   Axios/API utilities and mock data
  offline/               Dexie schema and field sync types (PWA testing client)
  schemas/               client form schemas
  services/              API service boundaries
  types/                 API-facing TypeScript types
```

## 4. Route Map

| Audience | Route(s) | Contract |
|---|---|---|
| Public | `/`, `/verify/[certNo]` | No login; call minimized public verification API |
| Auth | `/login` | Submit credentials to backend auth contract; generic errors |
| Business | `/app`, `/app/instruments`, `/app/instruments/new`, `/app/instruments/[id]`, `/app/applications`, `/app/applications/new`, `/app/applications/[id]`, `/app/certificates`, `/app/certificates/[id]`, `/app/notifications`, `/app/profile` | Own business scope only |
| Admin | `/admin`, `/admin/applications`, `/admin/applications/[id]`, `/admin/instruments`, `/admin/officers`, `/admin/schedules`, `/admin/certificates`, `/admin/notifications`, `/admin/audit`, `/admin/settings` | Backend-enforced administrative scope |
| Field PWA *(testing only)* | `/field`, `/field/inspections`, `/field/inspections/[id]`, `/field/inspections/[id]/checklist`, `/field/inspections/[id]/readings`, `/field/inspections/[id]/evidence`, `/field/inspections/[id]/review`, `/field/sync`, `/field/sync/conflict/[id]`, `/field/profile` | **Testing / prototype client** — not the production field application; see [OFFLINE_APP.md](OFFLINE_APP.md) |

> [!IMPORTANT]
> The `/field` route group is the **React field PWA testing client**. The **official field application** is the Flutter/Dart app at `flutter_field_app/`. Do not treat these routes as the final native field architecture.

## 5. Layout and State Rules

The root layout provides global styles and providers. Auth, Business, Admin, and Field layouts own navigation and user context. TanStack Query owns server state and invalidation; local React state owns ephemeral UI state. Do not add a global store for domain state without an ADR.

Every data screen defines loading, empty, error, unauthorized, and success states. Mutations show pending and result state. A local optimistic state must never be labelled server-confirmed until the API responds.

## 6. API Integration

Keep HTTP calls in `src/lib`/`src/services`, normalize API errors, and use `/api/v1` as the canonical backend base path. React Web, React field PWA, and Flutter all use the same endpoint semantics. Public verification calls only the public verification endpoint. Multipart evidence upload must obey server MIME and size checks.

The frontend may use Zod/React Hook Form to improve feedback. It must not rely on those checks for security, ownership, authorization, certificate validity, or state transitions.

## 7. UX Requirements by Area

### Business Portal

Show instrument identity, applications, current state, next action, assignment/schedule visibility allowed by policy, certificates, notifications, and profile. Prevent cross-business identifiers from being selected by the UI; the API must enforce the same rule.

### Admin Portal

Show queues, assignment/scheduling, instrument/application/certificate management, notifications, audit viewing, and settings. Destructive or status-changing actions require clear confirmation and reason fields where the API requires them.

### Public Verification

Show certificate number, minimal instrument/business information, issue/valid-until dates, status, and signature verification result returned by the API. Do not calculate trust in the browser, expose internal IDs, or imply statutory/legal approval.

### Testing-only Field PWA (`/field`)

The field routes exist for testing prototype field workflow and API contract integration. They are not the production field application. Any agent working on these routes must label tasks as `FIELD_PWA_TESTING`. Do not improve or extend this route group as if it were the final product; the official field product is the Flutter application.

## 8. Accessibility and Responsive Design

Use semantic landmarks, labelled controls, visible focus, keyboard operation, meaningful validation messages, sufficient contrast, and text alternatives. Responsive layouts must preserve the next action and status on small screens. Avoid hover-only information and do not hide security/error states behind color alone.

## 9. Web Testing

Use Vitest/Testing Library for components, forms, API-state rendering, accessibility states, and pure client utilities. Use Playwright when it is added to the repository for Business/Admin/Public journeys. A test script must be added to `package.json` before tasks claim a standard frontend test script.

The web frontend is not the authority for security and is not the final native field-client implementation.
