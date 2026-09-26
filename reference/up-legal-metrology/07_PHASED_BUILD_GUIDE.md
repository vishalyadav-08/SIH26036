# MapanSetu — Phased Build Guide
# "One Nation One Process" — Implementation Phases

> **Purpose:** Step-by-step build guide with deliverables, data sources, file locations,  
> models, APIs, frontend pages, and acceptance criteria for each phase.  
> **Total Estimated Duration:** 16 weeks across 6 phases  
> **Prerequisite:** Existing MapanSetu codebase is functional (instruments, verification, certificates, inspections)

---

## Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      PHASE DEPENDENCY FLOW                                  │
│                                                                              │
│   Phase 1 ────► Phase 2 ────► Phase 3 ────► Phase 4 ────► Phase 5 ────► P6 │
│   License &     Jurisdiction   Compliance    Enforcement   Standards    Nat. │
│   Payments      & Multi-State  & Returns     & Consumer    & Seals     Intg │
│   (4 weeks)     (2 weeks)      (2 weeks)     (3 weeks)     (2 weeks)  (3wk)│
│                                                                              │
│   🔴 CRITICAL   🟡 HIGH        🟡 HIGH       🟡 HIGH       🟠 MEDIUM  🟡HIGH│
│   Foundation    Enables        Depends on    Depends on    Depends on  All  │
│   for all       routing &      licensing     jurisdiction  inspections deps │
│                 auto-assign                                              ok  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

---

# PHASE 1: License Management & Payment System
**Duration:** 4 weeks | **Priority:** 🔴 CRITICAL — Foundation for everything else

## Why This Phase First
The UP Legal Metrology portal (e-TULA) and every state portal revolve around **licensing**. Without a licensing system, MapanSetu only handles verification — which is just one part of the Legal Metrology lifecycle. A business must first obtain a license before it can even own instruments that need verification.

---

## Phase 1A: License Management Module (Week 1-2)

### Backend — New Django App: `backend/licensing/`

#### Files to Create

| File | Content |
|---|---|
| `backend/licensing/__init__.py` | App init |
| `backend/licensing/apps.py` | Django app config |
| `backend/licensing/models.py` | LicenseApplication, License, LicenseDocument models |
| `backend/licensing/serializers.py` | DRF serializers for all license entities |
| `backend/licensing/services.py` | License state machine, auto-numbering, renewal logic |
| `backend/licensing/views.py` | ViewSets for CRUD + state transitions |
| `backend/licensing/urls.py` | URL routing |
| `backend/licensing/admin.py` | Django admin registration |
| `backend/licensing/permissions.py` | Role-based access rules |
| `backend/licensing/signals.py` | Auto-notification on state changes |
| `backend/licensing/tests/` | Unit + integration tests |

#### Data Models

```python
# backend/licensing/models.py

class LicenseCategory(models.TextChoices):
    MANUFACTURER = "MANUFACTURER"    # Form LM-1 — Section 23
    DEALER = "DEALER"                # Form LD-1 — Section 23
    REPAIRER = "REPAIRER"            # Form LR-1 — Section 23
    PACKER_IMPORTER = "PACKER_IMPORTER"  # Rule 27 — PC Rules 2011

class LicenseType(models.TextChoices):
    NEW = "NEW"
    RENEWAL = "RENEWAL"
    AMENDMENT = "AMENDMENT"
    DUPLICATE = "DUPLICATE"

class LicenseAppState(models.TextChoices):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    QUERY_RAISED = "QUERY_RAISED"
    INSPECTION_SCHEDULED = "INSPECTION_SCHEDULED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class LicenseApplication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    application_number = models.CharField(max_length=30, unique=True)
    business = models.ForeignKey("businesses.Business", on_delete=models.PROTECT)
    submitted_by = models.ForeignKey("authentication.User", on_delete=models.PROTECT)
    category = models.CharField(max_length=20, choices=LicenseCategory.choices)
    license_type = models.CharField(max_length=15, choices=LicenseType.choices)
    validity_years = models.PositiveSmallIntegerField(default=1)  # 1–10 years
    state = models.CharField(max_length=25, choices=LicenseAppState.choices, default="DRAFT")
    
    # Review workflow
    reviewing_officer = models.ForeignKey("authentication.User", null=True, related_name="reviews")
    query_details = models.TextField(blank=True)
    query_response = models.TextField(blank=True)
    inspection_date = models.DateTimeField(null=True)
    inspection_report = models.TextField(blank=True)
    
    # Decision
    approval_date = models.DateField(null=True)
    rejection_reason = models.TextField(blank=True)
    
    # Payment link
    payment = models.ForeignKey("payments.PaymentTransaction", null=True)
    
    # Metadata
    premises_address = models.TextField()
    premises_proof_type = models.CharField(max_length=30)  # OWNED/LEASED/RENTED
    gst_number = models.CharField(max_length=15, blank=True)
    pan_number = models.CharField(max_length=10, blank=True)
    
    # Manufacturer-specific
    model_approval_number = models.CharField(max_length=50, blank=True)
    machinery_list = models.JSONField(default=list, blank=True)
    technical_staff_count = models.PositiveIntegerField(default=0)
    
    # Repairer-specific
    qualification_details = models.TextField(blank=True)
    equipment_list = models.JSONField(default=list, blank=True)
    
    # Dealer-specific
    dealership_authorization = models.CharField(max_length=200, blank=True)
    
    # Packer/Importer-specific
    commodity_list = models.JSONField(default=list, blank=True)
    iec_code = models.CharField(max_length=15, blank=True)
    sample_labels = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class License(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    license_number = models.CharField(max_length=30, unique=True)
    business = models.ForeignKey("businesses.Business", on_delete=models.PROTECT)
    application = models.OneToOneField(LicenseApplication, on_delete=models.PROTECT)
    category = models.CharField(max_length=20, choices=LicenseCategory.choices)
    issued_date = models.DateField()
    valid_from = models.DateField()
    valid_until = models.DateField()
    status = models.CharField(max_length=20)  # ACTIVE/EXPIRED/SUSPENDED/CANCELLED/RENEWAL_PENDING
    conditions = models.JSONField(default=list)
    digital_signature = models.TextField(blank=True)
    payload_hash = models.CharField(max_length=64, blank=True)
    qr_verification_url = models.URLField(blank=True)
    pdf_object_key = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class DocumentType(models.TextChoices):
    PREMISES_PROOF = "PREMISES_PROOF"
    IDENTITY_PAN = "IDENTITY_PAN"
    IDENTITY_AADHAAR = "IDENTITY_AADHAAR"
    GST_CERTIFICATE = "GST_CERTIFICATE"
    INCORPORATION_CERT = "INCORPORATION_CERT"
    PARTNERSHIP_DEED = "PARTNERSHIP_DEED"
    MODEL_APPROVAL = "MODEL_APPROVAL"
    QUALIFICATION_CERT = "QUALIFICATION_CERT"
    EQUIPMENT_LIST = "EQUIPMENT_LIST"
    FACTORY_LICENSE = "FACTORY_LICENSE"
    TRADE_LICENSE = "TRADE_LICENSE"
    DEALERSHIP_AUTH = "DEALERSHIP_AUTH"
    IEC_CERTIFICATE = "IEC_CERTIFICATE"
    AFFIDAVIT = "AFFIDAVIT"
    SITE_MAP = "SITE_MAP"
    SAMPLE_LABEL = "SAMPLE_LABEL"
    OTHER = "OTHER"

class LicenseDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    application = models.ForeignKey(LicenseApplication, related_name="documents")
    document_type = models.CharField(max_length=25, choices=DocumentType.choices)
    object_key = models.CharField(max_length=200, unique=True)
    original_file_name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    size_bytes = models.PositiveIntegerField()
    sha256 = models.CharField(max_length=64)
    verified_by = models.ForeignKey("authentication.User", null=True)
    verification_status = models.CharField(max_length=15, default="PENDING")
    verification_note = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
```

