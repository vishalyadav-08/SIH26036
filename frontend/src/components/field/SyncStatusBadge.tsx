import { CheckCircle2, Clock, AlertTriangle, CloudOff } from "lucide-react";
import { SyncStatus } from "@/types/sync";

export function SyncStatusBadge({ status }: { status: SyncStatus | "LOCAL_DRAFT" }) {
  switch (status) {
    case "SYNCED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          <span>SYNCED</span>
        </span>
      );
    case "READY_TO_SYNC":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3" />
          <span>READY TO SYNC</span>
        </span>
      );
    case "LOCAL_DRAFT":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <CloudOff className="w-3 h-3" />
          <span>LOCAL DRAFT</span>
        </span>
      );
    case "FAILED":
    case "CONFLICT":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3" />
          <span>{status}</span>
        </span>
      );
  }
}
