import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock,
  FilePlus2,
} from "lucide-react";

import { InstrumentStatus } from "@/types/instrument";

/**
 * One place that decides how an instrument's lifecycle reads.
 *
 * The distinction that matters: REGISTERED is neutral, not a warning and not a
 * success. An owner who has just recorded an instrument has done nothing wrong
 * (so red would be misleading) and nothing verified (so green would be a lie).
 */
const PRESENTATION: Record<
  InstrumentStatus,
  { label: string; className: string; Icon: typeof CheckCircle2; iconClass: string }
> = {
  REGISTERED: {
    label: "Not yet verified",
    className: "bg-slate-50 text-slate-700 border border-slate-200",
    Icon: FilePlus2,
    iconClass: "text-slate-500",
  },
  PENDING_VERIFICATION: {
    label: "Pending verification",
    className: "bg-amber-50 text-amber-800 border border-amber-200",
    Icon: Clock,
    iconClass: "text-amber-600",
  },
  ACTIVE: {
    label: "Verified",
    className: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    Icon: CheckCircle2,
    iconClass: "text-emerald-600",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-rose-50 text-rose-800 border border-rose-200",
    Icon: AlertTriangle,
    iconClass: "text-rose-600",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-800 border border-rose-200",
    Icon: AlertTriangle,
    iconClass: "text-rose-600",
  },
  INACTIVE: {
    label: "Retired",
    className: "bg-slate-100 text-slate-600 border border-slate-300",
    Icon: Archive,
    iconClass: "text-slate-500",
  },
};

export function InstrumentStatusBadge({ status }: { status: InstrumentStatus }) {
  // An unrecognised status must still render something honest rather than
  // crashing or silently showing "verified".
  const { label, className, Icon, iconClass } =
    PRESENTATION[status] ?? PRESENTATION.REGISTERED;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${className}`}
    >
      <Icon className={`w-3 h-3 ${iconClass}`} />
      <span>{label}</span>
    </span>
  );
}
