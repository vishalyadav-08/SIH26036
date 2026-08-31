# MapanSetu Website — DESIGN.md

## 1. Purpose

This document is the **canonical UI/UX design specification for the complete MapanSetu web frontend**.

The frontend must be designed and implemented according to this document.

The design covers:

- Public website
- Public certificate verification
- Business portal
- Administrator/Supervisor portal
- Authentication screens
- Shared components
- Forms
- Tables
- Dashboards
- Status workflows
- Loading/error/empty states
- Accessibility
- English/Hindi localization
- Responsive layouts
- Government-style identity
- Legal/policy pages

This document defines **UI/UX only**.

Do not modify backend architecture, API contracts, database models, authentication semantics, or domain workflows as part of UI redesign.

The frontend must consume the existing API contract rather than inventing replacement APIs.

---

# 2. Product Identity

## Product

**MapanSetu**

## Domain

Digital coordination and record management for weighing and measuring instrument verification.

## Institutional Context

**Department of Legal Metrology**

## Core purpose

MapanSetu provides a digital workflow around:

1. Business registration
2. Instrument registration
3. Verification applications
4. Officer assignment
5. Inspection scheduling
6. Field inspection records
7. Evidence
8. Certificate generation
9. Certificate lifecycle
10. Public certificate verification
11. Re-verification

## Important product boundary

MapanSetu is a digital workflow/record coordination system.

The UI must NOT claim that the platform itself:

- physically verifies instruments
- replaces an authorized Legal Metrology Officer
- independently grants statutory approval
- provides legal-signature authority
- has live government integrations unless explicitly implemented
- guarantees legal validity merely because a certificate exists in the prototype

Use precise, neutral language.

---

# 3. Design Goals

Every screen must prioritize:

1. Accessibility
2. Clarity
3. Trust
4. Government-service usability
5. Consistency
6. Responsive behavior
7. Bilingual support
8. Information hierarchy
9. Error prevention
10. Easy task completion

Avoid designing the product like:

- a commercial SaaS dashboard
- a banking app
- a social network
- a futuristic AI product
- a marketing landing page overloaded with animation

The visual language should feel like a serious Indian public digital service.

---

# 4. Design Standards

Use the following as design principles:

- UX4G design-system principles
- GIGW 3.0 principles
- WCAG 2.1 Level AA accessibility principles
- IS 17802 accessibility direction where applicable
- semantic HTML
- keyboard accessibility
- screen-reader accessibility
- responsive design
- bilingual English/Hindi interface

Do not claim formal government certification or formal accessibility certification unless actually obtained.

---

# 5. Design System

## 5.1 Typography

Primary typeface:

**Noto Sans**

Hindi:

**Noto Sans Devanagari**

Use the same typographic family consistently across the application.

### Suggested hierarchy

| Element | Desktop | Mobile |
|---|---:|---:|
| Display heading | 40–48px | 32–36px |
| H1 | 36–40px | 28–32px |
| H2 | 28–32px | 24–28px |
| H3 | 24px | 20–24px |
| H4 | 20px | 18–20px |
| Body | 16px | 16px |
| Small text | 14px | 14px |
| Caption | 12–14px | 12–14px |

Use readable line heights.

Do not make body text unnecessarily small.

Hindi text must be allowed additional vertical space because Devanagari can require different line-height behavior.

---

# 6. Spacing System

Use an 8-point spacing system.

Primary spacing values:

```text
4px   — micro spacing only
8px   — compact spacing
16px  — standard spacing
24px  — component spacing
32px  — section spacing
40px  — large spacing
48px  — major spacing
64px  — hero/major section spacing
80px  — exceptional section separation
```

Prefer consistent spacing over arbitrary values.

---

# 7. Color System

Use a restrained government-service palette.

## Primary

Government/UX4G-style blue:

```text
#0066CC
```

Dark institutional blue may be used for headers and major surfaces where appropriate.

## Accent

Saffron:

```text
#FF9933
```

Use sparingly.

Do not turn the entire interface orange.

## Success

```text
#15803D
```

## Warning

```text
#B45309
```

## Error

```text
#B91C1C
```

## Main text

```text
#1E293B
```

## Page background

```text
#F8FAFC
```

## Surfaces

```text
#FFFFFF
```

