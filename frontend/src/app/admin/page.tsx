"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Users,
  Calendar,
  Award,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAdminDashboardData } from "@/services/admin/admin.service";
import { getApplications } from "@/services/applications/applications.service";
import { getOfficers } from "@/services/officers/officers.service";
import { AdminDashboardData } from "@/types/dashboard";
import { Application } from "@/types/application";
import { Officer } from "@/types/officer";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const [dash, apps, offs, audits] = await Promise.all([
          getAdminDashboardData(),
          getApplications(),
          getOfficers(),
          getAuditLogs(),
        ]);
        if (isMounted) {
          setData(dash);
          setRecentApps(apps.slice(0, 5));
          setOfficers(offs);
          setRecentAudit(audits.slice(0, 4));
        }
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
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading supervisor dashboard">
        <span className="sr-only">Loading supervisor dashboard...</span>
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const appCounts = data?.applicationCounts;
  const certCounts = data?.certificateCounts;

  return (
    <div className="space-y-6">
      {/* Supervisor Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
              Departmental Supervisor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {user?.displayName || "Admin Supervisor"}
          </h1>
          <p className="text-xs text-slate-600">
            Legal Metrology Department • Verification & Certification Control Hub
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Triage Queue ({data?.pendingTriageCount || 0})</span>
          </Link>
          <Link
            href="/admin/certificates"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Certificates</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/applications"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Triage
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {appCounts?.submitted || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Applications awaiting assignment
          </p>
        </Link>

        <Link
          href="/admin/schedules"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Field & Scheduled
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {(appCounts?.assigned || 0) + (appCounts?.scheduled || 0)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {appCounts?.scheduled || 0} visits scheduled
          </p>
        </Link>

        <Link
          href="/admin/certificates"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Certificates
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {certCounts?.valid || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {certCounts?.revoked || 0} revoked • {certCounts?.expired || 0} expired
          </p>
        </Link>

        <Link
          href="/admin/officers"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Field Officers
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {data?.activeOfficersCount || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Active inspectors on duty
          </p>
        </Link>
      </div>

      {/* Main Grid: Applications Triage & Officer Caseload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Triage Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Application Triage Queue
              </h2>
              <p className="text-xs text-slate-500">
                Recent verification applications submitted by businesses
              </p>
            </div>
            <Link
              href="/admin/applications"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
            >
              <span>View full queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentApps.map((app) => (
              <div
                key={app.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 -mx-2 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {app.applicationNumber}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        app.state === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : app.state === "SUBMITTED"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {app.state}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium">
                    {app.instrumentNumber} • {app.instrumentType.replace(/_/g, " ")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Business: {app.businessName} • Assigned:{" "}
                    <span className="font-semibold text-slate-700">
                      {app.assignedOfficerName || "Unassigned"}
                    </span>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Officer Fleet Caseload */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Officer Caseload
              </h2>
              <p className="text-xs text-slate-500">Active workload balancing</p>
            </div>
            <Link
              href="/admin/officers"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {officers.map((off) => {
              const pct = Math.round((off.activeCaseload / off.maxCaseload) * 100);
              return (
                <div
                  key={off.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {off.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {off.activeCaseload}/{off.maxCaseload} Cases
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 75
                          ? "bg-rose-500"
                          : pct > 40
                          ? "bg-amber-500"
                          : "bg-indigo-600"
                      }`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {off.jurisdiction}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
