"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  initializeInspectionDraft,
  submitFinalInspectionDecision,
} from "@/services/inspections/inspections.service";
import { getApplicationById } from "@/services/applications/applications.service";
import { getInspectionDraft } from "@/lib/offline-storage";
import { InspectionDraft, InspectionResult } from "@/types/inspection";
import { Application } from "@/types/application";
import { InspectionStepper } from "@/components/field/InspectionStepper";

export default function InspectionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [result, setResult] = useState<InspectionResult>("PASS");
  const [notes, setNotes] = useState("Instrument meets statutory maximum permissible error requirements.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<{
    queuedOffline: boolean;
  } | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      let current = getInspectionDraft(resolvedParams.id);
      if (!current) {
        current = initializeInspectionDraft(resolvedParams.id, user?.id || "usr-demo-off-001");
      }
      setDraft(current);

      getApplicationById(resolvedParams.id).then((found) => {
        if (found) setApp(found);
      });
    });
  }, [resolvedParams.id, user?.id]);

  const handleSubmitDecision = async () => {
    if (!draft) return;
    setIsSubmitting(true);

    try {
      const outcome = await submitFinalInspectionDecision(
        draft,
        result,
        notes,
        {
          applicationNumber: app?.applicationNumber || "APP-DEMO",
          instrumentNumber: app?.instrumentNumber || "INS-DEMO",
        }
      );
      setSubmittedStatus({ queuedOffline: outcome.queuedOffline });
    } finally {
      setIsSubmitting(false);
    }
  };

  const checklistPassedCount = draft?.checklist.filter((c) => c.passed).length || 0;
  const readingsCount = draft?.measurements.length || 0;
  const evidenceCount = draft?.evidence.length || 0;

  if (submittedStatus) {
    return (
      <div className="max-w-xl mx-auto py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-extrabold text-slate-900">
            Inspection Decision Recorded!
          </h1>

          <p className="text-xs text-slate-600 leading-relaxed">
            {submittedStatus.queuedOffline ? (
              <>
                Operation successfully queued in local IndexedDB as{" "}
                <span className="font-bold text-amber-800">READY_TO_SYNC</span>.
                When you reconnect to network, open the Sync Center to upload.
              </>
            ) : (
              <>Decision submitted and confirmed by central server.</>
            )}
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono text-left">
            <div>
              <span className="text-slate-500 font-sans">Decision: </span>
              <span className="font-bold text-emerald-800">{result}</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans">Case: </span>
              <span>{app?.applicationNumber || resolvedParams.id}</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans">Inspector: </span>
              <span>{user?.displayName || "Inspector Sharma"}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/field/sync"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Open Sync Center</span>
            </Link>
            <Link
              href="/field"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
            >
              <span>Field Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/field/inspections/${resolvedParams.id}/evidence`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Evidence</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Step 4: Statutory Decision & Review
        </h1>
        <p className="text-xs text-slate-600">
          Review verification evidence and record the official statutory inspection outcome
        </p>
      </div>

      <InspectionStepper applicationId={resolvedParams.id} currentStep="review" />

      {/* Summary Verification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">
            1. Checklist
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {checklistPassedCount} / {draft?.checklist.length || 0} Passed
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">
            2. Test Readings
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {readingsCount} Points Checked
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase">
            3. Photo Evidence
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {evidenceCount} Blobs Attached
          </div>
        </div>
      </div>

      {/* Decision Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Statutory Inspection Decision:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setResult("PASS")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                result === "PASS"
                  ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>PASS</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Instrument conforms to statutory tolerances. Eligible for digital certificate.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setResult("REQUIRES_CORRECTION")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                result === "REQUIRES_CORRECTION"
                  ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>CORRECTION</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Minor calibration or leveling adjustments required before re-testing.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setResult("FAIL")}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                result === "FAIL"
                  ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                <XCircle className="w-4 h-4" />
                <span>FAIL</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Instrument rejected. Serious error or physical seal tampering detected.
              </p>
            </button>
          </div>
        </div>

        {/* Inspector Remarks */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Statutory Inspector Remarks / Notes:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={handleSubmitDecision}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Recording Decision...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Confirm & Finalize Decision ({result})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
