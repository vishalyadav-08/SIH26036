# MapanSetu — System Integration & End-to-End Testing Plan
> **Owner:** Lead / Integrator & QA
> **Goal:** Connect the Backend API, Web App, and Field App into a single, cohesive, working prototype.
> **Estimated Time:** 1 Day

---

## ⚠️ Core Principle of Integration
Integration is where most hackathon projects fail. You must ensure that **CORS**, **Environment Variables**, and **JWT Tokens** are perfectly synchronized across all three codebases before you attempt a full run.

---

## PHASE 1 — Environment Synchronization

Before testing, all three services must be running locally and pointing to the correct ports.

### Step 1.1 — Backend API (`services/api`)
1. Ensure PostgreSQL and MinIO are running.
2. Verify `.env` has:
   ```env
   PORT=3000
   CORS_ORIGIN=http://localhost:5173,http://localhost:5174
   CERT_VERIFY_BASE_URL=http://localhost:5173/verify
   ```
3. Run `npm run dev`. It must be running on **Port 3000**.

### Step 1.2 — Web App (`apps/web`)
1. Create `apps/web/.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```
2. Run `npm run dev`. It must be running on **Port 5173**.

### Step 1.3 — Field App (`apps/field-app`)
1. Create `apps/field-app/.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```
2. Run `npm run dev -- --port 5174`. It must be running on **Port 5174**.

---

## PHASE 2 — Database Seeding & Clean Slate

To test the integration smoothly, start with a fresh database state, but pre-populated with the necessary user accounts.

1. Go to `services/api`.
2. Reset the database to wipe any corrupted partial tests:
   ```powershell
   npx prisma migrate reset --force
   ```
3. Run the seeder to generate the base users (Admin, LMO, Business):
   ```powershell
   npm run db:seed
   ```
   *This gives you `admin@mapansetu.gov.in`, `rajesh.lmo@up.gov.in`, and `sharma@store.com` with the password `Demo@1234`.*

---

## PHASE 3 — The Master End-to-End Integration Flow

Follow these exact steps across the 3 browser windows. Do not skip any steps.

### Step 3.1 — Business Registration & Instrument Setup (Web App)
1. Open `http://localhost:5173/login`.
2. Login as Business (`sharma@store.com` / `Demo@1234`).
3. Verify the Dashboard loads and the stats (Total Instruments, Pending, etc.) are fetched successfully from the API. *(If it fails, check browser network tab for CORS errors)*.
4. Go to **Instruments** -> **Add New**.
5. Submit a new instrument (e.g., Platform Scale, ABC Corp).
6. **Integration Check:** Look at the terminal for the backend. You should see a `201 Created` for `/api/v1/instruments`.

### Step 3.2 — Application Submission (Web App)
1. On the Business Dashboard, click the newly created instrument.
2. Click **Apply for Verification**.
3. **Integration Check:** The backend should generate an `APP-2026-XXXX` number, and the status in the UI should change to `PENDING`.

