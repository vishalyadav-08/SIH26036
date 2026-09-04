import { api } from "@/lib/api";
import {
  getInspectionDraft,
  getSyncQueue,
  saveInspectionDraft,
  updateSyncOperationStatus,
  isOfflineSimulated,
} from "@/lib/offline-storage";
import { blobToBase64, deleteEvidenceBlob, getEvidenceFile } from "@/lib/evidence-store";
import { SyncBatchResponse, SyncOperation, SyncOperationResult } from "@/types/sync";

/** The server accepts at most this many operations per request. */
const BATCH_SIZE = 50;

export interface SyncOutcome {
  syncedCount: number;
  failedCount: number;
  conflictCount: number;
  message: string;
  results: SyncOperationResult[];
}

function isOffline() {
  return typeof navigator !== "undefined" && (!navigator.onLine || isOfflineSimulated());
}

function errorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response?.data;

  return data?.message || (err instanceof Error ? err.message : "Sync request failed.");
}

/**
 * An UPLOAD_EVIDENCE operation carries only metadata on the queue (localStorage
 * cannot hold photos). The bytes are read from IndexedDB and attached as
 * base64 at send time. Returns null when the device no longer has the file.
 */
async function hydrate(op: SyncOperation): Promise<SyncOperation | null> {
  if (op.operationType !== "UPLOAD_EVIDENCE" || op.payload.contentBase64) return op;

  const itemId = op.payload.evidenceItemId as string | undefined;
  if (!itemId) return op;

  const file = await getEvidenceFile(itemId);
  if (!file) return null;

  return {
    ...op,
    payload: {
      ...op.payload,
      fileName: op.payload.fileName || file.name,
      contentBase64: await blobToBase64(file),
    },
  };
}

/**
 * Write the server's verdicts back onto the local drafts: an evidence item
 * becomes UPLOADED (and its device copy is dropped), a decision marks the
 * draft SYNCED with the server inspection id and version.
 */
export async function applyResultsToDrafts(
  operations: SyncOperation[],
  results: SyncOperationResult[]
) {
  const byId = new Map(results.map((r) => [r.clientOperationId, r]));

  for (const op of operations) {
    const result = byId.get(op.clientOperationId);
    if (!result) continue;

    const applicationId = (op.payload.applicationId as string) || op.entityId;
    const draft = getInspectionDraft(applicationId);
    if (!draft) continue;

    if (op.operationType === "UPLOAD_EVIDENCE") {
      const itemId = op.payload.evidenceItemId as string | undefined;
      if (!itemId) continue;

      draft.evidence = draft.evidence.map((e) => {
        if (e.id !== itemId) return e;

        if (result.status === "SYNCED" && result.entityId) {
          return {
            ...e,
            serverId: result.entityId,
            fileUrl: `/api/v1/evidence/${result.entityId}/file/`,
            uploadState: "UPLOADED",
            uploadError: undefined,
          };
        }

        return { ...e, uploadState: "FAILED", uploadError: result.message };
      });

      if (result.status === "SYNCED") await deleteEvidenceBlob(itemId);
      saveInspectionDraft(draft);
    }

    if (op.operationType === "RECORD_DECISION" && result.status === "SYNCED") {
      draft.status = "SYNCED";
      if (result.entityId) draft.serverInspectionId = result.entityId;
      if (result.serverVersion) draft.version = result.serverVersion;
      saveInspectionDraft(draft);
    }
  }
}

/**
 * Send operations to the server and return its per-operation verdicts. An
 * operation whose bytes are gone from the device is answered locally as
 * FAILED without being sent.
 */
export const syncService = {
  async submit(operations: SyncOperation[]): Promise<SyncOperationResult[]> {
    const results: SyncOperationResult[] = [];
    const sendable: SyncOperation[] = [];

    for (const op of operations) {
      const ready = await hydrate(op);

      if (ready) {
        sendable.push(ready);
      } else {
        results.push({
          clientOperationId: op.clientOperationId,
          status: "FAILED",
          entityId: null,
          serverVersion: null,
          message: "The file for this evidence is no longer on this device. Capture it again.",
        });
      }
    }

    for (let start = 0; start < sendable.length; start += BATCH_SIZE) {
      const slice = sendable.slice(start, start + BATCH_SIZE);
      const { data } = await api.post<SyncBatchResponse>("/sync/", { operations: slice });

      results.push(...data.results);
    }

    return results;
  },
};

export default syncService;

/**
 * Push everything READY_TO_SYNC (and FAILED, for a retry) to the server and
 * record each verdict on the queue. A network failure leaves the queue as it
 * was: nothing is marked SYNCED unless the server said so.
 */
export async function processOfflineSync(): Promise<SyncOutcome> {
  const empty = (message: string): SyncOutcome => ({
    syncedCount: 0,
    failedCount: 0,
    conflictCount: 0,
    message,
    results: [],
  });

  if (typeof window === "undefined") {
    return empty("Window undefined");
  }

  if (isOffline()) {
    return empty("Device is currently offline. Please reconnect to synchronize.");
  }

  const pending = getSyncQueue().filter(
    (op) => op.status === "READY_TO_SYNC" || op.status === "FAILED"
  );

  if (pending.length === 0) {
    return empty("Sync queue is empty.");
  }

  pending.forEach((op) => updateSyncOperationStatus(op.clientOperationId, "SYNCING"));

  let results: SyncOperationResult[];

  try {
    results = await syncService.submit(pending);
  } catch (err) {
    // Outcome unknown: back to READY_TO_SYNC with the same ids, per the
    // offline state machine. The server will recognise a retry.
    const message = errorMessage(err);
    pending.forEach((op) => updateSyncOperationStatus(op.clientOperationId, "READY_TO_SYNC", message));

    return empty(`Could not reach the server: ${message}`);
  }

  let synced = 0;
  let failed = 0;
  let conflicts = 0;

  for (const result of results) {
    updateSyncOperationStatus(
      result.clientOperationId,
      result.status,
      result.status === "SYNCED" ? null : result.message
    );

    if (result.status === "SYNCED") synced++;
    else if (result.status === "CONFLICT") conflicts++;
    else failed++;
  }

  // An operation the server did not answer for stays retryable.
  const answered = new Set(results.map((r) => r.clientOperationId));
  pending
    .filter((op) => !answered.has(op.clientOperationId))
    .forEach((op) => updateSyncOperationStatus(op.clientOperationId, "READY_TO_SYNC"));

  await applyResultsToDrafts(pending, results);

  const parts = [`${synced} synchronized`];
  if (failed) parts.push(`${failed} rejected`);
  if (conflicts) parts.push(`${conflicts} in conflict`);

  return {
    syncedCount: synced,
    failedCount: failed,
    conflictCount: conflicts,
    message: parts.join(", ") + ".",
    results,
  };
}
