"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { initializeInspectionDraft } from "@/services/inspections/inspections.service";
import { getInspectionDraft, saveInspectionDraft } from "@/lib/offline-storage";
import { MeasurementReading, InspectionDraft } from "@/types/inspection";
import { InspectionStepper } from "@/components/field/InspectionStepper";

export default function InspectionReadingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [readings, setReadings] = useState<MeasurementReading[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      let current = getInspectionDraft(resolvedParams.id);
      if (!current) {
        current = initializeInspectionDraft(resolvedParams.id, user?.id || "usr-demo-off-001");
      }
      setDraft(current);
      setReadings(current.measurements);
    });
  }, [resolvedParams.id, user?.id]);

  const updateReading = (
    id: string,
    field: "referenceValue" | "indicatedValue" | "notes",
    val: number | string
  ) => {
    setReadings((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, [field]: val };
          if (field === "referenceValue" || field === "indicatedValue") {
            const ref = Number(field === "referenceValue" ? val : r.referenceValue) || 0;
            const ind = Number(field === "indicatedValue" ? val : r.indicatedValue) || 0;
            updated.errorValue = Number((ind - ref).toFixed(4));
          }
          return updated;
        }
        return r;
      })
    );
  };

  const addReadingPoint = () => {
    const newPoint: MeasurementReading = {
      id: `meas-${Date.now()}`,
      testPoint: "REPEATABILITY",
      referenceValue: 10.0,
      indicatedValue: 10.0,
      unit: "kg",
      errorValue: 0.0,
      sequence: readings.length + 1,
      capturedAt: new Date().toISOString(),
      notes: "Additional repeatability check",
    };
    setReadings([...readings, newPoint]);
  };

  const removeReading = (id: string) => {
    if (readings.length <= 1) return;
    setReadings(readings.filter((r) => r.id !== id));
  };

  const handleSaveAndContinue = () => {
    if (draft) {
      const updated: InspectionDraft = {
        ...draft,
        measurements: readings,
      };
      saveInspectionDraft(updated);
      router.push(`/field/inspections/${resolvedParams.id}/evidence`);
    }
  };

  const handleSaveDraft = () => {
    if (draft) {
      const updated: InspectionDraft = {
        ...draft,
        measurements: readings,
      };
      saveInspectionDraft(updated);
      setFeedback("Measurement readings saved locally.");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/field/inspections/${resolvedParams.id}/checklist`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Checklist</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Step 2: Measurement Readings & Errors
        </h1>
        <p className="text-xs text-slate-600">
          Record standard test weight measurements and verify maximum permissible error (MPE)
        </p>
      </div>

      <InspectionStepper applicationId={resolvedParams.id} currentStep="readings" />

      {feedback && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Readings Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Verification Test Points</h2>
          <button
            type="button"
            onClick={addReadingPoint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Test Point</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Test Point</th>
                <th className="py-2.5 px-3">Reference (kg)</th>
                <th className="py-2.5 px-3">Indicated (kg)</th>
                <th className="py-2.5 px-3">Error (kg)</th>
                <th className="py-2.5 px-3">Notes</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {readings.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 text-slate-400">{i + 1}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {r.testPoint.replace(/_/g, " ")}
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      step="0.01"
                      value={r.referenceValue}
                      onChange={(e) =>
                        updateReading(r.id, "referenceValue", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      step="0.01"
                      value={r.indicatedValue}
                      onChange={(e) =>
                        updateReading(r.id, "indicatedValue", parseFloat(e.target.value) || 0)
                      }
                      className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`font-bold ${
                        Math.abs(r.errorValue) <= 0.05
                          ? "text-emerald-700"
                          : "text-rose-600"
                      }`}
                    >
                      {r.errorValue > 0 ? `+${r.errorValue}` : r.errorValue}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <input
                      type="text"
                      value={r.notes || ""}
                      onChange={(e) => updateReading(r.id, "notes", e.target.value)}
                      placeholder="Observation..."
                      className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeReading(r.id)}
                      disabled={readings.length <= 1}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Proceed to Step 3: Evidence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
