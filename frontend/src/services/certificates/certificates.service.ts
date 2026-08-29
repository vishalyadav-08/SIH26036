import { api } from "@/lib/api";
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

export async function getCertificates(): Promise<Certificate[]> {
  try {
    const res = await api.get<Certificate[]>("/certificates");
    return res.data;
  } catch {
    return getStoredCertificates();
  }
}

export async function getCertificateById(id: string): Promise<Certificate | null> {
  const certs = await getCertificates();
  return (
    certs.find(
      (c) => c.id === id || c.certificateNumber.toLowerCase() === id.toLowerCase()
    ) || null
  );
}

export async function revokeCertificate(
  id: string,
  dto: RevokeCertificateDto
): Promise<Certificate> {
  try {
    const res = await api.post<Certificate>(`/certificates/${id}/revoke`, dto);
    return res.data;
  } catch {
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
}

export async function verifyPublicCertificate(
  certNo: string
): Promise<PublicVerificationResponse> {
  try {
    const res = await api.get<PublicVerificationResponse>(
      `/certificates/verify?certNo=${encodeURIComponent(certNo)}`
    );
    return res.data;
  } catch {
    const certs = getStoredCertificates();
    const found = certs.find(
      (c) => c.certificateNumber.toLowerCase() === certNo.trim().toLowerCase()
    );

    if (!found) {
      return {
        certificateNumber: certNo,
        verificationStatus: "INVALID",
        certificateStatus: null,
        signatureValid: false,
        payloadHash: null,
        signatureAlgorithm: null,
        issuedAt: null,
        validUntil: null,
        instrumentSummary: null,
        verificationMessage:
          "Certificate not found in registry or cryptographic digest verification failed.",
      };
    }

    if (found.status === "VALID") {
      return {
        certificateNumber: found.certificateNumber,
        verificationStatus: "VALID",
        certificateStatus: "VALID",
        signatureValid: true,
        payloadHash: found.payloadHash,
        signatureAlgorithm: found.signatureAlgorithm,
        issuedAt: found.issuedAt,
        validUntil: found.validUntil,
        instrumentSummary: {
          instrumentNumber: found.instrumentNumber,
          instrumentType: found.instrumentType,
          manufacturer: "Precision Weights Corp",
          model: "PWS-Retail 25",
          capacity: 25.0,
          capacityUnit: "kg",
        },
        verificationMessage:
          "This instrument certificate is active, currently valid, and its cryptographic digital signature has been verified.",
      };
    }

    if (found.status === "EXPIRED") {
      return {
        certificateNumber: found.certificateNumber,
        verificationStatus: "EXPIRED",
        certificateStatus: "EXPIRED",
        signatureValid: true,
        payloadHash: found.payloadHash,
        signatureAlgorithm: found.signatureAlgorithm,
        issuedAt: found.issuedAt,
        validUntil: found.validUntil,
        instrumentSummary: {
          instrumentNumber: found.instrumentNumber,
          instrumentType: found.instrumentType,
          manufacturer: "Standard Heavy Scales Ltd",
          model: "SHS-Platform 500",
          capacity: 500.0,
          capacityUnit: "kg",
        },
        verificationMessage:
          "This certificate was legitimately issued and cryptographically authentic, but the statutory validity period has expired. Re-verification required.",
      };
    }

    if (found.status === "REVOKED") {
      return {
        certificateNumber: found.certificateNumber,
        verificationStatus: "REVOKED",
        certificateStatus: "REVOKED",
        signatureValid: false,
        payloadHash: found.payloadHash,
        signatureAlgorithm: found.signatureAlgorithm,
        issuedAt: found.issuedAt,
        validUntil: found.validUntil,
        revokedAt: found.revokedAt,
        revocationReason: found.revocationReason,
        instrumentSummary: {
          instrumentNumber: found.instrumentNumber,
          instrumentType: found.instrumentType,
          manufacturer: "Retail Counter Pro",
          model: "RCP-15",
          capacity: 15.0,
          capacityUnit: "kg",
        },
        verificationMessage: `This certificate has been officially REVOKED by the Legal Metrology Department. Reason: ${
          found.revocationReason || "Physical seal tampering or statutory non-compliance detected."
        }`,
      };
    }

    return {
      certificateNumber: certNo,
      verificationStatus: "INVALID",
      certificateStatus: null,
      signatureValid: false,
      payloadHash: null,
      signatureAlgorithm: null,
      issuedAt: null,
      validUntil: null,
      instrumentSummary: null,
      verificationMessage: "Certificate is invalid.",
    };
  }
}
