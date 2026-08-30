"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  HardDrive,
  Check,
  Download,
  Play,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { getApplications } from "@/services/applications/applications.service";
import {
  getCachedApplications,
  saveCachedApplication,
  removeCachedApplication,
} from "@/lib/offline-storage";
import { Application } from "@/types/application";

export default function FieldInspectionsListPage() {
  const [cases, setCases] = useState<Application[]>([]);
  const [cachedIds, setCachedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const apps = await getApplications();
      setCases(apps);

      const cached = getCachedApplications();
      setCachedIds(new Set(cached.map((c) => c.id)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleCache = (app: Application) => {
    if (cachedIds.has(app.id)) {
      removeCachedApplication(app.id);
      setCachedIds((prev) => {
        const next = new Set(prev);
        next.delete(app.id);
        return next;
      });
    } else {
      saveCachedApplication(app);
      setCachedIds((prev) => new Set(prev).add(app.id));
    }
  };

  const filtered = cases.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.applicationNumber.toLowerCase().includes(q) ||
      c.instrumentNumber.toLowerCase().includes(q) ||
      (c.businessName && c.businessName.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-64" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/field"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Field Dashboard</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Assigned Field Inspections
        </h1>
        <p className="text-xs text-slate-600">
          Cache assigned cases to local storage before leaving for low-connectivity field sites
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by application number, instrument ID, or business..."
          className="block w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
        />
      </div>

      {/* Cases List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No matching assigned cases found.
          </div>
        ) : (
          filtered.map((app) => {
            const isCached = cachedIds.has(app.id);

            return (
              <div
                key={app.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {app.applicationNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3 h-3" />
                      {app.state}
                    </span>
                    {isCached && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <HardDrive className="w-3 h-3" />
                        CACHED OFFLINE
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-700 font-medium">
                    {app.instrumentNumber} • {app.instrumentType.replace(/_/g, " ")}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Site: {app.businessName || "Demo Business Owner"}</span>
                    <span>•</span>
                    <span>
                      Scheduled:{" "}
                      {app.scheduledDate
                        ? new Date(app.scheduledDate).toLocaleDateString()
                        : "Scheduled for Inspection"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => toggleCache(app)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      isCached
                        ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isCached ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-blue-600" />
                        <span>Cached</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>Cache for Offline</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/field/inspections/${app.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Open Case</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
