"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  HardDrive,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getApplicationById } from "@/services/applications/applications.service";
import { initializeInspectionDraft } from "@/services/inspections/inspections.service";
import { saveCachedApplication } from "@/lib/offline-storage";
import { Application } from "@/types/application";
import { InspectionStepper } from "@/components/field/InspectionStepper";

export default function InspectionOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const found = await getApplicationById(resolvedParams.id);
        if (isMounted && found) {
          setApp(found);
          // Ensure case is saved to offline cache
          saveCachedApplication(found);
          // Initialize local draft in storage if not already existing
          initializeInspectionDraft(found.id, user?.id || "usr-demo-off-001");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id, user?.id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
        <p className="text-sm text-slate-600">Inspection case not found.</p>
        <Link
          href="/field/inspections"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assigned Cases</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/field/inspections"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Assigned Cases</span>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
            {app.applicationNumber}
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {app.state}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <HardDrive className="w-3 h-3" />
            CACHED LOCALLY
          </span>
        </div>
      </div>

      {/* Stepper */}
      <InspectionStepper applicationId={app.id} currentStep="checklist" />

      {/* Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
              Instrument Details
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Instrument ID:</span>
                <span className="font-mono font-bold text-slate-900">
                  {app.instrumentNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Type:</span>
                <span className="font-semibold text-slate-900">
                  {app.instrumentType.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Reason for Inspection:</span>
                <span className="text-slate-700 text-right max-w-[200px]">
                  {app.reason}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-500">
              Inspection Site & Schedule
            </h2>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Commercial Entity:</span>
                <span className="font-bold text-slate-900">
                  {app.businessName || "Demo Business Owner"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Assigned Officer:</span>
                <span className="font-semibold text-emerald-800">
                  {user?.displayName || "Inspector Sharma"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Scheduled Appointment:</span>
                <span className="font-semibold text-slate-900">
                  {app.scheduledDate
                    ? new Date(app.scheduledDate).toLocaleString()
                    : "Scheduled"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Action */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Link
            href={`/field/inspections/${app.id}/checklist`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <span>Proceed to Step 1: Checklist</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