Every actual foreground/background combination must be contrast-tested.

Target:

- normal text: minimum 4.5:1
- large text: minimum 3:1
- UI components/meaningful graphics: minimum 3:1

Never communicate status through color alone.

Example:

Bad:

`green badge = approved`

Good:

`✓ Verified`

with green used as supporting visual information.

---

# 8. Borders, Radius and Shadows

Keep the visual system institutional.

Preferred:

```text
border radius:
4px — buttons/inputs where appropriate
6px — cards
8px — larger surfaces
```

Avoid excessive pill-shaped components.

Use subtle borders.

Use shadows sparingly.

Do not use:

- glassmorphism
- glowing borders
- neon shadows
- heavy gradients
- excessive floating cards

---

# 9. Global Header

All public pages share one header.

Authenticated Business and Admin shells may use the same identity language but must have role-specific navigation.

## Utility/accessibility bar

Include:

- Skip to main content
- Accessibility
- A-
- A
- A+
- Contrast
- English
- हिंदी

Controls must have accessible names.

## Government identity

Left:

- State Emblem of India placeholder/official asset
- Department of Legal Metrology
- MapanSetu

Use alt text:

`State Emblem of India`

Do not generate a fake official emblem.

## Public navigation

Desktop:

- Home
- About
- Services / How It Works
- Verify Certificate
- Help
- Contact
- Login

Mobile:

- accessible hamburger menu
- keyboard navigation
- visible focus
- clear active route

---

# 10. Global Footer

Every public/common page must use the same footer.

## Identity

MapanSetu

Department of Legal Metrology

Short platform description.

## Quick Links

- Home
- About
- Verify Certificate
- Help / FAQ
- Accessibility
- Contact

## Policies

- Privacy Policy
- Terms / Disclaimer
- Hyperlinking Policy
- Copyright / Content Policy
- Sitemap

## Government resources

- National Portal of India
- Ministry/Department website

Do not invent URLs.

## Footer metadata

Include:

- Copyright
- Last Updated
- Accessibility information

---

# 11. Public Website

## P-01 — Landing / Homepage

Purpose:

Introduce MapanSetu and provide immediate access to public services.

### Structure

1. Accessibility bar
2. Government header
3. Hero
4. Quick services
5. How it works
6. Benefits
7. Certificate verification
8. Important notice
9. Government/service information
10. Footer

### Hero

Heading:

**MapanSetu**

Supporting heading:

**Digital Verification for Weighing & Measuring Instruments**

Primary CTA:

**Verify Certificate**

Secondary CTA:

**Login**

Optional:

**Learn How It Works**

Hero visual should relate to:

- weighing instruments
- measuring instruments
- certificate
- verification
- digital records

Do not use generic corporate stock imagery.

### Quick services

Cards:

- Verify Certificate
- Apply for Verification
- Track Application
- Manage Instruments

Unauthenticated users must not be given the impression that authenticated actions are publicly accessible.

### How it works

Use:

1. Register Instrument
2. Submit Verification Request
3. Officer Assignment & Scheduling
4. Field Inspection & Evidence
5. Certificate & Public Verification

### Benefits

- Traceable Records
- Transparent Status
- Evidence-backed Workflow
- Public Certificate Lookup

### Important notice

Clearly distinguish digital workflow from physical/statutory verification.

---

# 12. Public Certificate Verification

Certificate verification is a first-class public workflow.

## V-01 — Verification Landing

Heading:

**Verify Certificate**

Supporting text explaining that users can enter a certificate number to view publicly available certificate information.

Input:

`Certificate Number`

Primary button:

`Verify Certificate`

Optional:

`Scan QR Code`

Only show QR functionality if implemented.

---

## V-02 — Verification Form

Use:

- clear label
- helper text
- required indicator
- validation
- keyboard accessibility
- visible focus

Example helper:

`Enter the certificate number exactly as shown on the certificate.`

Do not rely on placeholder text as the label.

---

## V-03 — Verification Loading

Show:

- progress indicator
- “Verifying certificate…”
- no unnecessary animation

Do not freeze the interface.

---

## V-04 — Valid Certificate

Show:

- clear success icon
- `Certificate Verified`
- certificate number
- instrument information allowed for public disclosure
- business information allowed for public disclosure
- issue date
- validity/expiry
- verification status
- QR/reference information if implemented

