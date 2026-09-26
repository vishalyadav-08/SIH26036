# MapanSetu — One Nation One Process
# Unified Legal Metrology Platform: Feature Implementation Report

> **Based on:** UP Legal Metrology Portal (legalmetrology-up.gov.in) analysis,  
> Legal Metrology Act 2009 & Rules, Multi-State Portal Comparison,  
> and Existing MapanSetu Architecture Analysis

---

## 1. Executive Summary

India's Legal Metrology ecosystem is fragmented across **28 states and 8 Union Territories**, each running independent portals with different technologies, workflows, and user experiences. The UP portal (e-TULA) represents one of the more mature state implementations with features like Nivesh Mitra integration, DigiLocker support, and EoDB reforms.

**MapanSetu** already has a strong architectural foundation covering instrument registration, verification workflows, field inspections, certificate issuance, and public verification. This report identifies **gaps** between the current MapanSetu system and the comprehensive feature set observed across UP's e-TULA platform and other state portals, and proposes a "One Nation One Process" implementation roadmap.

### Goal: What Makes MapanSetu Different
Unlike state portals that serve only one state, MapanSetu will be a **unified national platform** that:
1. Standardizes all registration, verification, and compliance processes across India
2. Eliminates the need for businesses operating in multiple states to navigate different systems
3. Provides a single source of truth for all legal metrology records nationwide
4. Enables cross-state license recognition and verification

---

## 2. Gap Analysis: What UP's e-TULA Has vs MapanSetu Current State

### ✅ Already in MapanSetu (Core Strengths)
| Feature | MapanSetu Status |
|---|---|
| Instrument Registration & Passport | ✅ Fully implemented |
| Verification Application Workflow | ✅ Full state machine |
| Officer Assignment & Scheduling | ✅ Implemented |
| Field Inspection with Evidence | ✅ GPS, photos, measurements |
| Certificate Issuance (Digital) | ✅ RSA-signed, QR codes |
| Public QR Verification | ✅ Unauthenticated lookup |
| Offline Sync (Mobile App) | ✅ Flutter app with Hive |
| Audit Trail (Tamper-Evident) | ✅ SHA-256 hash chain |
| Role-Based Access Control | ✅ ADMIN, LMO, GATC, BUSINESS |
| AI Advisory Assistant | ✅ FastAPI microservice |
| Dashboard & Analytics | ✅ Admin dashboard |

### ❌ Missing in MapanSetu (Found in UP's e-TULA)
| Feature | Priority | Status |
|---|---|---|
| **Business Registration with Licensing** | 🔴 Critical | Missing |
| **Multi-Category License Management** (Manufacturer/Dealer/Repairer) | 🔴 Critical | Missing |
| **Pre-Packaged Commodity Registration** (Rule 27) | 🔴 Critical | Missing |
| **License Renewal & Multi-Year Licensing** | 🔴 Critical | Missing |
| **Fee Structure & Online Payment** | 🔴 Critical | Missing |
| **Periodical Returns Submission** | 🟡 High | Missing |
| **Multi-Tier Jurisdiction Model** (State→Division→District) | 🟡 High | Missing |
| **Complaint-Based Inspection Module** | 🟡 High | Missing |
| **Tank Lorry / Storage Tank Calibration** | 🟡 High | Missing |
| **Company Director Nomination (S.49)** | 🟡 High | Missing |
| **Enforcement & Compounding Module** | 🟡 High | Missing |
| **Seal/Hologram Management** | 🟠 Medium | Missing |
| **Working Standards Traceability** | 🟠 Medium | Missing |
| **Model Approval Registry** | 🟠 Medium | Missing |
| **Integration: DigiLocker** | 🟡 High | Missing |
| **Integration: Nivesh Mitra / NSWS** | 🟠 Medium | Missing |
| **Integration: E-District** | 🟠 Medium | Missing |
| **Integration: Treasury/Payment Gateway** | 🔴 Critical | Missing |
| **Consumer Grievance / Complaint Portal** | 🟡 High | Missing |
| **FPS Star Trader Rating System** | 🟢 Low | Missing |
| **Multi-Language Support (Hindi/Regional)** | 🟡 High | Partial (design spec) |
| **RTI / Citizen Charter Module** | 🟢 Low | Missing |
| **KPI Dashboard (Departmental)** | 🟠 Medium | Partial |
| **Notice Board / Circulars Module** | 🟢 Low | Missing |

