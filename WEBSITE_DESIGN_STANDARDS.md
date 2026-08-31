# MapanSetu Website Design Standards & UI/UX Specification

**Document:** `WEBSITE_DESIGN_STANDARDS.md`\
**Product:** MapanSetu --- SIH26036\
**Target:** React + TypeScript + Vite web portal\
**Design authority:** GIGW 3.0 + UX4G Design System 3.0 + WCAG 2.1 Level
AA, adapted to MapanSetu's documented roles and workflows.

> **Important:** MapanSetu is an SIH/internal prototype, not an official
> Government of India website. Government emblems, marks, certification
> badges, or official department identities must not be presented in a
> way that implies government ownership, endorsement, integration,
> statutory approval, or certification. Use a clearly labelled
> project/SIH identity unless authorized assets and usage rights are
> provided.

## 1. Design objective

The website must look and behave like a credible Indian public-service
platform: calm, trustworthy, accessible, multilingual, information-dense
without being overwhelming, mobile-first, and status-oriented.

It must NOT look like: - a startup landing page; - a cyber-security
dashboard; - a crypto/blockchain product; - a gaming/cyberpunk
interface; - a generic SaaS template; - an unofficial imitation of
DigiLocker or another government service.

The visual language should be **government-service inspired, not
government-identity impersonating**.

## 2. Standards hierarchy

Use this hierarchy when making a design decision:

1.  MapanSetu PRD, API contract, data model and accepted ADRs.
2.  GIGW 3.0 for Indian government/public-service web/app quality
    expectations.
3.  UX4G Design System 3.0 for foundations, components, patterns and
    government UX conventions.
4.  WCAG 2.1 Level AA for accessibility.
5.  W3C HTML/WAI and platform accessibility guidance.
6.  MapanSetu-specific design tokens and component decisions.
7.  Google Material Design principles only where they do not conflict
    with UX4G/GIGW; do not blindly copy Material styling.

GIGW 3.0 explicitly targets usability, user-centricity and universal
accessibility and incorporates WCAG 2.1 Level AA. UX4G 3.0 provides
foundations, components, patterns, tokens and accessibility guidance for
government services.

## 3. Official standards to consult

-   GIGW 3.0: https://guidelines.india.gov.in/
-   GIGW conformity matrix:
    https://guidelines.india.gov.in/annexure-ii-matrix-to-check-conformity/
-   UX4G 3.0: https://www.ux4g.gov.in/
-   UX4G developer docs: https://doc.ux4g.gov.in/
-   WCAG 2.1: https://www.w3.org/TR/WCAG21/
-   DigiLocker may be used as a UX reference for public-service
    patterns, multilingual navigation, trust cues and
    accessibility---not as a visual copy target.

## 4. Government identity and branding

### 4.1 Trust without false affiliation

Every public-facing MapanSetu page must make ownership clear.

For the prototype: - Display `MapanSetu` and `SIH 2026 Prototype` or
equivalent approved project identity. - Do not claim
`Government of India`, `Department of Consumer Affairs`,
`Legal Metrology`, `NIC`, `MeitY`, or another department as owner unless
explicitly authorized. - Do not display the State Emblem of India merely
to make the UI look official. - Do not create a fake ministry logo,
government seal, certification badge, or "official" footer. - Do not use
copied government website screenshots/assets as production UI. - If
authorized official assets are later supplied, preserve their exact
proportions, clear space, approved colors and alternate text.

GIGW 3.0 requires government ownership to be demonstrated through
appropriate emblem/logo usage, while also requiring proper ratio, color
and alternate text. For this prototype, the correct response is
transparent project identity rather than simulated government identity.

### 4.2 Header

Recommended structure:

``` text
┌─────────────────────────────────────────────────────────────┐
│ [MapanSetu]  SIH 2026 Prototype              हिंदी | EN    │
│ Online Verification & Instrument Lifecycle                 │
├─────────────────────────────────────────────────────────────┤
│ Dashboard   Instruments   Applications   Certificates       │
└─────────────────────────────────────────────────────────────┘
```

Authenticated pages may add notifications, profile and role context.

### 4.3 Footer

Include: - MapanSetu / SIH prototype identity; - About; -
Accessibility; - Privacy; - Terms/usage; - Contact/help; - language
switch; - version/build information where useful; - prototype
disclaimer.

For a future government deployment, add the complete ownership lineage
and official policies required by GIGW.

## 5. Multilingual design

Language is a first-class design requirement.