Do not expose private/internal data.

---

## V-05 — Invalid Certificate

Heading:

**Certificate Could Not Be Verified**

Explain clearly.

Actions:

- Try Again
- Return Home

Do not expose backend errors.

---

## V-06 — Expired Certificate

Clearly show:

**Certificate Expired**

Provide:

- certificate number
- expiry date
- available public information
- next-step guidance if defined

Do not represent expired certificates as valid.

---

## V-07 — Revoked/Cancelled Certificate

Heading:

**Certificate Revoked**

Clearly communicate the status.

Do not disclose internal administrative reasons unless explicitly intended for public display.

---

## V-08 — Certificate Not Found

Heading:

**Certificate Not Found**

Explain that no matching public certificate record was found.

Actions:

- Check Certificate Number
- Try Again
- Contact Support

---

## V-09 — Certificate Details

Use a structured government-record presentation.

Sections:

### Certificate Information

- Certificate Number
- Status
- Issue Date
- Valid Until

### Instrument Information

- Instrument type
- Identification/serial information where public

### Business Information

Only public-safe fields.

### Verification

- verification status
- verification timestamp if appropriate

Provide:

- Print
- Download only if actually supported
- Verify another certificate

---

## V-10 — QR Verification Result

Use the same certificate-result layout as normal verification.

Show source:

`Verified using QR`

Do not create a separate visual language for QR verification.

---

## V-11 — Verification Error / Rate Limit

Use a reusable error layout.

Possible message:

`Too many verification attempts. Please wait and try again.`

Never expose:

- stack traces
- API URLs
- database errors
- internal IDs
- server details

---

# 13. P-02 — About

Title:

**About MapanSetu**

Sections:

1. About the Platform
2. Problem Being Addressed
3. What MapanSetu Coordinates
4. Digital Lifecycle
5. What MapanSetu Does Not Do
6. Department/Organization Information
7. Vision
8. Government Resources

Use institutional information hierarchy.

Do not invent official departmental facts.

---

# 14. P-03 — Contact

Title:

**Contact Us**

Sections:

### Department Contact

- Department
- Address
- Phone
- Email
- Working hours

Use placeholders where official data is unavailable.

### Citizen Support

- Support email
- Support phone
- response information

### Contact form

Fields:

- Name
- Email
- Phone
- Subject
- Message

States:

- default
- focus
- validation error
- submitting
- success
- failure

---

# 15. P-04 — Help / FAQ

Title:

**Help & Frequently Asked Questions**

Search:

`Search help topics`

Categories:

- General
- Certificate Verification
- Instruments
- Verification Applications
- Account & Login
- Accessibility
- Technical Issues

FAQ examples:

- What is MapanSetu?
- How can I verify a certificate?
- What information is required?
- How do I register an instrument?
- How do I track an application?
- What happens after inspection?
- How do I access a certificate?
- What should I do if verification fails?
- Is Hindi available?
- How do accessibility controls work?

Use accessible accordion components.

---

# 16. P-05 — Accessibility

Title:

**Accessibility**

Sections:

1. Accessibility Commitment
2. Keyboard Navigation
3. Screen Reader Support
4. Text Resize
5. Contrast
6. Language Support
7. Alternative Text
8. Responsive Design
9. Browser/Device Guidance
10. Accessibility Feedback

Provide:

`Report an Accessibility Issue`

CTA.

Do not claim formal certification without evidence.

---

# 17. P-06 — Privacy Policy

Use document layout.

Sections:

1. Introduction
2. Information We Collect
3. Purpose of Collection
4. Use of Information
5. Data Sharing
6. Data Security
7. Data Retention
8. Cookies / Local Storage
9. User Requests
10. Third-party Services
11. Changes
12. Contact

Include:

- Last Updated
- Effective Date
- table of contents where useful

Do not invent actual legal commitments.

---

# 18. P-07 — Terms / Disclaimer

Title:

**Terms of Use & Disclaimer**

Sections:

1. Acceptance
2. Platform Purpose
3. User Responsibilities
4. Account Responsibilities
5. Information Accuracy
6. Digital Records
7. Certificate Verification
8. Platform Limitations
9. Intellectual Property
10. External Links
11. Availability
12. Changes
13. Contact

