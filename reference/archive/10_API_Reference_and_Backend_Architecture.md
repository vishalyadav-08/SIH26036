# MapanSetu API Reference and Backend Architecture

## 1. System Architecture

MapanSetu utilizes a **Modular Monolith** architecture. This pattern provides the development simplicity of a monolith while enforcing strict boundaries between domains, allowing for easier extraction into microservices in the future if required.

### Module Breakdown

The system is divided into domain-specific modules:

1.  **Auth Module (`auth`)**: Handles user registration, authentication, JWT issuing and refreshing, and session management.
2.  **User Module (`user`)**: Manages user profiles, role assignments (ADMIN, LMO, BUSINESS, PUBLIC), and user status.
3.  **Business Module (`business`)**: Manages business profiles, locations, GST details, and associated users.
4.  **Instrument Module (`instrument`)**: Manages instrument registration, lifecycle tracking, specifications, and the Digital Instrument Passport.
5.  **Application Module (`application`)**: Handles the workflow of verification requests, assignment of Legal Metrology Officers (LMOs), and status tracking.
6.  **Inspection Module (`inspection`)**: Handles both online and offline (synced) inspection records, checklist validations, and geo-tagged media.
7.  **Certificate Module (`certificate`)**: Manages the generation, signing, and verification of digital certificates, along with QR code generation.
8.  **Notification Module (`notification`)**: Manages in-app and push notifications for users.
9.  **Audit Module (`audit`)**: Maintains a cryptographically secure, append-only log of critical system actions.

### Folder Structure (`services/api/`)

```text
services/api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.schemas.ts
│   │   ├── user/
│   │   ├── business/
│   │   ├── instrument/
│   │   ├── application/
│   │   ├── inspection/
│   │   ├── certificate/
│   │   ├── notification/
│   │   └── audit/
│   ├── middleware/
│   │   ├── auth.guard.ts
│   │   ├── role.guard.ts
│   │   ├── rate-limit.ts
│   │   └── error-handler.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── minio.ts
│   │   ├── crypto.ts
│   │   └── logger.ts
│   ├── config/
│   │   └── env.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── package.json
└── tsconfig.json
```

---

## 2. Prisma Schema

This is the complete, runnable Prisma schema covering all necessary tables, types, relations, and indexes.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  LMO      // Legal Metrology Officer
  BUSINESS
  PUBLIC
}

enum ApplicationStatus {
  DRAFT
  SUBMITTED
  ASSIGNED
  IN_PROGRESS
  REJECTED
  COMPLETED
}

enum InspectionResult {
  PASS
  FAIL
  REQUIRE_REPAIR
}

enum PassportEventType {
  REGISTRATION
  INSPECTION
  REPAIR
  CERTIFICATION
  OWNERSHIP_TRANSFER
}

model User {
  id             String         @id @default(uuid())
  email          String         @unique
  passwordHash   String
  name           String
  role           Role           @default(PUBLIC)
  phone          String?
  isActive       Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  businessId     String?
  business       Business?      @relation(fields: [businessId], references: [id])

  assignedApps   Application[]  @relation("AssignedLMO")
  inspections    Inspection[]   @relation("Inspector")
  auditLogs      AuditLog[]

  @@index([email])
  @@index([role])
}

model Business {
  id             String         @id @default(uuid())
  name           String
  gstin          String         @unique
  address        String
  city           String
  state          String
  pincode        String
  contactEmail   String
  contactPhone   String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  users          User[]
  instruments    Instrument[]
  applications   Application[]
}

model Instrument {
  id             String         @id @default(uuid())
  businessId     String
  business       Business       @relation(fields: [businessId], references: [id])
  type           String         // e.g., "Weighing Scale", "Fuel Dispenser"
  make           String
  model          String
  serialNumber   String
  capacity       String
  class          String?
  location       String?
  isActive       Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  applications   Application[]
  passports      PassportLog[]

  @@unique([make, model, serialNumber])
  @@index([businessId])
}

model Application {
  id             String            @id @default(uuid())
  businessId     String
  business       Business          @relation(fields: [businessId], references: [id])
  instrumentId   String
  instrument     Instrument        @relation(fields: [instrumentId], references: [id])
  lmoId          String?
  lmo            User?             @relation("AssignedLMO", fields: [lmoId], references: [id])
  
  status         ApplicationStatus @default(SUBMITTED)
  requestedDate  DateTime
  scheduledDate  DateTime?
  completedDate  DateTime?
  notes          String?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  inspection     Inspection?
  certificate    Certificate?

  @@index([businessId])
  @@index([lmoId])
  @@index([status])
}

