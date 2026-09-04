"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Server, Smartphone, Check, Upload } from "lucide-react";
import { inspectionsService, ServerInspection } from "@/services/inspections/inspections.service";
import {
  enqueueSyncOperation,
  getInspectionDraft,
  removeSyncOperation,
  saveInspectionDraft,
} from "@/lib/offline-storage";
import { SyncOperation } from "@/types/sync";

/**
 * Side-by-side view of a CONFLICT operation (OFFLINE_APP.md §8). The officer
 * chooses explicitly:
 *
 * - keep server: the local operation is dropped from the queue (the server
 *   keeps its SyncRecord) and the draft adopts the server's state;
 * - resubmit mine: a *new* operation with a new id, quoting the server's
 *   current version, is queued. The original stays on the server as history.
 *
 * Nothing is chosen automatically.
 */
export function ConflictResolver({
  operation,
  onResolved,
}: {
  operation: SyncOperation;
  onResolved: (message: string) => void;
}) {
  const applicationId = (operation.payload.applicationId as string) || operation.entityId;
  const [server, setServer] = useState<ServerInspection | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    inspectionsService
      .findByApplication(applicationId)
      .then((found) => mounted && setServer(found))
      .catch(() => mounted && setLoadError("Could not load the server record. Try again online."));

    return () => {
      mounted = false;
    };
  }, [applicationId]);

  const local = operation.payload as {
    result?: string;
    notes?: string;
    measurements?: unknown[];
    evidence?: unknown[];
    completedAt?: string;
  };

  const serverDecided = Boolean(server?.completedAt);

  const keepServer = () => {
    const draft = getInspectionDraft(applicationId);
    if (draft && server) {
      draft.status = "SYNCED";
      draft.serverInspectionId = server.id;
      draft.version = server.version;
      draft.result = (server.result || draft.result) as typeof draft.result;
      saveInspectionDraft(draft);
    }
    removeSyncOperation(operation.clientOperationId);
    onResolved("Kept the server record. Your local operation was withdrawn.");
  };

  const resubmitMine = () => {
    if (!server || serverDecided) return;

    enqueueSyncOperation({
      ...operation,
      clientOperationId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      attemptCount: 0,
      lastError: null,
      status: "READY_TO_SYNC",
      expectedServerVersion: server.version,
      payload: {
        ...operation.payload,
        resolvesClientOperationId: operation.clientOperationId,
      },
    });
    removeSyncOperation(operation.clientOperationId);
    onResolved(
      `Queued your decision as a new operation against server version ${server.version}. Press Sync All to send it.`
    );
  };

  return (
    <div className="mt-3 p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-3">
      <div className="flex items-start gap-2 text-xs text-rose-900">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <span>{operation.lastError || "The server holds a different version of this inspection."}</span>
      </div>

      {loadError && <div className="text-xs text-amber-800">{loadError}</div>}

      {server === undefined && !loadError && (
        <div className="text-xs text-slate-500">Loading the server record…</div>
      )}

      {server !== undefined && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Server className="w-3.5 h-3.5 text-indigo-600" /> Server
            </div>
            {server ? (
              <>
                <div>Version: <span className="font-mono">{server.version}</span></div>
                <div>Result: <span className="font-semibold">{server.result || "not decided"}</span></div>
                <div>Readings: {server.measurements.length} • Evidence: {server.evidence.length}</div>
                {server.completedAt && (
                  <div className="text-slate-500">
                    Completed {new Date(server.completedAt).toLocaleString()}
                  </div>
                )}
                {server.notes && <div className="text-slate-600 italic">“{server.notes}”</div>}
              </>
            ) : (
              <div className="text-slate-500">No inspection exists on the server yet.</div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> This device
            </div>
            <div>
              Expected version:{" "}
              <span className="font-mono">{operation.expectedServerVersion ?? "—"}</span>
            </div>
            <div>Result: <span className="font-semibold">{local.result || "—"}</span></div>
            <div>
              Readings: {local.measurements?.length ?? 0} • Evidence: {local.evidence?.length ?? 0}
            </div>
            {local.completedAt && (
              <div className="text-slate-500">
                Decided {new Date(local.completedAt).toLocaleString()}
              </div>
            )}
            {local.notes && <div className="text-slate-600 italic">“{local.notes}”</div>}
          </div>
        </div>
      )}

      {server !== undefined && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={keepServer}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-indigo-600" />
            Keep server record
          </button>
          <button
            type="button"
            onClick={resubmitMine}
            disabled={!server || serverDecided}
            title={
              serverDecided
                ? "The server already has a final decision for this inspection."
                : undefined
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl cursor-pointer disabled:cursor-not-allowed"
          >
            <Upload className="w-3.5 h-3.5" />
            Resubmit my decision
          </button>
          {serverDecided && (
            <span className="text-[11px] text-slate-600">
              A final decision is already recorded on the server; only keeping it is possible.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
