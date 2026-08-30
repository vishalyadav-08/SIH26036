"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  MapPin,
  ShieldCheck,
  Gauge,
  LogOut,
  FileCheck2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getInstruments } from "@/services/instruments/instruments.service";
import { getApplications } from "@/services/applications/applications.service";

export default function BusinessProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [instrumentCount, setInstrumentCount] = useState(0);
  const [activeCertCount, setActiveCertCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const [insList, appList] = await Promise.all([
          getInstruments(),
          getApplications(),
        ]);
        if (isMounted) {
          setInstrumentCount(insList.length);
          setActiveCertCount(insList.filter((i) => i.status === "ACTIVE").length);
          setApplicationCount(appList.length);
        }
      } catch {
        // ignore
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Commercial Business Profile & Compliance
        </h1>
        <p className="text-xs text-slate-600">
          Official registered entity credentials and statutory metrology compliance overview
        </p>
      </div>

      {/* Entity Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {user?.displayName || "Demo Business Owner"}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Entity ID: {user?.businessId || "biz-demo-001"} • Role: {user?.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Entity Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-slate-500 font-medium block">Commercial Registration</span>
            <div className="font-semibold text-slate-800">GSTIN / Trade Reg: 27AABCU9603R1ZM</div>
            <div className="text-slate-600">Authorized Legal Representative: {user?.displayName}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-slate-500 font-medium block">Contact & Registered Office</span>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Plot 42, Industrial Area, Sector 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Metrological Compliance Health
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Registered Instruments</span>
              <Gauge className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {instrumentCount}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Active Verified Instruments</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {activeCertCount}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Total Applications</span>
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {applicationCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
