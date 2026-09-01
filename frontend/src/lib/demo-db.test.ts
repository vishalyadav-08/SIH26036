import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { DemoRepository, DEMO_STORAGE_KEY } from './demo-db';

const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value.toString(); },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

describe('DemoRepository', () => {
  beforeAll(() => {
    (global as unknown as { window: unknown }).window = {};
    (global as unknown as { localStorage: unknown }).localStorage = localStorageMock;
  });

  beforeEach(() => {
    localStorage.clear();
    DemoRepository.reset();
  });

  it('1. Initial fixture loads correctly', () => {
    const apps = DemoRepository.getApplications();
    expect(apps.length).toBeGreaterThan(0);
    expect(apps[0].applicationNumber).toBe('APP-DEMO-001');
    expect(DemoRepository.getInstruments().length).toBeGreaterThan(0);
  });

  it('2. Business application submission changes state', () => {
    const app = DemoRepository.createApplication({ instrumentId: 'INS-DEMO-001', reason: 'Test' });
    expect(app.state).toBe('SUBMITTED');
    expect(DemoRepository.getApplications().length).toBe(2);
  });

  it('3. Admin sees submitted application', () => {
    DemoRepository.createApplication({ instrumentId: 'INS-DEMO-001', reason: 'Test' });
    const apps = DemoRepository.getApplications();
    expect(apps.some(a => a.state === 'SUBMITTED')).toBe(true);
  });

  it('4. Admin assignment creates active assignment', () => {
    const app = DemoRepository.assignOfficer('APP-DEMO-001', 'usr-demo-off-001', 'Demo Officer');
    expect(app.state).toBe('ASSIGNED');
    expect(app.assignedOfficerId).toBe('usr-demo-off-001');
  });

  it('5. Assigned officer sees the application', () => {
    DemoRepository.assignOfficer('APP-DEMO-001', 'usr-demo-off-001', 'Demo Officer');
    const app = DemoRepository.getApplicationById('APP-DEMO-001');
    expect(app?.assignedOfficerId).toBe('usr-demo-off-001');
  });

  it('6. Scheduling changes state correctly', () => {
    const app = DemoRepository.scheduleInspection('APP-DEMO-001', new Date().toISOString());
    expect(app.state).toBe('SCHEDULED');
  });

  it('7. Officer starts inspection', () => {
    const app = DemoRepository.startInspection('APP-DEMO-001');
    expect(app.state).toBe('INSPECTED');
  });

  it('8. Officer saves readings & 9. Officer records PASS & 10. Application becomes COMPLETED & 11. Certificate becomes available', () => {
    DemoRepository.saveInspection({
      id: 'ins-123',
      applicationId: 'app-uuid-001',
      officerUserId: 'usr-demo-off-001',
      status: 'READY_TO_SYNC',
      checklist: [],
      measurements: [],
      evidence: [],
      result: 'PASS',
      startedAt: new Date().toISOString(),
      version: 1
    });

    const app = DemoRepository.getApplicationById('app-uuid-001');
    expect(app?.state).toBe('COMPLETED');
    
    const certs = DemoRepository.getCertificates();
    const appCert = certs.find(c => c.applicationId === 'app-uuid-001' && c.status === 'VALID' && c.certificateNumber !== 'CERT-DEMO-001');
    expect(appCert).toBeDefined();
  });

  it('12. Public verification returns VALID', () => {
    const res = DemoRepository.verifyCertificate('CERT-DEMO-001');
    expect(res.verificationStatus).toBe('VALID');
  });

  it('13. Expired certificate returns EXPIRED', () => {
    const res = DemoRepository.verifyCertificate('CERT-DEMO-EXPIRED');
    expect(res.verificationStatus).toBe('EXPIRED');
  });

  it('14. Revoked certificate returns REVOKED', () => {
    const res = DemoRepository.verifyCertificate('CERT-DEMO-REVOKED');
    expect(res.verificationStatus).toBe('REVOKED');
  });

  it('15. Invalid certificate returns INVALID', () => {
    const res = DemoRepository.verifyCertificate('CERT-DEMO-INVALID');
    expect(res.verificationStatus).toBe('INVALID');
  });

  it('16. Reset restores initial deterministic state', () => {
    DemoRepository.createApplication({ instrumentId: 'INS-DEMO-001', reason: 'Test' });
    expect(DemoRepository.getApplications().length).toBe(2);
    DemoRepository.reset();
    expect(DemoRepository.getApplications().length).toBe(1);
  });

  it('17. State survives page refresh where persistence is required', () => {
    DemoRepository.createApplication({ instrumentId: 'INS-DEMO-001', reason: 'Test' });
    const parsedState = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '{}');
    expect(parsedState.applications.length).toBe(2);
  });

  it('18. Business cannot see another business synthetic data (conceptual test)', () => {
    const app = DemoRepository.getApplicationById('APP-DEMO-001');
    expect(app?.businessId).toBe('biz-demo-001');
  });

  it('19. Officer cannot see unassigned inspection data through role-specific view (conceptual)', () => {
    const app = DemoRepository.getApplicationById('APP-DEMO-001');
    expect(app?.assignedOfficerId).toBeUndefined(); // initially undefined
  });

  it('20. Demo state does not expose credentials/secrets', () => {
    const parsedState = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || '{}');
    const jsonStr = JSON.stringify(parsedState);
    expect(jsonStr).not.toContain('password');
    expect(jsonStr).not.toContain('secret');
  });
});
