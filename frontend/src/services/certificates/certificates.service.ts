import { api } from "@/lib/api";
import {
  Certificate,
  CertificateStatus,
  PublicVerificationResponse,
  VerificationStatus,
} from "@/types/certificate";
import { Paginated } from "@/types/instrument";

export type { Certificate, CertificateStatus, VerificationStatus };

/** The minimal public response. Deliberately carries no owner details. */
export type VerificationResult = PublicVerificationResponse;




export const certificatesService = {
  async list(params: { status?: string; page?: number } = {}): Promise<Paginated<Certificate>> {
    const { data } = await api.get<Paginated<Certificate>>("/certificates/", { params });

    return data;
  },

  async get(id: string): Promise<Certificate> {
    const { data } = await api.get<Certificate>(`/certificates/${id}/`);

    return data;
  },

  async issue(inspectionId: string): Promise<Certificate> {
    const { data } = await api.post<Certificate>("/certificates/", { inspectionId });

    return data;
  },

  async revoke(id: string, reason: string): Promise<Certificate> {
    const { data } = await api.post<Certificate>(`/certificates/${id}/revoke/`, { reason });

    return data;
  },

  /** SVG markup for the certificate's QR code. */
  async qrSvg(id: string): Promise<string> {
    const { data } = await api.get<string>(`/certificates/${id}/qr/`, {
      responseType: "text",
    });

    return data;
  },

  /**
   * Public lookup — no authentication, and never throws for an unknown
   * certificate. A missing or tampered record comes back as INVALID, which is
   * a legitimate answer the page should render, not an error state.
   */
  async verify(certificateNumber: string): Promise<VerificationResult> {
    const { data } = await api.get<VerificationResult>("/certificates/verify", {
      params: { certNo: certificateNumber },
    });

    return data;
  },
};

export default certificatesService;

/* Named exports kept for the existing pages; the envelope is unwrapped here. */

export async function getCertificates(params: { status?: string } = {}) {
  return (await certificatesService.list(params)).items;
}

export async function getCertificateById(id: string) {
  return certificatesService.get(id);
}

export async function revokeCertificate(
  id: string,
  payload: string | { reason: string }
) {
  const reason = typeof payload === "string" ? payload : payload.reason;

  return certificatesService.revoke(id, reason);
}

export async function verifyPublicCertificate(certificateNumber: string) {
  return certificatesService.verify(certificateNumber);
}
