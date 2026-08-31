# MapanSetu — Design System

> All components across Web App and Field App must follow this system.
> Framework: Tailwind CSS + custom config + Shadcn/UI primitives.

---

## 1. Color Palette

### Brand Colors
| Name | Hex | Tailwind Custom | Usage |
|---|---|---|---|
| Primary Dark | `#1B4F72` | `primary-dark` | Headers, nav, primary buttons |
| Primary | `#2E86C1` | `primary` | Links, accents, active states |
| Primary Light | `#AED6F1` | `primary-light` | Hover backgrounds, badges |

### Semantic Colors
| Name | Hex | Tailwind | Usage |
|---|---|---|---|
| Success | `#28B463` | `success` | PASS, VERIFIED, ACTIVE badges |
| Warning | `#F39C12` | `warning` | EXPIRING_SOON, PENDING badges |
| Danger | `#E74C3C` | `danger` | FAIL, EXPIRED, REVOKED badges |
| Info | `#2E86C1` | `info` | ASSIGNED, INSPECTED badges |

### Neutral Colors
| Name | Hex | Tailwind | Usage |
|---|---|---|---|
| Background | `#F4F6F8` | `bg-base` | Page background |
| Card BG | `#FFFFFF` | `bg-card` | Cards, modals |
| Border | `#D5DBDB` | `border-base` | Card borders, dividers |
| Text Primary | `#1A202C` | `text-primary` | Headings, body |
| Text Secondary | `#718096` | `text-secondary` | Subtext, captions |
| Text Disabled | `#A0AEC0` | `text-disabled` | Disabled labels |

### Tailwind Config Extension
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E86C1',
          dark: '#1B4F72',
          light: '#AED6F1',
        },
        success: '#28B463',
        warning: '#F39C12',
        danger: '#E74C3C',
        info: '#2E86C1',
        'bg-base': '#F4F6F8',
        'bg-card': '#FFFFFF',
        'border-base': '#D5DBDB',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    }
  }
}
```

---

## 2. Typography

| Element | Font | Size | Weight | Color |
|---|---|---|---|---|
| Page Title (H1) | Inter | 24px / 1.5rem | 700 Bold | `#1A202C` |
| Section Title (H2) | Inter | 20px / 1.25rem | 600 SemiBold | `#1A202C` |
| Card Title (H3) | Inter | 16px / 1rem | 600 SemiBold | `#1A202C` |
| Body Text | Inter | 14px / 0.875rem | 400 Regular | `#1A202C` |
| Small Text | Inter | 12px / 0.75rem | 400 Regular | `#718096` |
| Caption | Inter | 11px / 0.688rem | 400 Regular | `#A0AEC0` |
| Button Text | Inter | 14px / 0.875rem | 500 Medium | White or Primary |
| Form Label | Inter | 13px / 0.813rem | 500 Medium | `#4A5568` |
| Form Input | Inter | 14px / 0.875rem | 400 Regular | `#1A202C` |
| Code/ID | JetBrains Mono | 13px | 400 Regular | `#2E86C1` |

---

## 3. Status Badge Designs

All badges: `rounded-full`, `px-2.5 py-0.5`, `text-xs font-medium`, uppercase

| Status | Background | Text | Usage |
|---|---|---|---|
| `PENDING` | `#FEF3C7` | `#D97706` | Application awaiting assignment |
| `ASSIGNED` | `#DBEAFE` | `#1D4ED8` | LMO has been assigned |
| `INSPECTED` | `#E0E7FF` | `#4338CA` | Inspection done, cert pending |
| `COMPLETED` | `#D1FAE5` | `#065F46` | Application fully processed |
| `PASS` | `#D1FAE5` | `#065F46` | Inspection passed |
| `FAIL` | `#FEE2E2` | `#991B1B` | Inspection failed |
| `ACTIVE` | `#D1FAE5` | `#065F46` | Certificate currently valid |
| `EXPIRED` | `#FEE2E2` | `#991B1B` | Certificate expired |
| `EXPIRING_SOON` | `#FEF3C7` | `#D97706` | Expiring within 30 days |
| `UNVERIFIED` | `#F3F4F6` | `#6B7280` | Not yet verified |
| `VERIFIED` | `#D1FAE5` | `#065F46` | Currently verified |
| `SYNC_PENDING` | `#FEF3C7` | `#D97706` | PWA: not yet synced |

```tsx
// Component
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    ACTIVE: 'bg-green-100 text-green-700',
    EXPIRED: 'bg-red-100 text-red-700',
    EXPIRING_SOON: 'bg-orange-100 text-orange-700',
    PASS: 'bg-green-100 text-green-700',
    FAIL: 'bg-red-100 text-red-700',
    // ... etc
  }[status] ?? 'bg-gray-100 text-gray-600';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${config}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
```

---

## 4. Card Component

```tsx
// Standard Card
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
  {/* Content */}
</div>

// Stat Card
<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
  <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center">
    <Icon className="w-6 h-6 text-primary" />
  </div>
  <div>
    <p className="text-sm text-secondary">Total Instruments</p>
    <p className="text-2xl font-bold text-primary">1,248</p>
  </div>
</div>
```

### Stat Card Colors (Icon backgrounds)
| Type | Icon BG | Icon Color |
|---|---|---|
| Total | `#EFF6FF` | `#2E86C1` |
| Success | `#F0FDF4` | `#28B463` |
| Warning | `#FFFBEB` | `#F39C12` |
| Danger | `#FEF2F2` | `#E74C3C` |

