"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Trash2,
  Layers,
} from "lucide-react";
import {
  getSyncQueue,
  clearSyncedOperations,
} from "@/lib/offline-storage";
import { processOfflineSync } from "@/services/sync/sync.service";
import { SyncOperation } from "@/types/sync";
import { SyncStatusBadge } from "@/components/field/SyncStatusBadge";

export default function SyncCenterPage() {
  const [queue, setQueue] = useState<SyncOperation[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadQueue = () => {
    setQueue(getSyncQueue());
  };

  useEffect(() => {
    Promise.resolve().then(loadQueue);
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    setFeedback(null);
    try {
      const res = await processOfflineSync();
      setFeedback(res.message);
      loadQueue();
    } finally {
      setSyncing(false);
    }
  };

  const handleClearSynced = () => {
    clearSyncedOperations();
    loadQueue();
  };

  const pendingCount = queue.filter((q) => q.status === "READY_TO_SYNC").length;
  const syncedCount = queue.filter((q) => q.status === "SYNCED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/field"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Field Dashboard</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Offline Sync Center
          </h1>
          <p className="text-xs text-slate-600">
            Review queued offline decisions and upload them to the central verification server
          </p>
        </div>

        <div className="flex items-center gap-2">
          {syncedCount > 0 && (
            <button
              type="button"
              onClick={handleClearSynced}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Synced</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncing || pendingCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Syncing..." : `Sync All (${pendingCount})`}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Sync Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">Queued Operations</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {queue.length} total operations
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <div className="text-sm font-bold text-slate-900">
              All records synchronized
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no pending offline inspection records awaiting synchronization.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((op) => (
              <div
                key={op.clientOperationId}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SyncStatusBadge status={op.status} />
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {op.operationType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Case:{" "}
                    <span className="font-semibold text-slate-900">
                      {op.inspectionSummary?.applicationNumber || op.entityId}
                    </span>{" "}
                    • Instrument: {op.inspectionSummary?.instrumentNumber || "N/A"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {op.clientOperationId} • Created:{" "}
                    {new Date(op.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                {op.inspectionSummary?.result && (
                  <div className="self-end sm:self-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        op.inspectionSummary.result === "PASS"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      Decision: {op.inspectionSummary.result}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