Include clear platform limitation language.

---

# 19. P-08 — Hyperlinking Policy

Sections:

1. Internal Links
2. External Links
3. Linking to MapanSetu
4. Third-party Websites
5. External Website Disclaimer
6. Link Availability
7. Misleading/Prohibited Linking
8. Policy Changes
9. Contact

External links must have a recognizable external-link indicator where useful.

---

# 20. P-09 — Copyright / Content Policy

Sections:

1. Copyright
2. Ownership of Content
3. Permitted Use
4. Reproduction
5. Third-party Content
6. Documents and Publications
7. Attribution
8. External Content
9. Reporting Copyright Concerns
10. Contact

Use formal document styling.

---

# 21. P-10 — Sitemap

Use semantic lists.

### Public

- Home
- About
- Verify Certificate
- Help
- Accessibility
- Contact

### Policies

- Privacy Policy
- Terms / Disclaimer
- Hyperlinking Policy
- Copyright / Content Policy

### Authenticated

- Business Login
- Business Dashboard
- Instruments
- Verification Applications
- Certificates

Clearly distinguish public and authenticated areas.

---

# 22. P-11 — 404

Large:

**404**

Heading:

**Page Not Found**

Message:

`The page you are looking for could not be found or may have moved.`

Actions:

- Go to Homepage
- Verify Certificate
- Contact Support

Keep the design simple.

---

# 23. P-12 — 500

Large:

**500**

Heading:

**Service Temporarily Unavailable**

Message:

`Something went wrong while processing your request. Please try again later.`

Actions:

- Try Again
- Go to Homepage
- Contact Support

Optional request/reference ID.

Never display:

- stack traces
- SQL errors
- server information
- internal API information

---

# 24. Business Portal

Business and Public interfaces must NOT be visually or functionally confused.

## Business navigation

Recommended:

- Dashboard
- My Business
- Instruments
- Verification
- Inspections
- Certificates
- Notifications
- Reports
- Help

Profile/account menu:

- Profile
- Accessibility
- Language
- Logout

Do not display Officer navigation to Business users.

Do not show:

- Officer dashboard
- Officer assignments
- Officer sync center
- Officer conflict resolution
- Officer field controls

unless explicitly relevant to the Business role.

---

# 25. Business Screens

## B-01 Login

- Business Login
- Email/username
- Password
- Login
- recovery option only if supported

States:

- validation
- wrong credentials
- server error
- session expired

## B-02 Dashboard

Show only real API-backed information.

Possible sections:

- Active Instruments
- Pending Applications
- Upcoming Inspections
- Certificates
- Expiring Certificates
- Recent Activity
- Quick Actions

Do not fabricate metrics.

## B-03 Business Profile

Show:

- organization/business name
- registration information
- address
- contact information
- account information

## B-04 Instruments

List:

- instrument ID
- type
- status
- registration date
- latest verification
- next verification/expiry where available

Actions:

- View
- Register
- Edit where allowed

## B-05 Instrument Details

Sections:

- Instrument Identity
- Business
- Verification History
- Certificate History
- Lifecycle Timeline

## B-06 Verification Applications

List:

- application number
- instrument
- submitted date
- status
- inspection status
- certificate status

## B-07 New Verification Application

Use a step-based form:

1. Select Instrument
2. Application Details
3. Review
4. Submit

Do not create unnecessary form fields.

## B-08 Application Details

Show:

- application identity
- instrument
- status
- timeline
- inspection status
- certificate status
- actions

## B-09 Inspection Tracking

Business users can view workflow status.

They must NOT receive officer-only operational controls.

## B-10 Certificates

Show:

- certificate number
- instrument
- issue date
- validity
- status

## B-11 Certificate Details

Use the same certificate visual language as public verification where possible.

## B-12 Notifications

Use:

- unread/read states
- timestamps
- category
- clear action

## B-13 Reports

Only expose reports supported by backend functionality.

---

# 26. Administrator / Supervisor Portal

Admin has a separate information architecture.

Navigation:

- Dashboard
- Businesses
- Instruments
- Applications
- Assignments
- Scheduling
- Officers
- Certificates
- Evidence
- Audit
- Notifications
- Settings

Do not mix Business navigation with Admin navigation.

---

# 27. Admin Screens

## A-01 Login

Administrative authentication.

