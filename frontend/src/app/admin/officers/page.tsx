"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Phone,
  Mail,
  Shield,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { getOfficers } from "@/services/officers/officers.service";
import { Officer } from "@/types/officer";

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const list = await getOfficers();
        if (isMounted) setOfficers(list);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = officers.filter((off) => {
    const q = search.toLowerCase();
    return (
      off.name.toLowerCase().includes(q) ||
      off.badgeNumber.toLowerCase().includes(q) ||
      off.jurisdiction.toLowerCase().includes(q) ||
      off.email.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          LMO (Legal Metrology Officers) Fleet & Roster
        </h1>
        <p className="text-xs text-slate-600">
          Monitor LMO assignments, jurisdictional zones, and real-time caseload distribution
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search LMO name, badge number, zone..."
          className="block w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
        />
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((off) => {
          const activeCases = off.activeCaseload || 0;
          const maxCases = off.maxCaseload || 8;
          const pct = Math.round((activeCases / maxCases) * 100);
          return (
            <div
              key={off.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {off.name}
                    </h2>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      {off.badgeNumber}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{off.status}</span>
                </span>
              </div>

              {/* Caseload Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Active Caseload:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {activeCases} / {maxCases} Cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct > 75
                        ? "bg-rose-500"
                        : pct > 40
                        ? "bg-amber-500"
                        : "bg-indigo-600"
                    }`}
                    style={{ width: `${Math.min(Math.max(pct, 5), 100)}%` }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-xs pt-1 text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{off.jurisdiction}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-700">{off.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-700">{off.phone}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
