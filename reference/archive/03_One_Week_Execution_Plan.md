# 1-Week Execution Plan & Role Distribution

## Team Roles
1.  **Lead Architect / Integrator:** Reviews AI PRs, manages merges, ensures DB/API contracts are followed, handles deployment.
2.  **Frontend Dev + UI AI Agents:** Builds React portals, dashboards, Tailwind styling.
3.  **Field App Dev + PWA AI Agents:** Focuses purely on the offline PWA, IndexedDB, and camera integration.
4.  **Backend Dev + API AI Agents:** Builds Spring Boot/Node endpoints, DB schemas, handles cryptography.

## Day-by-Day Roadmap

### Day 1: Foundation & Scaffolding (TODAY)
*   [x] Define PRD, Architecture, and API Specs.
*   [ ] Initialize monorepo structure.
*   [ ] Setup PostgreSQL DB and run initial migrations.
*   [ ] Setup basic Spring Boot (or Node/Express) boilerplate with Swagger/OpenAPI.
*   [ ] Setup Vite + React boilerplate for Web and PWA.

### Day 2: Authentication & Entities
*   [ ] **Backend:** Implement JWT Auth. CRUD for `Users`, `Businesses`, and `Instruments`.
*   [ ] **Frontend:** Login/Signup screens. Business dashboard layout.
*   [ ] **Field App:** Login screen, basic offline caching setup (Workbox).

### Day 3: The Application Flow
*   [ ] **Backend:** Implement `Applications` module (Submit, Assign to LMO, Update Status).
*   [ ] **Frontend:** Business UI to "Apply for Verification". Admin UI to assign LMO.
*   [ ] **Field App:** Fetch assigned applications, display list locally.

### Day 4: Offline Inspection & Sync
*   [ ] **Field App:** Form to record readings, capture photo. Save to IndexedDB. Implement sync logic when online.
*   [ ] **Backend:** `/api/inspections/sync` endpoint to receive offline payloads and photos (upload to S3/MinIO).

### Day 5: Cryptography & Certificates
*   [ ] **Backend:** Logic to generate Certificate on PASS. Implement RSA signing. Generate QR code payload.
*   [ ] **Frontend:** Public verification page (`/verify/:certId`) that validates the signature.
*   [ ] **Frontend:** Business UI to view/download generated certificates.

### Day 6: AI / Polish / "Wow" Features
*   [ ] **Feature:** Instrument Passport timeline view on the frontend.
*   [ ] **Optional AI:** If time permits, add a simple OCR microservice (Python/FastAPI + Tesseract) to read serial numbers from uploaded photos to cross-check.
*   [ ] Complete End-to-End testing.

### Day 7: Demo Prep & Buffer
*   [ ] Deploy to a cloud provider (Render, Vercel, AWS, or similar).
*   [ ] Seed database with realistic demo data (Sharma General Store, specific LMOs).
*   [ ] Rehearse the 5-minute demo script.
