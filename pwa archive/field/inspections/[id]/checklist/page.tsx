"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  initializeInspectionDraft,
} from "@/services/inspections/inspections.service";
import {
  getInspectionDraft,
  saveInspectionDraft,
} from "@/lib/offline-storage";
import { ChecklistItem, InspectionDraft } from "@/types/inspection";
import { InspectionStepper } from "@/components/field/InspectionStepper";

export default function InspectionChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      let current = getInspectionDraft(resolvedParams.id);
      if (!current) {
        current = initializeInspectionDraft(resolvedParams.id, user?.id || "usr-demo-off-001");
      }
      setDraft(current);
      setChecklist(current.checklist);
    });
  }, [resolvedParams.id, user?.id]);

  const toggleItem = (itemId: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, passed: !item.passed } : item
      )
    );
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, notes } : item))
    );
  };

  const handleSaveAndContinue = () => {
    if (draft) {
      const updated: InspectionDraft = {
        ...draft,
        checklist,
      };
      saveInspectionDraft(updated);
      router.push(`/field/inspections/${resolvedParams.id}/readings`);
    }
  };

  const handleSaveDraft = () => {
    if (draft) {
      const updated: InspectionDraft = {
        ...draft,
        checklist,
      };
      saveInspectionDraft(updated);
      setFeedback("Checklist draft saved to local IndexedDB.");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/field/inspections/${resolvedParams.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Case Overview</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Step 1: Statutory Verification Checklist
        </h1>
        <p className="text-xs text-slate-600">
          Verify physical security, stamping, leveling, and environment requirements
        </p>
      </div>

      <InspectionStepper applicationId={resolvedParams.id} currentStep="checklist" />

      {feedback && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Checklist Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="divide-y divide-slate-100">
          {checklist.map((item, idx) => (
            <div
              key={item.id}
              className="py-4 space-y-2.5"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={`chk-${item.id}`}
                  checked={item.passed}
                  onChange={() => toggleItem(item.id)}
                  className="w-5 h-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`chk-${item.id}`}
                    className="text-xs font-bold text-slate-900 cursor-pointer"
                  >
                    {idx + 1}. {item.category}: {item.label}
                  </label>
                  <span className="text-[10px] text-emerald-700 block font-semibold">
                    {item.passed ? "Verified Conformant" : "Non-Conformant / Defect Observed"}
                  </span>
                </div>
              </div>

              <div className="pl-8">
                <input
                  type="text"
                  placeholder="Inspector notes or observed defects (optional)..."
                  value={item.notes || ""}
                  onChange={(e) => handleNotesChange(item.id, e.target.value)}
                  className="block w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          ))}
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
            <span>Proceed to Step 2: Readings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
