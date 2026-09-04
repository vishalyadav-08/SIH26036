export type SyncOperationType =
  | "CREATE_INSPECTION"
  | "UPSERT_CHECKLIST"
  | "UPSERT_READINGS"
  | "UPLOAD_EVIDENCE"
  | "RECORD_DECISION";

/**
 * Client-side queue states (DATA_MODEL.md "Offline local states"). SYNCED,
 * FAILED and CONFLICT are only ever set from a server result; the client
 * never promotes itself to SYNCED.
 */
export type SyncStatus = "READY_TO_SYNC" | "SYNCING" | "SYNCED" | "FAILED" | "CONFLICT";

export interface SyncOperation {
  /** A UUID. The server keys idempotency on it, so retries must reuse it. */
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
  /** Display only; the server ignores it. */
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
  /** The server-side id the operation resolved to (inspection or evidence). */
  entityId: string | null;
  serverVersion: number | null;
  message: string;
  applicationState?: string | null;
}

export interface SyncBatchResponse {
  results: SyncOperationResult[];
}
