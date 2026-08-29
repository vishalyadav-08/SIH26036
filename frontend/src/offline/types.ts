export type LocalState = 'LOCAL_DRAFT' | 'READY_TO_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';

export interface AppMetadata {
  id: string; // single row 'singleton'
  schemaVersion: number;
  lastSuccessfulSync?: number;
  cachedAt?: number;
}

export interface CachedInspection {
  inspectionId: string;
  applicationId: string;
  snapshot: unknown; // Using unknown for simplicity in this phase to match mock data
  serverVersion: string;
  cachedAt: number;
  localState: LocalState;
}

export interface InspectionDraft {
  inspectionId: string;
  checklist?: unknown[];
  readings: unknown[];
  result?: 'PASS' | 'FAIL' | 'REQUIRES_CORRECTION';
  notes?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  } | null;
  serverVersion: string;
  localState: LocalState;
  updatedAt: number;
}

export interface EvidenceBlob {
  id?: number; // auto-increment
  inspectionId: string;
  fileName: string;
  mimeType: string;
  size: number;
  data: Blob;
  capturedAt: number;
  gpsLocation?: unknown;
}

export interface SyncOperation {
  clientOperationId: string;
  createdAt: number;
  entityType: 'INSPECTION' | 'EVIDENCE';
  entityId: string;
  operationType: 'UPDATE_DRAFT' | 'SUBMIT_DECISION' | 'UPLOAD_EVIDENCE';
  payload: unknown;
  attemptCount: number;
  lastError?: string;
  status: LocalState;
  expectedServerVersion: string;
}

export interface SyncResult {
  id?: number;
  clientOperationId: string;
  resolvedAt: number;
  status: 'SYNCED' | 'FAILED' | 'CONFLICT';
  entityId: string;
  serverVersion?: string;
  message?: string;
}

export type Inspection = {
  id: string;
  applicationNumber: string;
  instrumentNumber: string;
  instrumentType: string;
  businessName: string;
  location: string;
  scheduledAt: string;
  applicationState: string;
  syncStatus: LocalState;
  lastSavedAt: string;
};
