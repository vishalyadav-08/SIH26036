"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Gauge,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ArrowRight,
  FileCheck2,
} from "lucide-react";
import { InstrumentStatusBadge } from "@/components/instruments/InstrumentStatusBadge";
import { useInstrumentList } from "@/hooks/useInstruments";
import { Instrument } from "@/types/instrument";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All Instruments", value: "ALL" },
  { label: "Not yet verified", value: "REGISTERED" },
  { label: "Verified", value: "ACTIVE" },
  { label: "Pending Verification", value: "PENDING_VERIFICATION" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Retired", value: "INACTIVE" },
];

export default function BusinessInstrumentsPage() {
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Cached by TanStack Query: returning to this route reuses the rows instead
  // of refetching, so navigation is instant.
  const { instruments, isPending: loading } = useInstrumentList();

  const filtered = instruments.filter((ins) => {
    if (selectedFilter !== "ALL" && ins.status !== selectedFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ins.instrumentNumber.toLowerCase().includes(q) ||
        ins.instrumentType.toLowerCase().includes(q) ||
        (ins.serialNumber && ins.serialNumber.toLowerCase().includes(q)) ||
        ins.manufacturer.toLowerCase().includes(q) ||
        ins.model.toLowerCase().includes(q)
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
            Registered Metrological Instruments
          </h1>
          <p className="text-xs text-slate-600">
            Maintain your business instrument registry, calibration records, and statutory certificates
          </p>
        </div>

        <Link
          href="/app/instruments/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Instrument</span>
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
            placeholder="Search by instrument number, category, manufacturer, model..."
            className="block w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((f) => (
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

      {/* Instruments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-3">
            <Gauge className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No registered instruments found matching your criteria.</p>
            <Link
              href="/app/instruments/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register an Instrument</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Instrument ID</th>
                  <th className="py-3 px-4">Category & Model</th>
                  <th className="py-3 px-4">Capacity Range</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Next Due Date</th>
                  <th className="py-3 px-4">Certificate</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link
                        href={`/app/instruments/${ins.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {ins.instrumentNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {ins.instrumentType.replace(/_/g, " ")}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {ins.manufacturer} • {ins.model}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      0 – {ins.capacity} {ins.capacityUnit}
                    </td>
                    <td className="py-3.5 px-4">
                      <InstrumentStatusBadge status={ins.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {ins.nextVerificationDue
                        ? new Date(ins.nextVerificationDue).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {ins.activeCertificateNo ? (
                        <Link
                          href={`/verify/${ins.activeCertificateNo}`}
                          target="_blank"
                          className="font-mono text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          <span>{ins.activeCertificateNo}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ins.status !== "ACTIVE" && (
                          <Link
                            href={`/app/applications/new?instrumentId=${encodeURIComponent(
                              ins.id
                            )}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                            title="Submit Verification Application"
                          >
                            <FileCheck2 className="w-3 h-3" />
                            <span>Apply</span>
                          </Link>
                        )}
                        <Link
                          href={`/app/instruments/${ins.id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                        <Link
                          href={`/app/instruments/${ins.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                        >
                          <span>Passport</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
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
