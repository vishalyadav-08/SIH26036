import { Application } from "@/types/application";
import { InspectionDraft } from "@/types/inspection";
import { SyncOperation } from "@/types/sync";

const CACHED_CASES_KEY = "mapansetu_cached_inspections";
const DRAFTS_KEY = "mapansetu_inspection_drafts";
const SYNC_QUEUE_KEY = "mapansetu_sync_queue";
const OFFLINE_SIMULATION_KEY = "mapansetu_offline_simulation";

// ==================== CACHED INSPECTIONS ====================
export function getCachedApplications(): Application[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CACHED_CASES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Application[];
  } catch {
    return [];
  }
}

export function saveCachedApplication(application: Application): void {
  if (typeof window === "undefined") return;
  const current = getCachedApplications();
  const index = current.findIndex((c) => c.id === application.id);
  if (index >= 0) {
    current[index] = application;
  } else {
    current.push(application);
  }
  localStorage.setItem(CACHED_CASES_KEY, JSON.stringify(current));
}

export function removeCachedApplication(applicationId: string): void {
  if (typeof window === "undefined") return;
  const current = getCachedApplications().filter((c) => c.id !== applicationId);
  localStorage.setItem(CACHED_CASES_KEY, JSON.stringify(current));
}

// ==================== INSPECTION DRAFTS ====================
export function getInspectionDraft(applicationId: string): InspectionDraft | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DRAFTS_KEY);
  if (!raw) return null;
  try {
    const all = JSON.parse(raw) as Record<string, InspectionDraft>;
    return all[applicationId] || null;
  } catch {
    return null;
  }
}

export function saveInspectionDraft(draft: InspectionDraft): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(DRAFTS_KEY);
  const all = raw ? (JSON.parse(raw) as Record<string, InspectionDraft>) : {};
  all[draft.applicationId] = draft;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(all));
}

export function clearInspectionDraft(applicationId: string): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(DRAFTS_KEY);
  if (!raw) return;
  try {
    const all = JSON.parse(raw) as Record<string, InspectionDraft>;
    delete all[applicationId];
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(all));
  } catch {
    // noop
  }
}

// ==================== SYNC QUEUE ====================
export function getSyncQueue(): SyncOperation[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SYNC_QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SyncOperation[];
  } catch {
    return [];
  }
}

export function enqueueSyncOperation(operation: SyncOperation): void {
  if (typeof window === "undefined") return;
  const current = getSyncQueue();
  const index = current.findIndex(
    (op) => op.clientOperationId === operation.clientOperationId
  );
  if (index >= 0) {
    current[index] = operation;
  } else {
    current.push(operation);
  }
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(current));
}

export function updateSyncOperationStatus(
  clientOperationId: string,
  status: SyncOperation["status"],
  lastError?: string | null
): void {
  if (typeof window === "undefined") return;
  const current = getSyncQueue();
  const index = current.findIndex(
    (op) => op.clientOperationId === clientOperationId
  );
  if (index >= 0) {
    current[index].status = status;
    current[index].attemptCount += 1;
    if (lastError !== undefined) {
      current[index].lastError = lastError;
    }
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(current));
  }
}

/**
 * Drop one operation from the device queue. Used after a conflict has been
 * resolved: the server keeps its SyncRecord, so the history is not lost.
 */
export function removeSyncOperation(clientOperationId: string): void {
  if (typeof window === "undefined") return;
  const current = getSyncQueue().filter((op) => op.clientOperationId !== clientOperationId);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(current));
}

export function clearSyncedOperations(): void {
  if (typeof window === "undefined") return;
  const current = getSyncQueue().filter((op) => op.status !== "SYNCED");
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(current));
}

// ==================== OFFLINE SIMULATION ====================
export function isOfflineSimulated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(OFFLINE_SIMULATION_KEY) === "true";
}

export function setOfflineSimulated(val: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OFFLINE_SIMULATION_KEY, String(val));
}

// ==================== METRICS ====================
export function getOfflineStorageMetrics() {
  if (typeof window === "undefined") {
    return { cachedCasesCount: 0, draftsCount: 0, pendingSyncCount: 0, approximateBytes: 0 };
  }

  const cached = getCachedApplications();
  const queue = getSyncQueue();
  const pending = queue.filter((q) => q.status === "READY_TO_SYNC");

  const rawDrafts = localStorage.getItem(DRAFTS_KEY) || "";
  const rawCached = localStorage.getItem(CACHED_CASES_KEY) || "";
  const rawQueue = localStorage.getItem(SYNC_QUEUE_KEY) || "";

  const totalBytes =
    (rawDrafts.length + rawCached.length + rawQueue.length) * 2; // UTF-16 bytes approx

  let draftsCount = 0;
  if (rawDrafts) {
    try {
      draftsCount = Object.keys(JSON.parse(rawDrafts)).length;
    } catch {
      draftsCount = 0;
    }
  }

  return {
    cachedCasesCount: cached.length,
    draftsCount,
    pendingSyncCount: pending.length,
    approximateBytes: totalBytes,
  };
}
