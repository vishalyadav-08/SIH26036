import { cn } from '@/lib/utils';
import {
  FileText,
  Send,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldX
} from 'lucide-react';
import React from 'react';

/** Canonical application states per MapanSetu design standards */
type ApplicationState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ASSIGNED'
  | 'SCHEDULED'
  | 'INSPECTION_IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

/** Canonical certificate statuses */
type CertificateStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

/** Canonical inspection results */
type InspectionResult = 'PASS' | 'FAIL' | 'REQUIRES_CORRECTION';

type StatusValue = ApplicationState | CertificateStatus | InspectionResult;

interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
}

const statusConfig: Record<
  StatusValue,
  { label: string; classes: string; icon: React.ElementType }
> = {
  // Application states
  DRAFT: {
    label: 'Draft',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: FileText
  },
  SUBMITTED: {
    label: 'Submitted',
    classes: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Send
  },
  ASSIGNED: {
    label: 'Assigned',
    classes: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    icon: UserCheck
  },
  SCHEDULED: {
    label: 'Scheduled',
    classes: 'bg-violet-50 text-violet-800 border-violet-200',
    icon: Calendar
  },
  INSPECTION_IN_PROGRESS: {
    label: 'Inspection In Progress',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Clock
  },
  COMPLETED: {
    label: 'Completed',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: XCircle
  },
  CANCELLED: {
    label: 'Cancelled',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: X
  },
  // Certificate statuses
  ACTIVE: {
    label: 'Active',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: ShieldCheck
  },
  EXPIRED: {
    label: 'Expired',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: ShieldAlert
  },
  REVOKED: {
    label: 'Revoked',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: ShieldX
  },
  // Inspection results
  PASS: {
    label: 'Pass',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: CheckCircle2
  },
  FAIL: {
    label: 'Fail',
    classes: 'bg-red-50 text-red-800 border-red-200',
    icon: XCircle
  },
  REQUIRES_CORRECTION: {
    label: 'Requires Correction',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertCircle
  },
};

/**
 * StatusBadge — WCAG-compliant pill badge for canonical MapanSetu states.
 * Always uses text + icon (visual indicator) so it doesn't rely on color alone.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.classes,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}

export type { StatusValue, ApplicationState, CertificateStatus, InspectionResult };
