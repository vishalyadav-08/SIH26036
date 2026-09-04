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

export type ServerEvidenceType =
  | "MACHINE_PHOTO"
  | "NAMEPLATE_PHOTO"
  | "SEAL_PHOTO"
  | "SITE_PHOTO"
  | "DOCUMENT";

/** Evidence metadata as the server records it. The bytes are behind `fileUrl`. */
export interface ServerEvidence {
  id: string;
  inspectionId: string;
  instrumentId: string;
  uploadedByUserId: string;
  uploadedByName: string;
  evidenceType: ServerEvidenceType;
  objectKey: string;
  fileName: string;
  /** Sniffed from the bytes by the server, not taken from the client. */
  mimeType: string;
  sizeBytes: number;
  /** Computed by the server over the stored bytes. */
  sha256: string;
  capturedAt: string | null;
  latitude: string | null;
  longitude: string | null;
  gpsAccuracyMeters: number | null;
  notes: string;
  clientOperationId: string | null;
  status: "UPLOADED";
  uploadedAt: string;
  /** Authenticated API route; fetch it with the bearer token, not as <img src>. */
  fileUrl: string;
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
  evidence: ServerEvidence[];
}

export interface EvidenceUploadMeta {
  evidenceType?: ServerEvidenceType;
  capturedAt?: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracyMeters?: number;
  notes?: string;
  /** Lets the server recognise a retried upload and return the original. */
  clientOperationId?: string;
  /** Hex digest; the server refuses the upload if the bytes do not match. */
  sha256?: string;
}

