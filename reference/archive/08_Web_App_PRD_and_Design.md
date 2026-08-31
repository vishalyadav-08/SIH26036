# MapanSetu Web Application: PRD and UI/UX Design Specification

**Project:** SIH26036 - Legal Metrology Instrument Verification System
**Document Status:** Final
**Target Audience:** Frontend Developers, UI/UX Designers, AI Agents

---

## 1. Overview

### Purpose
MapanSetu is a unified digital platform designed for the Legal Metrology department of India. It digitizes the end-to-end process of verifying, inspecting, and certifying weighing and measuring instruments used in trade and commerce. The platform aims to bring transparency, efficiency, and traceability to a traditionally manual process.

### Primary Users
1. **Businesses (Shop Owners/Traders):** Entities that own weighing/measuring instruments and are legally required to get them periodically verified and certified.
2. **Legal Metrology Officers (LMO):** Government officials responsible for inspecting instruments, recording readings, and issuing certificates.
3. **Administrators (Admin):** State/District level supervisors who manage officers, businesses, and monitor system KPIs.
4. **Public/Consumers:** End-users who can verify the authenticity of a shop's weighing scale certificate via QR code scanning.

### Goals
- Fully digitize the instrument registration and verification application process.
- Provide a guided, digital inspection flow for LMOs, including photo uploads and GPS tagging.
- Automatically generate verifiable digital certificates with unique QR codes.
- Maintain a "Digital Instrument Passport" for complete lifecycle traceability of every instrument.
- Support the core hackathon demo flow seamlessly.

---

## 2. Information Architecture

### Site Map and Routes
The application is structured around Role-Based Access Control (RBAC).

**Public / Auth Routes:**
- `/` - Landing Page
- `/login` - User Authentication
- `/register` - Business Registration
- `/verify/:certNo` - Public Certificate Verification Page

**Business Portal Routes (`/business/*`):**
- `/business/dashboard` - Business Dashboard
- `/business/instruments` - List of Registered Instruments
- `/business/instruments/new` - Register New Instrument Form
- `/business/instruments/:id` - Instrument Detail & Digital Passport
- `/business/applications` - List of Verification Applications
- `/business/applications/new` - Submit Verification Request (Wizard)
- `/business/certificates` - Issued Certificates

**Officer Portal Routes (`/officer/*`):**
- `/officer/dashboard` - Officer Dashboard
- `/officer/applications` - Assigned Inspections Queue
- `/officer/applications/:id` - Application Details
- `/officer/inspections/new/:appId` - Digital Inspection Form
- `/officer/certificates` - Certificates Issued by Officer

**Admin Portal Routes (`/admin/*`):**
- `/admin/dashboard` - State/System KPIs
- `/admin/officers` - Officer Management
- `/admin/businesses` - Business Directory
- `/admin/instruments` - Global Instrument Directory
- `/admin/applications` - Global Applications & Assignment
- `/admin/certificates` - Global Certificate Registry
- `/admin/audit-logs` - System Audit Trail

**Shared Routes:**
- `/profile` - User Profile & Settings
- `/notifications` - Alert Center

---

## 3. Screen-by-Screen Design Spec

### Color Palette
- **Primary:** `#1B4F72` (Deep Government Blue)
- **Accent/Action:** `#2E86C1` (Lighter Blue for buttons/links)
- **Success:** `#28B463` (Green for Pass/Verified/Active)
- **Warning:** `#F39C12` (Orange for Pending/Expiring Soon)
- **Danger:** `#E74C3C` (Red for Fail/Expired/Errors)
- **Background:** `#F4F6F8` (Light Gray for app background)
- **Card/Surface:** `#FFFFFF` (White)
- **Text Main:** `#2C3E50` (Dark Slate)
- **Text Muted:** `#7F8C8D` (Gray)

---

### 3.1 Public / Auth Screens

#### 1. Landing Page (`/`)
- **Purpose:** Introduce MapanSetu, entry point for login/registration, public QR verifier tool.
- **Layout:** Standard Landing Page (Header, Hero Section, Features, Footer).
- **Header:** Logo left, Navigation (Home, About, Login, Register) right.
- **Hero Section:**
  - Headline: "Digital Metrology for a Transparent India"
  - Call to Actions (CTA): Primary button "Login to Portal" (`#2E86C1`), Secondary button "Register Business".
- **Widget Area:** "Verify a Certificate"
  - Form Field: `certificateNo` (Text, Placeholder: "Enter Certificate No.")
  - Button: "Verify" (Redirects to `/verify/:certNo`)
- **Empty/Loading/Error:** N/A.

