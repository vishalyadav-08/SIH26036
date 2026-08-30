# MapanSetu Field Officer Mobile App - PRD & Technical Design

## 1. Overview

### 1.1 Purpose
The MapanSetu Field Officer Mobile App is a dedicated Progressive Web Application (PWA) designed specifically for Legal Metrology Officers. Its primary function is to facilitate the field verification and inspection of weighing and measuring instruments directly at the business/shop premises.

### 1.2 Target Audience
Legal Metrology Officers (Field Inspectors) who are authorized to verify, stamp, and certify commercial measuring instruments.

### 1.3 Platform & Technology Stack
- **Architecture**: Progressive Web App (PWA)
- **Frontend Framework**: React.js with Vite
- **Offline & Caching**: Workbox (Service Workers)
- **Local Database**: IndexedDB managed via Dexie.js
- **Routing**: React Router DOM
- **UI Framework**: Tailwind CSS (optimized for mobile PWA)
- **Device Support**: Installable on Android (Chrome/Edge), iOS (Safari), and Desktop.
- **Core Philosophy**: **Offline-First**. The app must function identically with zero connectivity as it does with a 5G connection.

### 1.4 Core User Journey (The "Offline-First" Flow)
1. **Online (Morning):** Officer logs into the app while connected to the internet (home/office).
2. **Fetch:** App automatically fetches and caches today's assigned inspections (and up to 7 days ahead).
3. **Go Offline:** Officer enters a shop basement or rural area with absolutely no cellular signal.
4. **Inspect:** Officer opens the assigned inspection from the local queue.
5. **Data Entry:** Officer enters all standard vs. observed readings. Tolerance is auto-calculated.
6. **Evidence:** Officer takes required photos (Serial Plate, Display, Overall, Seal). Photos are saved locally.
7. **Complete:** Officer marks the inspection as PASS or FAIL and hits "Save". Data is committed to IndexedDB.
8. **Come Online:** Officer steps out into a signal zone. The Service Worker detects `navigator.onLine` and automatically syncs the cached payloads (including photos) to the central MapanSetu server in the background.

---

## 2. Screen List & Routes

The application follows a standard mobile route hierarchy, optimized for single-column layouts and bottom-navigation paradigms.

| Route | Screen Name | Description |
| :--- | :--- | :--- |
| `/app/login` | Login | Authentication screen (requires online connection). |
| `/app/dashboard` | Dashboard | Overview of today's queue, quick stats, pending sync count. |
| `/app/inspections` | Assigned Inspections | Full list of assigned inspections (filterable by date/status). |
| `/app/inspections/:id` | Inspection Detail | Read-only view of the assignment details (shop info, map). |
| `/app/inspect/:appId` | Active Inspection Form | **MAIN SCREEN**: The data entry interface for the inspection. |
| `/app/sync` | Sync Status | Dedicated screen to view `pending_syncs`, manual retry, logs. |
| `/app/profile` | Officer Profile | Officer details, logout, clear local data options. |

---

## 3. Screen-by-Screen Design Spec

### General Mobile Layout Rules
- **Width**: Optimized for 375px (standard mobile), fluid up to tablet size.
- **Columns**: Strictly single-column layout to prevent horizontal scrolling.
- **Touch Targets**: Minimum 44x44px for all interactable elements (buttons, inputs, toggles) as per accessibility standards.
- **App Bar**: Fixed top header containing Back Button (left), Page Title (center), Context Action (right).
- **Bottom Navigation**: Fixed bottom bar with icons for: Dashboard, List, QR Scan, Sync, Profile.

### 3.1 Login Screen (`/app/login`)
- **Header**: None (Fullscreen logo display).
- **UI Components**:
  - Department Logo (MapanSetu).
  - Username / Officer ID field (text input, 44px height).
  - Password field (masked input, toggle visibility).
  - Primary CTA: "Secure Login" (full-width button, green).
- **Offline Behavior**: If offline and no valid session exists, display a toast: "You must be online to log in for the first time." If session exists, automatically redirect to Dashboard.