#### State Machine (License Application)

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → (License Issued)
                  ↘ QUERY_RAISED → UNDER_REVIEW
                  ↘ INSPECTION_SCHEDULED → UNDER_REVIEW
                  ↘ REJECTED
                  ↘ CANCELLED
```

#### API Endpoints to Build

```
POST   /api/v1/licenses/applications/              — Create new license application
GET    /api/v1/licenses/applications/              — List (filtered by state/category/business)
GET    /api/v1/licenses/applications/{id}/         — Detail view
PATCH  /api/v1/licenses/applications/{id}/         — Update draft
POST   /api/v1/licenses/applications/{id}/submit/  — DRAFT → SUBMITTED
POST   /api/v1/licenses/applications/{id}/review/  — SUBMITTED → UNDER_REVIEW (assign reviewer)
POST   /api/v1/licenses/applications/{id}/query/   — Raise query (Single Query Policy)
POST   /api/v1/licenses/applications/{id}/respond/ — Business responds to query
POST   /api/v1/licenses/applications/{id}/schedule-inspection/ — Schedule premises inspection
POST   /api/v1/licenses/applications/{id}/approve/ — UNDER_REVIEW → APPROVED (issues license)
POST   /api/v1/licenses/applications/{id}/reject/  — UNDER_REVIEW → REJECTED
POST   /api/v1/licenses/applications/{id}/cancel/  — Cancel application

POST   /api/v1/licenses/applications/{id}/documents/  — Upload document
GET    /api/v1/licenses/applications/{id}/documents/   — List documents

GET    /api/v1/licenses/                           — List issued licenses
GET    /api/v1/licenses/{id}/                      — License detail
POST   /api/v1/licenses/{id}/suspend/              — Suspend license
POST   /api/v1/licenses/{id}/cancel/               — Cancel license
GET    /api/v1/licenses/verify?licenseNo={no}      — Public license verification (unauthenticated)
GET    /api/v1/licenses/{id}/download/              — Download license PDF
```

#### Data Sources for Building

| What | Source | Location |
|---|---|---|
| License categories & forms | Legal Metrology Act 2009, Section 23 | [02_act_rules_regulations.md](./02_act_rules_regulations.md) |
| Document requirements per category | UP LM Enforcement Rules 2011, Rule 11 | [03_services_registration_flows.md](./03_services_registration_flows.md) |
| Fee structure | UP Schedule IV | [03_services_registration_flows.md](./03_services_registration_flows.md) § Fee Structure |
| SLA timelines | UP EoDB reforms | [03_services_registration_flows.md](./03_services_registration_flows.md) § EoDB SLA Matrix |
| License number format | UP portal conventions | e.g. `UP/LM/MFG/2026/00001` |
| Existing serializer patterns | MapanSetu codebase | `backend/applications/serializers.py` |
| Existing state machine pattern | MapanSetu codebase | `backend/applications/services.py` |
| Certificate signing pattern | MapanSetu codebase | `backend/certificates/services.py` |

### Frontend — License Management Pages (Week 2)

#### Files to Create

| File | Content |
|---|---|
| `frontend/src/app/app/licenses/page.tsx` | License dashboard (list licenses + status) |
| `frontend/src/app/app/licenses/apply/page.tsx` | Category selection → application form |
| `frontend/src/app/app/licenses/apply/[category]/page.tsx` | Dynamic form per category |
| `frontend/src/app/app/licenses/[id]/page.tsx` | License detail & renewal action |
| `frontend/src/app/admin/licenses/page.tsx` | Admin license review queue |
| `frontend/src/app/admin/licenses/[id]/page.tsx` | Admin review: approve/reject/query |
| `frontend/src/app/license/verify/[licenseNo]/page.tsx` | Public license verification |
| `frontend/src/services/licensing.ts` | API client for licensing endpoints |
| `frontend/src/schemas/licensing.ts` | Zod validation schemas for forms |
| `frontend/src/hooks/useLicenses.ts` | TanStack Query hooks |
| `frontend/src/types/licensing.ts` | TypeScript types |

#### Form Fields per Category

**Manufacturer (LM-1):**
- Business name, trade name, GST, PAN
- Factory address + site map upload
- Manufacturing machinery list (dynamic rows)
- Technical staff count & qualifications
- Model Approval Certificate number
- Factory License / Udyam Registration number
- NOC details
- 9 document uploads

**Dealer (LD-1):**
- Business name, trade name, GST, PAN
- Shop address + establishment registration
- Dealership authorization details
- 6 document uploads

**Repairer (LR-1):**
- Business name, trade name, GST, PAN
- Workshop address + specifications
- Technical qualifications (dropdown + upload)
- Equipment list (dynamic rows)
- 5 document uploads

**Packer/Importer (Rule 27):**
- Business name, trade name, GST, PAN
- Commodity list (name + packaging sizes — dynamic table)
- IEC code (importers only)
- Sample label images (multi-upload)
- 6 document uploads

### Acceptance Criteria — Phase 1A
- [ ] Business can apply for any of 4 license categories
- [ ] Category-specific form validates required fields & documents
- [ ] Documents upload to object storage with SHA-256 hash
- [ ] Application follows state machine: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED
- [ ] Single Query Policy: officer raises all deficiencies in one query
- [ ] On approval: License record created with unique number, digital signature, QR code, PDF
- [ ] Public can verify license by number without login
- [ ] Audit log entries for every state transition
- [ ] Notifications sent at each stage to business + officer

---

## Phase 1B: Payment & Fee System (Week 3-4)

### Backend — New Django App: `backend/payments/`

#### Files to Create

| File | Content |
|---|---|
| `backend/payments/__init__.py` | App init |
| `backend/payments/apps.py` | Django app config |
| `backend/payments/models.py` | FeeSchedule, PaymentTransaction |
| `backend/payments/serializers.py` | DRF serializers |
| `backend/payments/services.py` | Fee calculation, payment gateway integration |
| `backend/payments/views.py` | Payment initiation, callback, receipt |
| `backend/payments/urls.py` | URL routing |
| `backend/payments/gateway.py` | Razorpay/UPI gateway adapter (strategy pattern) |
| `backend/payments/tests/` | Tests |

#### Data Models

```python
# backend/payments/models.py

