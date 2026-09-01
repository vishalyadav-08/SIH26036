"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Gauge,
  FileCheck2,
  Award,
  AlertCircle,
  Calendar,
  Download,
  Plus,
  ArrowRight,
  Info,
  CheckCircle,
  Clock,
  Building2,
} from "lucide-react";

import { getApplications } from "@/services/applications/applications.service";
import { getInstruments } from "@/services/instruments/instruments.service";
import { getCertificates } from "@/services/certificates/certificates.service";

import type { Application } from "@/types/application";
import type { Instrument } from "@/types/instrument";
import type { Certificate } from "@/types/certificate";

export default function BusinessDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [apps, insts, certs] = await Promise.all([
          getApplications(),
          getInstruments(),
          getCertificates(),
        ]);
        setApplications(apps);
        setInstruments(insts);
        setCertificates(certs);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm">Failed to load dashboard</h3>
            <p className="text-xs text-rose-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const activeInstruments = instruments.filter((i) => i.status === "ACTIVE").length;
  const activeCertificates = certificates.filter((c) => c.status === "VALID").length;
  const pendingActionsCount =
    applications.filter((a) => a.state === "REJECTED").length +
    certificates.filter(
      (c) => c.status === "EXPIRED" || c.status === "REVOKED" || c.status === "INVALID"
    ).length;

  const scheduledInspections = applications.filter((a) => a.state === "SCHEDULED" || a.state === "INSPECTION_PENDING");
  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#cbd5e1] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111c2d] tracking-tight flex items-center gap-2">
            Business Dashboard <span className="text-[#727784] font-normal text-xl">| डैशबोर्ड</span>
          </h1>
          <p className="text-xs md:text-sm text-[#414753] mt-1">
            Overview of your registered instruments, verification applications, and regulatory standing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="bg-white border border-[#cbd5e1] text-[#004e9f] font-semibold text-xs py-2.5 px-4 rounded-lg hover:bg-[#f0f3ff] transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
          <Link
            href="/app/applications/new"
            className="bg-[#004e9f] text-white font-bold text-xs py-2.5 px-4 rounded-lg hover:bg-[#003366] transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Application</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-[#cbd5e1] p-5 flex flex-col justify-between hover:border-[#004e9f] transition-all shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-[#f0f3ff] flex items-center justify-center text-[#004e9f]">
              <Gauge className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#414753] bg-[#f8fafc] border border-[#cbd5e1] px-2 py-0.5 rounded">
              Total
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#111c2d]">{loading ? "-" : instruments.length}</h3>
            <p className="text-xs text-[#414753] mt-0.5">Registered Instruments</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-[#cbd5e1] p-5 flex flex-col justify-between hover:border-[#15803d] transition-all shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#15803d]">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#15803d] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Active
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#111c2d]">{loading ? "-" : activeCertificates}</h3>
            <p className="text-xs text-[#414753] mt-0.5">Active Certificates</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-[#cbd5e1] p-5 flex flex-col justify-between hover:border-[#b45309] transition-all shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#b45309]">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#b45309] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Scheduled
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#111c2d]">{loading ? "-" : scheduledInspections.length}</h3>
            <p className="text-xs text-[#414753] mt-0.5">Upcoming Inspections</p>
          </div>
        </div>

        {/* Card 4 */}
        <div
          className={`rounded-xl border p-5 flex flex-col justify-between transition-all shadow-xs ${
            pendingActionsCount > 0
              ? "bg-rose-50/50 border-[#b91c1c]"
              : "bg-white border-[#cbd5e1]"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-[#b91c1c]">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#b91c1c] bg-rose-100 px-2 py-0.5 rounded">
              Action Required
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#b91c1c]">{loading ? "-" : pendingActionsCount}</h3>
            <p className="text-xs text-[#414753] mt-0.5">Expiring / Issues</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Detailed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Applications Table */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#cbd5e1] bg-[#f8fafc] flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#111c2d] flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#004e9f]" /> Recent Applications
              </h2>
              <Link href="/app/applications" className="text-xs font-bold text-[#004e9f] hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#414753] font-semibold">
                  <tr>
                    <th className="p-3.5">Ref Number</th>
                    <th className="p-3.5">Instrument Type</th>
                    <th className="p-3.5">Submission Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cbd5e1]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#414753]">
                        Loading applications...
                      </td>
                    </tr>
                  ) : recentApplications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-[#414753]">
                        No verification applications found.
                      </td>
                    </tr>
                  ) : (
                    recentApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="p-3.5 font-mono font-bold text-[#111c2d]">{app.applicationNumber}</td>
                        <td className="p-3.5 text-[#414753]">{app.instrumentType.replace(/_/g, " ")}</td>
                        <td className="p-3.5 text-[#414753]">
                          {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "Recent"}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              app.state === "APPROVED" || app.state === "VERIFIED"
                                ? "bg-emerald-50 text-[#15803d] border border-emerald-200"
                                : app.state === "REJECTED"
                                ? "bg-rose-50 text-[#b91c1c] border border-rose-200"
                                : "bg-blue-50 text-[#004e9f] border border-blue-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                app.state === "APPROVED" || app.state === "VERIFIED"
                                  ? "bg-[#15803d]"
                                  : app.state === "REJECTED"
                                  ? "bg-[#b91c1c]"
                                  : "bg-[#004e9f]"
                              }`}
                            />
                            {app.state.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <Link
                            href={`/app/applications/${app.id}`}
                            className="text-[#004e9f] font-bold hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Inspections Section */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#cbd5e1] bg-[#f8fafc] flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#111c2d] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#004e9f]" /> Upcoming Inspections &amp; Verifications
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {scheduledInspections.length === 0 ? (
                <p className="text-xs text-[#414753] py-3 text-center">
                  No upcoming verification inspections scheduled at this time.
                </p>
              ) : (
                scheduledInspections.map((insp) => (
                  <div
                    key={insp.id}
                    className="flex items-center justify-between p-3.5 border border-[#cbd5e1] rounded-lg bg-white hover:border-[#004e9f] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#f0f3ff] rounded-lg flex flex-col items-center justify-center border border-[#cbd5e1] text-[#004e9f]">
                        <span className="text-[10px] font-bold uppercase">
                          {insp.scheduledDate
                            ? new Date(insp.scheduledDate).toLocaleString("default", { month: "short" })
                            : "SCH"}
                        </span>
                        <span className="text-base font-bold text-[#111c2d] leading-none">
                          {insp.scheduledDate ? new Date(insp.scheduledDate).getDate() : "—"}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#111c2d]">
                          {insp.instrumentType.replace(/_/g, " ")} Verification
                        </h4>
                        <p className="text-[11px] text-[#414753] mt-0.5">Application #{insp.applicationNumber}</p>
                      </div>
                    </div>
                    <span className="bg-[#f0f3ff] text-[#004e9f] border border-[#004e9f]/20 px-2.5 py-1 rounded text-[11px] font-semibold">
                      Scheduled
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          {/* Action Required Alert Box */}
          {pendingActionsCount > 0 ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 shadow-xs">
              <AlertCircle className="w-5 h-5 text-[#b91c1c] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#b91c1c]">Compliance Action Required</h3>
                <p className="text-xs text-[#414753] mt-1">
                  You have {pendingActionsCount} certificate(s) or application(s) that require immediate renewal or review.
                </p>
                <Link
                  href="/app/certificates"
                  className="inline-block mt-3 bg-[#b91c1c] text-white font-bold text-xs py-1.5 px-3 rounded hover:bg-[#991b1b] transition-colors"
                >
                  Initiate Renewal
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 shadow-xs">
              <CheckCircle className="w-5 h-5 text-[#15803d] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#15803d]">All Compliances Up to Date</h3>
                <p className="text-xs text-[#414753] mt-1">
                  All your registered instruments and enterprise certificates are valid under Legal Metrology standards.
                </p>
              </div>
            </div>
          )}

          {/* Recent Notifications Box */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#cbd5e1] bg-[#f8fafc] flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#111c2d] flex items-center gap-2">
                <Info className="w-4 h-4 text-[#004e9f]" /> Notifications
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2.5 pb-3 border-b border-[#cbd5e1]">
                <Info className="w-4 h-4 text-[#004e9f] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#111c2d]">New quarterly calibration guidelines released by Directorate.</p>
                  <span className="text-[10px] text-[#727784]">1 day ago</span>
                </div>
              </div>
              <div className="flex gap-2.5 pb-3 border-b border-[#cbd5e1]">
                <CheckCircle className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#111c2d]">Online payment receipt verified for latest inspection.</p>
                  <span className="text-[10px] text-[#727784]">2 days ago</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <Clock className="w-4 h-4 text-[#727784] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#111c2d]">Annual verification window opens in 30 days.</p>
                  <span className="text-[10px] text-[#727784]">4 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

