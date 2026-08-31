import { api } from "@/lib/api";
import { AuditLogEntry } from "@/types/audit";
import { Paginated } from "@/types/instrument";

export type AuditEvent = AuditLogEntry;


export interface ChainVerification {
  chainValid: boolean;
  eventCount: number;
  firstBrokenEventId: string | null;
  message: string;
}

/** Administrator-only. The public never sees audit metadata. */
export const auditService = {
  async list(params: { entityType?: string; entityId?: string; page?: number } = {}) {
    const { data } = await api.get<Paginated<AuditLogEntry>>("/audit/", { params });

    return data;
  },

  /** Recomputes every link — this is what demonstrates tamper evidence. */
  async verifyChain(): Promise<ChainVerification> {
    const { data } = await api.get<ChainVerification>("/audit/verify/");

    return data;
  },
};

export default auditService;

/* Named exports kept for the existing pages; the envelope is unwrapped here. */

export async function getAuditLogs(params: { entityType?: string } = {}) {
  return (await auditService.list(params)).items;
}

export async function verifyAuditChain() {
  return auditService.verifyChain();
}