class ServiceType(models.TextChoices):
    MANUFACTURER_LICENSE_NEW = "MANUFACTURER_LICENSE_NEW"
    MANUFACTURER_LICENSE_RENEWAL = "MANUFACTURER_LICENSE_RENEWAL"
    DEALER_LICENSE_NEW = "DEALER_LICENSE_NEW"
    DEALER_LICENSE_RENEWAL = "DEALER_LICENSE_RENEWAL"
    REPAIRER_LICENSE_NEW = "REPAIRER_LICENSE_NEW"
    REPAIRER_LICENSE_RENEWAL = "REPAIRER_LICENSE_RENEWAL"
    PACKER_REGISTRATION = "PACKER_REGISTRATION"
    VERIFICATION_FEE = "VERIFICATION_FEE"
    DUPLICATE_LICENSE = "DUPLICATE_LICENSE"
    AMENDMENT_FEE = "AMENDMENT_FEE"
    COMPOUNDING_FEE = "COMPOUNDING_FEE"

class FeeSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    state_code = models.CharField(max_length=5, default="NAT")  # NAT = national default
    service_type = models.CharField(max_length=40, choices=ServiceType.choices)
    instrument_category = models.CharField(max_length=50, blank=True)
    base_fee = models.DecimalField(max_digits=10, decimal_places=2)
    per_year_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_surcharge_percent = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    gst_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    effective_from = models.DateField()
    effective_until = models.DateField(null=True)
    created_by = models.ForeignKey("authentication.User", on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

class PaymentTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    transaction_reference = models.CharField(max_length=50, unique=True)
    payer_business = models.ForeignKey("businesses.Business", on_delete=models.PROTECT)
    payer_user = models.ForeignKey("authentication.User", on_delete=models.PROTECT)
    service_type = models.CharField(max_length=40)
    related_entity_type = models.CharField(max_length=30)  # LICENSE_APPLICATION, VERIFICATION, etc.
    related_entity_id = models.UUIDField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    fee_breakdown = models.JSONField(default=dict)  # {base, surcharge, gst, total}
    gateway = models.CharField(max_length=20)  # RAZORPAY / UPI / DEMO
    gateway_order_id = models.CharField(max_length=100, blank=True)
    gateway_payment_id = models.CharField(max_length=100, blank=True)
    gateway_signature = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=15, default="INITIATED")
    receipt_url = models.URLField(blank=True)
    paid_at = models.DateTimeField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### API Endpoints

```
GET    /api/v1/payments/fees/                  — Fee schedule lookup (by service + state)
POST   /api/v1/payments/calculate/             — Calculate fee for given service
POST   /api/v1/payments/initiate/              — Create payment order (returns gateway URL)
POST   /api/v1/payments/callback/              — Payment gateway webhook
GET    /api/v1/payments/                        — Payment history for business
GET    /api/v1/payments/{id}/                   — Payment detail + receipt
GET    /api/v1/payments/{id}/receipt/           — Download payment receipt PDF
```

#### Data Sources

| What | Source | Location |
|---|---|---|
| License fees (Manufacturer ₹500, Dealer ₹100, Repairer ₹100) | UP Schedule IV | [03_services_registration_flows.md](./03_services_registration_flows.md) § Fee Structure |
| Verification fees by instrument type | UP Schedule IX | [03_services_registration_flows.md](./03_services_registration_flows.md) § Verification Fees |
| Late surcharge rules (100% within 3 months) | UP Enforcement Rules | [02_act_rules_regulations.md](./02_act_rules_regulations.md) |
| Packer registration fee (₹500 base) | PC Rules 2011, Rule 27 | [03_services_registration_flows.md](./03_services_registration_flows.md) |
| Razorpay integration docs | Razorpay API | https://razorpay.com/docs/api/ |

### Frontend — Payments

| File | Content |
|---|---|
| `frontend/src/app/app/payments/page.tsx` | Payment history & receipts |
| `frontend/src/app/app/payments/[id]/page.tsx` | Payment detail |
| `frontend/src/components/payments/PaymentButton.tsx` | Reusable payment initiation component |
| `frontend/src/components/payments/FeeBreakdown.tsx` | Fee summary display |
| `frontend/src/services/payments.ts` | API client |