## A-02 Dashboard

Show API-backed operational information:

- application queue
- pending reviews
- officer workload
- upcoming inspections
- expiring certificates
- alerts
- system activity

## A-03 Businesses

- search
- filter
- list
- details
- instruments
- applications
- certificates
- history

## A-04 Instruments

- all instruments
- search
- details
- verification history
- conflicts

## A-05 Applications

- queue
- filters
- application details
- review
- timeline
- assignment
- scheduling

## A-06 Assignments

Show:

- application
- assigned officer
- assignment status
- assignment history

## A-07 Scheduling

Show:

- inspection
- date/time
- officer
- location
- schedule status
- reschedule

## A-08 Officers

Show:

- officer list
- officer details
- workload
- assignments
- schedule
- activity

This is administrative information only.

Field inspection execution remains in the Officer application.

## A-09 Certificates

- registry
- details
- issuance status
- revoke/cancel where supported
- history

## A-10 Evidence

- evidence registry
- evidence details
- inspection evidence
- audit relationship

## A-11 Audit

Use dense but readable audit tables.

Show:

- timestamp
- actor
- action
- entity
- result
- reference

## A-12 Notifications

Operational notification queue.

## A-13 Settings

Only expose settings supported by the application.

---

# 28. Authentication and Authorization UX

Authentication states:

- unauthenticated
- authenticating
- authenticated
- session expired
- unauthorized
- forbidden

Role separation is mandatory.

Business must never receive Officer UI.

Admin must never receive Business-only navigation where inappropriate.

Public users must never receive authenticated navigation.

---

# 29. Common Components

Create reusable components.

## Navigation

- GovernmentHeader
- UtilityBar
- AccessibilityToolbar
- LanguageSwitcher
- MobileMenu
- Breadcrumbs

## Content

- PageHeader
- SectionHeader
- Card
- InfoCard
- ServiceCard
- Timeline
- StatusBadge
- Alert
- EmptyState

## Forms

- TextInput
- Select
- DateInput
- SearchInput
- Textarea
- Checkbox
- RadioGroup
- FileInput where supported
- FormError
- FormSuccess

## Data

- Table
- Pagination
- Filters
- Sort
- Search
- DetailPanel

## Feedback

- Toast
- Modal
- ConfirmationDialog
- LoadingState
- ErrorState
- OfflineState

---

# 30. Button System

Primary:

Use for the main action.

Examples:

- Verify Certificate
- Login
- Submit Application
- Save
- Continue

Secondary:

Supporting action.

Examples:

- Cancel
- Back
- View Details

Destructive:

Use only for genuinely destructive operations.

Examples:

- Revoke
- Delete

Never use red simply to make a button visually noticeable.

Every button must have:

- default
- hover
- focus
- active
- disabled

---

# 31. Forms

Every input must have:

- visible label
- optional helper text
- required indicator where applicable
- validation message
- accessible error state

Example:

```text
Certificate Number *
Enter the certificate number exactly as shown on the certificate.

[________________________]

Error:
Enter a valid certificate number.
```

Never use:

`placeholder = label`

as the only label.

---

# 32. Tables

Tables are required for administrative and registry data.

Desktop:

- clear headers
- aligned values
- sortable columns where supported
- filters
- pagination

Mobile:

Prefer responsive cards when the data is simple.

For complex tables:

allow horizontal scrolling inside an accessible table container.

Do not force the entire page to horizontally scroll.

---

# 33. Status System

Every status must have:

- text
- optional icon
- color as supporting information

Examples:

```text
✓ Verified
Pending
⚠ Action Required
Expired
✕ Rejected
Revoked
Cancelled
```

Do not use only:

green / yellow / red.

---

# 34. Loading States

Use skeletons for substantial page content.

Use progress indicators for short actions.

Avoid:

- blank screen
- infinite spinner
- misleading loading animation

Example:

`Verifying certificate…`

---

# 35. Empty States

Every major list must have an intentional empty state.

Example:

**No instruments registered**

`Your registered instruments will appear here.`

Primary action:

`Register Instrument`

Do not show empty tables with no explanation.

---

# 36. Error States

Error messages must:

- explain what happened
- avoid technical jargon
- tell the user what to do next
- preserve entered data where possible

Bad:

`500 Internal Server Error`