---

## 3. Proposed New Features — "One Nation One Process"

### 3.1 🔴 License Management Module (CRITICAL)

**Current gap:** MapanSetu handles instrument verification but has NO licensing system. UP's portal manages 3 license types with full lifecycle.

#### New Module: `backend/licensing/`

**Entities:**
```
LicenseCategory (MANUFACTURER | DEALER | REPAIRER | PACKER_IMPORTER)
LicenseApplication
  - id (UUID)
  - application_number (unique, auto-generated)
  - business (FK → Business)
  - submitted_by (FK → User)
  - category (LicenseCategory)
  - license_type (NEW | RENEWAL | AMENDMENT | DUPLICATE)
  - validity_years (1-10)
  - state (DRAFT → SUBMITTED → UNDER_REVIEW → INSPECTION_SCHEDULED → APPROVED → REJECTED)
  - documents[] (FK → LicenseDocument)
  - fees_paid (decimal)
  - payment_reference
  - reviewing_officer (FK → User)
  - inspection_report
  - approval_date
  - rejection_reason
  - created_at, updated_at

License
  - id (UUID)
  - license_number (unique, formatted: UP/LM/MFG/2026/00001)
  - business (FK → Business)
  - category (LicenseCategory)
  - application (FK → LicenseApplication)
  - issued_date
  - valid_from
  - valid_until
  - status (ACTIVE | EXPIRED | SUSPENDED | CANCELLED | RENEWAL_PENDING)
  - digital_signature
  - qr_code_url
  - conditions[]
  - created_at, updated_at

LicenseDocument
  - id (UUID)
  - application (FK → LicenseApplication)
  - document_type (PREMISES_PROOF | IDENTITY | GST | MODEL_APPROVAL | QUALIFICATION | etc.)
  - file_key
  - original_name
  - verified_by (FK → User, nullable)
  - verification_status (PENDING | VERIFIED | REJECTED)
```

**Registration Flow for Each Business Type:**

#### A. Manufacturer Registration Flow
```
1. Business creates account on MapanSetu
2. Fills Form LM-1 online:
   - Business details (legal name, trade name, GST, PAN)
   - Factory premises details + site map upload
   - Manufacturing machinery list
   - Technical staff details
   - Model Approval Certificate number (validated against central registry)
3. Uploads required documents (10 document types)
4. System validates document completeness
5. Online fee payment (₹500 + state-specific charges)
6. Application auto-assigned to Controller office
7. Officer reviews documents (Single Query Policy)
8. Physical premises inspection scheduled (if required)
9. Inspection conducted, report uploaded within 48 hours
10. Approval → License LM-2 generated with digital signature + QR
11. License available on DigiLocker
12. Renewal reminder auto-sent before expiry
```

#### B. Dealer Registration Flow
```
1. Business creates account
2. Fills Form LD-1:
   - Business details
   - Shop/establishment details
   - Dealership agreement / manufacturer authorization
3. Uploads documents (6 types)
4. Fee payment (₹100)
5. Auto-assigned to ACLM
6. Review + optional inspection
7. Approval → License LD-2 issued
8. Annual renewal via Form LD-3
```

#### C. Repairer Registration Flow
```
1. Business creates account
2. Fills Form LR-1:
   - Business details
   - Workshop specifications
   - Technical qualifications / certifications
   - Repair equipment inventory
3. Uploads documents (5 types)
4. Fee payment (₹100)
5. Auto-assigned to ACLM
6. Review + mandatory workshop inspection
7. Approval → License LR-2 issued
```

#### D. Pre-Packaged Commodity Registration (Rule 27)
```
1. Manufacturer/Packer/Importer creates account
2. Fills PC Registration form:
   - Business details
   - List of commodities with packaging sizes
   - Sample label images
   - IEC code (for importers)
3. Uploads documents
4. Fee payment (₹500-₹5,000)
5. Review for label compliance
6. Registration certificate issued
7. Periodic compliance audits
```

---

### 3.2 🔴 Payment & Fee Management Module

#### New Module: `backend/payments/`