model Inspection {
  id             String           @id @default(uuid())
  applicationId  String           @unique
  application    Application      @relation(fields: [applicationId], references: [id])
  lmoId          String
  lmo            User             @relation("Inspector", fields: [lmoId], references: [id])
  
  date           DateTime         @default(now())
  latitude       Float
  longitude      Float
  result         InspectionResult
  remarks        String?
  checklists     Json             // Stores dynamic checklist answers
  mediaUrls      String[]         // S3/MinIO keys for photos
  
  isOfflineSync  Boolean          @default(false)
  syncId         String?          @unique // Idempotency key for offline sync
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

model Certificate {
  id             String         @id @default(uuid())
  certNo         String         @unique
  applicationId  String         @unique
  application    Application    @relation(fields: [applicationId], references: [id])
  
  issueDate      DateTime       @default(now())
  expiryDate     DateTime
  payloadData    Json           // Complete data snapshot at time of issue
  signature      String         // RSA-SHA256 signature of payload
  
  isValid        Boolean        @default(true)
  revocationReason String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([certNo])
}

model PassportLog {
  id             String            @id @default(uuid())
  instrumentId   String
  instrument     Instrument        @relation(fields: [instrumentId], references: [id])
  eventType      PassportEventType
  description    String
  timestamp      DateTime          @default(now())
  metadata       Json?             // Additional event-specific data
  actorId        String?           // User who triggered the event

  @@index([instrumentId])
  @@index([timestamp])
}

model AuditLog {
  id             String         @id @default(uuid())
  userId         String?
  user           User?          @relation(fields: [userId], references: [id])
  action         String
  entityType     String         // e.g., "CERTIFICATE", "USER"
  entityId       String
  details        Json
  ipAddress      String?
  timestamp      DateTime       @default(now())
  previousHash   String         // For blockchain-like hash chain
  hash           String         // Hash of this record + previousHash

  @@index([entityType, entityId])
  @@index([timestamp])
}

model Notification {
  id             String         @id @default(uuid())
  userId         String
  title          String
  message        String
  isRead         Boolean        @default(false)
  actionUrl      String?
  createdAt      DateTime       @default(now())

  @@index([userId, isRead])
}
```

---

## 3. Complete API Endpoints Reference

Base Path: `/api/v1`

### 3.1 Auth Module

#### `POST /auth/register`
- **Auth:** Public
- **Description:** Registers a new business user.
- **Request Body:**
  ```typescript
  interface RegisterReq {
    email: string;
    password: string; // min 8 chars
    name: string;
    phone: string;
    businessName: string;
    gstin: string;
  }
  ```
- **Response (201 Created):**
  ```typescript
  interface RegisterRes {
    success: true;
    data: {
      userId: string;
      businessId: string;
      message: string;
    }
  }
  ```

#### `POST /auth/login`
- **Auth:** Public
- **Description:** Authenticates user and returns JWT access and refresh tokens.
- **Request Body:**
  ```typescript
  interface LoginReq {
    email: string;
    password: string;
  }
  ```
- **Response (200 OK):**
  ```typescript
  interface LoginRes {
    success: true;
    data: {
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        name: string;
        role: "ADMIN" | "LMO" | "BUSINESS" | "PUBLIC";
        businessId: string | null;
      }
    }
  }
  ```
- **Errors:** `401 Unauthorized` (Invalid credentials)

#### `POST /auth/refresh`
- **Auth:** Public (Requires valid Refresh Token)
- **Description:** Rotates access token using a refresh token.
- **Request Body:**
  ```typescript
  interface RefreshReq {
    refreshToken: string;
  }
  ```
- **Response (200 OK):**
  ```typescript
  interface RefreshRes {
    success: true;
    data: { accessToken: string; }
  }
  ```

#### `GET /auth/me`
- **Auth:** JWT Required
- **Description:** Returns the profile of the currently authenticated user.
- **Response (200 OK):**
  ```typescript
  interface MeRes {
    success: true;
    data: {
      id: string;
      email: string;
      name: string;
      role: string;
      businessId: string | null;
    }
  }
  ```

---

### 3.2 Instrument Module

#### `GET /instruments`
- **Auth:** JWT Required
- **Description:** List instruments. ADMIN sees all; BUSINESS sees only their own.
- **Query Params:** `page` (number), `limit` (number), `type` (string).
- **Response (200 OK):**
  ```typescript
  interface ListInstrumentsRes {
    success: true;
    data: {
      instruments: Array<{
        id: string;
        type: string;
        make: string;
        model: string;
        serialNumber: string;
        isActive: boolean;
      }>;
      total: number;
    }
  }
  ```

#### `POST /instruments`
- **Auth:** JWT Required (BUSINESS)
- **Description:** Registers a new instrument under the user's business.
- **Request Body:**
  ```typescript
  interface CreateInstrumentReq {
    type: string;
    make: string;
    model: string;
    serialNumber: string;
    capacity: string;
    class?: string;
    location?: string;
  }
  ```
- **Response (201 Created):** returns the created instrument object.

#### `GET /instruments/:id`
- **Auth:** JWT Required (Ownership check for BUSINESS)
- **Description:** Get specific instrument detail.
- **Response (200 OK):** Returns detailed instrument object.

#### `PUT /instruments/:id`
- **Auth:** JWT Required (Ownership check for BUSINESS)
- **Description:** Update instrument metadata (e.g., location).
- **Request Body:** Partial update fields.

#### `GET /instruments/:id/passport`
- **Auth:** JWT Required (Ownership check for BUSINESS, open for ADMIN/LMO)
- **Description:** Retrieve the Digital Instrument Passport (audit log of the instrument).
- **Response (200 OK):**
  ```typescript
  interface PassportRes {
    success: true;
    data: {
      instrumentId: string;
      events: Array<{
        id: string;
        eventType: "REGISTRATION" | "INSPECTION" | "REPAIR" | "CERTIFICATION";
        description: string;
        timestamp: string;
        actor: string;
      }>;
    }
  }
  ```

---

### 3.3 Application Module

#### `GET /applications`
- **Auth:** JWT Required
- **Description:** List verification applications. Role filters apply (BUSINESS sees own, LMO sees assigned, ADMIN sees all).
- **Response (200 OK):** Array of application objects.

#### `POST /applications`
- **Auth:** JWT Required (BUSINESS)
- **Description:** Create a verification request for an instrument.
- **Request Body:**
  ```typescript
  interface CreateAppReq {
    instrumentId: string;
    requestedDate: string; // ISO DateTime
    notes?: string;
  }
  ```
- **Response (201 Created):**
  ```typescript
  interface CreateAppRes {
    success: true;
    data: { applicationId: string; status: string; }
  }
  ```

#### `GET /applications/:id`
- **Auth:** JWT Required
- **Description:** Get application detail.

#### `PUT /applications/:id/assign`
- **Auth:** JWT Required (ADMIN)
- **Description:** Assign an LMO to an application.
- **Request Body:**
  ```typescript
  interface AssignLMOReq { lmoId: string; scheduledDate: string; }
  ```
- **Response (200 OK)**

#### `GET /applications/lmo/queue`
- **Auth:** JWT Required (LMO)
- **Description:** Optimized endpoint for the LMO PWA to fetch today's assigned inspections for offline caching.
- **Response (200 OK):** Array of applications with nested instrument and business location details.

---

### 3.4 Inspection Module

#### `POST /inspections`
- **Auth:** JWT Required (LMO)
- **Description:** Submit an online inspection report.
- **Request Body:**
  ```typescript
  interface CreateInspectionReq {
    applicationId: string;
    latitude: number;
    longitude: number;
    result: "PASS" | "FAIL" | "REQUIRE_REPAIR";
    remarks?: string;
    checklists: Record<string, any>;
    mediaUrls: string[]; // Uploaded via separate media endpoint
  }
  ```
- **Response (201 Created):** Returns created inspection ID.

#### `POST /inspections/sync`
- **Auth:** JWT Required (LMO)
- **Description:** Batch upload for offline inspections from PWA.
- **Request Body:**
  ```typescript
  interface SyncReq {
    inspections: Array<{
      syncId: string; // uuid generated on client for idempotency
      applicationId: string;
      timestamp: string;
      latitude: number;
      longitude: number;
      result: "PASS" | "FAIL" | "REQUIRE_REPAIR";
      remarks?: string;
      checklists: Record<string, any>;
      photos: Array<{ label: string; base64: string; }>;
    }>;
  }
  ```
- **Response (200 OK):**
  ```typescript
  interface SyncRes {
    success: true;
    data: {
      syncedIds: string[]; // array of client syncIds successfully processed
      failedIds: Array<{ syncId: string; reason: string; }>;
    }
  }
  ```

#### `GET /inspections/:id`
- **Auth:** JWT Required
- **Description:** Get inspection detail.

---

### 3.5 Certificate Module

#### `GET /certificates/:id`
- **Auth:** JWT Required
- **Description:** Get digital certificate details by DB ID.

#### `GET /certificates/verify`
- **Auth:** Public
- **Description:** Public verification endpoint used by scanning QR codes.
- **Query Params:** `certNo`
- **Response (200 OK):**
  ```typescript
  interface VerifyCertRes {
    success: true;
    data: {
      isValid: boolean;
      certNo: string;
      issueDate: string;
      expiryDate: string;
      businessName: string;
      instrumentMakeModel: string;
      revocationReason?: string;
    }
  }
  ```

#### `GET /certificates/:id/qr`
- **Auth:** Public
- **Description:** Returns a PNG image stream of the QR code containing the verification URL (e.g., `https://mapansetu.gov.in/verify?certNo=XXXX`).

