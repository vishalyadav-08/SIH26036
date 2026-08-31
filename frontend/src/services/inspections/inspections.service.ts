/**
 * Two layers live here on purpose.
 *
 * The offline draft functions below are the field PWA's local Dexie-backed
 * workflow: an officer must be able to work with no server reachable, so those
 * keep operating on a local draft and are unchanged.
 *
 * `inspectionsService` is the online layer that talks to the API. The field app
 * uses it when a connection exists; the offline queue reaches the same
 * endpoints later through the sync path.
 */
import { api } from "@/lib/api";
import { Paginated } from "@/types/instrument";

export type InspectionResult = "PASS" | "FAIL" | "REQUIRES_CORRECTION";

export interface Measurement {
  id: string;
  label: string;
  nominalValue: string;
  observedValue: string;
  unit: string;
  withinTolerance: boolean;
}

export interface ServerInspection {
  id: string;
  applicationId: string;
  officerUserId: string;
  startedAt: string;
  completedAt: string | null;
  /** Separate from the application's state. Empty until the officer decides. */
  result: InspectionResult | "";
  notes: string;
  /** Null means GPS was genuinely unavailable — never render it as 0,0. */
  gpsLatitude: string | null;
  gpsLongitude: string | null;
  gpsAccuracyMeters: number | null;
  capturedAt: string | null;
  version: number;
  measurements: Measurement[];
}

export interface GpsCapture {
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  capturedAt?: string;
}

export const inspectionsService = {
  async list(params: { page?: number } = {}) {
    const { data } = await api.get<Paginated<ServerInspection>>("/inspections/", { params });

    return data;
  },

  async get(id: string): Promise<ServerInspection> {
    const { data } = await api.get<ServerInspection>(`/inspections/${id}/`);

    return data;
  },

  /** Moves the application SCHEDULED -> INSPECTION_IN_PROGRESS. */
  async start(applicationId: string): Promise<ServerInspection> {
    const { data } = await api.post<ServerInspection>("/inspections/", { applicationId });

    return data;
  },

  async addMeasurement(
    inspectionId: string,
    reading: { label: string; nominalValue: number | string; observedValue: number | string; unit: string }
  ): Promise<Measurement> {
    const { data } = await api.post<Measurement>(
      `/inspections/${inspectionId}/measurements/`,
      reading
    );

    return data;
  },

  async complete(
    inspectionId: string,
    payload: { result: InspectionResult; notes?: string; gps?: GpsCapture }
  ): Promise<ServerInspection> {
    const { data } = await api.post<ServerInspection>(
      `/inspections/${inspectionId}/complete/`,
      payload
    );

    return data;
  },
};

export default inspectionsService;


/* --- Offline draft layer (unchanged, field PWA) --- */

import {
  InspectionDraft,
  ChecklistItem,
} from "@/types/inspection";
import {
  getInspectionDraft,
  saveInspectionDraft,
  enqueueSyncOperation,
  isOfflineSimulated,
} from "@/lib/offline-storage";

export const DEFAULT_CHECKLIST_TEMPLATE: ChecklistItem[] = [
  {
    id: "chk-01",
    category: "Physical Security",
    label: "Lead/wire verification seal is intact and shows no evidence of tampering.",
    passed: true,
    required: true,
  },
  {
    id: "chk-02",
    category: "Physical Security",
    label: "Previous year statutory verification stamping mark is legible on the main housing.",
    passed: true,
    required: true,
  },
  {
    id: "chk-03",
    category: "Operational Setup",
    label: "Spirit level bubble is centered and instrument leveling feet are firmly seated.",
    passed: true,
    required: true,
  },
  {
    id: "chk-04",
    category: "Operational Setup",
    label: "Instrument is placed on a rigid, vibration-free platform away from excessive air drafts.",
    passed: true,
    required: true,
  },
  {
    id: "chk-05",
    category: "Identification",
    label: "Manufacturer model plate and serial number match the registered instrument identity.",
    passed: true,
    required: true,
  },
];