### Seed Data for Phase 1

```
# seed_fees.py — Load initial fee schedule from UP data
# Populate FeeSchedule with UP Schedule IV + Schedule IX rates
# Mark as state_code="UP" and create a NAT national default copy
```

### Acceptance Criteria — Phase 1B
- [ ] Fee schedule configurable per state + national default
- [ ] Automatic fee calculation with surcharges for late applications
- [ ] Razorpay test mode payment flow end-to-end
- [ ] Payment receipt PDF generation
- [ ] License application blocks at SUBMITTED until payment is confirmed
- [ ] Payment history visible to business users
- [ ] Admin can view all payment transactions

---

---

# PHASE 2: Jurisdiction & Multi-State Support
**Duration:** 2 weeks | **Priority:** 🟡 HIGH — Enables routing & multi-state operation
**Depends on:** Phase 1

## Why This Phase
State portals like UP's e-TULA operate within a single state's hierarchy (Controller → ACLM → LMO). MapanSetu must model **all 36 states/UTs** with their divisional/district structures and route applications to the correct jurisdiction officer.

---

### Backend — New Django App: `backend/jurisdiction/`

#### Files to Create

| File | Content |
|---|---|
| `backend/jurisdiction/__init__.py` | App init |
| `backend/jurisdiction/apps.py` | Django app config |
| `backend/jurisdiction/models.py` | State, Division, District, JurisdictionAssignment |
| `backend/jurisdiction/serializers.py` | DRF serializers |
| `backend/jurisdiction/services.py` | Auto-routing logic, jurisdiction lookup |
| `backend/jurisdiction/views.py` | ViewSets |
| `backend/jurisdiction/urls.py` | URL routing |
| `backend/jurisdiction/management/commands/seed_jurisdictions.py` | Seed all states/districts |
| `backend/jurisdiction/tests/` | Tests |

#### Data Models

```python
class State(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    code = models.CharField(max_length=5, unique=True)  # "UP", "MH", "KL"
    name = models.CharField(max_length=100)
    name_local = models.CharField(max_length=200, blank=True)  # Hindi/regional name
    official_language = models.CharField(max_length=20, default="hi")
    controller_email = models.EmailField(blank=True)
    controller_phone = models.CharField(max_length=15, blank=True)
    is_active = models.BooleanField(default=True)

class Division(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    state = models.ForeignKey(State, related_name="divisions", on_delete=models.PROTECT)
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    name_local = models.CharField(max_length=200, blank=True)
    headquarters_city = models.CharField(max_length=100, blank=True)

class District(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    division = models.ForeignKey(Division, related_name="districts", on_delete=models.PROTECT)
    code = models.CharField(max_length=10, unique=True)  # Census code
    name = models.CharField(max_length=100)
    name_local = models.CharField(max_length=200, blank=True)
    pin_codes = models.JSONField(default=list)  # PIN codes in this district

class OfficerDesignation(models.TextChoices):
    CONTROLLER = "CONTROLLER"
    ADDITIONAL_CONTROLLER = "ADDITIONAL_CONTROLLER"
    JOINT_CONTROLLER = "JOINT_CONTROLLER"
    DEPUTY_CONTROLLER = "DEPUTY_CONTROLLER"
    ACLM = "ACLM"
    SLMO = "SLMO"
    LMO = "LMO"

class JurisdictionAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    officer = models.ForeignKey("authentication.User", related_name="jurisdictions")
    designation = models.CharField(max_length=30, choices=OfficerDesignation.choices)
    state = models.ForeignKey(State, null=True, on_delete=models.PROTECT)
    division = models.ForeignKey(Division, null=True, on_delete=models.PROTECT)
    district = models.ForeignKey(District, null=True, on_delete=models.PROTECT)
    is_primary = models.BooleanField(default=True)
    active_from = models.DateField()
    active_until = models.DateField(null=True)
```

#### Auto-Routing Logic

```python
# backend/jurisdiction/services.py

def route_license_application(application):
    """
    Route application to correct approving authority based on:
    1. Business premises district (from address/PIN code)
    2. License category:
       - MANUFACTURER → Controller (State level)
       - DEALER/REPAIRER → ACLM (Division/District level)
       - PACKER_IMPORTER → Controller or authorized officer
    """
    district = resolve_district(application.premises_address)
    
    if application.category == "MANUFACTURER":
        officer = find_controller(district.division.state)
    else:
        officer = find_aclm(district)
    
    return officer
```

#### API Endpoints

```
GET    /api/v1/jurisdiction/states/                — List all states
GET    /api/v1/jurisdiction/states/{code}/          — State detail with divisions
GET    /api/v1/jurisdiction/divisions/{id}/         — Division detail with districts
GET    /api/v1/jurisdiction/districts/{id}/         — District detail
GET    /api/v1/jurisdiction/officers/               — Officers by jurisdiction
POST   /api/v1/jurisdiction/assignments/            — Assign officer to jurisdiction (admin)
GET    /api/v1/jurisdiction/resolve?pincode={pin}   — Resolve PIN code → State/Division/District
```

#### Seed Data

| What | Source | Rows |
|---|---|---|
| All 36 States/UTs | Census of India / LGD codes | 36 rows |
| UP 18 Divisions | UP Legal Metrology contact data | 18 rows + [04_organization_contact_kpi.md](./04_organization_contact_kpi.md) |
| UP 75 Districts | Census data | 75 rows |
| All India ~780 Districts | LGD (Local Govt Directory) API | ~780 rows |
| PIN code → District mapping | India Post PIN directory | ~30,000 rows |

**Data source:** https://lgdirectory.gov.in/ (Local Government Directory, open data)

### Backend Changes — Existing Modules

| File to Modify | Change |
|---|---|
| `backend/authentication/models.py` | Add `designation` field + FK to `JurisdictionAssignment` |
| `backend/businesses/models.py` | Add `district` FK, `state` FK, `pin_code` field |
| `backend/licensing/services.py` | Use `route_license_application()` for auto-assignment |
| `backend/applications/services.py` | Use jurisdiction to auto-assign verification applications |
| `backend/payments/models.py` | Use `state_code` for state-specific fee lookup |

