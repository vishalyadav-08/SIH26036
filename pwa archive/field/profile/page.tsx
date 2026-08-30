"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  HardDrive,
  Trash2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  getOfflineStorageMetrics,
  clearSyncedOperations,
} from "@/lib/offline-storage";

export function OfficerProfilePage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    cachedCasesCount: 0,
    draftsCount: 0,
    pendingSyncCount: 0,
    approximateBytes: 0,
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadMetrics = () => {
    setMetrics(getOfflineStorageMetrics());
  };

  useEffect(() => {
    Promise.resolve().then(loadMetrics);
  }, []);

  const handleClearCache = () => {
    clearSyncedOperations();
    loadMetrics();
    setFeedback("Cleared synchronized items from local storage.");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/field"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Field Dashboard</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Officer Profile & Local Storage
        </h1>
        <p className="text-xs text-slate-600">
          Statutory inspector credentials and offline data management
        </p>
      </div>

      {feedback && (
        <div
          role="status"
          className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {user?.displayName || "Inspector Sharma"}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Legal Metrology Officer (LMO)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 font-medium block">Email:</span>
            <span className="font-mono text-slate-900 font-semibold">
              {user?.email || "officer@example.test"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block">Officer ID:</span>
            <span className="font-mono text-slate-900 font-semibold">
              {user?.id || "usr-demo-off-001"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block">Role:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
              {user?.role || "OFFICER"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block">Jurisdiction:</span>
            <span className="text-slate-900 font-semibold">
              District Metrology Zone 1
            </span>
          </div>
        </div>
      </div>

      {/* Local Storage & Cache Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">
              Offline IndexedDB & Cache Metrics
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClearCache}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Synced Cache</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xl font-bold font-mono text-slate-900">
              {metrics.cachedCasesCount}
            </div>
            <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">
              Cached Cases
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xl font-bold font-mono text-slate-900">
              {metrics.draftsCount}
            </div>
            <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">
              Local Drafts
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xl font-bold font-mono text-amber-800">
              {metrics.pendingSyncCount}
            </div>
            <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">
              Pending Sync
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xl font-bold font-mono text-slate-900">
              {(metrics.approximateBytes / 1024).toFixed(1)} KB
            </div>
            <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">
              Storage Used
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerProfilePage;
