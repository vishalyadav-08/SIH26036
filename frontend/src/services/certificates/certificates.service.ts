import { USE_MOCK_API, api } from "@/lib/api";
import {
  Certificate,
  RevokeCertificateDto,
  PublicVerificationResponse,
} from "@/types/certificate";

const CERTS_STORAGE_KEY = "mapansetu_certificates_store";

export const INITIAL_DEMO_CERTIFICATES: Certificate[] = [
  {
    id: "cert-001",
    certificateNumber: "CERT-DEMO-001",
    applicationId: "app-001",
    applicationNumber: "APP-2026-0001",
    instrumentId: "ins-001",
    instrumentNumber: "INS-DEMO-001",
    instrumentType: "ELECTRONIC_SCALE",
    businessId: "biz-demo-001",
    businessName: "Demo Business Owner",
    status: "VALID",
    issuedAt: "2026-08-15T10:00:00Z",
    validUntil: "2027-08-15T23:59:59Z",
    payloadHash: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
    signatureAlgorithm: "RSA-PSS/SHA-256",
    pdfObjectKey: "certificates/2026/CERT-DEMO-001.pdf",
    qrVerificationUrl: "http://localhost:3000/verify/CERT-DEMO-001",
    issuerOfficerName: "Inspector Sharma (LMO)",
  },
  {
    id: "cert-002",
    certificateNumber: "CERT-EXPIRED-001",
    applicationId: "app-exp-001",
    applicationNumber: "APP-2025-0089",
    instrumentId: "ins-002",
    instrumentNumber: "INS-DEMO-002",
    instrumentType: "PLATFORM_SCALE",
    businessId: "biz-demo-001",
    businessName: "Demo Business Owner",
    status: "EXPIRED",
    issuedAt: "2025-08-01T10:00:00Z",
    validUntil: "2026-08-01T23:59:59Z",
    payloadHash: "b2c3d4e5f6a17890123456789abcdef0123456789abcdef0123456789abcdef1",
    signatureAlgorithm: "RSA-PSS/SHA-256",
    pdfObjectKey: "certificates/2025/CERT-EXPIRED-001.pdf",
    qrVerificationUrl: "http://localhost:3000/verify/CERT-EXPIRED-001",
    issuerOfficerName: "Inspector Verma (LMO)",
  },
  {
    id: "cert-003",
    certificateNumber: "CERT-REVOKED-001",
    applicationId: "app-rev-001",
    applicationNumber: "APP-2026-0044",
    instrumentId: "ins-003",
    instrumentNumber: "INS-DEMO-003",
    instrumentType: "COUNTER_SCALE",
    businessId: "biz-demo-002",
    businessName: "City Mart Wholesale",
    status: "REVOKED",
    issuedAt: "2026-06-01T10:00:00Z",
    validUntil: "2027-06-01T23:59:59Z",
    revokedAt: "2026-07-15T14:30:00Z",
    revocationReason: "Physical inspection detected broken lead verification seal and unauthorized calibration modification.",
    payloadHash: "c3d4e5f6a1b27890123456789abcdef0123456789abcdef0123456789abcdef2",
    signatureAlgorithm: "RSA-PSS/SHA-256",
    pdfObjectKey: "certificates/2026/CERT-REVOKED-001.pdf",
    qrVerificationUrl: "http://localhost:3000/verify/CERT-REVOKED-001",
    issuerOfficerName: "Inspector Sharma (LMO)",
  },
];

function getStoredCertificates(): Certificate[] {
  if (typeof window === "undefined") return INITIAL_DEMO_CERTIFICATES;
  const raw = localStorage.getItem(CERTS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CERTIFICATES));
    return INITIAL_DEMO_CERTIFICATES;
  }
  try {
    return JSON.parse(raw) as Certificate[];
  } catch {
    return INITIAL_DEMO_CERTIFICATES;
  }
}

function saveStoredCertificates(certs: Certificate[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(certs));
}

// ----------------------------------------------------------------------------
// PRIMARY EXPORTS (Switching logic)
// ----------------------------------------------------------------------------

export async function getCertificates(): Promise<Certificate[]> {
  if (USE_MOCK_API) return getStoredCertificates();
  
  const res = await api.get<{ items: Certificate[] }>("/certificates");
  return res.items || res as unknown as Certificate[];
}

export async function getCertificateById(id: string): Promise<Certificate | null> {
  if (USE_MOCK_API) {
    const certs = getStoredCertificates();
    return certs.find(
      (c) => c.id === id || c.certificateNumber.toLowerCase() === id.toLowerCase()
    ) || null;
  }

  try {
    const res = await api.get<Certificate>(`/certificates/${id}`);
    return res as unknown as Certificate;
  } catch {
    return null;
  }
}

export async function revokeCertificate(
  id: string,
  dto: RevokeCertificateDto
): Promise<Certificate> {
  if (USE_MOCK_API) {
    const current = getStoredCertificates();
    const index = current.findIndex(
      (c) => c.id === id || c.certificateNumber.toLowerCase() === id.toLowerCase()
    );
    if (index >= 0) {
      current[index].status = "REVOKED";
      current[index].revokedAt = new Date().toISOString();
      current[index].revocationReason = dto.reason;
      saveStoredCertificates(current);
      return current[index];
    }
    throw new Error("Certificate not found");
  }

  const res = await api.post<Certificate>(`/certificates/${id}/revoke`, {
    reason: dto.reason,
    clientOperationId: `op-${Date.now()}`
  });
  return res as unknown as Certificate;
}

export interface SampleCertificate {
  certificateNumber: string;
  status: string;
  instrumentNumber: string;
  instrumentType: string;
}

export async function getSampleCertificates(): Promise<SampleCertificate[]> {
  try {
    const res = await api.get<SampleCertificate[]>("/certificates/samples");
    if (Array.isArray(res) && res.length > 0) {
      return res;
    }
  } catch {
    // Fallback if backend is restarting or unreachable
  }
  return [
    {
      certificateNumber: "CERT-DEMO-0002",
      status: "ACTIVE",
      instrumentNumber: "INS-DEMO-003",
      instrumentType: "MEASURING_TAPE",
    },
    {
      certificateNumber: "CERT-DEMO-0001",
      status: "REVOKED",
      instrumentNumber: "INS-DEMO-002",
      instrumentType: "PLATFORM_SCALE",
    },
  ];
}

export async function verifyPublicCertificate(
  certNo: string
): Promise<PublicVerificationResponse> {
  // Always query the live backend API for authentic cryptographic verification
  try {
    const res = await api.get<PublicVerificationResponse>(
      `/certificates/verify?certNo=${encodeURIComponent(certNo.trim())}`
    );
    return res as unknown as PublicVerificationResponse;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "verificationStatus" in err) {
      return err as PublicVerificationResponse;
    }
    throw err;
  }
}