Good:

`We couldn't load your certificates right now. Please try again.`

---

# 37. Accessibility

Every page must support:

- keyboard navigation
- visible focus
- semantic headings
- semantic landmarks
- screen readers
- text resizing
- bilingual content
- accessible forms
- accessible tables
- accessible modals
- accessible accordions
- accessible alerts

Use:

```text
header
nav
main
section
article
footer
button
a
form
label
table
```

appropriately.

Do not build the interface from generic `<div>` elements when a semantic element exists.

---

# 38. Focus State

Every keyboard-focusable interactive element must have a clearly visible focus state.

Never remove browser focus without replacing it with an equally visible custom focus treatment.

---

# 39. Language System

The entire website supports:

**English**

and

**Hindi / हिंदी**

Language switching must affect:

- navigation
- page titles
- headings
- labels
- buttons
- help text
- errors
- status messages
- footer
- policy content
- certificate verification UI

Do not translate only the homepage.

Do not put translated text inside images.

Use proper document language metadata.

---

# 40. Hindi Layout

Hindi must not be treated as a smaller secondary language.

Test:

- line wrapping
- heading height
- buttons
- navigation
- forms
- tables
- cards
- alerts
- footer

Allow Hindi text to occupy more vertical space when necessary.

Do not truncate Hindi content simply to preserve an English layout.

---

# 41. Responsive Breakpoints

Target:

```text
320px
360px
480px
768px
1024px
1200px+
```

At mobile:

- single-column forms
- stacked cards
- collapsible navigation
- readable policy text
- responsive footer
- no page-level horizontal scroll

At desktop:

- structured multi-column layouts
- maximum readable content width
- clear whitespace
- strong hierarchy

---

# 42. Touch Targets

Interactive controls should have sufficiently large target areas.

Target approximately:

**48 × 48px**

for important touch controls.

Do not place tiny icons immediately beside each other.

---

# 43. Animation

Animation must be restrained.

Use animation only when it improves:

- state transition
- feedback
- navigation
- loading comprehension

Avoid:

- parallax-heavy landing pages
- flashing content
- auto-playing decorative motion
- distracting transitions

Respect reduced-motion preferences.

---

# 44. Icons

Use simple, recognizable icons.

Icons must not replace critical text.

For icon-only buttons:

provide an accessible label.

Examples:

```text
Search
Menu
Notifications
Download
Print
Close
Back
```

---

# 45. Images and Illustrations

Every meaningful image must have meaningful alternative text.

Decorative images should be treated as decorative.

Do not use:

- fake official seals
- fabricated government logos
- AI-generated officers presented as real officers
- fake certificates that could be mistaken for genuine legal certificates

For prototype imagery, clearly use synthetic/demo presentation.

---

# 46. Security-Sensitive UI

Never expose in the UI:

- passwords
- tokens
- secret keys
- internal stack traces
- database errors
- sensitive internal IDs
- private officer information to public users
- internal administrative notes to Business users

Public certificate verification must expose only public-safe information.

---

# 47. Public vs Business vs Admin

This separation is mandatory.

```text
PUBLIC
    ↓
Home
Verify Certificate
About
Contact
Help
Policies

BUSINESS
    ↓
Dashboard
Business
Instruments
Applications
Inspections
Certificates
Notifications
Reports

ADMIN
    ↓
Dashboard
Businesses
Instruments
Applications
Assignments
Scheduling
Officers
Certificates
Evidence
Audit
Settings
```

Do not combine these into one universal navigation.

---

# 48. Officer Boundary

The Officer field application is separate from the web application.

Do not reproduce the Officer mobile application's operational navigation inside Business web pages.

Do not show Business users:

- Officer Dashboard
- Assigned Inspections
- Sync Center
- Conflict Resolution
- Officer Profile

unless specifically required by the Business API and role model.

Field inspection execution belongs to the Officer application.

---

# 49. API/UI Rule

UI must reflect actual backend capability.

Before designing a data-heavy screen:

1. identify the API endpoint
2. identify response fields
3. identify supported actions
4. design the UI around those fields
5. do not invent unsupported functionality

If an endpoint does not exist, do not create a fake functional control simply because it looks useful.

---

# 50. Last Updated

Public informational and policy pages should provide a clear:

**Last Updated**

