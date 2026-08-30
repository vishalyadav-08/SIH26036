import { api } from "@/lib/api";
import { AuditLogEntry, AuditQueryParams } from "@/types/audit";

export const INITIAL_DEMO_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-001",
    entityType: "AUTH",
    entityId: "usr-demo-adm-001",
    actorUserId: "usr-demo-adm-001",
    actorName: "Admin Supervisor",
    actorRole: "ADMIN",
    action: "SYSTEM_INITIALIZED",
    timestamp: "2026-08-01T00:00:00Z",
    metadata: { environment: "PROTOTYPE_SIH26036", node: "mapansetu-core-01" },
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    currentHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    isValidChain: true,
  },
  {
    id: "aud-002",
    entityType: "INSTRUMENT",
    entityId: "ins-001",
    actorUserId: "usr-demo-biz-001",
    actorName: "Demo Business Owner",
    actorRole: "BUSINESS",
    action: "INSTRUMENT_REGISTERED",
    timestamp: "2026-08-15T09:30:00Z",
    metadata: { instrumentNumber: "INS-DEMO-001", type: "ELECTRONIC_SCALE" },
    previousHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    currentHash: "f4a8b79210c4391e30925b3cf17d23a12948271e847192a013948572918471a2",
    isValidChain: true,
  },
  {
    id: "aud-003",
    entityType: "APPLICATION",
    entityId: "app-001",
    actorUserId: "usr-demo-biz-001",
    actorName: "Demo Business Owner",
    actorRole: "BUSINESS",
    action: "APPLICATION_SUBMITTED",
    timestamp: "2026-08-15T09:45:00Z",
    metadata: { applicationNumber: "APP-2026-0001", reason: "Annual Statutory Verification" },
    previousHash: "f4a8b79210c4391e30925b3cf17d23a12948271e847192a013948572918471a2",
    currentHash: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    isValidChain: true,
  },
  {
    id: "aud-004",
    entityType: "APPLICATION",
    entityId: "app-001",
    actorUserId: "usr-demo-adm-001",
    actorName: "Admin Supervisor",
    actorRole: "ADMIN",
    action: "OFFICER_ASSIGNED",
    timestamp: "2026-08-15T10:00:00Z",
    metadata: { assignedOfficer: "Inspector Sharma", officerId: "usr-demo-off-001" },
    previousHash: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    currentHash: "8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c",
    isValidChain: true,
  },
  {
    id: "aud-005",
    entityType: "INSPECTION",
    entityId: "ins-insp-001",
    actorUserId: "usr-demo-off-001",
    actorName: "Inspector Sharma",
    actorRole: "OFFICER",
    action: "INSPECTION_COMPLETED",
    timestamp: "2026-08-15T11:15:00Z",
    metadata: { result: "PASS", pointsTested: 3, evidenceCount: 2 },
    previousHash: "8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c",
    currentHash: "7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d",
    isValidChain: true,
  },
  {
    id: "aud-006",
    entityType: "CERTIFICATE",
    entityId: "cert-001",
    actorUserId: "usr-demo-adm-001",
    actorName: "System Automation",
    actorRole: "SYSTEM",
    action: "CERTIFICATE_ISSUED",
    timestamp: "2026-08-15T11:20:00Z",
    metadata: { certificateNumber: "CERT-DEMO-001", signatureAlgorithm: "RSA-PSS/SHA-256" },
    previousHash: "7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d",
    currentHash: "6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e",
    isValidChain: true,
  },
];

export async function getAuditLogs(params?: AuditQueryParams): Promise<AuditLogEntry[]> {
  try {
    const res = await api.get<AuditLogEntry[]>("/audit", { params });
    return res.data;
  } catch {
    let logs = [...INITIAL_DEMO_AUDIT_LOGS];
    if (params?.entityType) {
      logs = logs.filter((l) => l.entityType === params.entityType);
    }
    if (params?.action) {
      logs = logs.filter((l) =>
        l.action.toLowerCase().includes(params.action!.toLowerCase())
      );
    }
    return logs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
