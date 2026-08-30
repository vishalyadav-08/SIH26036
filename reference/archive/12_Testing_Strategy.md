# MapanSetu — Testing Strategy

## 1. Testing Pyramid

```
         /\
        /  \  E2E Tests (Playwright)
       /    \  - Full demo flow test
      /------\
     /        \ Integration Tests (Supertest)
    /          \  - API endpoint tests
   /------------\
  /              \ Unit Tests (Jest/Vitest)
 / (most tests)   \  - Crypto functions, validators, utils
/------------------\
```

---

## 2. Unit Tests

### Backend Unit Tests (Jest + ts-jest)

#### Cryptography Module
```typescript
// tests/unit/crypto.test.ts
describe('Certificate Crypto', () => {
  it('should generate a valid RSA signature for certificate payload', () => {
    const payload = { certNo: 'LM-UP-2026-00123', instrumentId: 'WM-UP-GKP-00123' };
    const { signature, hash } = signCertificate(payload);
    expect(signature).toBeDefined();
    expect(verifyCertificate(payload, signature)).toBe(true);
  });

  it('should fail verification if payload is tampered', () => {
    const payload = { certNo: 'LM-UP-2026-00123', instrumentId: 'WM-UP-GKP-00123' };
    const { signature } = signCertificate(payload);
    const tampered = { ...payload, instrumentId: 'FAKE-ID' };
    expect(verifyCertificate(tampered, signature)).toBe(false);
  });
});
```

#### Hash Chain (Passport Logs)
```typescript
describe('Passport Hash Chain', () => {
  it('should generate consistent hash for same input', () => {
    const hash = computePassportHash('prev_hash', { action: 'REGISTERED' }, '2026-08-28');
    const hash2 = computePassportHash('prev_hash', { action: 'REGISTERED' }, '2026-08-28');
    expect(hash).toBe(hash2);
  });

  it('should produce different hashes for different inputs', () => {
    const h1 = computePassportHash('hash1', { action: 'REGISTERED' }, '2026-08-28');
    const h2 = computePassportHash('hash2', { action: 'REGISTERED' }, '2026-08-28');
    expect(h1).not.toBe(h2);
  });
});
```

#### Inspection Error Calculation
```typescript
describe('Readings Error Calculation', () => {
  it('calculates error correctly', () => {
    expect(calculateError(5.000, 5.002)).toBeCloseTo(0.002);
  });

  it('determines PASS when all errors within tolerance', () => {
    const readings = [
      { standard: 1, observed: 1.001 },
      { standard: 5, observed: 5.003 },
    ];
    expect(determineResult(readings, TOLERANCE_MAP)).toBe('PASS');
  });
});
```

### Frontend Unit Tests (Vitest)
- StatusBadge renders correct color per status
- PassportTimeline renders correct number of events
- OfflineBanner shows/hides correctly
- Reading error calculation in InspectionForm

---

## 3. Integration Tests (Supertest + Jest)

### Auth Flow
```typescript
describe('POST /api/v1/auth/login', () => {
  it('returns JWT on valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 'test@business.com', password: 'Test@1234' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email: 'test@business.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
```

### Instrument Registration
```typescript
describe('POST /api/v1/instruments', () => {
  it('creates instrument and generates unique code', async () => {
    const res = await request(app)
      .post('/api/v1/instruments')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ category: 'Electronic Weighing Scale', manufacturer: 'ABC', ... });
    expect(res.status).toBe(201);
    expect(res.body.data.instrument_code).toMatch(/^WM-/);
  });
});
```

### Offline Sync Endpoint
```typescript
describe('POST /api/v1/inspections/sync', () => {
  it('processes batch inspection and generates certificate on PASS', async () => {
    const res = await request(app)
      .post('/api/v1/inspections/sync')
      .set('Authorization', `Bearer ${lmoToken}`)
      .send({ inspections: [mockInspectionPayload] });
    expect(res.status).toBe(200);
    expect(res.body.data.processed[0].certificate_no).toBeDefined();
  });

  it('is idempotent — duplicate sync does not create duplicate certificate', async () => {
    await request(app).post('/api/v1/inspections/sync')
      .set('Authorization', `Bearer ${lmoToken}`)
      .send({ inspections: [{ ...mockPayload, local_id: 'abc-123' }] });
    const res2 = await request(app).post('/api/v1/inspections/sync')
      .set('Authorization', `Bearer ${lmoToken}`)
      .send({ inspections: [{ ...mockPayload, local_id: 'abc-123' }] });
    expect(res2.body.data.processed[0].already_synced).toBe(true);
  });
});
```

