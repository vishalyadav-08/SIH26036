"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Search,
  Calendar,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { getApplications } from "@/services/applications/applications.service";
import { Application } from "@/types/application";

export default function FieldInspectionsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const apps = await getApplications();
        if (isMounted) {
          setApplications(apps);
        }
      } catch (err) {
        console.error("Failed to load LMO applications", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = applications.filter((app) => {
    if (selectedFilter === "ACTIVE") {
      if (app.state !== "ASSIGNED" && app.state !== "SCHEDULED") return false;
    } else if (selectedFilter === "COMPLETED") {
      if (app.state !== "COMPLETED") return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        app.applicationNumber.toLowerCase().includes(q) ||
        (app.instrumentNumber && app.instrumentNumber.toLowerCase().includes(q)) ||
        (app.businessName && app.businessName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-[#004e9f]" />
            LMO Inspections Queue
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Statutory on-site verification requests allocated to your officer caseload.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2">
          {(["ALL", "ACTIVE", "COMPLETED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedFilter === filter
                  ? "bg-[#004e9f] text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {filter === "ALL" ? "All Cases" : filter === "ACTIVE" ? "Active / Scheduled" : "Completed"}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by application no, instrument ID, business..."
          className="w-full pl-10 pr-4 py-2.5 bg-white text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004e9f] text-slate-900"
        />
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No inspections in queue</h3>
            <p className="text-xs text-slate-500">
              {search ? "No matching records found." : "All assigned verification visits are up to date."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {app.applicationNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        app.state === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : app.state === "SCHEDULED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{app.state}</span>
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-800">
                    {app.instrumentNumber || "Instrument"} • {(app.instrumentType || "Scale").replace(/_/g, " ")}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.businessName || "Shree Balaji Weighing Solutions"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {app.scheduledDate
                          ? new Date(app.scheduledDate).toLocaleString()
                          : "Scheduled Slot"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  {app.state === "COMPLETED" ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <Link
                      href={`/field/inspections/${app.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004e9f] hover:bg-[#003366] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                    >
                      <span>Conduct Test</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
