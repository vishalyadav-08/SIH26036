import { USE_MOCK_API, api } from "@/lib/api";
import {
  getSyncQueue,
  updateSyncOperationStatus,
  isOfflineSimulated,
} from "@/lib/offline-storage";
import { SyncBatchResponse } from "@/types/sync";

export async function processOfflineSync(): Promise<{
  syncedCount: number;
  failedCount: number;
  message: string;
}> {
  if (typeof window === "undefined") {
    return { syncedCount: 0, failedCount: 0, message: "Window undefined" };
  }

  const isOffline = !navigator.onLine || isOfflineSimulated();
  if (isOffline) {
    return {
      syncedCount: 0,
      failedCount: 0,
      message: "Device is currently offline. Please reconnect to synchronize.",
    };
  }

  const queue = getSyncQueue();
  const pending = queue.filter(
    (op) => op.status === "READY_TO_SYNC" || op.status === "FAILED"
  );

  if (pending.length === 0) {
    return { syncedCount: 0, failedCount: 0, message: "Sync queue is empty." };
  }

  if (USE_MOCK_API) {
    // Prototype offline fallback: simulate successful server synchronization
    for (const op of pending) {
      updateSyncOperationStatus(op.clientOperationId, "SYNCED");
    }

    return {
      syncedCount: pending.length,
      failedCount: 0,
      message: `Successfully processed ${pending.length} offline operation(s) (Mock Mode).`,
    };
  }

  // Real API
  const res = await api.post<SyncBatchResponse>("/sync", {
    operations: pending,
  });

  const batchResponse = res as unknown as SyncBatchResponse;
  
  let synced = 0;
  let failed = 0;

  for (const result of batchResponse.results) {
    if (result.status === "SYNCED") {
      updateSyncOperationStatus(result.clientOperationId, "SYNCED");
      synced++;
    } else {
      updateSyncOperationStatus(
        result.clientOperationId,
        "FAILED",
        result.message || "Sync rejected by server"
      );
      failed++;
    }
  }

  return {
    syncedCount: synced,
    failedCount: failed,
    message: `Successfully synchronized ${synced} record(s).`,
  };
}
