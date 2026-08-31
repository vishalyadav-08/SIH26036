"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getInstruments } from "@/services/instruments/instruments.service";
import { createApplication } from "@/services/applications/applications.service";
import { Instrument } from "@/types/instrument";

const VERIFICATION_REASONS = [
  "Periodic annual statutory re-verification",
  "Initial verification of newly acquired instrument",
  "Re-verification post-repair / recalibration",
  "Voluntary re-verification request",
  "Certificate validity expired / broken seal renewal",
];

function NewApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedInstrumentId = searchParams.get("instrumentId") || "";

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(
    preselectedInstrumentId
  );
  const [reason, setReason] = useState(VERIFICATION_REASONS[0]);
  const [customNote, setCustomNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const list = await getInstruments();
        if (isMounted) {
          setInstruments(list);
          if (list.length > 0 && !selectedInstrumentId) {
            setSelectedInstrumentId(list[0].id);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedInstrumentId]);

  const selectedInstrument = instruments.find(
    (ins) => ins.id === selectedInstrumentId || ins.instrumentNumber === selectedInstrumentId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedInstrumentId) {
      setError("Please select a registered instrument.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullReason = customNote.trim()
        ? `${reason}. Additional Note: ${customNote.trim()}`
        : reason;

      const newApp = await createApplication({
        instrumentId: selectedInstrumentId,
        reason: fullReason,
      });

      setSuccessMsg(`Application ${newApp.applicationNumber} created successfully! Redirecting...`);
      setTimeout(() => {
        router.push(`/app/applications/${newApp.id}`);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create application.";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-48" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/app/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Verification Application
        </h1>
        <p className="text-xs text-slate-600">
          Request official statutory verification and stamping by the Legal Metrology Department
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Application Details
            </h2>
          </div>

          <div className="space-y-4">
            {/* Instrument Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="instrumentSelect"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
              >
                Select Target Instrument: *
              </label>
              {instruments.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  No registered instruments found. Please{" "}
                  <Link
                    href="/app/instruments/new"
                    className="font-bold underline"
                  >
                    register an instrument
                  </Link>{" "}
                  first.
                </div>
              ) : (
                <select
                  id="instrumentSelect"
                  required
                  value={selectedInstrumentId}
                  onChange={(e) => setSelectedInstrumentId(e.target.value)}
                  className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {instruments.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.instrumentNumber} — {ins.instrumentType.replace(/_/g, " ")} (
                      {ins.manufacturer} • 0–{ins.capacity} {ins.capacityUnit})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Verification Reason */}
            <div className="space-y-1.5">
              <label
                htmlFor="reasonSelect"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
              >
                Statutory Reason for Verification: *
              </label>
              <select
                id="reasonSelect"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {VERIFICATION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Custom Note */}
            <div className="space-y-1.5">
              <label
                htmlFor="customNote"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
              >
                Premises Access Instructions / Availability Notes:
              </label>
              <textarea
                id="customNote"
                rows={3}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Available weekdays between 10:00 AM and 4:00 PM. Contact store supervisor upon arrival."
                className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/app/applications"
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || instruments.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isSubmitting ? "Submitting..." : "Submit Application"}</span>
            </button>
          </div>
        </form>

        {/* Live Summary Column */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 h-fit">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Application Summary
          </h2>

          {selectedInstrument ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Selected Instrument:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedInstrument.instrumentNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Category:</span>
                <span className="font-semibold text-slate-800">
                  {selectedInstrument.instrumentType.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Capacity Range:</span>
                <span className="font-mono text-slate-700">
                  0 – {selectedInstrument.capacity} {selectedInstrument.capacityUnit}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Premises Location:</span>
                <span className="text-slate-700">
                  {selectedInstrument.location || "Main Business Premises"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Select an instrument to view technical details.
            </div>
          )}

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
            <span className="font-bold block">Next Workflow Step:</span>
            <span>
              Once submitted, your application is queued in the Departmental Triage Hub. An Admin Supervisor will assign a Legal Metrology Officer.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Loading form...</div>}>
      <NewApplicationForm />
    </Suspense>
  );
}