#### `GET /certificates/:id/download`
- **Auth:** JWT Required (Owner / LMO / Admin)
- **Description:** Generates and returns a PDF of the certificate.

---

### 3.6 Dashboard / Stats Module

#### `GET /dashboard/business`
- **Auth:** JWT Required (BUSINESS)
- **Response:**
  ```typescript
  interface BusDashRes {
    totalInstruments: number;
    activeApplications: number;
    upcomingRenewals: number;
  }
  ```

#### `GET /dashboard/officer`
- **Auth:** JWT Required (LMO)
- **Response:**
  ```typescript
  interface LMODashRes {
    pendingInspections: number;
    completedToday: number;
    efficiencyScore: number;
  }
  ```

#### `GET /dashboard/admin`
- **Auth:** JWT Required (ADMIN)
- **Response:**
  ```typescript
  interface AdminDashRes {
    totalBusinesses: number;
    activeLMOs: number;
    certificatesIssuedThisMonth: number;
    revenue: number;
  }
  ```

---

### 3.7 Notification Module

#### `GET /notifications`
- **Auth:** JWT Required
- **Description:** List notifications for current user.

#### `PUT /notifications/:id/read`
- **Auth:** JWT Required
- **Description:** Mark specific notification as read.

---

### 3.8 Admin Module

