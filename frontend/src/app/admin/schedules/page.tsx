"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Building2,
  MapPin,
  StickyNote,
} from "lucide-react";
import { getSchedules } from "@/services/schedules/schedules.service";
import { Schedule } from "@/types/schedule";

export default function AdminSchedulesPage() {
  const [visits, setVisits] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        // Only current (CONFIRMED) appointments, oldest visit first.
        const list = await getSchedules();
        if (isMounted) setVisits(list);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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
          Inspection Schedules & Calendar
        </h1>
        <p className="text-xs text-slate-600">
          Timeline of confirmed on-site statutory inspection appointments
        </p>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {visits.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No inspection appointments currently scheduled.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visits.map((item) => {
              const inProgress = item.applicationState === "INSPECTION_IN_PROGRESS";

              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {item.applicationNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          inProgress
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{inProgress ? "IN PROGRESS" : "SCHEDULED"}</span>
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800">
                      {item.instrumentNumber} • {item.instrumentType.replace(/_/g, " ")}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.businessName}</span>
                      </div>
                      {item.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.location}</span>
                          </div>
                        </>
                      )}
                      <span>•</span>
                      <div className="flex items-center gap-1 text-indigo-900 font-medium">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Officer: {item.officerName}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-slate-900 font-bold font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(item.scheduledAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {item.scheduleNote && (
                      <div className="flex items-start gap-1 text-[11px] text-slate-500">
                        <StickyNote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{item.scheduleNote}</span>
                      </div>
                    )}
                  </div>

                  <div className="self-end sm:self-center">
                    <Link
                      href={`/admin/applications/${item.applicationId}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
