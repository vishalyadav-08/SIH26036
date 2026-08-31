"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  Award,
  ExternalLink,
} from "lucide-react";
import { getApplications } from "@/services/applications/applications.service";
import { Application } from "@/types/application";

const FILTER_STATES: { label: string; value: string }[] = [
  { label: "All Applications", value: "ALL" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Officer Assigned", value: "ASSIGNED" },
  { label: "Inspection Scheduled", value: "SCHEDULED" },
  { label: "Completed", value: "COMPLETED" },
];

export default function BusinessApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const list = await getApplications();
        if (isMounted) setApplications(list);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = applications.filter((app) => {
    if (selectedFilter !== "ALL" && app.state !== selectedFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        app.applicationNumber.toLowerCase().includes(q) ||
        app.instrumentNumber.toLowerCase().includes(q) ||
        app.reason.toLowerCase().includes(q) ||
        (app.assignedOfficerName && app.assignedOfficerName.toLowerCase().includes(q))
      );
    }
    return true;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verification Applications
          </h1>
          <p className="text-xs text-slate-600">
            Track statutory verification requests, assigned Legal Metrology Officers, and scheduled visits
          </p>
        </div>

        <Link
          href="/app/applications/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Verification Application</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by application number, instrument ID, or reason..."
            className="block w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {FILTER_STATES.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setSelectedFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === f.value
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-3">
            <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No verification applications found.</p>
            <Link
              href="/app/applications/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create an Application</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Application #</th>
                  <th className="py-3 px-4">Instrument</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Officer</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Certificate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link
                        href={`/app/applications/${app.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {app.applicationNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-slate-800">
                        {app.instrumentNumber}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {app.instrumentType.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          app.state === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : app.state === "SUBMITTED"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : app.state === "SCHEDULED"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                        }`}
                      >
                        {app.state === "COMPLETED" ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : app.state === "SCHEDULED" ? (
                          <Calendar className="w-3 h-3 text-amber-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-blue-600" />
                        )}
                        <span>{app.state}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {app.assignedOfficerName || (
                        <span className="text-slate-400 italic">Pending Assignment</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {app.scheduledDate
                        ? new Date(app.scheduledDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {app.certificateNumber ? (
                        <Link
                          href={`/verify/${app.certificateNumber}`}
                          target="_blank"
                          className="font-mono text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{app.certificateNumber}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/app/applications/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