```
FeeSchedule
  - id
  - state_code (or NATIONAL)
  - service_type (MANUFACTURER_LICENSE | DEALER_LICENSE | VERIFICATION | etc.)
  - instrument_category (for verification fees)
  - base_fee
  - late_surcharge_percent
  - effective_from
  - effective_until
  - created_by

PaymentTransaction
  - id (UUID)
  - transaction_reference (unique)
  - payer_business (FK → Business)
  - payer_user (FK → User)
  - service_type
  - amount
  - gateway (RAZORPAY | PAYTM | UPI | BHARATKOSH | STATE_TREASURY)
  - gateway_reference
  - status (INITIATED → PROCESSING → SUCCESS → FAILED → REFUNDED)
  - receipt_url
  - created_at
```

**Integrations:**
- Razorpay / PayU for online payments
- UPI direct integration
- State Treasury (e-GRAS / Koshwani / IFMS) for government revenue
- BharatKosh for central fees
- Auto-challan generation

---

### 3.3 🟡 Periodical Returns Module

#### New Module: `backend/returns/`

**Purpose:** Licensed businesses must file periodic compliance reports.

```
PeriodicalReturn
  - id (UUID)
  - return_number (unique)
  - business (FK → Business)
  - license (FK → License)
  - return_period (ANNUAL | HALF_YEARLY | QUARTERLY)
  - period_start, period_end
  - submitted_by (FK → User)
  - submitted_at
  - status (DRAFT → SUBMITTED → REVIEWED → ACCEPTED → REJECTED)
  - reviewed_by (FK → User)
  - data (JSON - instruments dealt/manufactured/repaired during period)
  - remarks
```

**Filing Requirements by Role:**
- **Dealer:** List of instruments bought/sold during period
- **Manufacturer:** List of instruments manufactured with model approval numbers
- **Repairer:** List of instruments repaired with serial numbers
- **Officer:** Summary of verifications and inspections conducted

---

### 3.4 🟡 Multi-Tier Jurisdiction Model

**Enhance:** `backend/authentication/` + New `backend/jurisdiction/`

```
State
  - id, code, name, official_language

Division
  - id, state (FK), name, code

District
  - id, division (FK), name, code

JurisdictionAssignment
  - id
  - officer (FK → User)
  - jurisdiction_type (STATE | DIVISION | DISTRICT)
  - jurisdiction_id
  - role_in_jurisdiction (CONTROLLER | JOINT_CONTROLLER | DEPUTY_CONTROLLER | ACLM | SLMO | LMO)
  - active_from, active_until
```

**Impact:** License applications auto-route to correct jurisdiction officer. Verification requests assigned to nearest LMO. Enforcement statistics aggregated by division/district.

---

### 3.5 🟡 Complaint-Based Inspection Module

#### New Module: `backend/complaints/`

```
ConsumerComplaint
  - id (UUID)
  - complaint_number (unique, auto-generated)
  - complainant_name, phone, email (can be anonymous)
  - complaint_type (SHORT_DELIVERY | UNVERIFIED_INSTRUMENT | WRONG_PRICING | 
                     TAMPERING | NON_STANDARD_WEIGHT | MRP_VIOLATION | OTHER)
  - target_business_name
  - target_address
  - district (FK → District)
  - description
  - evidence_attachments[]
  - status (RECEIVED → ASSIGNED → INVESTIGATION → ACTION_TAKEN → CLOSED)
  - assigned_officer (FK → User)
  - investigation_report
  - action_taken (COMPOUNDED | PROSECUTED | WARNING | NO_VIOLATION_FOUND)
  - compounding_fee
  - resolution_date
  - citizen_feedback_rating (1-5)
  - created_at
```

**Integrations:**
- IGRS / Jansunwai portal API
- National Consumer Helpline (1915 / NCH)
- CM Helpline (1076) backend

---

### 3.6 🟡 Enforcement & Compounding Module

#### New Module: `backend/enforcement/`

```
InspectionRaid
  - id (UUID)
  - raid_number
  - type (ROUTINE | COMPLAINT_BASED | SEASONAL_DRIVE | SPECIAL_DRIVE)
  - target_business (FK → Business, nullable)
  - target_address
  - district (FK → District)
  - conducting_officers[] (M2M → User)
  - conducted_at
  - findings_summary
  - violations_found[]
  - seizure_details
  - status (COMPLETED | COMPOUNDED | PROSECUTION_FILED)

Violation
  - id
  - raid (FK → InspectionRaid)
  - section_violated (e.g., "Section 25", "Section 36")
  - violation_description
  - compoundable (bool)

CompoundingOrder
  - id
  - violation (FK → Violation)
  - compound_fee
  - payment_status (PENDING → PAID)
  - order_date
  - compounding_officer (FK → User)

ProsecutionCase
  - id
  - violation (FK → Violation)
  - fir_number
  - court_name
  - case_status (FILED → HEARING → DISPOSED)
  - outcome
```

