export type CertificateStatus = "VALID" | "EXPIRED" | "REVOKED" | "INVALID";

export interface Certificate {
  id: string;
  certificateNumber: string;
  applicationId: string;
  applicationNumber: string;
  instrumentId: string;
  instrumentNumber: string;
  instrumentType: string;
  businessId: string;
  businessName: string;
  status: CertificateStatus;
  issuedAt: string;
  validUntil: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
  payloadHash: string;
  signatureAlgorithm: string;
  pdfObjectKey?: string;
  qrVerificationUrl: string;
  issuerOfficerName: string;
}

export interface RevokeCertificateDto {
  reason: string;
}

export interface InstrumentPublicSummary {
  instrumentNumber: string;
  instrumentType: string;
  manufacturer?: string;
  model?: string;
  capacity?: number;
  capacityUnit?: string;
}

export interface PublicVerificationResponse {
  certificateNumber: string;
  verificationStatus: "VALID" | "EXPIRED" | "REVOKED" | "INVALID";
  certificateStatus: CertificateStatus | null;
  signatureValid: boolean;
  payloadHash: string | null;
  signatureAlgorithm: string | null;
  issuedAt: string | null;
  validUntil: string | null;
  revokedAt?: string | null;
  revocationReason?: string | null;
  instrumentSummary: InstrumentPublicSummary | null;
  verificationMessage: string;
}
