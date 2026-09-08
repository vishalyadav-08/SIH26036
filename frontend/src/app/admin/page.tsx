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
  Download,
  UserPlus,
  Shield,
  Activity,
  AlertCircle,
  FileCheck2,
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
        const [dash, apps, offs] = await Promise.all([
          getAdminDashboardData().catch(() => null),
          getApplications().catch(() => []),
          getOfficers().catch(() => []),
        ]);
        if (isMounted) {
          setData(
            dash || {
              applicationCounts: {
                submitted: apps.filter((a) => a.state === "SUBMITTED").length,
                assigned: apps.filter((a) => a.state === "ASSIGNED").length,
                scheduled: apps.filter((a) => a.state === "SCHEDULED").length,
                inspected: apps.filter((a) => a.state === "INSPECTED").length,
                completed: apps.filter((a) => a.state === "COMPLETED").length,
                total: apps.length,
              },
              certificateCounts: { valid: 0, expired: 0, revoked: 0, total: 0 },
              activeOfficersCount: offs.length,
              totalInstrumentsCount: 0,
              pendingTriageCount: apps.filter((a) => a.state === "SUBMITTED").length,
              scheduledTodayCount: apps.filter((a) => a.state === "SCHEDULED").length,
            }
          );
          setRecentApps(apps.slice(0, 5));
          setOfficers(offs);
        }
      } catch (e) {
        console.error("Admin dashboard fetch error:", e);
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
        <div className="h-20 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 rounded-xl" />
          <div className="h-28 bg-slate-200 rounded-xl" />
          <div className="h-28 bg-slate-200 rounded-xl" />
          <div className="h-28 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const appCounts = data?.applicationCounts;
  const certCounts = data?.certificateCounts;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#cbd5e1] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111c2d] tracking-tight flex items-center gap-2">
            GATCs Dashboard <span className="text-[#727784] font-normal text-xl">| प्रशासनिक डैशबोर्ड</span>
          </h1>
          <p className="text-xs md:text-sm text-[#414753] mt-1">
            GATC supervision, LMO assignments, audit logs, and verification control hub.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/audit"
            className="bg-white border border-[#cbd5e1] text-[#004e9f] font-semibold text-xs py-2.5 px-4 rounded-lg hover:bg-[#f0f3ff] transition-colors flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Log</span>
          </Link>
          <Link
            href="/admin/officers"
            className="bg-[#004e9f] text-white font-bold text-xs py-2.5 px-4 rounded-lg hover:bg-[#003366] transition-colors flex items-center gap-2 shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Deploy LMO</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/applications"
          className="bg-white rounded-xl border border-[#cbd5e1] p-5 flex flex-col justify-between hover:border-[#b45309] transition-all shadow-xs group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#b45309] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#b45309] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Pending
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#111c2d]">{appCounts?.submitted || 0}</h3>
            <p className="text-xs text-[#414753] mt-0.5">Awaiting LMO Assignment</p>
          </div>
        </Link>

        <Link
          href="/admin/schedules"
          className="bg-white rounded-xl border border-[#cbd5e1] p-5 flex flex-col justify-between hover:border-[#004e9f] transition-all shadow-xs group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-[#f0f3ff] text-[#004e9f] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#004e9f] bg-[#f0f3ff] border border-[#004e9f]/20 px-2 py-0.5 rounded">
              Field Active
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#111c2d]">
              {(appCounts?.assigned || 0) + (appCounts?.scheduled || 0)}
            </h3>
            <p className="text-xs text-[#414753] mt-0.5">Scheduled Visits On Duty</p>
          </div>
        </Link>

        <Link
          href="/admin/certificates"
          className="bg-white rounded-xl border border-[#cbd5e1] p-5 flex flex-col justify-between hover:border-[#15803d] transition-all shadow-xs group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#15803d] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#15803d] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Valid
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#111c2d]">{certCounts?.valid || 0}</h3>
            <p className="text-xs text-[#414753] mt-0.5">Active Certificates Issued</p>
          </div>
        </Link>

        <Link
          href="/admin/officers"
          className="bg-white rounded-xl border border-[#cbd5e1] p-5 flex flex-col justify-between hover:border-[#3a5f94] transition-all shadow-xs group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#3a5f94] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#3a5f94] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              LMOs
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#111c2d]">{data?.activeOfficersCount || 0}</h3>
            <p className="text-xs text-[#414753] mt-0.5">LMOs in Region</p>
          </div>
        </Link>
      </div>

      {/* Main Detailed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications Triage Queue (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#cbd5e1] bg-[#f8fafc] flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-[#111c2d] flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#004e9f]" /> Application Triage Queue
              </h2>
              <p className="text-[11px] text-[#414753]">Applications awaiting departmental review</p>
            </div>
            <Link
              href="/admin/applications"
              className="text-xs font-bold text-[#004e9f] hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#cbd5e1]">
            {recentApps.map((app) => (
              <div
                key={app.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8fafc] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#111c2d]">
                      {app.applicationNumber}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        app.state === "COMPLETED"
                          ? "bg-emerald-50 text-[#15803d] border border-emerald-200"
                          : app.state === "SUBMITTED"
                          ? "bg-amber-50 text-[#b45309] border border-amber-200"
                          : "bg-blue-50 text-[#004e9f] border border-blue-200"
                      }`}
                    >
                      {app.state}
                    </span>
                  </div>
                  <div className="text-xs text-[#111c2d] font-semibold">
                    {app.instrumentNumber || "Instrument"} • {(app.instrumentType || "Scale").replace(/_/g, " ")}
                  </div>
                  <div className="text-[11px] text-[#414753]">
                    Business: <span className="font-semibold text-[#111c2d]">{app.businessName || "Registered Business"}</span> • Assigned LMO:{" "}
                    <span className="font-semibold text-[#004e9f]">
                      {app.assignedOfficerName || "Unassigned"}
                    </span>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#004e9f] hover:bg-[#003366] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LMO Fleet Caseload (1/3 width) */}
        <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-xs flex flex-col">
          <div className="p-4 border-b border-[#cbd5e1] bg-[#f8fafc] flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-[#111c2d] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#004e9f]" /> LMO Caseload
              </h2>
              <p className="text-[11px] text-[#414753]">LMO field inspection capacity</p>
            </div>
            <Link
              href="/admin/officers"
              className="text-xs font-bold text-[#004e9f] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 space-y-3.5 flex-1">
            {officers.map((off) => {
              const activeCases = off.activeCaseload || 0;
              const maxCases = off.maxCaseload || 8;
              const pct = Math.round((activeCases / maxCases) * 100);
              return (
                <div
                  key={off.id}
                  className="p-3 bg-[#f8fafc] rounded-lg border border-[#cbd5e1] space-y-2 hover:border-[#004e9f] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111c2d]">
                      {off.name || off.email}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-[#414753]">
                      {activeCases}/{maxCases} Cases
                    </span>
                  </div>
                  <div className="w-full bg-[#cbd5e1] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 75
                          ? "bg-[#b91c1c]"
                          : pct > 40
                          ? "bg-[#b45309]"
                          : "bg-[#004e9f]"
                      }`}
                      style={{ width: `${Math.min(Math.max(pct, 5), 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#727784] truncate">
                    Jurisdiction: {off.jurisdiction || "Gorakhpur District"}
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

