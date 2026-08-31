# MapanSetu (SIH26036) - Product Requirements Document (Prototype)

## 1. Problem Statement
The Department of Consumer Affairs requires an online system for the Legal Metrology department to manage the verification and stamping of weights and measuring instruments. The system must digitize the entire workflow from application to certificate issuance, including field inspections.

## 2. Target Audience
1. **Businesses (Shopkeepers, Factories):** Owners of weighing/measuring instruments.
2. **Legal Metrology Officers (LMOs):** Field officers who inspect instruments.
3. **Administrators (State/Central):** Track metrics, manage officers, and audit logs.
4. **Public/Consumers:** Can verify instrument authenticity via QR scan.

## 3. Prototype Scope (1-Week Goal)
For the hackathon prototype, we will focus on the core "Happy Path" workflow:
1. **Business Registration & Instrument Addition:** Business signs up and registers an electronic weighing machine.
2. **Application Submission:** Business requests verification for the instrument.
3. **Officer Assignment & Field Inspection (Offline-first App):** Officer views assigned applications, visits the site, records readings, uploads evidence (photo), and marks PASS/FAIL.
4. **Certificate Generation:** System generates a digitally verifiable certificate with a QR code.
5. **Public Verification:** Scanning the QR code displays "Valid" or "Expired" status.

## 4. Key Features for Prototype
*   **Web Portal (React):** Dashboards for Business and Admin/Officer.
*   **Field Officer App (PWA):** Mobile-friendly web app. Can cache data for offline inspection and sync when online.
*   **Digital Instrument Passport:** A chronological timeline of an instrument's life (registered -> verified -> renewed).
*   **QR-based Verification:** Cryptographically secure validation of certificates.

## 5. Out of Scope for 1-Week Prototype (Move to V2)
*   Payment gateway integration (mock it).
*   Complex AI/OCR for automatic reading extraction (keep it as a manual entry + photo upload for now, add AI only if time permits on Day 6).
*   Complex RBAC across 28 states (limit to 1 state, 1 admin, 1 officer for demo).
