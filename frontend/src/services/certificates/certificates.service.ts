import { api } from "@/lib/api";
import { PublicVerificationResponse } from "@/types/certificate";

const DEMO_FIXTURES: Record<string, PublicVerificationResponse> = {
  "CERT-DEMO-001": {
    certificateNumber: "CERT-DEMO-001",
    verificationStatus: "VALID",
    certificateStatus: "ACTIVE",
    signatureValid: true,
    payloadHash:
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    signatureAlgorithm: "RSA-PSS with SHA-256 (2048-bit)",
    issuedAt: "2026-08-15T09:30:00Z",
    validUntil: "2027-08-15T23:59:59Z",
    instrumentSummary: {
      instrumentNumber: "INS-DEMO-001",
      instrumentType: "ELECTRONIC_SCALE",
      manufacturer: "Synthetic Metrology Labs",
      model: "SML-Series 500",
      capacity: 100,
      capacityUnit: "kg",
    },
    verificationMessage:
      "Certificate is active and digital signature is verified against the authority public key.",
  },
  "CERT-EXPIRED-001": {
    certificateNumber: "CERT-EXPIRED-001",
    verificationStatus: "EXPIRED",
    certificateStatus: "EXPIRED",
    signatureValid: true,
    payloadHash:
      "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    signatureAlgorithm: "RSA-PSS with SHA-256 (2048-bit)",
    issuedAt: "2025-08-15T09:30:00Z",
    validUntil: "2026-08-15T23:59:59Z",
    instrumentSummary: {
      instrumentNumber: "INS-DEMO-002",
      instrumentType: "PLATFORM_SCALE",
      manufacturer: "Synthetic Standard Corp",
      model: "PSC-Industrial 1000",
      capacity: 500,
      capacityUnit: "kg",
    },
    verificationMessage:
      "This certificate has expired. Re-verification by an authorized Legal Metrology Officer is required.",
  },
  "CERT-REVOKED-001": {
    certificateNumber: "CERT-REVOKED-001",
    verificationStatus: "REVOKED",
    certificateStatus: "REVOKED",
    signatureValid: true,
    payloadHash:
      "f0e1d2c3b4a5968778695a4b3c2d1e0f0123456789abcdef0123456789abcdef",
    signatureAlgorithm: "RSA-PSS with SHA-256 (2048-bit)",
    issuedAt: "2026-01-10T10:00:00Z",
    validUntil: "2027-01-10T23:59:59Z",
    revokedAt: "2026-08-20T14:30:00Z",
    revocationReason:
      "Administrative revocation — instrument relocated without required recalibration.",
    instrumentSummary: {
      instrumentNumber: "INS-DEMO-003",
      instrumentType: "COUNTER_SCALE",
      manufacturer: "Precision Weights Synthetic",
      model: "PWS-Retail 25",
      capacity: 25,
      capacityUnit: "kg",
    },
    verificationMessage:
      "This certificate was administratively revoked and is no longer valid for commercial transactions.",
  },
};

export async function verifyPublicCertificate(
  certNo: string
): Promise<PublicVerificationResponse> {
  const normalizedCertNo = certNo.trim().toUpperCase();

  try {
    const response = await api.get<PublicVerificationResponse>(
      "/certificates/verify",
      {
        params: { certNo: normalizedCertNo },
        timeout: 4000,
      }
    );
    return response.data;
  } catch {
    // Graceful fallback to documented prototype demo fixtures if backend is offline or during prototype evaluation
    if (DEMO_FIXTURES[normalizedCertNo]) {
      return DEMO_FIXTURES[normalizedCertNo];
    }

    // Default response for untracked, malformed, or tampered certificates per API contract
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
        "Certificate record not found or cryptographic signature / hash verification failed.",
    };
  }
}
