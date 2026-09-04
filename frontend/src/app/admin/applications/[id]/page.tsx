"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  UserCheck,
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Gauge,
} from "lucide-react";
import {
  getApplicationById,
  assignOfficerToApplication,
  scheduleApplicationVisit,
} from "@/services/applications/applications.service";
import { Application } from "@/types/application";
import { AssignOfficerModal } from "@/components/admin/AssignOfficerModal";
import { ScheduleModal } from "@/components/admin/ScheduleModal";

export default function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

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

  const handleAssign = async (officerId: string, officerName: string, note?: string) => {
    if (!app) return;
    const updated = await assignOfficerToApplication(
      app.id,
      officerId,
      officerName,
      note
    );
    setApp(updated);
    setActionFeedback(`Successfully assigned application to ${officerName}.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleSchedule = async (scheduledAt: string, note?: string) => {
    if (!app) return;
    const updated = await scheduleApplicationVisit(app.id, scheduledAt, note);
    setApp(updated);
    setActionFeedback(
      `Inspection scheduled for ${new Date(scheduledAt).toLocaleString()}.`
    );
    setTimeout(() => setActionFeedback(null), 4000);
  };

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
          href="/admin/applications"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Triage Queue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-1"
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
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : app.state === "SCHEDULED"
                  ? "bg-blue-50 text-blue-800 border border-blue-200"
                  : "bg-indigo-50 text-indigo-800 border border-indigo-200"
              }`}
            >
              {app.state}
            </span>
          </div>

          {/* Supervisor Triage Actions */}
          <div className="flex items-center gap-2">
            {app.state === "SUBMITTED" && (
              <button
                type="button"
                onClick={() => setAssignModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Assign LMO</span>
              </button>
            )}

            {app.state === "ASSIGNED" && (
              <button
                type="button"
                onClick={() => setScheduleModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Inspection</span>
              </button>
            )}

            {app.state === "SCHEDULED" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reschedule</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Re-assign</span>
                </button>
              </div>
            )}

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
      </div>

      {actionFeedback && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instrument Passport Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Instrument Details
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
              <span className="text-slate-500 font-medium">Instrument Category:</span>
              <span className="font-semibold text-slate-900">
                {(app.instrumentType || "Scale").replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Commercial Entity:</span>
              <span className="font-semibold text-slate-900">
                {app.businessName}
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

        {/* Assignment & Workflow Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Assignment & Schedule
            </h2>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Assigned LMO:</span>
              <span className="font-bold text-indigo-950">
                {app.assignedOfficerName || (
                  <span className="text-amber-800 italic">Unassigned (Action Required)</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Scheduled Visit:</span>
              <span className="font-semibold text-slate-900">
                {app.scheduledDate
                  ? new Date(app.scheduledDate).toLocaleString()
                  : "Not Scheduled Yet"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Submission Date:</span>
              <span className="text-slate-700 font-mono">
                {new Date(app.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Last Updated:</span>
              <span className="text-slate-700 font-mono">
                {new Date(app.updatedAt || app.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignOfficerModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleAssign}
        applicationNumber={app.applicationNumber}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSchedule={handleSchedule}
        applicationNumber={app.applicationNumber}
        assignedOfficerName={app.assignedOfficerName}
      />
    </div>
  );
}