/** SHA-256 of a file on the device, as lowercase hex. */
export async function sha256Hex(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());

  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

  /** The server inspection for an application, if the officer has started one. */
  async findByApplication(applicationId: string): Promise<ServerInspection | null> {
    const { items } = await inspectionsService.list();

    return items.find((i) => i.applicationId === applicationId) ?? null;
  },

  /**
   * Resolve the server inspection for an application, starting it if the
   * officer has not yet. Starting is the officer's own act of opening the
   * case, so this is only called from the field workflow.
   */
  async ensureForApplication(applicationId: string): Promise<ServerInspection> {
    const existing = await inspectionsService.findByApplication(applicationId);

    return existing ?? (await inspectionsService.start(applicationId));
  },

  async listEvidence(inspectionId: string): Promise<ServerEvidence[]> {
    const { data } = await api.get<Paginated<ServerEvidence>>(
      `/inspections/${inspectionId}/evidence/`,
      { params: { pageSize: 100 } }
    );

    return data.items;
  },

  async uploadEvidence(
    inspectionId: string,
    file: File,
    meta: EvidenceUploadMeta = {}
  ): Promise<ServerEvidence> {
    const form = new FormData();
    form.append("file", file, file.name);

    for (const [key, value] of Object.entries(meta)) {
      if (value !== undefined && value !== null && value !== "") {
        form.append(key, String(value));
      }
    }

    // Let the browser set the multipart boundary; the instance default is JSON.
    const { data } = await api.post<ServerEvidence>(
      `/inspections/${inspectionId}/evidence/`,
      form,
      { headers: { "Content-Type": undefined } }
    );

    return data;
  },

  async deleteEvidence(evidenceId: string): Promise<void> {
    await api.delete(`/evidence/${evidenceId}/`);
  },

  /**
   * The bytes, as an object URL for <img>/<a>. The route needs the bearer
   * token, so it cannot be used as a plain src. Revoke the URL when done.
   */
  async evidenceObjectUrl(evidenceId: string): Promise<string> {
    const { data } = await api.get<Blob>(`/evidence/${evidenceId}/file/`, {
      responseType: "blob",
    });

    return URL.createObjectURL(data);
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
import { applyResultsToDrafts, syncService } from "@/services/sync/sync.service";
import { SyncOperation, SyncOperationResult } from "@/types/sync";

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

/**
 * The decision as one RECORD_DECISION operation: readings, the decision and
 * the evidence *metadata* travel together. Evidence bytes do not — they go
 * through the multipart upload (see the evidence step), and any item still
 * only on the device is reported back as pending by the server.
 *
 * Built once with a UUID and reused for every retry, so the server can
 * recognise a resend and never applies the same decision twice.
 */
export function buildDecisionOperation(
  draft: InspectionDraft,
  summaryMetadata?: { applicationNumber: string; instrumentNumber: string },
  createdAt: Date = new Date()
): SyncOperation {
  return {
    clientOperationId: crypto.randomUUID(),
    createdAt: createdAt.toISOString(),
    entityType: "APPLICATION",
    entityId: draft.applicationId,
    operationType: "RECORD_DECISION",
    payload: {
      applicationId: draft.applicationId,
      localDraftId: draft.id,
      inspectionId: draft.serverInspectionId ?? null,
      checklist: draft.checklist,
      measurements: draft.measurements,
      evidence: draft.evidence.map((e) => ({
        id: e.id,
        serverId: e.serverId ?? null,
        type: e.type,
        fileName: e.fileName,
        sha256: e.sha256 ?? null,
        uploadState: e.uploadState ?? (e.serverId ? "UPLOADED" : "PENDING"),
      })),
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
      result: draft.result,
    },
  };
}

/**
 * One UPLOAD_EVIDENCE operation per item the server has not confirmed. The
 * bytes are not on the queue: the sync layer reads them from the device
 * store and attaches them when it sends. Dated just before the decision so
 * the server applies them first (it needs evidence before a decision).
 */
export function buildPendingEvidenceOperations(
  draft: InspectionDraft,
  summaryMetadata?: { applicationNumber: string; instrumentNumber: string },
  before: Date = new Date()
): SyncOperation[] {
  return draft.evidence
    .filter((e) => !e.serverId && e.uploadState !== "UPLOADED")
    .map((e, index) => ({
      clientOperationId: crypto.randomUUID(),
      createdAt: new Date(before.getTime() - 1000 + index).toISOString(),
      entityType: "APPLICATION" as const,
      entityId: draft.applicationId,
      operationType: "UPLOAD_EVIDENCE" as const,
      payload: {
        applicationId: draft.applicationId,
        evidenceItemId: e.id,
        fileName: e.fileName,
        evidenceType: e.type,
        sha256: e.sha256 ?? null,
        capturedAt: e.capturedAt,
        latitude: e.latitude ?? null,
        longitude: e.longitude ?? null,
        gpsAccuracyMeters: e.gpsAccuracyMeters ?? null,
        notes: e.notes ?? "",
      },
      attemptCount: 0,
      status: "READY_TO_SYNC" as const,
      inspectionSummary: summaryMetadata
        ? { ...summaryMetadata, result: undefined }
        : undefined,
    }));
}

export async function submitFinalInspectionDecision(
  draft: InspectionDraft,
  result: InspectionResult,
  notes?: string,
  summaryMetadata?: { applicationNumber: string; instrumentNumber: string }
): Promise<{ success: boolean; queuedOffline: boolean; message?: string }> {
  draft.result = result;
  draft.notes = notes;
  draft.completedAt = new Date().toISOString();

  const isOffline =
    typeof navigator !== "undefined" ? !navigator.onLine || isOfflineSimulated() : false;

  // Online: quote the server's current version so a stale draft is caught
  // as a CONFLICT rather than silently overwriting someone's readings.
  if (!isOffline) {
    try {
      const server = await inspectionsService.findByApplication(draft.applicationId);
      if (server) {
        draft.serverInspectionId = server.id;
        draft.version = server.version;
      }
    } catch {
      // Treated as unknown; the server will still check the version.
    }
  }

  const now = new Date();
  const evidenceOps = buildPendingEvidenceOperations(draft, summaryMetadata, now);
  const decision = buildDecisionOperation(draft, summaryMetadata, now);
  const operations = [...evidenceOps, decision];

  const queueAll = (status: SyncOperation["status"], lastError?: string | null) => {
    draft.status = "READY_TO_SYNC";
    saveInspectionDraft(draft);
    operations.forEach((op) =>
      enqueueSyncOperation({ ...op, status, lastError: lastError ?? null })
    );
  };

  if (isOffline) {
    queueAll("READY_TO_SYNC");

    return { success: true, queuedOffline: true };
  }

  // Online: the same operations, sent straight away through the same sync
  // endpoint, so there is exactly one server code path for a decision.
  let results: SyncOperationResult[];

  try {
    results = await syncService.submit(operations);
  } catch {
    // Outcome unknown (network): keep the same operation ids for the retry.
    queueAll("READY_TO_SYNC");

    return { success: true, queuedOffline: true };
  }

  const byId = new Map(results.map((r) => [r.clientOperationId, r]));

  // Every operation lands on the queue with the server's verdict, so the
  // Sync Center shows exactly what happened; nothing is silently retried.
  operations.forEach((op) => {
    const verdict = byId.get(op.clientOperationId);
    enqueueSyncOperation({
      ...op,
      attemptCount: 1,
      status: verdict?.status ?? "READY_TO_SYNC",
      lastError: verdict && verdict.status !== "SYNCED" ? verdict.message : null,
    });
  });

  await applyResultsToDrafts(operations, results);

  const verdict = byId.get(decision.clientOperationId);

  if (verdict?.status === "SYNCED") {
    return { success: true, queuedOffline: false, message: verdict.message };
  }

  draft.status = "READY_TO_SYNC";
  saveInspectionDraft(draft);

  return { success: false, queuedOffline: true, message: verdict?.message ?? "Rejected by server." };
}
