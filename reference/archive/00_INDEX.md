# MapanSetu — Master Documentation Index

> **Project:** SIH26036 — Legal Metrology Instrument Verification System
> **Team:** MapanSetu
> **Demo Date:** 3 September 2026
> **Stack:** React + Node.js/TypeScript + PostgreSQL + PWA

---

## 📁 Document Map

| # | Document | Owner | Purpose |
|---|---|---|---|
| 01 | [PRD (Prototype Scope)](./01_PRD.md) | All | Core requirements and 1-week scope |
| 02 | [Architecture & Cryptography](./02_Architecture_and_Cryptography.md) | Architect | System design, crypto, offline strategy |
| 03 | [Execution Plan](./03_One_Week_Execution_Plan.md) | Lead | Day-by-day roadmap |
| 04 | [Tech Stack](./04_Tech_Stack.md) | All | Technology choices |
| 05 | [Agentic Workflow Guide](./05_Agentic_Workflow_Guide.md) | All | How to use AI agents correctly |
| 06 | [Database Schema (SQL)](./06_Database_Schema.md) | Backend | PostgreSQL table definitions |
| 07 | [API Contracts (Quick Ref)](./07_API_Contracts.md) | Backend/Frontend | Endpoint quick reference |
| **08** | **[Web App PRD & Design](./08_Web_App_PRD_and_Design.md)** | **Frontend** | **All screens, UI design, interactions** |
| **09** | **[Field App PRD & Design](./09_Field_App_PRD_and_Design.md)** | **Field App Dev** | **Mobile PWA, offline flow, sync** |
| **10** | **[API Reference & Backend Architecture](./10_API_Reference_and_Backend_Architecture.md)** | **Backend** | **Full API spec, Prisma schema, crypto impl** |
| 11 | [Design System](./11_Design_System.md) | Frontend | Colors, typography, components |
| 12 | [Testing Strategy](./12_Testing_Strategy.md) | QA/All | Unit, integration, e2e, security tests |
| 13 | [Demo Script](./13_Demo_Script.md) | Lead | 5-minute demo walkthrough |

---

## 🗺️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAPANSETU ECOSYSTEM                           │
├──────────────────┬──────────────────┬───────────────────────────┤
│   WEB APP        │   FIELD PWA      │   PUBLIC VERIFIER          │
│   (React/Vite)   │   (React/PWA)    │   (Embedded in Web App)   │
│                  │                  │                            │
│  • Business      │  • LMO Login     │  • Scan QR Code           │
│    Dashboard     │  • Inspection    │  • See Certificate        │
│  • Admin Panel   │    Form (Offline)│  • Validity Check         │
│  • Officer View  │  • Photo Capture │                           │
│  • Cert Viewer   │  • GPS Capture   │                           │
│  • Passport View │  • Auto Sync     │                           │
└────────┬─────────┴────────┬─────────┴──────────────────────────┘
         │                  │
         └────────┬─────────┘
                  │ REST API (JWT)
         ┌────────▼─────────────────────────┐
         │   BACKEND (Node.js/TypeScript)   │
         │   Express + Prisma ORM           │
         │                                  │
         │  Modules:                        │
         │  Auth | User | Business          │
         │  Instrument | Application        │
         │  Inspection | Certificate        │
         │  Notification | Audit            │
         └───────┬──────────────────┬───────┘
                 │                  │
        ┌────────▼──────┐  ┌───────▼───────┐
        │  PostgreSQL   │  │     MinIO     │
        │  (All Data)   │  │  (Photos &   │
        │               │  │   Evidence)  │
        └───────────────┘  └───────────────┘
```

---

## 🔄 The Core Demo Flow

```
Sharma General Store (BUSINESS role)
    │
    ├─ 1. Registers account
    ├─ 2. Registers instrument: WM-UP-GKP-00123
    └─ 3. Submits verification application

                   Admin
                    │
                    └─ 4. Assigns LMO to application

Legal Metrology Officer (LMO role)
    │
    ├─ 5. Opens field app (PWA)
    ├─ 6. Views assigned application
    ├─ 7. Goes offline (to the shop)
    ├─ 8. Enters 5 standard weight readings
    ├─ 9. Takes 4 photos (machine, serial, display, seal)
    ├─ 10. Marks GPS location
    ├─ 11. Selects PASS
    └─ 12. App syncs when online
            │
            └─ Backend generates:
                    │
                    ├─ Certificate: LM-UP-2026-00123
                    ├─ RSA Digital Signature
                    ├─ QR Code
                    └─ Passport Log Entry

Public / Consumer
    │
    └─ 13. Scans QR Code → sees "✅ CERTIFICATE VALID"

Business (Sharma General Store)
    │
    └─ 14. Views Digital Instrument Passport:
                WM-UP-GKP-00123
                │
                ├─ 2025: ✓ Registered
                ├─ 2025: ✓ Verified
                ├─ 2025: ✓ Certificate Issued
                ├─ 2026: ✓ Re-verification
                ├─ 2026: ✓ Certificate Issued
                └─ 2027: ⚠ Expiring Soon
```

---

## 👥 Team Role Assignment

| Role | Docs to Read | Deliverables |
|---|---|---|
| **Lead/Integrator** | All docs | PR reviews, deployment, demo |
| **Frontend Dev** | 04, 05, 08, 11 | Web app (React) |
| **Field App Dev** | 04, 05, 09, 11 | PWA (React + Workbox) |
| **Backend Dev** | 02, 06, 07, 10 | API (Node.js + Prisma) |
| **DB Admin** | 06, 10 | PostgreSQL migrations |

---

## ⚡ Quick Start

```bash
# Clone and install
git clone <repo>
cd mapansetu
npm install

# Start API
cd services/api
cp .env.example .env  # Fill in DB details
npx prisma migrate dev
npm run dev

# Start Web App
cd apps/web
npm run dev

# Start Field App
cd apps/field-app
npm run dev
```
