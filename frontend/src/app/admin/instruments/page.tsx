"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
} from "lucide-react";
import { useInstrumentList } from "@/hooks/useInstruments";
import { InstrumentStatusBadge } from "@/components/instruments/InstrumentStatusBadge";
import { Instrument } from "@/types/instrument";

export default function AdminInstrumentsPage() {
  const [search, setSearch] = useState("");

  // Cached across route changes; no refetch when returning to this page.
  const { instruments, isPending: loading } = useInstrumentList();

  const filtered = instruments.filter((ins) => {
    const q = search.toLowerCase();
    return (
      ins.instrumentNumber.toLowerCase().includes(q) ||
      ins.instrumentType.toLowerCase().includes(q) ||
      (ins.serialNumber && ins.serialNumber.toLowerCase().includes(q)) ||
      ins.manufacturer.toLowerCase().includes(q) ||
      ins.model.toLowerCase().includes(q)
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Registered Instruments Master Registry
        </h1>
        <p className="text-xs text-slate-600">
          Search and inspect metrological instruments registered across commercial entities
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search instrument ID, type, manufacturer, serial..."
          className="block w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
        />
      </div>

      {/* Instruments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No matching registered instruments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Instrument ID</th>
                  <th className="py-3 px-4">Category & Model</th>
                  <th className="py-3 px-4">Commercial Entity</th>
                  <th className="py-3 px-4">Capacity Range</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Next Verification Due</th>
                  <th className="py-3 px-4 text-right">Active Cert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {ins.instrumentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {ins.instrumentType.replace(/_/g, " ")}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {ins.manufacturer} • Model: {ins.model}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {ins.businessId === "biz-demo-001" ? "Demo Business Owner" : ins.businessId}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      0 – {ins.capacity} {ins.capacityUnit || "kg"}
                    </td>
                    <td className="py-3.5 px-4">
                      <InstrumentStatusBadge status={ins.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {ins.nextVerificationDue
                        ? new Date(ins.nextVerificationDue).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ins.activeCertificateNo ? (
                        <Link
                          href={`/verify/${ins.activeCertificateNo}`}
                          target="_blank"
                          className="font-mono text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                        >
                          <span>{ins.activeCertificateNo}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
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
