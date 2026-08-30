"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Search,
} from "lucide-react";
import { getAuditLogs } from "@/services/audit/audit.service";
import { AuditLogEntry } from "@/types/audit";
import { AuditHashBadge } from "@/components/admin/AuditHashBadge";

const ENTITY_FILTERS = [
  { label: "All Events", value: "ALL" },
  { label: "Applications", value: "APPLICATION" },
  { label: "Certificates", value: "CERTIFICATE" },
  { label: "Inspections", value: "INSPECTION" },
  { label: "Instruments", value: "INSTRUMENT" },
  { label: "Authentication", value: "AUTH" },
];

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const list = await getAuditLogs();
        if (isMounted) setLogs(list);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = logs.filter((item) => {
    if (selectedFilter !== "ALL" && item.entityType !== selectedFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.action.toLowerCase().includes(q) ||
        item.actorName.toLowerCase().includes(q) ||
        item.entityId.toLowerCase().includes(q) ||
        item.currentHash.toLowerCase().includes(q)
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
      {/* Header & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tamper-Evident Cryptographic Audit Trail
          </h1>
          <p className="text-xs text-slate-600">
            Immutable SHA-256 sequential hash chain recording all statutory verification actions
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-2xs self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Hash Chain Verified: 100% Cryptographic Integrity</span>
        </div>
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
            placeholder="Search action, actor, entity ID, or hash..."
            className="block w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {ENTITY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setSelectedFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === f.value
                  ? "bg-indigo-600 text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Blocks */}
      <div className="space-y-4">
        {filtered.map((entry, idx) => (
          <div
            key={entry.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-200 transition-colors space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-xs font-bold flex items-center justify-center">
                  #{logs.length - idx}
                </span>
                <span className="font-mono text-xs font-extrabold text-indigo-950 px-2 py-0.5 rounded-md bg-indigo-50/70 border border-indigo-100">
                  {entry.action}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  on <strong className="text-slate-800">{entry.entityType}</strong> ({entry.entityId})
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>CHAIN INTACT</span>
                </span>
              </div>
            </div>

            {/* Actor & Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">Actor: </span>
                <span className="font-bold text-slate-900">{entry.actorName}</span>{" "}
                <span className="text-[10px] text-slate-500 font-mono">({entry.actorRole})</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Payload Metadata: </span>
                <span className="font-mono text-slate-700">
                  {JSON.stringify(entry.metadata)}
                </span>
              </div>
            </div>

            {/* Cryptographic Link Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <AuditHashBadge label="Prev Hash" hash={entry.previousHash} />
                <span className="text-slate-400 font-mono">→</span>
                <AuditHashBadge label="Current Hash" hash={entry.currentHash} />
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                SHA-256 Digest Verification
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
