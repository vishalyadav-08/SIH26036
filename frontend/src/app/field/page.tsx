"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  RefreshCw,
  Award,
  Calendar,
  AlertCircle,
  ArrowRight,
  HardDrive,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  Shield,
  FileCheck2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getApplications } from "@/services/applications/applications.service";
import { getSyncQueue, isOfflineSimulated } from "@/lib/offline-storage";
import { Application } from "@/types/application";

export default function FieldDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
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
        console.error("Failed to load officer applications", err);
      } finally {
        if (isMounted) setLoading(false);
      }

      if (typeof window !== "undefined") {
        const queue = getSyncQueue();
        setPendingSyncCount(queue.length);
        setIsOffline(!navigator.onLine || isOfflineSimulated());
      }
    }

    loadData();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      isMounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const assignedApps = applications.filter(
    (a) => a.state === "ASSIGNED" || a.state === "SCHEDULED"
  );
  const completedApps = applications.filter(
    (a) => a.state === "COMPLETED"
  );
  const urgentApps = applications.filter((a) => a.state === "REJECTED");

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#cbd5e1] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111c2d] tracking-tight flex items-center gap-2">
            LMO Console <span className="text-[#727784] font-normal text-xl">| क्षेत्रीय अधिकारी</span>
          </h1>
          <p className="text-xs md:text-sm text-[#414753] mt-1">
            Offline-first statutory inspection toolkit, verification checklists, and sync manager.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/field/sync"
            className="bg-white border border-[#cbd5e1] text-[#004e9f] font-semibold text-xs py-2.5 px-4 rounded-lg hover:bg-[#f0f3ff] transition-colors flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${pendingSyncCount > 0 ? "animate-spin text-[#b45309]" : ""}`} />
            <span>Sync Queue ({pendingSyncCount})</span>
          </Link>
          <Link
            href="/field/inspections"
            className="bg-[#004e9f] text-white font-bold text-xs py-2.5 px-4 rounded-lg hover:bg-[#003366] transition-colors flex items-center gap-2 shadow-xs"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Start Inspection</span>
          </Link>
        </div>
      </div>

      {/* 4 Bento Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Link
          href="/field/inspections"
          className="bg-white rounded-xl border border-[#cbd5e1] p-5 flex flex-col justify-between hover:border-[#004e9f] transition-all shadow-xs group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-[#f0f3ff] text-[#004e9f] flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#004e9f] bg-[#f0f3ff] border border-[#004e9f]/20 px-2 py-0.5 rounded">
              Assigned
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#111c2d]">{loading ? "-" : assignedApps.length}</h3>
            <p className="text-xs text-[#414753] mt-0.5">Active Verification Cases</p>
          </div>
        </Link>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-[#cbd5e1] p-5 flex flex-col justify-between hover:border-[#15803d] transition-all shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#15803d] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#15803d] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Completed
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#111c2d]">{loading ? "-" : completedApps.length}</h3>
            <p className="text-xs text-[#414753] mt-0.5">Verified &amp; Sealed</p>
          </div>
        </div>

        {/* Card 3 */}
        <Link
          href="/field/sync"
          className="bg-white rounded-xl border border-[#cbd5e1] p-5 flex flex-col justify-between hover:border-[#b45309] transition-all shadow-xs group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-[#b45309] flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#b45309] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Pending Sync
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#111c2d]">{pendingSyncCount}</h3>
            <p className="text-xs text-[#414753] mt-0.5">Offline Records in Queue</p>
          </div>
        </Link>

        {/* Card 4 */}
        <div
          className={`rounded-xl border p-5 flex flex-col justify-between transition-all shadow-xs ${
            urgentApps.length > 0
              ? "bg-rose-50/50 border-[#b91c1c]"
              : "bg-white border-[#cbd5e1]"
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-[#b91c1c] flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#b91c1c] bg-rose-100 px-2 py-0.5 rounded">
              Flagged
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#b91c1c]">{loading ? "-" : urgentApps.length}</h3>
            <p className="text-xs text-[#414753] mt-0.5">Failed / Re-inspection</p>
          </div>
        </div>
      </div>

      {/* Main Detailed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width): Assigned Inspections Queue */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#cbd5e1] bg-[#f8fafc] flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-[#111c2d] flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[#004e9f]" /> Today&apos;s Field Inspection Queue
                </h2>
                <p className="text-[11px] text-[#414753]">Assigned instruments requiring on-site test verification</p>
              </div>
              <Link
                href="/field/inspections"
                className="text-xs font-bold text-[#004e9f] hover:underline inline-flex items-center gap-1"
              >
                <span>All Cases</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#cbd5e1]">
              {assignedApps.length === 0 ? (
                <div className="p-8 text-center text-[#414753] space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#15803d] mx-auto" />
                  <p className="text-xs font-semibold">No active inspection cases in your queue.</p>
                  <p className="text-[11px] text-[#727784]">Check back later or synchronize with the department server.</p>
                </div>
              ) : (
                assignedApps.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#111c2d]">
                          {app.applicationNumber}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#f0f3ff] text-[#004e9f] border border-[#004e9f]/20">
                          {app.state}
                        </span>
                      </div>
                      <div className="text-xs text-[#111c2d] font-semibold">
                        {app.instrumentNumber} • {app.instrumentType.replace(/_/g, " ")}
                      </div>
                      <div className="text-[11px] text-[#414753]">
                        Premises: <span className="font-semibold text-[#111c2d]">{app.businessName}</span>
                      </div>
                    </div>

                    <div className="self-end sm:self-center">
                      <Link
                        href={`/field/inspections/${app.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#004e9f] hover:bg-[#003366] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                      >
                        <span>Conduct Test</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width): Device & Storage Status */}
        <div className="space-y-6">
          {/* Offline Engine Status Widget */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#111c2d] uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#004e9f]" /> PWA Offline Engine
            </h3>

            <div className="p-3 rounded-lg bg-[#f8fafc] border border-[#cbd5e1] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#414753]">Network Link:</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold ${
                    isOffline ? "text-[#b45309]" : "text-[#15803d]"
                  }`}
                >
                  {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
                  {isOffline ? "Offline Mode" : "Online (Connected)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#414753]">Pending Syncs:</span>
                <span className="text-xs font-mono font-bold text-[#111c2d]">{pendingSyncCount} operations</span>
              </div>
            </div>

            <Link
              href="/field/sync"
              className="w-full flex items-center justify-center gap-2 bg-[#f0f3ff] hover:bg-[#dee8ff] text-[#004e9f] font-bold text-xs py-2.5 px-4 rounded-lg border border-[#cbd5e1] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Manage Sync Center</span>
            </Link>
          </div>

          {/* Legal Metrology Officer Bulletins */}
          <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#cbd5e1] bg-[#f8fafc]">
              <h3 className="text-xs font-bold text-[#111c2d] uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#004e9f]" /> Officer Field Notices
              </h3>
            </div>
            <div className="p-4 space-y-3 text-xs text-[#414753]">
              <div className="pb-3 border-b border-[#cbd5e1]">
                <p className="font-semibold text-[#111c2d]">Physical Stamping Security</p>
                <p className="text-[11px] text-[#727784] mt-0.5">
                  Always inspect the lead seal integrity and capture tamper photos before issuing valid certificates.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#111c2d]">Tolerance Error Limits</p>
                <p className="text-[11px] text-[#727784] mt-0.5">
                  Ensure all weight measurements fall within statutory tolerance bands specified in Rule 12.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

