"use client";

import { useEffect, useState } from "react";
import { X, UserCheck, AlertCircle } from "lucide-react";
import { Officer } from "@/types/officer";
import { getOfficers } from "@/services/officers/officers.service";

interface AssignOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (officerId: string, officerName: string, note?: string) => Promise<void>;
  applicationNumber: string;
}

export function AssignOfficerModal({
  isOpen,
  onClose,
  onAssign,
  applicationNumber,
}: AssignOfficerModalProps) {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getOfficers().then((list) => {
        setOfficers(list);
        if (list.length > 0 && !selectedOfficerId) {
          setSelectedOfficerId(list[0].userId);
        }
      });
    }
  }, [isOpen, selectedOfficerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficerId) return;
    setIsSubmitting(true);
    try {
      const selected = officers.find((o) => o.userId === selectedOfficerId);
      await onAssign(
        selectedOfficerId,
        selected?.name || "Inspector Sharma",
        note || "Assigned by GATCs"
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="assign-modal-title"
                className="text-base font-bold text-slate-900"
              >
                Assign LMO
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {applicationNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="officer-select"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Select Active LMO:
            </label>
            <select
              id="officer-select"
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {officers.map((off) => (
                <option key={off.id} value={off.userId}>
                  {off.name} ({off.badgeNumber}) — Caseload: {off.activeCaseload}/{off.maxCaseload}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="assignment-note"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Assignment Instructions (Optional):
            </label>
            <textarea
              id="assignment-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Standard on-site calibration verification for retail establishment."
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Assigning will transition application state from <strong>SUBMITTED</strong> to <strong>ASSIGNED</strong> and dispatch an alert to the officer.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedOfficerId}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? "Assigning..." : "Confirm Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