### 3.2 Dashboard (`/app/dashboard`)
- **Header**: Menu (left), "Dashboard" (title), Notification bell (right).
- **UI Components**:
  - Welcome Banner: "Welcome, Officer [Name]".
  - Stats Row: "Pending Today (4)", "Completed (2)", "To Sync (1)".
  - Next Appointment Card: Details of the immediate next inspection.
  - Quick Actions Grid: Start Inspection, Scan QR, View Sync Queue.
- **Offline Behavior**: Fully operational reading from `assigned_inspections` in Dexie.

### 3.3 Assigned Inspections (`/app/inspections`)
- **Header**: "My Inspections" (title).
- **UI Components**:
  - Date Tabs: "Today" | "Tomorrow" | "Next 7 Days".
  - List View: Cards showing Business Name, Location, Instrument Type.
  - Status Pills on Cards: "Pending" (Gray), "Draft" (Orange), "Completed" (Green).
- **Empty State**: Illustration of a clipboard with "No inspections scheduled for this date."

### 3.4 Inspection Detail (`/app/inspections/:id`)
- **Header**: Back (left), "Details" (title).
- **UI Components**:
  - Business Information Block (Name, Address, Phone, Contact Person).
  - Map Preview (Static image or embedded if online, fallback to textual address if offline).
  - Instrument Summary.
  - Primary CTA: "START INSPECTION" (Sticky bottom, full width, 56px height).

### 3.5 Active Inspection Form (`/app/inspect/:appId`) - CRITICAL SCREEN
This is the core working area of the application.

#### Header & Top Banner
- **Header**: Back Button, "Verification: #ID", Help Icon.
- **Offline Banner**: A sticky yellow banner directly below the header: `⚠️ Offline Mode - Data will be saved locally`.

#### Instrument Info Card (Top section)
- **Data Displayed**: Instrument ID, Owner Name, Manufacturer/Model, Capacity/Class, Previous Certificate Date.
- **Format**: Read-only, compact card format with gray background.

#### Readings Table (Core Data Entry)
- **Layout**: Horizontally scrollable table or stacked card format if screen is too narrow.
- **Columns**: Standard Weight (g/kg) | Observed Reading (g/kg) | Error | Status
- **Rows**: Minimum 5 mandatory test points based on instrument capacity (e.g., 0.5kg, 1kg, 2kg, 5kg, 10kg).
- **Interactions**:
  - Officer taps the "Observed" field (Numeric keypad opens).
  - Inputs reading.
- **Auto-Calculation Logic**:
  - `Error = Observed Reading - Standard Weight`
  - `Tolerance Limit`: Pulled from local DB based on instrument class.
  - `Status Indicator`:
    - If `|Error| <= Tolerance`: ✅ Green icon, text "PASS".
    - If `|Error| > Tolerance`: ❌ Red icon, text "FAIL".

#### Evidence Section (Photos)
- **Component**: Grid of 4 required photo slots.
  1. Serial Number Plate
  2. Display Screen (showing zero or weight)
  3. Verification Seal (old or new)
  4. Overall View of the Instrument
- **Interaction**:
  - Tapping a slot opens the native camera (via HTML5 MediaDevices API `capture="environment"`).
  - After capture: Shows a small square thumbnail (80x80px).
  - Includes a small "X" or "Retake" button on the thumbnail.
- **Offline Behavior**: Blobs are converted and saved instantly to `photos_blobs` IndexedDB table.

#### GPS Location Capture
- **Component**: "Capture Location" button with a map pin icon.
- **Behavior**: Auto-triggers on form load. If it fails, the user can manually tap to retry.
- **Validation**: Saves Lat/Lng accuracy radius.

#### Notes Section
- **Component**: Textarea, 4 rows, label "Inspection Remarks (Optional)".

#### Action Buttons (Sticky Bottom)
- Fixed at the bottom of the viewport so they are always accessible.
- **FAIL Button**: Red background (`#E74C3C`), left half, text "MARK FAILED".
- **PASS Button**: Green background (`#28B463`), right half, text "ISSUE CERTIFICATE".
- **Confirmation**: Tapping either triggers a full-screen confirmation modal to prevent accidental taps.

