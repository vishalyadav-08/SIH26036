"use client";

import { useState } from "react";
import { X, Calendar, AlertCircle } from "lucide-react";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledAt: string, note?: string) => Promise<void>;
  applicationNumber: string;
  assignedOfficerName?: string;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  applicationNumber,
  assignedOfficerName,
}: ScheduleModalProps) {
  const [dateTime, setDateTime] = useState("2026-09-05T10:00");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTime) return;
    setIsSubmitting(true);
    try {
      await onSchedule(new Date(dateTime).toISOString(), note);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="schedule-modal-title"
                className="text-base font-bold text-slate-900"
              >
                Schedule Inspection Visit
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
              htmlFor="schedule-datetime"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Appointment Date & Time:
            </label>
            <input
              type="datetime-local"
              id="schedule-datetime"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="schedule-note"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Appointment Notes / Access Instructions:
            </label>
            <textarea
              id="schedule-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Standard morning slot. Commercial premises owner confirmed availability."
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Scheduling will move application to <strong>SCHEDULED</strong>. Assigned officer{" "}
              <strong>({assignedOfficerName || "Inspector Sharma"})</strong> will see this case in their Field PWA.
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
              disabled={isSubmitting || !dateTime}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? "Scheduling..." : "Confirm & Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
