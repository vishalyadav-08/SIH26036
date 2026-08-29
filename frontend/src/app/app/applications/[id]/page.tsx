"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  ExternalLink,
  Gauge,
} from "lucide-react";
import { getApplicationById } from "@/services/applications/applications.service";
import { Application } from "@/types/application";

const TIMELINE_STEPS = [
  { key: "SUBMITTED", label: "Application Submitted", desc: "Awaiting Departmental Triage" },
  { key: "ASSIGNED", label: "Officer Assigned", desc: "Assigned to Field Inspector" },
  { key: "SCHEDULED", label: "Inspection Scheduled", desc: "On-site Visit Confirmed" },
  { key: "COMPLETED", label: "Verified & Stamped", desc: "Statutory Certificate Issued" },
];

export default function BusinessApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const found = await getApplicationById(resolvedParams.id);
        if (isMounted) setApp(found);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-48" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
        <p className="text-sm text-slate-600">Application record not found.</p>
        <Link
          href="/app/applications"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </Link>
      </div>
    );
  }

  const getStepStatus = (stepKey: string) => {
    const states = ["SUBMITTED", "ASSIGNED", "SCHEDULED", "COMPLETED"];
    const currentIndex = states.indexOf(app.state);
    const stepIndex = states.indexOf(stepKey);

    if (stepIndex < currentIndex || app.state === stepKey) {
      return "COMPLETED";
    }
    return "UPCOMING";
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/app/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications Queue</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {app.applicationNumber}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                app.state === "COMPLETED"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : app.state === "SUBMITTED"
                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : app.state === "SCHEDULED"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-indigo-50 text-indigo-800 border border-indigo-200"
              }`}
            >
              {app.state}
            </span>
          </div>

          {app.state === "COMPLETED" && app.certificateNumber && (
            <Link
              href={`/verify/${app.certificateNumber}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Verify Certificate ({app.certificateNumber})</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Visual Workflow Progress Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
          Verification Progress Timeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {TIMELINE_STEPS.map((step, idx) => {
            const status = getStepStatus(step.key);
            const isCurrent = app.state === step.key;

            return (
              <div
                key={step.key}
                className={`p-4 rounded-xl border space-y-1.5 transition-colors ${
                  isCurrent
                    ? "bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20"
                    : status === "COMPLETED"
                    ? "bg-slate-50 border-slate-200"
                    : "bg-white border-slate-100 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    0{idx + 1}
                  </span>
                  {status === "COMPLETED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {step.label}
                </div>
                <div className="text-[11px] text-slate-500">
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instrument Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Gauge className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Target Instrument
            </h2>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Instrument Number:</span>
              <span className="font-mono font-bold text-slate-900">
                {app.instrumentNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Category:</span>
              <span className="font-semibold text-slate-800">
                {app.instrumentType.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Submission Reason:</span>
              <span className="text-slate-700 text-right max-w-[220px]">
                {app.reason}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule & Assignment Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Inspection Schedule
            </h2>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Assigned Officer:</span>
              <span className="font-bold text-slate-900">
                {app.assignedOfficerName || (
                  <span className="text-slate-400 italic">Pending Assignment</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Scheduled Visit:</span>
              <span className="font-semibold text-slate-900">
                {app.scheduledDate
                  ? new Date(app.scheduledDate).toLocaleString()
                  : "Awaiting Schedule"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Submitted On:</span>
              <span className="font-mono text-slate-700">
                {new Date(app.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