#### 2. Login Page (`/login`)
- **Purpose:** User authentication.
- **Layout:** Centered card layout on `#F4F6F8` background.
- **UI Components:**
  - Card: 400px width, white background, soft shadow.
  - Logo centered at top.
  - **Tabs/Pills:** Role Selector [Business | Officer | Admin]. Active tab uses Primary color, inactive uses gray.
  - **Form Fields:**
    - `email`: Type Email, Required, Placeholder "Email Address".
    - `password`: Type Password, Required, Placeholder "Password".
  - **Action:** Primary Button "Login" (width 100%).
  - **Links:** "Forgot Password?", "New Business? Register Here".
- **Validation:** Standard email format, password min length 8.
- **Loading State:** Button shows spinner and text "Logging in...".
- **Error State:** Red inline text below fields for validation errors; toast notification for invalid credentials.

#### 3. Business Registration (`/register`)
- **Purpose:** Onboarding for new shop owners.
- **Layout:** Centered wider card (600px).
- **Form Fields:**
  - `businessName`: Text, Required.
  - `ownerName`: Text, Required.
  - `gstin`: Text, Optional, Regex for GSTIN format.
  - `contactNumber`: Number, 10 digits required.
  - `email`: Email, Required.
  - `address`: Textarea, Required.
  - `password`: Password, Required.
  - `confirmPassword`: Password, Required.
- **Action:** Button "Register Business".
- **Loading/Error:** Standard inline validation, spinner on submit.

#### 4. Public QR Certificate Verification (`/verify/:certNo`)
- **Purpose:** Public display of instrument certificate validity.
- **Layout:** Mobile-optimized single column.
- **UI Components:**
  - Top Banner: Green `#28B463` background if Valid, Red `#E74C3C` if Invalid/Expired.
  - Large Text: "CERTIFICATE VALID" (with checkmark icon) or "EXPIRED".
  - Card Details:
    - Business Name
    - Instrument Type & Capacity
    - Verified On (Date)
    - Valid Till (Date)
    - Verified By (Officer Name)
- **Empty State:** If certNo not found, show "Certificate Not Found" with an illustration.
- **Loading State:** Skeleton loader for the card.

---

### 3.2 Business Portal

#### 5. Business Dashboard (`/business/dashboard`)
- **Purpose:** High-level overview for the business owner.
- **Layout:** Sidebar Navigation + Topbar (Profile/Notifications) + Main Content Area.
- **UI Components:**
  - **Stats Cards (Row of 4):**
    - "Total Instruments" (Icon: Scale)
    - "Active Certificates" (Green Text)
    - "Expiring Soon (30 Days)" (Orange Text)
    - "Pending Applications" (Blue Text)
  - **Alerts Section:**
    - Warning banner for any instrument expiring in < 7 days.
  - **Recent Applications Table:**
    - Columns: App ID, Instrument, Date Submitted, Status (Badge), Action (Link).
    - Max 5 rows.
    - Status Badges: [PENDING (Orange)], [ASSIGNED (Blue)], [INSPECTED (Purple)], [COMPLETED (Green)].
- **Empty State:** If no instruments, show a card with CTA "Register your first instrument".

#### 6. Instrument List (`/business/instruments`)
- **Purpose:** Manage all owned instruments.
- **Layout:** Page Header with "Add New Instrument" button (Primary color).
- **UI Components:**
  - **Data Table:**
    - Columns: ID, Type (e.g., Electronic Weighing Scale), Make/Model, Capacity, Current Status (Badge), Next Due Date.
    - Badges: [ACTIVE (Green)], [EXPIRED (Red)], [EXPIRING_SOON (Orange)].
    - Actions column: "View Passport" (Eye icon), "Apply for Verification" (Play icon, disabled if currently active).
- **Empty State:** "No instruments registered yet." + Add Button.

#### 7. Register New Instrument Form (`/business/instruments/new`)
- **Purpose:** Add an instrument to inventory.
- **Layout:** Simple 1-column form in a Card.
- **Fields:**
  - `type`: Dropdown (Electronic Scale, Mechanical Scale, Weight Box, Dispensing Pump).
  - `make`: Text.
  - `model`: Text.
  - `serialNo`: Text.
  - `capacity`: Text (e.g., "50 kg").
  - `class`: Dropdown (Class I, II, III, IV).
- **Action:** "Save Instrument".

#### 8. Instrument Detail & Digital Passport (`/business/instruments/:id`)
- **Purpose:** Comprehensive view of a single instrument's lifecycle.
- **Layout:** Two columns. Left: Details. Right: Timeline.
- **Left Column (Details Card):**
  - Instrument Metadata (Make, Model, S/N).
  - Current Certificate QR Code displayed prominently.
