"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Image as ImageIcon,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { initializeInspectionDraft } from "@/services/inspections/inspections.service";
import { getInspectionDraft, saveInspectionDraft } from "@/lib/offline-storage";
import { EvidenceItem, InspectionDraft } from "@/types/inspection";
import { InspectionStepper } from "@/components/field/InspectionStepper";

export default function InspectionEvidencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [draft, setDraft] = useState<InspectionDraft | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);

  useEffect(() => {
    Promise.resolve().then(() => {
      let current = getInspectionDraft(resolvedParams.id);
      if (!current) {
        current = initializeInspectionDraft(resolvedParams.id, user?.id || "usr-demo-off-001");
      }
      setDraft(current);
      setEvidenceList(current.evidence);
    });
  }, [resolvedParams.id, user?.id]);

  const addSyntheticPhoto = (type: EvidenceItem["type"]) => {
    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}`,
      type,
      fileName: `${type.toLowerCase()}_${Date.now()}.jpg`,
      fileSize: 1024 * 342, // ~342 KB
      mimeType: "image/jpeg",
      latitude: 28.6139,
      longitude: 77.209,
      capturedAt: new Date().toISOString(),
      notes: "Captured on-site via mobile camera",
    };

    const updated = [...evidenceList, newItem];
    setEvidenceList(updated);
    if (draft) {
      saveInspectionDraft({ ...draft, evidence: updated });
    }
  };

  const removeEvidence = (id: string) => {
    const updated = evidenceList.filter((e) => e.id !== id);
    setEvidenceList(updated);
    if (draft) {
      saveInspectionDraft({ ...draft, evidence: updated });
    }
  };

  const handleSaveAndContinue = () => {
    if (draft) {
      saveInspectionDraft({ ...draft, evidence: evidenceList });
      router.push(`/field/inspections/${resolvedParams.id}/review`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/field/inspections/${resolvedParams.id}/readings`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Readings</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Step 3: Photographic Evidence Capture
        </h1>
        <p className="text-xs text-slate-600">
          Capture and attach machine nameplate, seal, and site verification photos (saved offline)
        </p>
      </div>

      <InspectionStepper applicationId={resolvedParams.id} currentStep="evidence" />

      {/* Evidence Capture Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Capture On-Site Photo Evidence
            </h2>
            <p className="text-xs text-slate-500">
              Select category and capture photographic proof
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => addSyntheticPhoto("SEAL_PHOTO")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>+ Capture Seal Photo</span>
            </button>
            <button
              type="button"
              onClick={() => addSyntheticPhoto("NAMEPLATE_PHOTO")}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>+ Capture Nameplate</span>
            </button>
          </div>
        </div>

        {/* Evidence Items Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Attached Evidence Blobs ({evidenceList.length})
          </h3>

          {evidenceList.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                No photos captured yet. Click the buttons above to capture verification photos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {evidenceList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                        {item.type.replace(/_/g, " ")}
                      </span>
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        {item.fileName}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>GPS: 28.6139° N, 77.2090° E</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeEvidence(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            href={`/field/inspections/${resolvedParams.id}/readings`}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            ← Previous: Readings
          </Link>

          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Proceed to Step 4: Review & Decision</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