### Frontend

| File | Content |
|---|---|
| `frontend/src/app/admin/jurisdiction/page.tsx` | Jurisdiction management (states, divisions, districts) |
| `frontend/src/app/admin/jurisdiction/officers/page.tsx` | Officer-to-jurisdiction assignment |
| `frontend/src/components/forms/AddressWithJurisdiction.tsx` | Address input that auto-resolves jurisdiction |
| `frontend/src/services/jurisdiction.ts` | API client |

### Acceptance Criteria — Phase 2
- [ ] All 36 states/UTs seeded with divisions & districts
- [ ] PIN code resolves to correct State → Division → District
- [ ] License applications auto-routed to correct authority by category + district
- [ ] Verification applications auto-assigned to nearest LMO by district
- [ ] Fee schedule lookups respect state-specific overrides
- [ ] Officers scoped to see only their jurisdiction's applications
- [ ] Admin can reassign officers between jurisdictions

---

---

# PHASE 3: Compliance & Returns
**Duration:** 2 weeks | **Priority:** 🟡 HIGH — Regulatory compliance
**Depends on:** Phase 1 (licensing), Phase 2 (jurisdiction)

## Why This Phase
Licensed businesses must file periodic compliance reports. Pre-packaged commodity registration is a massive market segment. These are statutory requirements under the Legal Metrology Act.

---

### Backend — New Django App: `backend/compliance/`

#### Files to Create

| File | Content |
|---|---|
| `backend/compliance/__init__.py` | App init |
| `backend/compliance/apps.py` | Django app config |
| `backend/compliance/models.py` | PeriodicalReturn, PackerRegistration, DirectorNomination |
| `backend/compliance/serializers.py` | DRF serializers |
| `backend/compliance/services.py` | Return validation, deadline calculation, reminder scheduling |
| `backend/compliance/views.py` | ViewSets |
| `backend/compliance/urls.py` | URL routing |
| `backend/compliance/tasks.py` | Celery/cron tasks for auto-reminders |
| `backend/compliance/tests/` | Tests |

#### Data Models

```python
class PeriodicalReturn(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    return_number = models.CharField(max_length=30, unique=True)
    business = models.ForeignKey("businesses.Business", on_delete=models.PROTECT)
    license = models.ForeignKey("licensing.License", on_delete=models.PROTECT)
    category = models.CharField(max_length=20)  # DEALER/MANUFACTURER/REPAIRER
    return_period = models.CharField(max_length=15)  # ANNUAL/HALF_YEARLY
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Return data (JSON structure varies by category)
    instruments_dealt = models.JSONField(default=list)   # Dealer: bought/sold
    instruments_manufactured = models.JSONField(default=list)  # Manufacturer
    instruments_repaired = models.JSONField(default=list)  # Repairer
    revenue_from_activities = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    submitted_by = models.ForeignKey("authentication.User", on_delete=models.PROTECT)
    submitted_at = models.DateTimeField(null=True)
    status = models.CharField(max_length=15, default="DRAFT")
    reviewed_by = models.ForeignKey("authentication.User", null=True, related_name="+")
    reviewed_at = models.DateTimeField(null=True)
    review_remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class DirectorNomination(models.Model):
    """Section 49(2) — Company Director responsible for LM compliance"""
    id = models.UUIDField(primary_key=True, default=uuid4)
    business = models.ForeignKey("businesses.Business", on_delete=models.PROTECT)
    nominee_name = models.CharField(max_length=200)
    nominee_designation = models.CharField(max_length=100)
    nominee_din = models.CharField(max_length=10, blank=True)  # Director Identification Number
    nominee_email = models.EmailField()
    nominee_phone = models.CharField(max_length=15)
    effective_from = models.DateField()
    effective_until = models.DateField(null=True)
    status = models.CharField(max_length=15, default="ACTIVE")
    submitted_at = models.DateTimeField(auto_now_add=True)

class ComplianceCalendar(models.Model):
    """Auto-generated compliance deadlines"""
    id = models.UUIDField(primary_key=True, default=uuid4)
    business = models.ForeignKey("businesses.Business", on_delete=models.CASCADE)
    compliance_type = models.CharField(max_length=30)  # LICENSE_RENEWAL, RETURN_FILING, etc.
    related_entity_type = models.CharField(max_length=30)
    related_entity_id = models.UUIDField()
    deadline = models.DateField()
    reminder_sent_at = models.DateTimeField(null=True)
    status = models.CharField(max_length=15, default="UPCOMING")  # UPCOMING/DUE/OVERDUE/COMPLETED
```

#### API Endpoints

```
POST   /api/v1/compliance/returns/                 — Create periodical return
GET    /api/v1/compliance/returns/                 — List returns
POST   /api/v1/compliance/returns/{id}/submit/     — Submit return
POST   /api/v1/compliance/returns/{id}/review/     — Officer reviews return

POST   /api/v1/compliance/director-nomination/     — Submit Section 49 nomination
GET    /api/v1/compliance/director-nomination/     — Current nomination

GET    /api/v1/compliance/calendar/                — Upcoming deadlines for business
GET    /api/v1/compliance/calendar/overdue/        — Overdue items (admin view)
```

#### Data Sources

| What | Source | Location |
|---|---|---|
| Return filing requirements by role | UP e-TULA Periodical Return section | [01_homepage.md](./01_homepage.md) § Periodical Returns |
| Return forms (Dealer/Manufacturer/Repairer) | UP portal user manuals | `Periodical_Return_manual_dealer.pdf` etc. |
| Section 49 nomination rules | Legal Metrology Act 2009, Section 49(2) | [02_act_rules_regulations.md](./02_act_rules_regulations.md) |
| Compliance deadlines | UP Enforcement Rules | [03_services_registration_flows.md](./03_services_registration_flows.md) § Compliance Calendar |
| Pre-packaged commodity rules | PC Rules 2011, Rule 27 | [03_services_registration_flows.md](./03_services_registration_flows.md) § Service 6 |

### Frontend

