# API Contract Matrix

| Frontend Service | Operation | HTTP | Contract Endpoint | Request | Response | Role | Mock Supported | Real API Supported |
| ---------------- | --------- | ---- | ----------------- | ------- | -------- | ---- | -------------- | ------------------ |
| `auth` | `loginUser` | POST | `/api/v1/auth/login` | `{ email, password }` | `{ accessToken, tokenType, expiresAt, user }` | Public | YES | YES |
| `auth` | `fetchCurrentUser` | GET | `/api/v1/users/me` | None | `User` | Authenticated | YES | YES |
| `businesses` | `createBusiness` | POST | `/api/v1/businesses` | `BusinessDto` | `Business` | BUSINESS/ADMIN | N/A (UI missing) | N/A |
| `businesses` | `getCurrentBusiness` | GET | `/api/v1/businesses/me` | None | `Business` | BUSINESS | N/A (UI missing) | N/A |
| `instruments` | `registerInstrument` | POST | `/api/v1/instruments` | `RegisterInstrumentDto` | `Instrument` | BUSINESS/ADMIN | YES | YES |
| `instruments` | `getInstruments` | GET | `/api/v1/instruments` | None | `Paginated<Instrument>` | Auth | YES | YES |
| `instruments` | `getInstrumentById` | GET | `/api/v1/instruments/{id}` | None | `Instrument` | Auth | YES | YES |
| `instruments` | `getInstrumentPassport`| GET | `/api/v1/instruments/{id}/passport` | None | `{ instrument, ... }` | Auth | N/A (UI missing) | N/A |
| `applications` | `createApplication` | POST | `/api/v1/applications` | `CreateApplicationDto` | `Application` | BUSINESS/ADMIN | YES | YES |
| `applications` | `getApplications` | GET | `/api/v1/applications` | None | `Paginated<Application>` | Auth | YES | YES |
| `applications` | `getApplicationById` | GET | `/api/v1/applications/{id}` | None | `Application Detail` | Auth | YES | YES |
| `applications` | `assignOfficer` | POST | `/api/v1/applications/{id}/assign` | `{ officerUserId }` | `Application` | ADMIN | YES | YES |
| `applications` | `scheduleApplication` | POST | `/api/v1/applications/{id}/schedule` | `{ scheduledAt }` | `Application` | ADMIN | YES | YES |
| `inspections` | `initializeDraft` | POST | `/api/v1/inspections` | `{ applicationId }` | `Inspection` | OFFICER/ADMIN | YES | YES |
| `inspections` | `getInspectionById` | GET | `/api/v1/inspections/{id}` | None | `Inspection` | Auth | N/A (UI missing) | N/A |
| `inspections` | `saveReadings` | POST | `/api/v1/inspections/{id}/readings` | `Measurements[]` | `Inspection` | OFFICER | N/A (UI missing) | N/A |
| `inspections` | `uploadEvidence` | POST | `/api/v1/inspections/{id}/evidence` | `FormData` | `Evidence` | OFFICER | N/A (UI missing) | N/A |
| `inspections` | `submitDecision` | POST | `/api/v1/inspections/{id}/decision` | `{ result, notes }` | `InspectionResult` | OFFICER | YES | YES |
| `certificates` | `generateCertificate` | POST | `/api/v1/certificates` | `{ inspectionId }` | `Certificate` | ADMIN | N/A (UI missing) | N/A |
| `certificates` | `getCertificates` | GET | `/api/v1/certificates` | None | `Paginated<Certificate>` | Auth | YES | YES |
| `certificates` | `getCertificateById` | GET | `/api/v1/certificates/{id}` | None | `Certificate Detail` | Auth | YES | YES |
| `certificates` | `revokeCertificate` | POST | `/api/v1/certificates/{id}/revoke` | `{ reason }` | `Certificate` | ADMIN | YES | YES |
| `certificates` | `verifyPublic` | GET | `/api/v1/certificates/verify?certNo=` | Query param | `VerificationResult` | Public | YES | YES |
| `notifications` | `getNotifications` | GET | `/api/v1/notifications` | None | `Paginated<Notification>` | Auth | YES | YES |
| `notifications` | `markAsRead` | POST | `/api/v1/notifications/{id}/read` | None | `Notification` | Auth | YES | YES |
| `admin` | `getDashboard` | GET | `/api/v1/dashboards/admin` | None | `DashboardStats` | ADMIN | YES | YES |
| `officers` | `getOfficers` | GET | `/api/v1/officers` | None | `Paginated<Officer>` | ADMIN | YES | YES |
| `audit` | `getAuditLogs` | GET | `/api/v1/audit` | Query params | `Paginated<AuditLog>` | ADMIN | YES | YES |
| `sync` | `processOfflineSync` | POST | `/api/v1/sync` | `SyncBatch` | `SyncBatchResponse` | OFFICER | YES | YES |

### Endpoints missing from the contract
- `markAllNotificationsAsRead`: POST `/api/v1/notifications/read-all` — **NOT PRESENT IN CONTRACT — BACKEND CLARIFICATION REQUIRED**
- `getOfficerById`: GET `/api/v1/officers/{id}` — **NOT PRESENT IN CONTRACT — BACKEND CLARIFICATION REQUIRED**