- **Right Column (Digital Instrument Passport - Timeline Component):**
  - Vertical line with dots.
  - Nodes: Date, Event Name, Actor.
  - Example node:
    - *12 Jan 2024*
    - **CERTIFICATE_ISSUED**
    - Verified by LMO R. Kumar. Certificate #12345.
    - Status Badge: [PASS]
- **Loading State:** Skeleton blocks for both columns.

#### 9. Verification Application Wizard (`/business/applications/new`)
- **Purpose:** Apply for periodic verification.
- **Layout:** Stepper Wizard (Step 1: Select Instrument -> Step 2: Upload Documents -> Step 3: Review & Submit).
- **Step 1:** Dropdown of unverified/expired instruments.
- **Step 2:** File upload for Previous Certificate (if any), Invoice.
- **Step 3:** Summary card.
- **Action:** "Submit Application".
- **Success State:** Confetti animation, Modal with Application ID.

---

### 3.3 Officer Portal (LMO)

#### 10. Officer Dashboard (`/officer/dashboard`)
- **Purpose:** Daily work management for LMO.
- **Layout:** Sidebar + Main Content.
- **UI Components:**
  - **Stats:** "Inspections Today", "Pending in Queue", "Certificates Issued (This Month)".
  - **Today's Schedule (List):** Applications assigned for today. Shows Business Name, Address, and Instrument Type. Quick action "Start Inspection".
- **Empty State:** "You have no inspections scheduled for today. Enjoy your day!"

#### 11. Digital Inspection Form (`/officer/inspections/new/:appId`)
- **Purpose:** Core feature for LMO to conduct digital verification.
- **Layout:** Mobile-friendly wide form (often used on tablets in the field).
- **UI Components:**
  - Header: Application ID, Business Details.
  - **Section 1: General Check**
    - `physicalCondition`: Radio (Good, Damaged).
    - `sealIntact`: Radio (Yes, No).
  - **Section 2: Error Readings (Dynamic Table)**
    - Table to enter Load, Indicated Value, Error, and Allowable Error.
    - Fields are number inputs.
  - **Section 3: Evidence (Photos)**
    - "Upload Machine Photo" (Dropzone, opens camera on mobile).
    - "Upload Weight Indication Photo".
    - Background process captures GPS coordinates upon photo upload.
  - **Section 4: Decision**
    - `result`: Massive toggle buttons [PASS (Green)] / [FAIL (Red)].
    - `remarks`: Textarea.
  - **Actions:** "Submit Verification".
- **Validations:** Photos are mandatory. If FAIL is selected, Remarks are mandatory.
- **Loading State:** "Uploading evidence and saving report...".

---

### 3.4 Admin Portal

#### 12. Admin Dashboard (`/admin/dashboard`)
- **Purpose:** Macro view of the state's metrology operations.
- **Layout:** Sidebar + Wide Content Area.
- **UI Components:**
  - **KPIs:** Total Revenue Collected, Total Instruments Verified, Total Businesses, Active Officers.
  - **Charts:** Bar chart for "Verifications per Month".
  - **Recent Activity Feed:** Audit logs of recent certificates issued.

#### 13. Applications Management (`/admin/applications`)
- **Purpose:** Assign LMOs to incoming applications.
- **UI Components:**
  - Filterable Table (Status = PENDING).
  - Action: "Assign Officer" opens a Modal.
  - Modal: Select Officer from Dropdown (shows current workload next to name, e.g., "R. Kumar (3 pending)"). Click "Assign".
- **Notification Trigger:** Assigning sends an in-app notification to the LMO.

---

## 4. Component Design System

### Typography
- **Font Family:** Inter, sans-serif.
- **Headings (H1-H4):** Font weights 600-700. Dark Slate (`#2C3E50`).
- **Body Text:** 14px and 16px, weight 400. Muted Gray (`#7F8C8D`) for secondary text.

### Badges
Used heavily for Statuses. Pill shaped, 12px font, bold uppercase.
- `PENDING`: Background `#FEF5E7`, Text `#F39C12` (Orange)
- `ASSIGNED`: Background `#EAF2F8`, Text `#2E86C1` (Blue)
- `PASS` / `ACTIVE`: Background `#EAFAF1`, Text `#28B463` (Green)
- `FAIL` / `EXPIRED`: Background `#FDEDEC`, Text `#E74C3C` (Red)