---

### 3.7 🟠 Working Standards & Seal Management

#### New Module: `backend/standards/`

```
WorkingStandard
  - id (UUID)
  - standard_number (unique)
  - type (TEST_WEIGHT_SET | VOLUMETRIC_MEASURE | PROVING_TANK | etc.)
  - assigned_to (FK → User - LMO)
  - calibration_date
  - calibration_valid_until
  - calibrated_by_lab
  - calibration_certificate_key
  - status (ACTIVE | EXPIRED | UNDER_CALIBRATION)

VerificationSeal
  - id
  - seal_serial_number (unique)
  - seal_type (LEAD_SEAL | TAMPER_STICKER | HOLOGRAM | DATE_PUNCH)
  - batch_number
  - issued_to_officer (FK → User)
  - issued_date
  - status (AVAILABLE | USED | LOST | DAMAGED)
  - used_on_instrument (FK → Instrument, nullable)
  - used_on_date
```

**Business Rule:** An inspection cannot be finalized unless the officer's working standards have a valid (non-expired) calibration certificate.

---

### 3.8 🟡 Integration Layer

#### New Module: `backend/integrations/`

| Integration | Purpose | Priority |
|---|---|---|
| **DigiLocker** | Push/pull licenses & certificates | High |
| **Aadhaar eKYC / eSign** | Identity verification, digital signing | High |
| **GSTN API** | Validate GST number, business details | High |
| **MCA21 / Udyam** | Validate company registration | Medium |
| **NSWS (National Single Window)** | Cross-department approvals | Medium |
| **BharatKosh / State Treasury** | Government fee collection | Critical |
| **VAHAN / Parivahan** | Vehicle details for tanker calibration | Medium |
| **NCH (1915) / IGRS** | Consumer complaint inflow | High |
| **eMaap Portal** | Central LM data exchange | High |

---

## 4. Enhanced User Roles for "One Nation One Process"

### Current Roles (Keep)
- `ADMIN` → Supervisor
- `LMO` → Legal Metrology Officer
- `GATC` → Government Approved Test Centre
- `BUSINESS` → Business User

### New Roles to Add
| Role | Description | Jurisdiction |
|---|---|---|
| `CONTROLLER` | State Controller of Legal Metrology | State-wide |
| `JOINT_CONTROLLER` | Joint/Additional Controller | Zonal |
| `DEPUTY_CONTROLLER` | Deputy Controller | Regional/Division |
| `ACLM` | Assistant Controller | Division/District |
| `SLMO` | Senior Legal Metrology Officer | Supervisory Field |
| `CENTRAL_ADMIN` | Director of Legal Metrology (Central) | National |
| `CSC_OPERATOR` | Common Service Centre Operator | District |
| `CONSUMER` | Public citizen for complaints/verification | Public |

---

## 5. Frontend Enhancements Required

### New Routes to Add

| Audience | Routes | Purpose |
|---|---|---|
| Business | `/app/licenses` | License management dashboard |
| Business | `/app/licenses/apply/:category` | License application form |
| Business | `/app/licenses/:id` | License details & renewal |
| Business | `/app/returns` | Periodical returns |
| Business | `/app/returns/submit` | File new return |
| Business | `/app/payments` | Payment history & receipts |
| Admin | `/admin/licenses` | License review queue |
| Admin | `/admin/enforcement` | Enforcement & raids |
| Admin | `/admin/complaints` | Complaint management |
| Admin | `/admin/returns` | Returns review |
| Admin | `/admin/jurisdiction` | Jurisdiction management |
| Admin | `/admin/standards` | Working standards tracking |
| Admin | `/admin/seals` | Seal/hologram inventory |
| Admin | `/admin/kpi` | Departmental KPIs |
| Public | `/complaints/new` | File a consumer complaint |
| Public | `/complaints/:id` | Track complaint status |
| Public | `/license/verify/:licenseNo` | Public license verification |
| Public | `/knowledge` | Acts, Rules, FAQs, Citizen Charter |

