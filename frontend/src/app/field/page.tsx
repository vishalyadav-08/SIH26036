"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  RefreshCw,
  HardDrive,
  Clock,
  ArrowRight,
  Play,
  Download,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getApplications } from "@/services/applications/applications.service";
import {
  getCachedApplications,
  saveCachedApplication,
  getOfflineStorageMetrics,
} from "@/lib/offline-storage";
import { Application } from "@/types/application";

export default function FieldDashboardPage() {
  const { user } = useAuth();
  const [assignedCases, setAssignedCases] = useState<Application[]>([]);
  const [cachedCount, setCachedCount] = useState(0);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const apps = await getApplications();
        // Filter for assigned/scheduled cases
        const officerCases = apps.filter(
          (a) => a.state === "SCHEDULED" || a.state === "ASSIGNED" || a.state === "SUBMITTED"
        );

        if (isMounted) {
          setAssignedCases(officerCases);
          const cached = getCachedApplications();
          setCachedCount(cached.length);

          const metrics = getOfflineStorageMetrics();
          setPendingSyncCount(metrics.pendingSyncCount);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCacheAll = () => {
    for (const c of assignedCases) {
      saveCachedApplication(c);
    }
    const cached = getCachedApplications();
    setCachedCount(cached.length);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading officer dashboard">
        <span className="sr-only">Loading officer dashboard...</span>
        <div className="h-24 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Officer Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              Authorized Field Inspector
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {user?.displayName || "Inspector Sharma"}
          </h1>
          <p className="text-xs text-slate-600">
            Legal Metrology Department • Officer ID:{" "}
            <span className="font-mono font-semibold text-slate-800">
              {user?.id || "usr-demo-off-001"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCacheAll}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Cache all assigned cases to local IndexedDB for offline operation"
          >
            <Download className="w-4 h-4" />
            <span>Cache All for Offline</span>
          </button>
          <Link
            href="/field/sync"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Center</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/field/inspections"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Cases
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {assignedCases.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Active inspection assignments
          </p>
        </Link>

        <Link
          href="/field/inspections"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cached for Offline
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {cachedCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Available without internet
          </p>
        </Link>

        <Link
          href="/field/sync"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ready to Sync
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-800 font-mono">
            {pendingSyncCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pending upload to server
          </p>
        </Link>
      </div>

      {/* Primary Inspection Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Assigned Field Cases
            </h2>
            <p className="text-xs text-slate-500">
              Select an assigned case to perform the 4-step statutory inspection workflow
            </p>
          </div>
          <Link
            href="/field/inspections"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {assignedCases.map((app) => (
            <div
              key={app.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 -mx-2 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {app.applicationNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-3 h-3" />
                    {app.state}
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-700">
                  {app.instrumentNumber} • {app.instrumentType.replace(/_/g, " ")}
                </div>
                <div className="text-[11px] text-slate-500">
                  Site: {app.businessName || "Demo Business Owner"} • Schedule:{" "}
                  {app.scheduledDate
                    ? new Date(app.scheduledDate).toLocaleDateString()
                    : "Scheduled"}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link
                  href={`/field/inspections/${app.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Inspection</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