date.

Do not fabricate dates.

Use a placeholder until official content is supplied.

---

# 51. Stitch Design Rules

When generating screens in Stitch:

1. Reuse the same design language.
2. Do not redesign the header for every screen.
3. Do not redesign the footer for every screen.
4. Keep spacing tokens consistent.
5. Keep typography consistent.
6. Keep colors consistent.
7. Keep button styles consistent.
8. Keep status styles consistent.
9. Keep accessibility controls consistent.
10. Keep English/Hindi behavior consistent.

If a component already exists, reuse it rather than creating a visually different version.

---

# 52. Stitch Generation Order

Generate the frontend in this order.

## Phase 1 — Core Design System

1. Government Header
2. Accessibility Toolbar
3. Navigation
4. Footer
5. Typography
6. Buttons
7. Inputs
8. Cards
9. Alerts
10. Status badges
11. Tables
12. Timeline
13. Modal
14. Loading
15. Empty
16. Error

## Phase 2 — Public

17. P-01 Landing
18. V-01 Verify Certificate
19. V-02 Verification Form
20. V-03 Loading
21. V-04 Valid Certificate
22. V-05 Invalid Certificate
23. V-06 Expired Certificate
24. V-07 Revoked Certificate
25. V-08 Not Found
26. V-09 Certificate Details
27. V-10 QR Result
28. V-11 Verification Error
29. P-02 About
30. P-03 Contact
31. P-04 Help
32. P-05 Accessibility
33. P-06 Privacy
34. P-07 Terms
35. P-08 Hyperlinking
36. P-09 Copyright
37. P-10 Sitemap
38. P-11 404
39. P-12 500

## Phase 3 — Business

40. Login
41. Dashboard
42. Profile
43. Instruments
44. Instrument Details
45. Add Instrument
46. Applications
47. New Application
48. Application Details
49. Inspection Tracking
50. Certificates
51. Certificate Details
52. Notifications
53. Reports

## Phase 4 — Admin

54. Admin Login
55. Dashboard
56. Businesses
57. Business Details
58. Instruments
59. Applications
60. Assignment
61. Scheduling
62. Officers
63. Officer Workload
64. Certificates
65. Evidence
66. Audit
67. Notifications
68. Settings

## Phase 5 — Responsive & Accessibility Review

Review all screens at:

- 320px
- 360px
- 768px
- 1024px
- 1200px+

Then review:

- English
- Hindi
- keyboard
- focus
- contrast
- text resize
- screen-reader semantics
- error states
- empty states
- loading states

---

# 53. Definition of a Finished Screen

A screen is not considered complete merely because the main desktop design looks good.

Every screen must have:

- desktop layout
- mobile layout
- English state
- Hindi state
- loading state where applicable
- empty state where applicable
- error state where applicable
- focus state
- hover state where applicable
- disabled state where applicable
- accessible labels
- responsive behavior
- correct navigation relationship
- API-backed content assumptions
- no role leakage

---

# 54. Final Quality Gate

Before considering the website design complete, verify:

### Visual

- consistent typography
- consistent spacing
- consistent components
- restrained government visual language
- no unnecessary decoration

### Accessibility

- keyboard navigation
- visible focus
- semantic hierarchy
- accessible forms
- contrast
- text resize
- language metadata
- meaningful alt text

### Responsive

- 320px
- 360px
- 768px
- 1024px
- 1200px+

### Localization

- English
- Hindi
- complete translation
- no clipped Hindi text

### Role separation

- Public ≠ Business
- Business ≠ Admin
- Admin ≠ Officer
- Officer field UI remains separate

### Content

- no fabricated government claims
- no fake official data
- no fake officer information
- no unsupported API functionality
- no technical errors exposed to users

### Functional consistency

Every button, link, filter, form, table, modal and navigation element must correspond to an actual intended product action or clearly be marked as a non-functional prototype element.

---

# 55. Core Design Principle

**Design the interface around the user's task, not around the database.**

Public users primarily need to:

`Understand → Verify → Get Help`

Businesses primarily need to:

`Register → Apply → Track → Inspect Status → Manage Certificates`

Administrators primarily need to:

`Monitor → Review → Assign → Schedule → Manage → Audit`

The UI must make these workflows immediately understandable without exposing irrelevant internal complexity.