---

## 5. Form Components

### Input Field
```html
<div class="space-y-1">
  <label class="text-sm font-medium text-gray-700">Serial Number</label>
  <input
    type="text"
    placeholder="e.g. AX12345"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm 
           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
           placeholder:text-gray-400"
  />
  <p class="text-xs text-gray-500">As printed on the manufacturer's plate</p>
</div>
```

### Select/Dropdown
Same styling as input, with a chevron icon.

### Form Validation States
- **Default:** `border-gray-300`
- **Focus:** `border-primary ring-2 ring-primary/20`
- **Error:** `border-danger ring-2 ring-danger/20` + error message in `text-danger text-xs` below
- **Success:** `border-success` after validation

---

## 6. Button System

| Variant | Class | Usage |
|---|---|---|
| Primary | `bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-lg font-medium text-sm` | Main actions |
| Secondary | `border border-primary text-primary hover:bg-primary-light px-4 py-2 rounded-lg` | Secondary actions |
| Danger | `bg-danger text-white hover:bg-red-700 px-4 py-2 rounded-lg` | FAIL, Delete |
| Success | `bg-success text-white hover:bg-green-700 px-4 py-2 rounded-lg` | PASS, Confirm |
| Ghost | `text-primary hover:bg-gray-100 px-4 py-2 rounded-lg` | Tertiary |
| Full Width | Add `w-full` | Mobile CTAs |
| Loading | Add `opacity-70 cursor-not-allowed` + spinner inside | During API calls |

```tsx
// Primary Button
<button className="bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm 
  hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
  flex items-center gap-2">
  {loading && <Spinner className="w-4 h-4 animate-spin" />}
  Submit Application
</button>
```

---

## 7. Table Design

```html
<div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-gray-50 border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Instrument ID
        </th>
        <!-- more columns -->
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      <tr class="hover:bg-gray-50 transition-colors cursor-pointer">
        <td class="px-4 py-3 font-mono text-primary text-xs">WM-UP-GKP-00123</td>
        <!-- more cells -->
      </tr>
    </tbody>
  </table>
</div>
```

---

## 8. Navigation

### Web App Sidebar (Desktop)
- Width: 256px (16rem)
- Background: `#1B4F72` (primary-dark)
- Logo area: 64px height, white text
- Nav items: `text-white/70 hover:text-white hover:bg-white/10`
- Active item: `bg-white/10 text-white font-medium`
- Icons: Lucide React (consistent 20x20px)

### Web App Top Header
- Height: 64px
- Background: White
- Border-bottom: `#E2E8F0`
- Contains: Page title, notification bell, user avatar dropdown

### Field App Bottom Navigation
- Height: 64px
- Background: White
- Shadow: `shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`
- 4 items: Dashboard, Inspections, Sync, Profile
- Icons: 24x24px, label text-xs
- Active: Primary color. Inactive: gray-400

---

## 9. Digital Instrument Passport Timeline

```tsx
// Timeline component
const PassportTimeline = ({ logs }) => (
  <div className="relative">
    {/* Vertical line */}
    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
    
    <div className="space-y-6">
      {logs.map(log => (
        <div key={log.id} className="flex gap-4 relative">
          {/* Icon circle */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 flex-shrink-0
            ${log.type === 'EXPIRING_SOON' ? 'bg-warning/20 border-2 border-warning' : 
              log.status === 'done' ? 'bg-success/20 border-2 border-success' : 
              'bg-gray-100 border-2 border-gray-300'}`}>
            {/* Icon based on type */}
          </div>
          
          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">{log.action_type}</p>
              <StatusBadge status={log.type === 'EXPIRING_SOON' ? 'EXPIRING_SOON' : 'COMPLETED'} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{formatDate(log.created_at)}</p>
            {log.officer_name && (
              <p className="text-xs text-gray-500">Officer: {log.officer_name}</p>
            )}
            {log.certificate_no && (
              <p className="text-xs font-mono text-primary mt-1">Cert: {log.certificate_no}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);
```

---

## 10. QR Code Display

```tsx
import QRCode from 'qrcode.react';

const CertificateQR = ({ certNo, verifyUrl }) => (
  <div className="flex flex-col items-center p-6 bg-white rounded-xl border-2 border-gray-200">
    <QRCode 
      value={verifyUrl}  // e.g., https://mapansetu.gov.in/verify?certNo=LM-UP-2026-00123
      size={200}
      level="H"         // High error correction
      includeMargin={true}
    />
    <p className="mt-3 font-mono text-xs text-gray-600">{certNo}</p>
    <p className="text-xs text-gray-400 mt-1">Scan to verify certificate</p>
  </div>
);
```

---

## 11. Loading & Empty States

### Loading Skeleton
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

### Empty State
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    <FileIcon className="w-8 h-8 text-gray-400" />
  </div>
  <p className="text-gray-600 font-medium">No instruments registered yet</p>
  <p className="text-gray-400 text-sm mt-1">Add your first instrument to get started</p>
  <Button className="mt-4">Register Instrument</Button>
</div>
```

---

## 12. Offline Indicator Banner (Field App)

```tsx
const OfflineBanner = ({ isOnline }) => 
  !isOnline ? (
    <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 flex items-center gap-2">
      <WifiOffIcon className="w-4 h-4 text-warning flex-shrink-0" />
      <p className="text-xs text-warning font-medium">
        Offline Mode — Changes will sync when connection is restored
      </p>
    </div>
  ) : null;
```