| File | Content |
|---|---|
| `frontend/src/app/app/returns/page.tsx` | Returns dashboard + filing history |
| `frontend/src/app/app/returns/submit/page.tsx` | New return submission form |
| `frontend/src/app/app/compliance/page.tsx` | Compliance calendar view |
| `frontend/src/app/admin/returns/page.tsx` | Admin returns review queue |

### Acceptance Criteria — Phase 3
- [ ] Dealer/Manufacturer/Repairer can file periodical returns per license
- [ ] Category-specific return data validated (instruments list, serial numbers)
- [ ] Company Director Nomination (Section 49) submission and tracking
- [ ] Auto-generated compliance calendar with deadlines
- [ ] Reminder notifications at 30 days, 15 days, 7 days before deadline
- [ ] Overdue items flagged in admin dashboard
- [ ] Returns linked to specific license

---

---

# PHASE 4: Enforcement & Consumer Protection
**Duration:** 3 weeks | **Priority:** 🟡 HIGH — Consumer-facing & government compliance
**Depends on:** Phase 2 (jurisdiction for district-level assignment)

## Why This Phase
UP's e-TULA has complaint-based inspection, enforcement drives, compounding, and prosecution tracking. This is a critical government function — protecting consumers from faulty weights/measures.

---

### Backend — New Django App: `backend/complaints/`

#### Files to Create

| File | Content |
|---|---|
| `backend/complaints/__init__.py` | App init |
| `backend/complaints/models.py` | ConsumerComplaint, ComplaintEvidence |
| `backend/complaints/serializers.py` | DRF serializers (public + admin views) |
| `backend/complaints/services.py` | Auto-assignment, escalation logic |
| `backend/complaints/views.py` | Public complaint filing + admin management |
| `backend/complaints/urls.py` | URL routing |
| `backend/complaints/tests/` | Tests |

### Backend — New Django App: `backend/enforcement/`

| File | Content |
|---|---|
| `backend/enforcement/__init__.py` | App init |
| `backend/enforcement/models.py` | InspectionRaid, Violation, CompoundingOrder, ProsecutionCase |
| `backend/enforcement/serializers.py` | DRF serializers |
| `backend/enforcement/services.py` | Violation classification, compounding fee calculation |
| `backend/enforcement/views.py` | ViewSets |
| `backend/enforcement/urls.py` | URL routing |
| `backend/enforcement/tests/` | Tests |

#### Key Data Models

```python
class ComplaintType(models.TextChoices):
    SHORT_DELIVERY = "SHORT_DELIVERY"          # Less quantity than declared
    UNVERIFIED_INSTRUMENT = "UNVERIFIED"       # Using unstamped scales
    WRONG_PRICING = "WRONG_PRICING"            # Charging above MRP
    TAMPERING = "TAMPERING"                    # Tampered seals/instruments
    NON_STANDARD_WEIGHT = "NON_STANDARD"       # Using non-approved weights
    MRP_VIOLATION = "MRP_VIOLATION"            # MRP not printed / overcharging
    LABEL_VIOLATION = "LABEL_VIOLATION"        # Missing mandatory label info
    OTHER = "OTHER"

class ConsumerComplaint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    complaint_number = models.CharField(max_length=30, unique=True)
    # Complainant (can be anonymous)
    complainant_name = models.CharField(max_length=200, blank=True)
    complainant_phone = models.CharField(max_length=15, blank=True)
    complainant_email = models.EmailField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    # Complaint details
    complaint_type = models.CharField(max_length=25, choices=ComplaintType.choices)
    target_business_name = models.CharField(max_length=200)
    target_address = models.TextField()
    district = models.ForeignKey("jurisdiction.District", on_delete=models.PROTECT)
    description = models.TextField()
    # Workflow
    status = models.CharField(max_length=20, default="RECEIVED")
    assigned_officer = models.ForeignKey("authentication.User", null=True)
    assigned_at = models.DateTimeField(null=True)
    investigation_report = models.TextField(blank=True)
    action_taken = models.CharField(max_length=25, blank=True)
    resolution_summary = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True)
    citizen_feedback_rating = models.PositiveSmallIntegerField(null=True)  # 1-5
    created_at = models.DateTimeField(auto_now_add=True)
```

#### API Endpoints

```
# Public (no auth required)
POST   /api/v1/complaints/                     — File new complaint
GET    /api/v1/complaints/track?number={no}    — Track complaint status

# Admin
GET    /api/v1/complaints/                     — List all complaints (filtered)
POST   /api/v1/complaints/{id}/assign/         — Assign to officer
POST   /api/v1/complaints/{id}/investigate/    — Record investigation findings
POST   /api/v1/complaints/{id}/resolve/        — Close with action taken
POST   /api/v1/complaints/{id}/feedback/       — Citizen submits rating

# Enforcement
POST   /api/v1/enforcement/raids/              — Create raid record
GET    /api/v1/enforcement/raids/              — List raids
POST   /api/v1/enforcement/raids/{id}/violations/ — Record violations found
POST   /api/v1/enforcement/compound/           — Create compounding order
POST   /api/v1/enforcement/prosecute/          — File prosecution case
GET    /api/v1/enforcement/stats/              — Enforcement statistics
```

#### Data Sources

| What | Source | Location |
|---|---|---|
| Complaint types & violation categories | LM Act 2009, Chapter V (Sections 25–47) | [02_act_rules_regulations.md](./02_act_rules_regulations.md) § Penalties |
| Compounding rules | Section 48 + UP SOP | [05_circulars_enforcement_comparison.md](./05_circulars_enforcement_comparison.md) |
| Complaint-Based Inspection workflow | UP e-TULA CB User Manual | `pdf/CB_User_Manual.pdf` |
| Enforcement statistics format | UP Enforcement Tables 2024-25 | `pdf/EnforcementTables_24-25.pdf` |
| Seasonal drive types | UP Circulars | [05_circulars_enforcement_comparison.md](./05_circulars_enforcement_comparison.md) § Seasonal Enforcement |
| Grievance escalation matrix | UP RTI disclosure | [04_organization_contact_kpi.md](./04_organization_contact_kpi.md) § Grievance Escalation |

### Frontend