export function initializeInspectionDraft(
  applicationId: string,
  officerUserId: string
): InspectionDraft {
  const existing = getInspectionDraft(applicationId);
  if (existing) return existing;

  const newDraft: InspectionDraft = {
    id: `ins-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    applicationId,
    officerUserId,
    status: "LOCAL_DRAFT",
    checklist: DEFAULT_CHECKLIST_TEMPLATE,
    measurements: [
      {
        id: "meas-01",
        testPoint: "ZERO",
        referenceValue: 0.0,
        indicatedValue: 0.0,
        unit: "kg",
        errorValue: 0.0,
        sequence: 1,
        capturedAt: new Date().toISOString(),
        notes: "Initial zero balance check",
      },
      {
        id: "meas-02",
        testPoint: "HALF_CAPACITY",
        referenceValue: 12.5,
        indicatedValue: 12.5,
        unit: "kg",
        errorValue: 0.0,
        sequence: 2,
        capturedAt: new Date().toISOString(),
        notes: "Standard reference weights applied",
      },
      {
        id: "meas-03",
        testPoint: "MAX_CAPACITY",
        referenceValue: 25.0,
        indicatedValue: 25.0,
        unit: "kg",
        errorValue: 0.0,
        sequence: 3,
        capturedAt: new Date().toISOString(),
        notes: "Full range tolerance check",
      },
    ],
    evidence: [],
    startedAt: new Date().toISOString(),
    version: 1,
  };

  saveInspectionDraft(newDraft);
  return newDraft;
}

export async function submitFinalInspectionDecision(
  draft: InspectionDraft,
  result: InspectionResult,
  notes?: string,
  summaryMetadata?: { applicationNumber: string; instrumentNumber: string }
): Promise<{ success: boolean; queuedOffline: boolean }> {
  draft.result = result;
  draft.notes = notes;
  draft.completedAt = new Date().toISOString();

  const isOffline = typeof navigator !== "undefined" ? !navigator.onLine || isOfflineSimulated() : false;

  if (isOffline) {
    draft.status = "READY_TO_SYNC";
    saveInspectionDraft(draft);

    enqueueSyncOperation({
      clientOperationId: `op-${draft.id}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      entityType: "INSPECTION",
      entityId: draft.id,
      operationType: "RECORD_DECISION",
      payload: {
        applicationId: draft.applicationId,
        inspectionId: draft.id,
        checklist: draft.checklist,
        measurements: draft.measurements,
        evidence: draft.evidence,
        result: draft.result,
        notes: draft.notes,
        completedAt: draft.completedAt,
      },
      attemptCount: 0,
      status: "READY_TO_SYNC",
      expectedServerVersion: draft.version,
      inspectionSummary: {
        applicationNumber: summaryMetadata?.applicationNumber || "APP-CASE",
        instrumentNumber: summaryMetadata?.instrumentNumber || "INS-CASE",
        result,
      },
    });

    return { success: true, queuedOffline: true };
  }

  try {
    await api.post(`/inspections/${draft.id}/decision`, {
      applicationId: draft.applicationId,
      result,
      notes,
      completedAt: draft.completedAt,
    });
    draft.status = "SYNCED";
    saveInspectionDraft(draft);
    return { success: true, queuedOffline: false };
  } catch {
    // Graceful offline queue fallback on network failure
    draft.status = "READY_TO_SYNC";
    saveInspectionDraft(draft);

    enqueueSyncOperation({
      clientOperationId: `op-${draft.id}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      entityType: "INSPECTION",
      entityId: draft.id,
      operationType: "RECORD_DECISION",
      payload: {
        applicationId: draft.applicationId,
        inspectionId: draft.id,
        result: draft.result,
        notes: draft.notes,
      },
      attemptCount: 1,
      status: "READY_TO_SYNC",
      inspectionSummary: {
        applicationNumber: summaryMetadata?.applicationNumber || "APP-CASE",
        instrumentNumber: summaryMetadata?.instrumentNumber || "INS-CASE",
        result,
      },
    });

    return { success: true, queuedOffline: true };
  }
}
