export type VerificationStatus = "VALID" | "EXPIRED" | "REVOKED" | "INVALID";

export type CertificateStatus = "ACTIVE" | "EXPIRED" | "REVOKED";

export interface InstrumentSummary {
  instrumentNumber: string;
  instrumentType: string;
  manufacturer?: string;
  model?: string;
  capacity?: number;
  capacityUnit?: string;
}

export interface PublicVerificationResponse {
  certificateNumber: string;
  verificationStatus: VerificationStatus;
  certificateStatus?: CertificateStatus | null;
  signatureValid: boolean;
  payloadHash?: string | null;
  signatureAlgorithm?: string | null;
  issuedAt?: string | null;
  validUntil?: string | null;
  revokedAt?: string | null;
  revocationReason?: string | null;
  instrumentSummary?: InstrumentSummary | null;
  verificationMessage: string;
}