#### `GET /admin/users`
- **Auth:** JWT Required (ADMIN)
- **Description:** List system users.

#### `POST /admin/users/officer`
- **Auth:** JWT Required (ADMIN)
- **Description:** Create an LMO account.
- **Request Body:** `{ email, name, phone, password }`

#### `GET /admin/audit-logs`
- **Auth:** JWT Required (ADMIN)
- **Description:** View cryptographically secured system audit logs.

---

## 4. Authentication & Authorization

### JWT Structure
Tokens are generated using `jsonwebtoken` library.

**Payload:**
```json
{
  "sub": "user-uuid-123",
  "role": "BUSINESS",
  "businessId": "business-uuid-456",
  "iat": 1700000000,
  "exp": 1700086400
}
```

### Expiry
- Access Token: `24h` (to accommodate offline shifts for LMOs without frequent login prompts).
- Refresh Token: `7d`. Stored in DB to allow revocation.

### Role Guard Middleware (Pseudocode)
```typescript
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }
    next();
  };
};

// Usage
router.get('/admin/users', authenticateJWT, authorizeRoles('ADMIN'), adminController.getUsers);
```

### Rate Limiting Strategy
Implemented using `express-rate-limit` connected to Redis.
- **Global:** 100 requests / 1 minute per IP.
- **Auth Routes (`/auth/*`):** 10 requests / 15 minutes per IP (Brute-force protection).

---

## 5. Cryptography Implementation

To ensure non-repudiation and integrity of Certificates and Audit Logs, public-key cryptography and cryptographic hashing are used.

### RSA Key Management
- Generate a 2048-bit RSA Key Pair (offline or at deployment via script).
- **Private Key:** Stored securely as an environment variable or via AWS KMS / HashiCorp Vault. Never exposed.
- **Public Key:** Can be exposed or shared internally to verify signatures.

### Certificate Signing Flow
1. **Build Payload:** When a certificate is issued, a static JSON representation is created.
   ```javascript
   const payload = {
     certNo: "CERT-2024-89912",
     instrumentId: "inst-123",
     issueDate: "2024-01-01T00:00:00Z",
     expiryDate: "2025-01-01T00:00:00Z"
   };
   const payloadString = JSON.stringify(payload);
   ```
2. **Hash:** Create SHA-256 hash of `payloadString`.
3. **Sign:** Sign the hash with the RSA Private Key.
   ```javascript
   const sign = crypto.createSign('RSA-SHA256');
   sign.update(payloadString);
   const signature = sign.sign(privateKey, 'base64');
   ```
4. **Store:** Save `payload`, `signature`, and other metadata in the `Certificate` DB table.
5. **QR Code:** The physical QR code only contains `https://app.mapansetu.gov.in/verify?certNo=CERT-2024-89912`.