---

## 6. Database Schema Changes Summary

### New Tables Required
1. `licensing_licensecategory`
2. `licensing_licenseapplication`
3. `licensing_license`
4. `licensing_licensedocument`
5. `payments_feeschedule`
6. `payments_paymenttransaction`
7. `returns_periodicalreturn`
8. `jurisdiction_state`
9. `jurisdiction_division`
10. `jurisdiction_district`
11. `jurisdiction_jurisdictionassignment`
12. `complaints_consumercomplaint`
13. `enforcement_inspectionraid`
14. `enforcement_violation`
15. `enforcement_compoundingorder`
16. `enforcement_prosecutioncase`
17. `standards_workingstandard`
18. `standards_verificationseal`

### Modified Tables
1. `authentication_user` — Add new roles, jurisdiction FK
2. `businesses_business` — Add license references, GST validation
3. `instruments_instrument` — Add seal references, model approval link

---

## 7. Implementation Roadmap

### Phase 1: License Management & Payments (4 weeks)
- [ ] License Application Module (Manufacturer, Dealer, Repairer)
- [ ] License lifecycle (New, Renewal, Amendment, Suspension, Cancellation)
- [ ] Document upload & verification workflow
- [ ] Fee schedule management
- [ ] Payment gateway integration (Razorpay)
- [ ] License PDF generation with digital signature
- [ ] Public license verification endpoint
- [ ] Business registration flow aligned with LM Act rules

### Phase 2: Jurisdiction & Multi-State Support (2 weeks)
- [ ] State/Division/District data model
- [ ] Jurisdiction-based auto-routing of applications
- [ ] Hierarchical officer roles
- [ ] Multi-state fee schedule support
- [ ] State-specific rule configuration

### Phase 3: Compliance & Returns (2 weeks)
- [ ] Periodical Returns module
- [ ] Pre-Packaged Commodity Registration (Rule 27)
- [ ] Company Director Nomination (Section 49)
- [ ] Compliance calendar with auto-reminders

### Phase 4: Enforcement & Consumer Protection (3 weeks)
- [ ] Consumer Complaint Portal
- [ ] Complaint-Based Inspection workflows
- [ ] Enforcement Raid tracking
- [ ] Compounding & Prosecution management
- [ ] Integration with NCH/IGRS

### Phase 5: Standards & Seal Management (2 weeks)
- [ ] Working Standards registry
- [ ] Calibration tracking & expiry alerts
- [ ] Verification seal/hologram inventory
- [ ] Seal assignment & usage tracking

### Phase 6: National Integrations (3 weeks)
- [ ] DigiLocker push/pull
- [ ] GSTN validation
- [ ] Aadhaar eKYC / eSign
- [ ] eMaap portal data exchange
- [ ] State treasury integration
- [ ] NSWS integration

---

## 8. What Makes MapanSetu Different from State Portals

| Aspect | State Portals (e.g., UP e-TULA) | MapanSetu (One Nation One Process) |
|---|---|---|
| **Scope** | Single state only | All 36 states & UTs |
| **Technology** | Legacy PHP, fragmented | Modern Django + Next.js + Flutter |
| **Business Registration** | Navigate different sites per state | Single registration, works nationwide |
| **License Portability** | Not recognized across states | Cross-state license verification |
| **Verification** | State-specific certificates | Nationally verifiable, QR-coded |
| **Offline Support** | None | Full offline inspection app |
| **Cryptographic Integrity** | Basic | RSA-PSS signed, hash-chain audit |
| **AI Assistance** | None | Built-in advisory assistant |
| **Public Verification** | State-level only | National certificate lookup |
| **Instrument Passport** | Not available | Full lifecycle history |
| **Mobile App** | None (most states) | Native Flutter field app |
| **API-First** | No APIs | Full REST API with OpenAPI docs |
| **Multi-Language** | Hindi + English only | Extensible to all 22 scheduled languages |
| **Accessibility** | WCAG non-compliant | WCAG 2.1 AA + GIGW 3.0 |
| **Data Analytics** | Basic MIS reports | Real-time dashboards + KPI tracking |
| **Compliance Automation** | Manual follow-up | Auto-reminders, escalation rules |
