# PHASE 0 — Frontend Baseline Audit

## 1. Current route inventory

### Public
| Route | Purpose | Implemented? | Uses mock/demo data? | Uses shared components? | Notes |
|---|---|---|---|---|---|
| `/` | Landing page | Yes | No | Minimal | |
| `/verify/[certNo]` | Public certificate verification | Yes | Unknown | Yes (`PageHeader`, `StatusBadge`) | |

### Auth
| Route | Purpose | Implemented? | Uses mock/demo data? | Uses shared components? | Notes |
|---|---|---|---|---|---|
| `/(auth)/login` | Login page | Yes | Yes (1-click demo buttons) | No (hardcoded HTML inputs/buttons) | Hardcoded styling without relying on `components/ui` |

### Admin
| Route | Purpose | Implemented? | Uses mock/demo data? | Uses shared components? | Notes |
|---|---|---|---|---|---|
| `/admin` | Admin dashboard | Yes | Yes | Yes (`StatCard`) | |
| `/admin/applications` | Applications list | Yes | Yes | Yes | |
| `/admin/applications/[id]` | Application details | Yes | Yes | Yes | |
| `/admin/audit` | Audit logs | Yes | Yes | Yes (`AuditHashBadge`) | |
| `/admin/certificates` | Certificates list | Yes | Yes | Yes (`RevokeCertModal`) | |
| `/admin/instruments` | Instruments list | Yes | Yes | Yes | |
| `/admin/notifications` | Notifications | Yes | Yes | Yes | |
| `/admin/officers` | Officers list | Yes | Yes | Yes (`AssignOfficerModal`) | |
| `/admin/schedules` | Schedule list | Yes | Yes | Yes (`ScheduleModal`) | |
| `/admin/settings` | Settings | Yes | No | Yes | |

### Business
*No routes currently exist in the repository.*

### Field/PWA
*No routes currently exist in the repository.*

## 2. Missing documented routes

Compared to the active `FRONTEND.md` route contract, the following routes are completely missing from the `frontend/src/app` directory (having been moved to a `pwa archive` directory in this branch):

**Missing Business Routes:**
- `/app`
- `/app/instruments`
- `/app/instruments/new`
- `/app/instruments/[id]`
- `/app/applications`
- `/app/applications/new`
- `/app/applications/[id]`
- `/app/certificates`
- `/app/certificates/[id]`
- `/app/notifications`
- `/app/profile`

**Missing Field PWA Routes:**
- `/field`
- `/field/inspections`
- `/field/inspections/[id]`
- `/field/inspections/[id]/checklist`
- `/field/inspections/[id]/readings`
- `/field/inspections/[id]/evidence`
- `/field/inspections/[id]/review`
- `/field/sync`
- `/field/sync/conflict/[id]`
- `/field/profile`

## 3. Existing reusable UI

The `components/ui` directory is mostly empty and lacks a full component library.

**Existing UI components:**
- Layout components: `AdminHeader`, `BusinessHeader`, `FieldHeader`, `OfflineBanner`, `PublicHeader`, `SiteFooter`
- Navigation/Guards: `AuthGuard`, `GuestGuard`
- Cards: `StatCard`
- Modals: `AssignOfficerModal`, `RevokeCertModal`, `ScheduleModal`
- Badges: `StatusBadge`, `AuditHashBadge`
- Page structures: `PageHeader`

**Missing reusable UI:**
- Buttons, inputs, forms, labels, tables, dialogs/modals (base primitives), alerts, and loaders are **not** present in `components/ui` despite the `FRONTEND.md` specifying shadcn and Radix primitives.

## 4. Existing design implementation

- **Typography**: Inter and Noto Sans defined in `globals.css` with standard Tailwind text scales.
- **Colours**: Custom CSS variables for MapanSetu brand (`--color-primary`, `--color-secondary`, etc.) defined in `globals.css`.
- **Forms and Buttons**: Currently hardcoded with utility classes (e.g., in `/login` and other pages) rather than reusable components. Inconsistent focus rings/states.
- **Dark/light mode**: Forced light mode (`color-scheme: light` in `globals.css`).
- **Icon system**: `lucide-react` is used consistently.

**Inconsistencies**: The design system relies heavily on bespoke Tailwind utility classes applied inline rather than abstracting into reusable UI primitives (like standard shadcn components), resulting in massive class strings and high risk of visual drift.

## 5. UX/accessibility baseline

- **Visible Focus**: Implemented via global CSS (`*:focus-visible { outline: 2px solid var(--color-primary); }`).
- **Keyboard Navigation**: A skip link is present in global CSS. However, hardcoded components might lack robust keyboard navigation attributes compared to Radix primitives.
- **Labels**: Present on custom forms, but custom inputs lack ARIA links in some places.
- **Screen-reader considerations**: Some elements lack robust `aria` attributes or `aria-live` regions due to manual implementation.

## 6. Data/API readiness

- **Services**: Service files exist for `admin`, `applications`, `audit`, `auth`, `certificates`, `inspections`, `instruments`, `notifications`, `officers`, and `sync`.
- **Implementation**: Currently, these services use a mix of Axios (`api.get`) wrapped in try/catch blocks that fallback to **localStorage and mock data arrays** (e.g., `INITIAL_DEMO_INSTRUMENTS`).
- **State**: TanStack Query is configured via `QueryProvider`, but much of the app still relies on fallback mock data logic inside the service definitions.

## 7. Technical debt / risks

- **Broken Next.js Build**: The `.next` cache still references deleted `/app/app` and `/app/field` routes resulting in a `Failed to type check` error and build failure (`exit code 1`).
- **Missing Vitest**: The `vitest.config.ts` is missing or not configured correctly, and `pnpm exec vitest run` fails with `Command "vitest" not found`.
- **Missing Shadcn Primitives**: `package.json` contains dependencies for Radix and Shadcn, but they are not initialized/generated in the `components/ui` directory. Forms use raw HTML elements with long inline Tailwind strings.
- **Route inconsistencies**: Business and Field PWA routes have been moved to `pwa archive/` leaving the Next.js app in a broken state regarding the frontend contract.
- **Mock-only dependencies**: Heavy reliance on local storage fallback mocks in services instead of true API contracts.

## 8. Recommended implementation order

1. **Fix Build & TypeScript Errors**: Clean the `.next` cache and resolve type checking errors from missing routes.
2. **Restore Contract Routes**: Move Business (`/app`) routes back into `src/app` or update `FRONTEND.md` if the architectural decision to archive them is permanent.
3. **Initialize Shadcn UI**: Properly install and generate base UI primitives (`Button`, `Input`, `Form`, `Table`, `Dialog`) to eliminate hardcoded Tailwind class strings and ensure consistent accessibility.
4. **Configure Vitest**: Setup testing infrastructure to meet the web testing contract.
5. **Phase out Mock Fallbacks**: Transition services strictly to the backend API as the API reaches maturity.
