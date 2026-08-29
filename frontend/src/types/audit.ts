export interface AuditLogEntry {
  id: string;
  entityType: "APPLICATION" | "INSTRUMENT" | "INSPECTION" | "CERTIFICATE" | "AUTH";
  entityId: string;
  actorUserId: string;
  actorName: string;
  actorRole: string;
  action: string;
  timestamp: string;
  metadata: Record<string, unknown>;
  previousHash: string;
  currentHash: string;
  isValidChain: boolean;
}

export interface AuditQueryParams {
  page?: number;
  pageSize?: number;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  action?: string;
  from?: string;
  to?: string;
}
