"use client";

import { useState } from "react";
import { X, AlertTriangle, ShieldAlert } from "lucide-react";

interface RevokeCertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRevoke: (reason: string) => Promise<void>;
  certificateNumber: string;
}

export function RevokeCertModal({
  isOpen,
  onClose,
  onRevoke,
  certificateNumber,
}: RevokeCertModalProps) {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !confirmed) return;
    setIsSubmitting(true);
    try {
      await onRevoke(reason.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="revoke-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-rose-200 shadow-xl max-w-md w-full p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="revoke-modal-title"
                className="text-base font-bold text-rose-950"
              >
                Revoke Statutory Certificate
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {certificateNumber}
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
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Warning: Irreversible Statutory Action</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              Revocation invalidates the digital certificate across all public verifiers immediately and appends a permanent record to the audit chain.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="revoke-reason"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Statutory Revocation Reason (Required):
            </label>
            <textarea
              id="revoke-reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Physical verification seal found broken upon follow-up inspection; seal tampering detected."
              className="block w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="confirm-revocation"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 rounded-md border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer mt-0.5"
            />
            <label
              htmlFor="confirm-revocation"
              className="text-xs font-medium text-slate-700 cursor-pointer"
            >
              I confirm that this certificate is being officially revoked under legal authority.
            </label>
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
              disabled={isSubmitting || !reason.trim() || !confirmed}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSubmitting ? "Revoking..." : "Execute Revocation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
