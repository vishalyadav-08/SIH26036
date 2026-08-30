# API Contracts (REST)

## Base URL: `/api/v1`

### 1. Auth
*   `POST /auth/login` -> Returns JWT token & role.
*   `POST /auth/register`

### 2. Instruments
*   `GET /instruments` -> List instruments for logged-in business (or all for admin).
*   `POST /instruments` -> Register a new instrument.
*   `GET /instruments/:id/passport` -> Get audit history (Hash Chain) for the instrument.

### 3. Applications
*   `GET /applications` -> LMO gets assigned apps; Business gets their apps.
*   `POST /applications` -> Business applies for verification.
    *   Payload: `{ instrument_id: UUID }`
*   `PUT /applications/:id/assign` -> Admin assigns an LMO.

### 4. Inspections (Offline-First Sync)
*   `POST /inspections/sync` -> The critical endpoint for the PWA.
    *   Accepts an array of completed offline inspections.
    *   Payload:
    ```json
    {
      "inspections": [
        {
          "application_id": "uuid",
          "inspection_date": "ISO8601",
          "readings": [{"std": "5kg", "obs": "5.002kg", "err": "+0.002"}],
          "result": "PASS",
          "evidence_base64": "data:image/jpeg;base64,..."
        }
      ]
    }
    ```
    *   *Backend Logic:* Saves inspection, if PASS -> generates Certificate -> generates Digital Signature -> updates Instrument status.

### 5. Certificates
*   `GET /certificates/:id` -> Get certificate details.
*   `GET /verify?certNo=...` -> Public endpoint. Returns certificate data and boolean `is_valid_signature`.
