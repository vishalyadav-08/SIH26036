export type InspectionResult = "PASS" | "FAIL" | "REQUIRES_CORRECTION";

export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  passed: boolean;
  notes?: string;
  required: boolean;
}

export interface MeasurementReading {
  id: string;
  testPoint: "ZERO" | "HALF_CAPACITY" | "MAX_CAPACITY" | "REPEATABILITY" | "ECCENTRICITY";
  referenceValue: number;
  indicatedValue: number;
  unit: string;
  errorValue: number;
  sequence: number;
  capturedAt: string;
  notes?: string;
}

export type EvidenceType =
  | "MACHINE_PHOTO"
  | "NAMEPLATE_PHOTO"
  | "SEAL_PHOTO"
  | "SITE_PHOTO"
  | "DOCUMENT";

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  fileUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracyMeters?: number;
  capturedAt: string;
  notes?: string;
  blobId?: string;
  /** Set once the server has stored the bytes. */
  serverId?: string;
  /** Computed on the device before upload; the server verifies it. */
  sha256?: string;
  /**
   * UPLOADED: the server holds it. PENDING: captured while offline, bytes are
   * only on this device. FAILED: an upload attempt was refused.
   */
  uploadState?: "UPLOADED" | "PENDING" | "FAILED";
  uploadError?: string;
}

export interface InspectionDraft {
  id: string; // Local draft id
  applicationId: string;
  /** The server-side Inspection this draft is attached to, once started online. */
  serverInspectionId?: string;
  officerUserId: string;
  status: "LOCAL_DRAFT" | "READY_TO_SYNC" | "SYNCED";
  checklist: ChecklistItem[];
  measurements: MeasurementReading[];
  evidence: EvidenceItem[];
  result?: InspectionResult;
  notes?: string;
  startedAt: string;
  completedAt?: string;
  version: number;
}