### Required architecture

Use: - Unicode throughout; - translation keys, never hard-coded UI
strings; - language-aware routing/state where appropriate; - English +
Hindi as the initial prototype languages; - an architecture that can add
Indian regional languages later; - locale-aware dates, numbers and
units; - translated validation/error messages; - translated
empty/loading/success/error states; - translated accessibility labels
and document metadata.

GIGW 3.0 requires bilingual presentation and prominent language
selection, with Unicode and layout testing for regional-language
content.

### Language switcher

Place language selection consistently in the top header.

Preferred:

`English | हिंदी`

Requirements: - keyboard accessible; - current language clearly
indicated; - does not reset form data; - preserves current
route/context; - translated page title updates; - no mixed-language UI
after switching; - test long Hindi strings and future regional-language
expansion.

### Typography for Indian languages

Never assume English text metrics.

Test: - Devanagari; - numerals; - mixed English/Hindi labels; - long
translated words; - buttons with longer translations; - table columns; -
form validation; - navigation; - notifications.

Do not shrink text merely to force translation into a fixed width.

## 6. UX4G foundation alignment

Use UX4G concepts as the baseline:

-   design tokens;
-   color system;
-   typography;
-   spacing;
-   elevation;
-   iconography;
-   components;
-   patterns;
-   accessibility;
-   plain-language content;
-   multilingual content.

UX4G 3.0 documents a base-4 spacing scale, reusable components/patterns,
accessibility guidance, and WCAG 2.1 AA as its minimum accessibility
baseline.

### Component strategy

Prefer UX4G-equivalent components/patterns first: - buttons; - inputs; -
selects; - checkboxes/radios; - alerts; - badges; - tables; - cards; -
breadcrumbs; - tabs; - dialogs; - drawers; - pagination; - search; -
filters; - date/time inputs; - step/progress indicators; - status
timelines; - notifications; - empty/error states.

If a component does not exist in the chosen implementation, create a
MapanSetu component that follows the same accessibility and interaction
principles.

## 7. Design tokens

Centralize tokens. Do not scatter raw values throughout JSX/CSS.

### Spacing

Use a 4px base scale:

``` text
4   8   12   16   20   24   32   40   48   64
```

Use: - 8--12px for compact control gaps; - 16px standard component
spacing; - 24px card/panel spacing; - 32--48px section spacing; -
48--64px page-level separation.

### Typography

Baseline: - body: 16px; - comfortable line-height; - clear hierarchy; -
semibold headings; - avoid decorative display fonts.

Suggested semantic scale:

``` text
Display / page hero   32–40px
H1                     28–32px
H2                     24–28px
H3                     20–22px
Body                   16px
Small                  14px
Caption                12–13px
```

Do not reduce body text below a comfortable reading size to fit dense
tables.

### Color

Use a restrained public-service palette: - primary: deep blue/indigo; -
neutral: slate/gray; - success: green; - warning: amber; - danger:
red; - information: blue.

Every semantic status must have: 1. text; 2. optional icon; 3. color as
a supplementary cue.

Never communicate status using color alone.

### Borders/radius/elevation

Use: - modest 6--10px radii; - subtle borders; - one or two controlled
elevation levels; - visible focus ring; - minimal decorative shadows.

Avoid: - glassmorphism; - neon gradients; - excessive rounded cards; -
giant floating dashboards; - decorative 3D.

## 8. Layout system

Use a responsive grid with a readable maximum content width.

Desktop:

``` text
┌───────────────────────────────────────────────────────┐
│ Header                                                │
├───────────────┬───────────────────────────────────────┤
│ Sidebar       │ Page title + primary action           │
│               │ Breadcrumb                            │
│ Navigation    │ Main content                          │
│               │                                       │
└───────────────┴───────────────────────────────────────┘
```

Tablet: - collapse sidebar; - preserve primary navigation; - preserve
filters.

Mobile: - use bottom navigation or compact navigation where
appropriate; - stack cards/forms; - convert wide tables to cards or
controlled horizontal scrolling; - keep primary action reachable; -
never hide critical status information.

## 9. Page anatomy

Every important page should follow a predictable structure:

1.  Skip link.
2.  Header / ownership identity.
3.  Primary navigation.
4.  Breadcrumb where useful.
5.  Page title.
6.  One-sentence purpose/context where useful.
7.  Primary action.
8.  Filters/search if required.
9.  Main content.
10. Status/feedback region.
11. Footer.

Each page must be understandable when reached directly from
search/bookmark/deep link.

