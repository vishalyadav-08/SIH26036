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

export interface EvidenceItem {
  id: string;
  type: "MACHINE_PHOTO" | "NAMEPLATE_PHOTO" | "SEAL_PHOTO" | "SITE_PHOTO" | "DOCUMENT";
  fileUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  latitude?: number;
  longitude?: number;
  capturedAt: string;
  notes?: string;
  blobId?: string;
}

export interface InspectionDraft {
  id: string; // Inspection UUID
  applicationId: string;
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