#### Auto-Save Mechanism
- Runs every 30 seconds.
- Serializes form state to IndexedDB (`draft_inspections` table).
- Shows a small transient toast: "Draft saved locally."

### 3.6 Sync Status (`/app/sync`)
- **Header**: "Sync Status".
- **UI Components**:
  - Network Status Indicator (Online/Offline).
  - Sync Queue List: Shows all items in `pending_syncs`.
  - Item Statuses: `🔄 Pending` | `✅ Synced` | `❌ Failed`.
  - Primary CTA: "Sync Now" (Disabled if offline).
  - Error logs expandable section for failed syncs.

### 3.7 Officer Profile (`/app/profile`)
- **Header**: "Profile".
- **UI Components**:
  - Officer details (Name, Badge No, Zone).
  - App Version Info.
  - "Clear Local Data" (Red button, protected by warning modal).
  - "Logout" (Only allowed if sync queue is empty).

---

## 4. Offline Architecture

### 4.1 Local Database (IndexedDB via Dexie.js)
The app utilizes Dexie.js to manage IndexedDB cleanly.

**Database Schema Definition:**
```javascript
const db = new Dexie('MapanSetuOfflineDB');

db.version(1).stores({
  // Master data synced down to the device
  assigned_inspections: 'appId, date, status, businessName',
  instrument_metadata: 'instrumentId, type, class, toleranceLimits',
  
  // Data generated on the device
  draft_inspections: 'appId, lastUpdated, payload',
  pending_syncs: 'syncId, appId, timestamp, status, retryCount',
  
  // Heavy blob storage separate to prevent main table blocking
  photos_blobs: 'photoId, syncId, tag, base64Data'
});
```

### 4.2 Service Worker Strategy (Workbox)
- **Static Assets (HTML, CSS, JS, Fonts, Icons)**: `CacheFirst` strategy. These are precached during the installation phase.
- **API GET Requests (e.g., fetching assignments)**: `NetworkFirst` strategy with fallback to `CacheFirst`.
- **API POST Requests (e.g., submitting forms)**: Background Sync API integration. Intercepted when offline and pushed to `pending_syncs`.

### 4.3 Data Pre-caching
When the officer logs in and goes online, the app triggers a `syncDown()` routine:
1. Fetch assigned inspections for `[Today, Today + 7 days]`.
2. Fetch tolerance thresholds and instrument master data required for those specific assignments.
3. Write to `assigned_inspections` table.

### 4.4 Sync Trigger Lifecycle
- The app listens to `window.addEventListener('online', triggerSync)`.
- When triggered, a background Web Worker (or main thread async function if Web Workers are restricted) processes the `pending_syncs` table one by one.

---

## 5. Camera & Photo Handling

Mobile browsers have specific constraints regarding cameras and storage.
- **API**: Standard `<input type="file" accept="image/*" capture="environment" />` provides the most stable native camera integration across iOS/Android PWAs without complex permission layers.
- **Processing**:
  1. Image is loaded into a `<canvas>`.
  2. Resized to a maximum dimension of 1024x1024.
  3. Quality reduced (`canvas.toDataURL('image/jpeg', 0.7)`).
  4. **Target Size**: < 800KB per image.
- **Storage**: The resulting Base64 string is stored in the `photos_blobs` Dexie table. Base64 is used over Blobs to prevent complex cross-browser IndexedDB Blob reference issues (especially on older Safari).
- **Upload**: During background sync, the Base64 is converted back to a Blob and appended to a `FormData` object for standard HTTP multipart upload.

---

## 6. QR Scanner Integration

- **Purpose**: Verify existing MapanSetu certificates stuck on shop walls.
- **Library**: `html5-qrcode` (optimized for PWA).
- **Flow**:
  1. User taps "Scan QR" on Bottom Nav.
  2. Full-screen camera view opens (requires camera permissions).
  3. Scans URL/ID.
  4. If online: Fetches live certificate status.
  5. If offline: Checks local database (if previously cached), else displays "Cannot verify live status offline, showing decoded ID: XYZ".