GIGW expects ownership, navigation and context to remain clear on
important entry pages and subsequent pages.

## 10. Navigation

### Business

``` text
Dashboard
Instruments
Applications
Certificates
Notifications
Profile
```

### Admin

``` text
Dashboard
Applications
Instruments
Officers
Schedules
Certificates
Notifications
Audit
Settings
```

Rules: - stable ordering; - clear active state; - no icon-only primary
navigation; - breadcrumbs for deep workflows; - no hidden route that is
required to understand the current task; - use familiar labels rather
than internal engineering terminology.

## 11. Status-first UX

MapanSetu is a workflow product, so status is more important than
decoration.

### Application states

Use exactly: - DRAFT - SUBMITTED - ASSIGNED - SCHEDULED -
INSPECTION_IN_PROGRESS - COMPLETED - REJECTED - CANCELLED

### Inspection results

Use exactly: - PASS - FAIL - REQUIRES_CORRECTION

### Certificate statuses

Use exactly: - ACTIVE - EXPIRED - REVOKED

### Offline states

Use exactly: - LOCAL_DRAFT - READY_TO_SYNC - SYNCING - SYNCED - FAILED -
CONFLICT

Never invent synonyms in UI such as "Processing" when the canonical
state is `SUBMITTED`, unless the product team explicitly defines a
display label.

## 12. Forms

Government-service forms should feel predictable and forgiving.

Rules: - visible labels; - required marker; - short hint text; - one
field per meaningful concept; - logical grouping; - inline validation; -
preserve entered values after recoverable errors; - show server
validation errors; - confirm destructive cancellation; - prevent
duplicate submission; - clearly distinguish draft save from final
submit; - show progress for long forms; - never ask for data that is not
needed.

Use: - React Hook Form; - Zod; - server-side validation as authority.

Do not put statutory tolerance rules in the frontend unless explicitly
supplied as approved configurable data.

## 13. Tables and data-heavy screens

Use tables for administrative data, not for mobile-first field work.

Requirements: - caption/title; - semantic headers; - stable column
labels; - pagination; - bounded filters; - search; - sort only where
useful; - row action menu with accessible name; - responsive card
fallback; - no color-only status; - empty state; - loading skeleton; -
error/retry state.

GIGW specifically calls for proper table headers/captions and accessible
markup.

## 14. Dashboard design

Avoid "analytics for decoration."

Dashboard cards must answer: - What needs attention? - What is
pending? - What is overdue/expiring? - What changed? - What action can I
take?

Example Business dashboard:

``` text
Active applications | Expiring certificates | Recent activity
        ↓                     ↓                     ↓
    View queue            Review items          Open record
```

Admin dashboard: - queue by application state; - officer workload; -
upcoming schedules; - expiry buckets; - sync exceptions; - certificate
status; - recent audit activity.

Charts require accessible table/text summaries.

## 15. Public verification page

This is a trust-critical page.

### `/`

Show: - MapanSetu identity; - prototype label; - short explanation; -
certificate number input; - language switch; - accessibility entry; -
help.

### `/verify/:certNo`

Show status prominently:

``` text
✓ VALID
Certificate is active and signature verified.

Certificate No.
CERT-DEMO-001

Instrument
INS-DEMO-001
Electronic Scale

Issued
01 Sep 2026

Valid until
01 Sep 2027
```

For: - `EXPIRED`: clearly state the certificate is expired. - `REVOKED`:
clearly state it has been revoked. - `INVALID`: clearly state that the
certificate could not be verified.

Do not expose: - owner phone/email; - internal UUIDs; - private
evidence; - audit metadata; - private keys; - unnecessary personal
information.

## 16. Accessibility --- WCAG 2.1 AA

Accessibility is a release gate, not an enhancement.

### Perceivable

-   text alternatives for meaningful images;
-   decorative images marked decorative;
-   sufficient contrast;
-   status not conveyed by color alone;
-   reflow at narrow widths;
-   text remains readable when spacing is increased;
-   no flashing content.

### Operable

-   full keyboard operation;
-   visible focus;
-   logical tab order;
-   skip link;
-   no keyboard trap;
-   dialogs have correct focus management;
-   touch targets are comfortably usable;
-   no interaction that depends only on complex gestures.

### Understandable

-   plain language;
-   predictable navigation;
-   labels describe purpose;
-   validation errors explain correction;
-   language is programmatically identified;
-   language changes are programmatically identifiable.

### Robust