### Verification Flow (Public Endpoint)
1. User scans QR and hits `GET /api/v1/certificates/verify?certNo=...`
2. Server fetches `Certificate` row by `certNo`.
3. Server recreates `payloadString` from DB `payloadData`.
4. Server verifies signature:
   ```javascript
   const verify = crypto.createVerify('RSA-SHA256');
   verify.update(payloadString);
   const isValid = verify.verify(publicKey, dbSignature, 'base64');
   ```
5. If valid, return certificate details. If invalid, flag as tampered.

### Audit Hash Chain
Every record in `AuditLog` calculates its hash based on its own data plus the hash of the immediately preceding log entry.
```javascript
const currentHash = crypto.createHash('sha256')
  .update(JSON.stringify(actionData) + previousRecord.hash)
  .digest('hex');
```
This ensures history cannot be rewritten without breaking the chain.

---

## 6. File Upload Architecture

The system uses MinIO (S3 compatible) for Object Storage.

### Setup
- Bucket: `mapansetu-media`
- Access: Private (URLs generated are pre-signed with short expiration).

### Standard Photo Upload (Online)
- Endpoint `POST /upload` accepts `multipart/form-data`.
- Middleware uses `multer` (memory storage).
- Service streams buffer to MinIO using `aws-sdk/client-s3`.
- Returns MinIO object key.

### Offline Sync Photo Handling
- PWA cannot easily manage multipart uploads in a background sync loop.
- Client encodes images as base64 strings and embeds them inside the JSON payload of `/inspections/sync`.
- Backend extracts base64 string:
  ```typescript
  const buffer = Buffer.from(photo.base64, 'base64');
  const key = `inspections/${applicationId}/${Date.now()}_${photo.label}.jpg`;
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.MINIO_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg'
  }));
  ```

---

## 7. Offline Sync Protocol Detail

The offline sync protocol handles inspections completed by LMOs without internet access.

### Sync Payload Schema
```json
{
  "inspections": [
    {
      "syncId": "client-uuid-v4-for-idempotency",
      "applicationId": "app-uuid",
      "timestamp": "2024-03-15T10:30:00Z",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "result": "PASS",
      "remarks": "All seals intact.",
      "checklists": {
        "visual_inspection": true,
        "calibration_error": "0.01%"
      },
      "photos": [
        {
          "label": "front_panel",
          "base64": "/9j/4AAQSkZJRgABAQ..."
        }
      ]
    }
  ]
}
```

### Backend Processing Steps
1. **Validation:** Check schema validity.
2. **Transaction Start:** Begin Prisma transaction.
3. **Loop Inspections:**
   - Check if `syncId` already exists in DB (Idempotency). If yes, skip (already processed).
   - Validate `applicationId` belongs to assigned LMO.
   - Upload base64 photos to MinIO asynchronously (Promise.all).
   - Create `Inspection` record.
   - Update `Application` status to `COMPLETED`.
   - Append to `PassportLog`.
4. **Transaction Commit.**
5. **Response:** Return array of successfully processed `syncId`s so the client can clear them from local IndexedDB.

---

## 8. Error Handling

All API errors return a standard JSON structure. HTTP Status codes indicate the category.

### Standard Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The email provided is invalid."
  }
}
```

### Error Codes Catalog
- `UNAUTHORIZED` (401) - Missing or invalid JWT.
- `FORBIDDEN` (403) - JWT valid, but insufficient role privileges.
- `NOT_FOUND` (404) - Resource does not exist.
- `VALIDATION_ERROR` (400) - Payload failed Zod schema validation.
- `CONFLICT` (409) - Resource already exists (e.g., email taken).
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests.
- `SERVER_ERROR` (500) - Unhandled exception.
- `TAMPERED_DATA` (400) - Cryptographic verification failed.

---

## 9. Environment Variables

Complete `.env.example` file for backend setup.

```env
# Server
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1

# Database
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mapansetu_db?schema=public"

# Redis (for Rate Limiting / Queues)
REDIS_URL="redis://localhost:6379"

# Security
JWT_ACCESS_SECRET="generate-a-secure-random-string-here"
JWT_REFRESH_SECRET="generate-another-secure-random-string"
CORS_ORIGIN="http://localhost:5173,https://mapansetu.gov.in"

# Cryptography (RSA Base64 Encoded Keys)
RSA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBCcwggQjAgEAAoIBAQ...\n-----END PRIVATE KEY-----"
RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----"

# MinIO / S3 Storage
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="mapansetu-media"
MINIO_REGION="us-east-1"
```