### Forms
- **Inputs:** Height 40px, Border `#D5D8DC`, Border Radius 6px.
- **Focus State:** Border changes to Primary `#1B4F72`, slight box-shadow.
- **Labels:** 13px, weight 500, placed above the input.
- **Error State:** Border `#E74C3C`, error message below in 12px red text.

### Buttons
- **Primary:** Background `#2E86C1`, Text White, Hover `#21618C`. Border radius 6px.
- **Secondary:** Background Transparent, Border `#2E86C1`, Text `#2E86C1`.
- **Danger:** Background `#E74C3C`, Text White.
- **Disabled:** Background `#E5E7E9`, Text `#A6ACAF`, cursor not-allowed.

### Tables
- Header Row: Background `#F4F6F8`, Font weight 600, Text uppercase 12px.
- Rows: White background, bottom border `#EAEDED`. Hover state background `#F8F9F9`.
- Pagination: Standard Previous/Next and page numbers at bottom right.

---

## 5. Key Interaction Flows (Demo Flow)

1. **Login:** User accesses `/login`, selects "Business" tab, logs in as Sharma General Store.
2. **Dashboard -> Register Instrument:** Navigates to `/business/instruments/new`, fills details, saves.
3. **Apply for Verification:** Clicks "Apply for Verification" on the instrument row. Completes wizard, gets App ID.
4. **Role Switch (Admin):** (Optional in demo) Admin assigns application to LMO.
5. **Login as LMO:** Logs in, goes to `/officer/dashboard`. Sees application in queue.
6. **Digital Inspection:** Clicks "Start Inspection". Fills readings, uploads photos (simulated GPS capture), selects **PASS**, submits.
7. **Certificate Generation:** System generates PDF and QR code asynchronously.
8. **View Certificate:** Business logs back in, sees Certificate with QR.
9. **Public Verification:** Anyone scans QR -> opens `/verify/:certNo` -> Shows large green **CERTIFICATE VALID**.
10. **Digital Passport:** Business views `/business/instruments/:id`, sees the timeline updated with the new inspection and certificate generation event.

---

## 6. Digital Instrument Passport UI Detail

The Digital Instrument Passport is a core differentiator. It provides an immutable timeline of an instrument.

### Technical UI Layout
```markdown
[ Header: Instrument XYZ - S/N: 998877 ]

+---------------------------------------------------+
|  [QR Code Image]                                  |
|  Scan to verify current status                    |
+---------------------------------------------------+

TIMELINE:
(Line starts)
  |
 (O)--- 15 Oct 2024, 10:30 AM
  |     Event: CERTIFICATE_ISSUED
  |     Actor: System
  |     Details: Valid till 14 Oct 2025. [Download PDF]
  |
 (O)--- 14 Oct 2024, 02:15 PM
  |     Event: INSPECTION_PASSED
  |     Actor: LMO R. Sharma
  |     Details: Readings verified. Photos attached.
  |
 (O)--- 10 Oct 2024, 09:00 AM
  |     Event: VERIFICATION_APPLIED
  |     Actor: Business Owner
  |     Details: Application #APP-992 created.
  |
 (O)--- 01 Oct 2024, 11:00 AM
        Event: INSTRUMENT_REGISTERED
        Actor: Business Owner
        Details: Added to system.
```
*Implementation Note: Use a vertical stepper component from UI libraries (like MUI Timeline, Ant Design Steps, or custom Tailwind CSS).*

---

## 7. Notification System

### In-App Notifications
- Accessed via a Bell Icon in the top right Topbar.
- Unread count badge (red dot) on the bell.
- Clicking opens a dropdown menu showing a list of recent alerts.
- Clicking an alert marks it as read and navigates to the relevant entity (e.g., Application Detail).

### Trigger Events
- **Business:**
  - Instrument Registration Successful.
  - Application Status Changed (Assigned, Inspected, Certificate Issued).
  - Expiry Alerts (Triggered by Cron Job): 30 days before, 7 days before, 1 day before, Expired.
- **Officer:**
  - New Application Assigned.
- **Admin:**
  - Weekly summary reports.

---

## 8. Responsive Design Requirements

- **Desktop (1280px+):** Full Sidebar visible permanently. Multi-column layouts (like Dashboard cards in a row of 4).
- **Tablet (768px - 1024px):** Crucial for LMO field work. Sidebar collapses to icons only or a hamburger menu. Forms switch to single column. Tables allow horizontal scrolling if needed, or collapse less important columns.
- **Mobile (< 768px):** Public Verify page must be perfectly optimized for mobile screens. Stacked layouts. Bottom navigation or Hamburger menu. Touch-friendly large buttons (min 44px height).

---
*End of Document*
