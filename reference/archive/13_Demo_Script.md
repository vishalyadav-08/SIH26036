# MapanSetu — 5-Minute Demo Script

> Use this for the SIH hackathon presentation. Practice this flow 3 times before demo day.

---

## Setup Before Demo
- [ ] Pre-seed database with Sharma General Store account + pre-existing instrument history (2025 logs)
- [ ] Open 3 browser tabs: Business login, Officer login, Public verifier
- [ ] Open Field App PWA on a mobile device (or browser mobile emulation)
- [ ] Enable camera on mobile for photo capture
- [ ] Have a physical QR code printout ready as backup

---

## Demo Flow (5 Minutes)

### Minute 0:30 — Set the Scene
> "Every weighing instrument used in a shop must be legally verified by the government. Today this process is paper-based and inefficient. We built MapanSetu — a complete digital lifecycle platform for every weighing instrument in India."

---

### Minute 0:30–1:30 — Business Side

**Action 1: Login as Sharma General Store**
- Navigate to `mapansetu.gov.in/login`
- Login: `sharma@store.com` / `Demo@1234`
- Show dashboard: "4 instruments registered, 1 pending verification"

**Action 2: Show existing instrument**
- Click on `WM-UP-GKP-00123`
- Show the Digital Instrument Passport timeline:
  - ✓ 2025: Registered
  - ✓ 2025: Verified (by LMO Rajesh Kumar)
  - ✓ 2025: Certificate Issued: LM-UP-2025-00045
  - ✓ 2026: Re-verification Application Submitted
  - ⚠ 2027: Expiring Soon

> "Every instrument has a permanent digital history — like a vehicle RC book, but for weighing machines."

**Action 3: Submit new application**
- Click "Apply for Verification" for a new instrument
- Show the simple form
- Submit → status: PENDING

---

### Minute 1:30–2:30 — Admin Assigns LMO

**Action 4: Admin dashboard** (switch to admin tab)
- Show new application in queue
- Assign to "LMO Rajesh Kumar"
- Status changes to ASSIGNED

---

### Minute 2:30–4:00 — Officer Field App

**Action 5: Open Field App on mobile**
- Login as `rajesh.lmo@up.gov.in`
- Show today's queue: 1 assigned inspection

**Action 6: Simulate going offline**
- Enable airplane mode on the mobile device
- Show the orange "Offline Mode" banner

**Action 7: Start inspection**
- Open the assigned inspection
- Show instrument details auto-loaded

**Action 8: Enter readings**
- Fill in the readings table:
  | Standard | Observed | Error |
  |---|---|---|
  | 1 kg | 1.002 kg | +0.002 ✅ |
  | 5 kg | 5.004 kg | +0.004 ✅ |
  | 10 kg | 10.006 kg | +0.006 ✅ |

**Action 9: Upload photo**
- Tap "Take Photo"
- Capture the machine
- Label: "Overall View"
- Show thumbnail preview

**Action 10: PASS**
- Tap green PASS button
- Show "Saved offline. Will sync when online."

**Action 11: Come back online**
- Disable airplane mode
- Show sync notification: "✅ 1 inspection synced successfully"

---

### Minute 4:00–4:30 — Certificate & QR

**Back on web app (Business tab)**

**Action 12: Certificate generated**
- Refresh business dashboard
- Navigate to Certificates
- Show: `Certificate LM-UP-2026-00123` — ACTIVE
- Show the QR code

**Action 13: Scan QR**
- Open camera / QR scanner
- Scan the QR code
- Show public verification page:

```
✅ CERTIFICATE VALID

Instrument: WM-UP-GKP-00123
Owner: Sharma General Store
Verified: 28 Aug 2026
Valid Until: 27 Aug 2027
Verified By: LMO Rajesh Kumar, Gorakhpur
```

---

### Minute 4:30–5:00 — Close

> "MapanSetu gives every weighing instrument in India a tamper-proof digital identity. Businesses apply online, officers inspect digitally even offline, certificates are cryptographically signed, and anyone can verify authenticity by scanning a QR code."

> "This eliminates fake certificates, reduces paperwork, and creates a complete audit trail for regulators — all in compliance with the Legal Metrology Act."

---

## Backup: If Live Demo Fails
- Use pre-recorded screen recording (record this exact flow beforehand)
- Have static screenshots in a PDF as final fallback