---

## 7. Install as PWA

### 7.1 Web App Manifest (`manifest.json`)
```json
{
  "name": "MapanSetu Field Officer",
  "short_name": "MapanSetu",
  "description": "Offline-first field inspection app for Legal Metrology.",
  "start_url": "/app/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2E86C1",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512x512-mask.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 7.2 Install Prompt
- A custom "Install App" banner should appear on the Dashboard if `window.matchMedia('(display-mode: standalone)').matches` is false.
- Handles the `beforeinstallprompt` event to trigger the native installation dialog programmatically.

---

## 8. Sync Protocol

### 8.1 Background Sync API
Utilizes the Service Worker Background Sync API where supported (Chrome/Android).
```javascript
// In App.js
navigator.serviceWorker.ready.then(swRegistration => {
  return swRegistration.sync.register('mapansetu-sync');
});
```

### 8.2 Fallback Mechanism
Since iOS Safari does not fully support Background Sync API, the app includes a foreground sync manager that runs in `useEffect` on the root layout whenever `navigator.onLine` evaluates to true.

### 8.3 Payload Structure
```json
{
  "inspectionId": "APP-2023-89312",
  "officerId": "OFF-4412",
  "timestamp": "2023-10-27T10:30:00Z",
  "gps": {
    "lat": 28.6139,
    "lng": 77.2090,
    "accuracy": 15.2
  },
  "readings": [
    { "standard": 500, "observed": 501, "error": 1, "status": "PASS" },
    { "standard": 1000, "observed": 1002, "error": 2, "status": "PASS" }
  ],
  "result": "PASS",
  "remarks": "Weights are well maintained."
  // Photos are attached via FormData, not JSON
}
```

### 8.4 Error Handling
- **400 Bad Request**: Marks sync as `FAILED` (Terminal error). Requires manual officer intervention.
- **500 Server Error / Timeout**: Increments `retryCount`. Automatically retries up to 5 times with exponential backoff.
- **Partial Success**: Transactions must be atomic on the server. If photo upload fails but data succeeds, the server rolls back, and the client retries the whole package.

---

## 9. Design System for Mobile

### 9.1 Colors
- **Brand Primary**: Blue `#2E86C1` (Header, Active Tabs, Main actions)
- **Background**: Light Gray `#F8F9F9` (Reduces eye strain compared to pure white)
- **Surface**: White `#FFFFFF` (Cards, Forms)
- **Success/Pass**: Green `#28B463`
- **Danger/Fail**: Red `#E74C3C`
- **Warning/Draft**: Orange `#F39C12`
- **Text Primary**: Dark `#1C2833`
- **Text Secondary**: Gray `#7F8C8D`

### 9.2 Typography
- **Font**: Inter (sans-serif), optimized for legibility.
- **Headers**: 20px, Semi-Bold.
- **Body Text**: 16px, Regular (Prevents iOS Safari from auto-zooming on inputs).
- **Small Text**: 12px, Regular (Meta data, timestamps).

### 9.3 Form UI Rules
- All `<input>` tags must have descriptive `autocomplete` attributes.
- Numeric keypads must be invoked via `type="number" pattern="[0-9]*" inputmode="decimal"`.
- Focus states must have a clear 2px blue ring.
- Error states must outline the input in red and provide a 12px red error message below the input.

---

## 10. Notification Strategy

### 10.1 Web Push Notifications (Online)
- Prompt for push notification permission on first dashboard load.
- Receive server-side payloads when new assignments are added to the officer's queue mid-day.
- Shows standard system tray notification.

### 10.2 Local Notifications (Service Worker)
- Used to inform the user about background task completion.
- When background sync completes successfully, the Service Worker triggers a local notification: *"All pending inspections have been synced successfully."*
- Alerts user if a sync fails repeatedly: *"Action required: 2 inspections failed to upload."*
