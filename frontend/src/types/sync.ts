export type SyncOperationType =
  | "CREATE_INSPECTION"
  | "UPSERT_CHECKLIST"
  | "UPSERT_READINGS"
  | "UPLOAD_EVIDENCE"
  | "RECORD_DECISION";

export type SyncStatus = "READY_TO_SYNC" | "SYNCED" | "FAILED" | "CONFLICT";

export interface SyncOperation {
  clientOperationId: string;
  createdAt: string;
  entityType: "INSPECTION" | "APPLICATION";
  entityId: string;
  operationType: SyncOperationType;
  payload: Record<string, unknown>;
  attemptCount: number;
  lastError?: string | null;
  status: SyncStatus;
  expectedServerVersion?: number;
  inspectionSummary?: {
    applicationNumber: string;
    instrumentNumber: string;
    result?: string;
  };
}

export interface SyncBatchRequest {
  operations: SyncOperation[];
}

export interface SyncOperationResult {
  clientOperationId: string;
  status: "SYNCED" | "FAILED" | "CONFLICT";
  entityId: string;
  serverVersion?: number;
  message?: string;
}

export interface SyncBatchResponse {
  results: SyncOperationResult[];
}