---

## 4. End-to-End Tests (Playwright)

### Full Demo Flow Test
```typescript
// tests/e2e/demo-flow.spec.ts
test('complete instrument verification flow', async ({ page }) => {
  // 1. Business registers instrument
  await page.goto('/login');
  await page.fill('[name=email]', 'sharma@store.com');
  await page.fill('[name=password]', 'Demo@1234');
  await page.click('[data-testid=login-btn]');
  
  await page.goto('/business/instruments/new');
  // ... fill form
  await expect(page.locator('[data-testid=instrument-code]')).toContainText('WM-');

  // 2. Submit application
  await page.goto('/business/applications/new');
  // ... 

  // 3. Admin assigns LMO (admin login)
  // ...

  // 4. API call to simulate offline inspection sync
  // (Field app tested separately via API)
  await request.post('/api/v1/inspections/sync', { data: mockInspection });

  // 5. Verify certificate appears on business dashboard
  await page.goto('/business/certificates');
  await expect(page.locator('[data-testid=cert-status]')).toContainText('ACTIVE');

  // 6. Public QR verification
  await page.goto('/verify?certNo=LM-UP-2026-00123');
  await expect(page.locator('[data-testid=verify-result]')).toContainText('CERTIFICATE VALID');
});
```

### Digital Instrument Passport E2E
```typescript
test('shows instrument passport timeline', async ({ page }) => {
  await loginAs(page, 'business');
  await page.goto('/business/instruments/WM-UP-GKP-00123');
  
  const timeline = page.locator('[data-testid=passport-timeline]');
  await expect(timeline.locator('[data-testid=passport-event]')).toHaveCount(5);
  await expect(timeline).toContainText('Registered');
  await expect(timeline).toContainText('Certificate Issued');
  await expect(timeline).toContainText('Expiring Soon');
});
```

---

## 5. Security Testing

| Test | Tool | What to Check |
|---|---|---|
| JWT token manipulation | Manual | Modified JWT payload should be rejected |
| SQL injection | OWASP ZAP | All API inputs sanitized |
| Business data isolation | Manual | Business A cannot access Business B's instruments |
| LMO data isolation | Manual | LMO can only access their assigned apps |
| Public endpoint safety | Manual | `/verify` endpoint returns no PII |
| Certificate tampering | Unit test | Modified cert payload fails signature verification |
| Rate limiting | Artillery | `/api/v1/auth/login` blocked after 10 failed attempts |

---

## 6. Performance Testing

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run tests/performance/api-load-test.yml
```

```yaml
# tests/performance/api-load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 50  # 50 virtual users/second
scenarios:
  - flow:
      - get:
          url: '/api/v1/verify?certNo=LM-UP-2026-00123'
```

Target: `GET /verify` must handle 50 req/s with < 200ms p95 latency.

---

## 7. PWA Offline Testing

Manual test checklist:
- [ ] Login while online, then disable network in DevTools
- [ ] Offline banner appears
- [ ] Assigned inspections still visible from IndexedDB cache
- [ ] Inspection form works completely offline
- [ ] Photo capture works offline
- [ ] Save works offline (saved to IndexedDB)
- [ ] Re-enable network → sync triggers automatically
- [ ] Certificate appears after sync

---

## 8. Demo Day Smoke Test (Run 30 min before demo)

```bash
# scripts/smoke-test.sh
curl -f http://localhost:3000/health && echo "API OK"
curl -f http://localhost:5173 && echo "Web OK"
curl -f http://localhost:5174 && echo "Field App OK"
curl -f "http://localhost:3000/api/v1/certificates/verify?certNo=LM-UP-2026-DEMO" | grep "VALID"
echo "All systems OK. Ready for demo."
```
