import Link from 'next/link';
import { type LucideIcon, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

/**
 * StatCard — Dashboard KPI card with colored icon badge, large count, label,
 * optional trend indicator, and optional CTA link.
 * Matches AI Studio's white card design with hover shadow lift.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-blue-700',
  iconBg = 'bg-blue-50',
  trend,
  ctaLabel,
  ctaHref,
  className,
}: StatCardProps) {
  const content = (
    <div className={cn('bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
            iconBg,
            iconColor,
            ctaHref && 'group-hover:bg-[#000666] group-hover:text-white'
          )}
          aria-hidden="true"
        >
          <Icon className="w-[18px] h-[18px]" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
          {value}
        </span>
        {trend && (
          <span className="text-xs text-emerald-600 font-semibold">{trend}</span>
        )}
      </div>

      {ctaLabel && (
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-700 group-hover:text-[#000666] transition-colors">
          {ctaLabel}
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
      )}
    </div>
  );

  if (ctaHref) {
    return (
      <Link href={ctaHref} className="block" aria-label={`${label}: ${value}${ctaLabel ? `. ${ctaLabel}` : ''}`}>
        {content}
      </Link>
    );
  }

  return content;
}