-   semantic HTML;
-   correct accessible names/roles/states;
-   ARIA only where necessary;
-   compatible with screen readers;
-   status messages exposed programmatically.

WCAG 2.1 Level AA includes requirements such as reflow, non-text
contrast, text spacing, keyboard accessibility, labels, language
identification, and programmatically determinable status messages.

## 17. Accessibility testing matrix

Test: - keyboard only; - screen reader; - zoom/reflow; - high
contrast/forced colors where applicable; - 200% text/zoom; - Hindi UI; -
reduced motion; - mobile browser; - touch; - error recovery; -
dialogs; - tables; - charts; - status badges; - notifications.

Automated checks are necessary but insufficient. Manual review is
required.

## 18. Content design

Use citizen-first language.

Prefer: - "Submit application" - "Save draft" - "Try again" -
"Certificate could not be verified" - "You are offline. Your saved work
is stored on this device."

Avoid: - "Execute mutation" - "Invalid payload" - "JWT expired" - "500
Internal Server Error" - "Sync failed due to optimistic concurrency"

Technical details can appear in admin diagnostics, not ordinary citizen
copy.

## 19. Error states

Every API-backed page needs:

### Loading

Show page-shaped skeletons; do not flash blank screens.

### Empty

Explain why there is no data and provide the next permitted action.

### Error

Show: - plain-language explanation; - retry; - request ID where
useful; - support/help path; - no stack trace.

### Offline

Clearly say whether: - data is cached; - local work is saved; -
operation is waiting to sync; - server confirmation is unavailable.

## 20. Motion

Motion must be functional, subtle and accessible.

Use: - short transitions; - loading indicators; - progress; -
confirmation feedback.

Avoid: - animated backgrounds; - parallax; - bouncing UI; -
auto-advancing content; - attention-grabbing motion.

Respect reduced-motion preferences.

## 21. Security-aware visual design

The UI must never imply a stronger security guarantee than the backend
provides.

For certificate verification: - distinguish "signature verified" from
"certificate active"; - distinguish `VALID`, `EXPIRED`, `REVOKED`,
`INVALID`; - never say "100% authentic"; - never say "government
certified" unless legally authorized; - never say "tamper-proof" or
"immutable"; - describe the prototype signature honestly.

For offline: - local save ≠ server save; - queued ≠ synchronized; -
synchronized ≠ legally approved.

## 22. Performance

Use: - route-level lazy loading; - query caching; - pagination; -
optimized images; - minimal JavaScript; - no unnecessary global state; -
avoid large client bundles.

Measure: - initial page load; - interaction readiness; - public
verification latency; - application list latency; - dashboard
rendering; - error recovery time.

Do not invent an SLA.

## 23. Browser and responsive support

Test current major: - Chrome/Chromium; - Firefox; - Safari; - Edge; -
Android Chrome; - iOS Safari.

Do not rely on a single browser's behavior for accessibility, PWA or
layout.

## 24. Design review checklist

Before a page is approved:

### Government UX

-   [ ] Clear ownership/project identity.
-   [ ] No fake government affiliation.
-   [ ] Consistent header/footer.
-   [ ] Clear navigation.
-   [ ] Search/filter patterns are predictable.
-   [ ] Plain language.
-   [ ] Multilingual support.
-   [ ] Deep links retain context.

### UX4G

-   [ ] UX4G foundations/components/patterns considered.
-   [ ] 4px spacing scale.
-   [ ] Consistent typography.
-   [ ] Semantic status colors.
-   [ ] Accessible components.
-   [ ] Consistent interaction states.

### WCAG

-   [ ] Keyboard complete.
-   [ ] Focus visible.
-   [ ] Labels and accessible names.
-   [ ] Contrast checked.
-   [ ] Color is not the only cue.
-   [ ] Reflow tested.
-   [ ] Text spacing tested.
-   [ ] Language metadata correct.
-   [ ] Screen reader reviewed.
-   [ ] Status messages announced.

### MapanSetu

-   [ ] Canonical states used.
-   [ ] API-backed state, not fake UI state.
-   [ ] Role/ownership boundaries reflected.
-   [ ] Prototype limitations visible.
-   [ ] No undocumented route or data.
-   [ ] Public data minimized.

## 25. Implementation rule

The website team must treat this document as the design contract. If
UX4G/GIGW guidance conflicts with a MapanSetu security, API, data-model
or accessibility requirement, do not silently override it. Raise the
conflict for design/architecture review and document the decision.
