# System Architecture & Cryptography Design

## 1. High-Level Architecture
We will use a **Modular Monolith** architecture for the prototype to ensure speed, ease of deployment, and simplicity for AI agents, while keeping separation of concerns.

```mermaid
graph TD
    subgraph Frontend [Frontend Apps (React / PWA)]
        B[Business Web Portal]
        O[Officer Field App PWA]
        P[Public QR Scanner]
    end

    subgraph Backend [Backend API (Spring Boot / Node.js)]
        API[REST API Gateway]
        AUTH[Auth Module]
        APP[Application Module]
        INSP[Inspection Module]
        CERT[Certificate & Crypto Module]
    end

    subgraph Data [Data Layer]
        DB[(PostgreSQL)]
        S3[(MinIO / AWS S3 - Evidence/Photos)]
    end

    B --> API
    O --> API
    P --> API
    
    API --> AUTH
    API --> APP
    API --> INSP
    API --> CERT

    AUTH --> DB
    APP --> DB
    INSP --> DB
    CERT --> DB
    
    INSP --> S3
```

## 2. The Field App (Offline-First Strategy)
The Officer App will be a Progressive Web App (PWA).
*   **Technology:** React + Workbox (Service Workers) + IndexedDB.
*   **Workflow:**
    1.  Officer logs in while online. App fetches assigned inspections and caches them in IndexedDB.
    2.  Officer goes to a shop (no network). Opens PWA.
    3.  Records readings, takes photos (stored in local blob storage/IndexedDB).
    4.  Saves inspection locally. Status marked as `SYNC_PENDING`.
    5.  When network returns, a background sync pushes data to the `/sync` API endpoint.

## 3. Cryptography & Certificate Verification
To ensure certificates are tamper-proof and not just simple URLs behind a QR code.

### 3.1 Hash Chain (Tamper-evident records)
Every major action on an instrument (Registration, Verification, Renewal) creates an Audit Log entry.
*   `hash = SHA256(previous_log_hash + current_action_data + timestamp)`
*   This ensures the "Digital Instrument Passport" cannot be secretly altered in the database.

### 3.2 Digital Certificates & QR
1.  **Generation:** When an inspection passes, the backend generates a JSON payload representing the certificate (Instrument ID, Expiry, Owner).
2.  **Signing:** The backend uses an RSA/ECDSA private key to sign the SHA-256 hash of this payload.
3.  **Storage:** The signature and the payload are saved in the DB.
4.  **QR Code:** The QR code contains a URL: `https://mapansetu.gov.in/verify?certId=CERT-123`
5.  **Verification:** When scanned, the frontend fetches the certificate data AND the signature. The frontend (or public API) verifies the signature using the known Public Key of the Legal Metrology department. If the data was altered in the DB, the signature verification fails.