| File | Content |
|---|---|
| `frontend/src/app/complaints/new/page.tsx` | **Public** complaint filing form (no login needed) |
| `frontend/src/app/complaints/track/page.tsx` | **Public** complaint tracking |
| `frontend/src/app/admin/complaints/page.tsx` | Admin complaint dashboard |
| `frontend/src/app/admin/complaints/[id]/page.tsx` | Complaint investigation view |
| `frontend/src/app/admin/enforcement/page.tsx` | Enforcement raids dashboard |
| `frontend/src/app/admin/enforcement/[id]/page.tsx` | Raid detail & violation recording |

### Acceptance Criteria — Phase 4
- [ ] Public (anonymous or named) can file consumer complaints without login
- [ ] Complaint auto-assigned to LMO of target district
- [ ] Officer can record investigation findings and action taken
- [ ] Compounding orders generated with calculated fees
- [ ] Prosecution cases tracked through filing → hearing → disposal
- [ ] Complainant can track status and submit feedback rating
- [ ] Enforcement statistics aggregated by district/division/state
- [ ] Admin dashboard shows complaint resolution rates and SLA compliance

---

---

# PHASE 5: Working Standards & Seal Management
**Duration:** 2 weeks | **Priority:** 🟠 MEDIUM — Operational integrity
**Depends on:** Phase 2 (jurisdiction for officer assignment)

## Why This Phase
An officer cannot legally verify an instrument if their own test weights are expired. UP's system tracks this — MapanSetu should enforce it as a business rule to guarantee verification integrity.

---

### Backend — New Django App: `backend/standards/`

#### Files to Create

| File | Content |
|---|---|
| `backend/standards/__init__.py` | App init |
| `backend/standards/models.py` | WorkingStandard, VerificationSeal, SealBatch |
| `backend/standards/serializers.py` | DRF serializers |
| `backend/standards/services.py` | Calibration validation, seal lifecycle |
| `backend/standards/views.py` | ViewSets |
| `backend/standards/urls.py` | URL routing |
| `backend/standards/tests/` | Tests |

#### API Endpoints

```
POST   /api/v1/standards/                      — Register working standard
GET    /api/v1/standards/                      — List (filtered by officer/status)
POST   /api/v1/standards/{id}/calibrate/       — Record calibration event
GET    /api/v1/standards/expiring/             — Standards expiring in 30 days

POST   /api/v1/seals/batches/                  — Create seal batch (admin)
POST   /api/v1/seals/issue/                    — Issue seals to officer
POST   /api/v1/seals/{id}/use/                 — Mark seal as used on instrument
POST   /api/v1/seals/{id}/report-lost/         — Report lost/damaged seal
GET    /api/v1/seals/inventory/                — Seal inventory by officer
```

#### Business Rule Integration

```python
# Modify backend/inspections/services.py

def validate_officer_can_inspect(officer, instrument):
    """Block inspection if officer's working standards are expired"""
    standards = WorkingStandard.objects.filter(
        assigned_to=officer, 
        status="ACTIVE",
        calibration_valid_until__gte=date.today()
    )
    if not standards.exists():
        raise ValidationError("Officer's working standards have expired calibration")
```

#### Data Sources

| What | Source | Location |
|---|---|---|
| Standard laboratory hierarchy (Reference → Secondary → Working) | UP RTI disclosure Point 4 | [04_organization_contact_kpi.md](./04_organization_contact_kpi.md) |
| Calibration periodicity | UP Enforcement Rules, Rule 3-5 | [02_act_rules_regulations.md](./02_act_rules_regulations.md) |
| Seal types (lead seal, tamper sticker, hologram, date punch) | UP verification process | [03_services_registration_flows.md](./03_services_registration_flows.md) § Service 4 |

### Acceptance Criteria — Phase 5
- [ ] Working standards registered and tracked per officer
- [ ] Calibration expiry alerts sent 30 days in advance
- [ ] **Inspection blocked** if officer's standards are expired
- [ ] Seal batches created by admin, issued to officers
- [ ] Seal usage linked to specific instrument and inspection
- [ ] Lost/damaged seal reporting with audit trail
- [ ] Seal inventory dashboard per officer and per district

---

---

# PHASE 6: National Integration Layer
**Duration:** 3 weeks | **Priority:** 🟡 HIGH — Production readiness
**Depends on:** All previous phases

## Why This Phase
This is what truly makes MapanSetu "One Nation One Process" — connecting to national digital infrastructure that no state portal currently does comprehensively.

---

### Backend — New Django App: `backend/integrations/`

#### Files to Create

| File | Content |
|---|---|
| `backend/integrations/__init__.py` | App init |
| `backend/integrations/digilocker.py` | DigiLocker API client (push/pull documents) |
| `backend/integrations/gstn.py` | GSTN validation API client |
| `backend/integrations/aadhaar.py` | Aadhaar eKYC / eSign adapter |
| `backend/integrations/emaap.py` | eMaap portal data exchange |
| `backend/integrations/treasury.py` | State treasury adapter (e-GRAS, BharatKosh) |
| `backend/integrations/nsws.py` | National Single Window System connector |
| `backend/integrations/vahan.py` | VAHAN/Parivahan vehicle lookup |
| `backend/integrations/base.py` | Base integration client with retry/circuit-breaker |
| `backend/integrations/models.py` | IntegrationLog for tracking API calls |
| `backend/integrations/tests/` | Tests with mock adapters |

#### Integration Details

| Integration | API Source | What It Does |
|---|---|---|
| **DigiLocker** | https://developers.digilocker.gov.in/ | Push licenses/certificates so users find them in DigiLocker app |
| **GSTN** | https://developer.gst.gov.in/ | Validate GST number → auto-fill business legal name, address, state |
| **Aadhaar eSign** | https://esign.egov.gov.in/ | Digital signing of license documents by Controller |
| **eMaap** | Central LM Dept API | Sync license and verification data to national registry |
| **BharatKosh** | https://bharatkosh.gov.in/ | Deposit verification fees into central government treasury |
| **VAHAN** | https://vahan.parivahan.gov.in/ | Lookup truck chassis/tare weight for tanker calibration |
| **NSWS** | https://nsws.gov.in/ | Cross-department approval for businesses needing multiple licenses |