### Step 3.3 — Admin LMO Assignment (Web App)
1. Open a new Incognito window (so you don't overwrite the Business token).
2. Go to `http://localhost:5173/login` and login as Admin (`admin@mapansetu.gov.in`).
3. Navigate to **Applications**.
4. Find the `PENDING` application you just created.
5. Assign it to the LMO (`Rajesh Kumar`).
6. **Integration Check:** The status must instantly change to `ASSIGNED`. Check the database table `applications` to ensure `assignedLmoId` is populated.

### Step 3.4 — Field App Queue Sync (Field App)
1. Open `http://localhost:5174/login` (Field App).
2. Login as LMO (`rajesh.lmo@up.gov.in`).
3. **Integration Check:** The `QueuePage` must immediately show the application you just assigned.
4. *Under the hood check:* Open Chrome DevTools -> Application -> IndexedDB -> `MapanSetuFieldDB`. Verify that the assigned application data is successfully cached in the `assignedQueue` table.

### Step 3.5 — Offline Inspection Execution (Field App)
1. **CRITICAL STEP:** In Chrome DevTools, go to the **Network** tab and change "No throttling" to **"Offline"**.
2. Refresh the page. The app MUST load from the Service Worker cache.
3. The orange "Offline Mode" banner must appear.
4. Click on the assigned application to open the `InspectionForm`.
5. Enter mock standard weights and observed readings (ensure at least one triggers the error calculation).
6. Click "Take Photo" (allow camera permissions).
7. Select **PASS**.
8. Click **Submit**.
9. **Integration Check:** The app should show "Saved Offline" and redirect to the Queue. Check IndexedDB -> `pendingSyncs` table. The massive JSON payload (including base64 photos) must be sitting there.

### Step 3.6 — Background Sync (Field App to API)
1. In Chrome DevTools Network tab, switch back to **"No throttling"** (Online).
2. The `useNetwork` hook should trigger `syncService.syncAllPending()`.
3. **Integration Check:** Look at the Backend terminal. You should see a massive POST request to `/api/v1/inspections/sync`.
4. The MinIO backend terminal should register file uploads for the photos.
5. The Field App should show a success toast, and the `pendingSyncs` IndexedDB table should now be empty.

### Step 3.7 — Certificate Generation & Timeline (Web App)
1. Go back to the Business Web App window (`http://localhost:5173`).
2. Refresh the Business Dashboard.
3. **Integration Check:** The application status should now be `COMPLETED`.
4. Go to the Instrument detail page.
5. **Integration Check:** The Digital Instrument Passport timeline must show the new events: `ASSIGNED`, `INSPECTION_DONE`, and `CERTIFICATE_ISSUED`.
6. Go to **Certificates**. A new certificate (`LM-UP-2026-XXXX`) should be visible and marked `ACTIVE`.

### Step 3.8 — Public QR Code Validation
1. Click on the Certificate to view the QR Code.
2. In the web app UI, click the QR code or manually copy the URL embedded in it (e.g., `http://localhost:5173/verify?certNo=LM-UP-2026-XXXX`).
3. Open a completely new browser profile or incognito window (simulate a random citizen).
4. Paste the URL.
5. **Integration Check:** The Public Verify Page should call `/api/v1/certificates/verify`. The backend will decrypt the RSA signature. The UI must boldly display **CERTIFICATE VALID** in green, along with the owner details.

---

## PHASE 4 — Common Integration Pitfalls & Debugging Guide

If a step above fails, check these specific areas:

### 1. CORS Errors (Preflight Failing)
*   **Symptom:** Browser console says "Cross-Origin Request Blocked".
*   **Fix:** Ensure `services/api/.env` has EXACTLY `CORS_ORIGIN=http://localhost:5173,http://localhost:5174`. Do NOT put a trailing slash (`/`). Restart the backend.

### 2. Missing JWT Token / 401 Unauthorized
*   **Symptom:** Backend returns `401` on every request after login.
*   **Fix:** Check `apps/web/src/lib/api.ts`. Ensure the Axios interceptor is correctly reading `useAuthStore.getState().token` and attaching it as `Bearer ${token}`.

### 3. MinIO Upload Fails (Connection Refused)
*   **Symptom:** Sync fails with `ECONNREFUSED 127.0.0.1:9000`.
*   **Fix:** MinIO is not running. Start it via `minio.exe server C:\minio-data --console-address ":9001"`. Ensure the bucket `mapansetu-evidence` exists (the backend should create it on startup, but check the MinIO console at `http://localhost:9001`).

### 4. PWA Not Working Offline
*   **Symptom:** When you turn off the network, the Field App shows the Chrome dinosaur game.
*   **Fix:** The Service Worker did not register. You must build the app (`npm run build`) and preview it (`npm run preview`) to test the Service Worker reliably. Vite's dev server (`npm run dev`) does not fully support offline Service Workers.

### 5. RSA Signature Verification Fails
*   **Symptom:** Step 3.8 shows "INVALID SIGNATURE".
*   **Fix:** The `payloadJson` was altered after generation. Ensure you are not modifying the certificate data in the database directly. If you regenerated the `private.pem` and `public.pem` keys, any previously generated certificates will fail verification. Wipe the DB and start fresh.

---

## PHASE 5 — Demo Day Preparation (The Final Polish)

Once the Integration Flow runs perfectly, freeze the codebase! Do not add new features.

1. **Seed the perfect demo data:** Modify `src/lib/seed.ts` to include exactly the names and locations you want to show the judges.
2. **Clear all caches:** Tell your team to clear `localStorage` and `IndexedDB` on their browsers to prevent stale state from ruining the demo.
3. **Rehearse the exact clicks:** Create a script (see `13_Demo_Script.md`) and practice clicking through the UI smoothly. Hide any developer tools or terminal windows.
