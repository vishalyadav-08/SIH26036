import { cn } from '@/lib/utils';

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
  { label: string; classes: string }
> = {
  // Application states
  DRAFT: {
    label: 'Draft',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  SUBMITTED: {
    label: 'Submitted',
    classes: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  ASSIGNED: {
    label: 'Assigned',
    classes: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  SCHEDULED: {
    label: 'Scheduled',
    classes: 'bg-violet-50 text-violet-800 border-violet-200',
  },
  INSPECTION_IN_PROGRESS: {
    label: 'Inspection In Progress',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  COMPLETED: {
    label: 'Completed',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-red-50 text-red-800 border-red-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  // Certificate statuses
  ACTIVE: {
    label: 'Active',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  EXPIRED: {
    label: 'Expired',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  REVOKED: {
    label: 'Revoked',
    classes: 'bg-red-50 text-red-800 border-red-200',
  },
  // Inspection results
  PASS: {
    label: 'Pass',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  FAIL: {
    label: 'Fail',
    classes: 'bg-red-50 text-red-800 border-red-200',
  },
  REQUIRES_CORRECTION: {
    label: 'Requires Correction',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
  },
};

/**
 * StatusBadge — WCAG-compliant pill badge for canonical MapanSetu states.
 * Always uses text + color (never color alone).
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export type { StatusValue, ApplicationState, CertificateStatus, InspectionResult };
