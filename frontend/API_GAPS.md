# API GAPS

## A. Frontend implementation bugs
*(All known frontend strict mode fallback logic preventing proper 1:1 API mapping was resolved in this phase via `USE_MOCK_API` branching. Currently, the code operates identically to the contract boundaries).*

## B. Backend contract gaps
- **Get Officer Detail**: The UI requests an individual officer by ID (`/api/v1/officers/{id}`) in `officers.service.ts` for assignments, but the contract only specifies a paginated list endpoint (`GET /api/v1/officers`).
- **Mark All Notifications Read**: The UI has a generic action to clear the notifications tray via (`POST /api/v1/notifications/read-all`), but the contract only specifies marking an individual notification as read (`POST /api/v1/notifications/{id}/read`).

## C. UI features with no backend support
- **Business Profile Management**: The mock data specifies a `business@example.test` with profile routes (`/app/profile`), however the UI lacks the forms to execute `POST /api/v1/businesses` or `GET /api/v1/businesses/me`.
- **Instrument Passport Timeline**: The `GET /api/v1/instruments/{id}/passport` endpoint exists in the contract but no UI is built yet to visualize this timeline.
- **Granular Inspection Components (Readings & Evidence)**: `POST /api/v1/inspections/{id}/readings` and `POST /api/v1/inspections/{id}/evidence` exist in the contract, but the frontend only submits the final consolidated decision (`submitFinalInspectionDecision`) because the Field Officer inspection UI remains a shell mockup in this phase.
- **System Certificate Generation**: The `POST /api/v1/certificates` endpoint is for backend-driven/admin manual issuance after an inspection, but the frontend has no dedicated trigger UI to invoke it yet.