#### Knowledge Base Module (Public-facing)

```python
# For /knowledge page — Acts, Rules, FAQs, Citizen Charter

class KnowledgeArticle(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4)
    category = models.CharField(max_length=30)  # ACT, RULE, FAQ, CIRCULAR, CITIZEN_CHARTER
    title = models.CharField(max_length=300)
    title_hindi = models.CharField(max_length=500, blank=True)
    content = models.TextField()
    content_hindi = models.TextField(blank=True)
    source_url = models.URLField(blank=True)
    attachment_key = models.CharField(max_length=200, blank=True)
    display_order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Data Sources

| What | Source | Where |
|---|---|---|
| DigiLocker API specs | DigiLocker developer portal | https://developers.digilocker.gov.in/ |
| GSTN API specs | GST developer portal | https://developer.gst.gov.in/ |
| eMaap portal context | Dept of Consumer Affairs | https://emaap.gov.in |
| FAQ content | UP portal FAQ PDF | `pdf/FAQ.pdf` from UP portal |
| Citizen Charter content | UP portal janhit PDF | `pdf/janhit.pdf` from UP portal |
| Acts & Rules full text | India Code | https://www.indiacode.nic.in/ |
| UP-specific circulars | UP portal circular page | [05_circulars_enforcement_comparison.md](./05_circulars_enforcement_comparison.md) |

### Frontend

| File | Content |
|---|---|
| `frontend/src/app/knowledge/page.tsx` | Public knowledge base (Acts, Rules, FAQ, Charter) |
| `frontend/src/app/knowledge/[category]/page.tsx` | Category-filtered articles |
| `frontend/src/app/admin/integrations/page.tsx` | Integration health dashboard |
| `frontend/src/app/admin/knowledge/page.tsx` | Knowledge article management |

### Acceptance Criteria — Phase 6
- [ ] GSTN validation auto-fills business details during registration
- [ ] Licenses pushed to DigiLocker on issuance
- [ ] Public knowledge base with Acts, Rules, FAQs, Citizen Charter
- [ ] Integration health monitoring dashboard
- [ ] All integrations have graceful fallback when external API is down
- [ ] eMaap data sync operational (or mock adapter for demo)
- [ ] Multi-language content support (EN + HI at minimum)

---

---

# APPENDIX A: Complete File Creation Checklist

## New Backend Apps (6 new Django apps)
```
backend/licensing/          — Phase 1A (12 files)
backend/payments/           — Phase 1B (9 files)
backend/jurisdiction/       — Phase 2  (9 files + seed command)
backend/compliance/         — Phase 3  (9 files)
backend/complaints/         — Phase 4  (7 files)
backend/enforcement/        — Phase 4  (7 files)
backend/standards/          — Phase 5  (7 files)
backend/integrations/       — Phase 6  (12 files)
```

## New Frontend Pages (25+ new pages)
```
frontend/src/app/app/licenses/          — Phase 1A (4 pages)
frontend/src/app/app/payments/          — Phase 1B (2 pages)
frontend/src/app/app/returns/           — Phase 3  (2 pages)
frontend/src/app/app/compliance/        — Phase 3  (1 page)
frontend/src/app/admin/licenses/        — Phase 1A (2 pages)
frontend/src/app/admin/jurisdiction/    — Phase 2  (2 pages)
frontend/src/app/admin/returns/         — Phase 3  (1 page)
frontend/src/app/admin/complaints/      — Phase 4  (2 pages)
frontend/src/app/admin/enforcement/     — Phase 4  (2 pages)
frontend/src/app/admin/standards/       — Phase 5  (1 page)
frontend/src/app/admin/seals/           — Phase 5  (1 page)
frontend/src/app/admin/kpi/             — Phase 5  (1 page)
frontend/src/app/admin/integrations/    — Phase 6  (1 page)
frontend/src/app/admin/knowledge/       — Phase 6  (1 page)
frontend/src/app/complaints/            — Phase 4  (2 pages, public)
frontend/src/app/license/verify/        — Phase 1A (1 page, public)
frontend/src/app/knowledge/             — Phase 6  (2 pages, public)
```

## New Database Tables (18 tables)
```
Phase 1A: licensing_licenseapplication, licensing_license, licensing_licensedocument
Phase 1B: payments_feeschedule, payments_paymenttransaction
Phase 2:  jurisdiction_state, jurisdiction_division, jurisdiction_district, jurisdiction_jurisdictionassignment
Phase 3:  compliance_periodicalreturn, compliance_directornomination, compliance_compliancecalendar
Phase 4:  complaints_consumercomplaint, enforcement_inspectionraid, enforcement_violation, enforcement_compoundingorder, enforcement_prosecutioncase
Phase 5:  standards_workingstandard, standards_verificationseal
```

---

# APPENDIX B: Data Source Reference Map

| Data Category | Primary Source Document | Location in Repo |
|---|---|---|
| Homepage structure & features | UP e-TULA portal scrape | `reference/up-legal-metrology/01_homepage.md` |
| Act sections & penalty framework | Legal Metrology Act 2009 analysis | `reference/up-legal-metrology/02_act_rules_regulations.md` |
| Registration flows & fees | UP services + EoDB data | `reference/up-legal-metrology/03_services_registration_flows.md` |
| Org structure & divisions | UP RTI + contact directory | `reference/up-legal-metrology/04_organization_contact_kpi.md` |
| Circulars & cross-state comparison | Multi-source research | `reference/up-legal-metrology/05_circulars_enforcement_comparison.md` |
| Gap analysis & feature specs | Combined analysis | `reference/up-legal-metrology/06_FEATURE_IMPLEMENTATION_REPORT.md` |
| Existing MapanSetu architecture | Project docs | `docs/ARCHITECTURE.md` |
| Existing data model | Project docs | `docs/DATA_MODEL.md` |
| Existing API contract | Project docs | `docs/API_CONTRACT.md` |
| Existing frontend spec | Project docs | `docs/FRONTEND.md` |
| Product requirements | Project docs | `docs/PRD.md` |
| Design standards (GIGW/UX4G) | Project root | `WEBSITE_DESIGN_STANDARDS.md` |
