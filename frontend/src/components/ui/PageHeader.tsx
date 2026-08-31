import Link from 'next/link';
import { type LucideIcon, ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode;
}

/**
 * PageHeader — Reusable page title block with optional breadcrumb
 * trail, subtitle, contextual icon, and primary action slot.
 */
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-700',
  breadcrumbs,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            className="flex items-center gap-1 text-xs text-slate-500 mb-1.5"
            aria-label="Breadcrumb"
          >
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && (
                  <ChevronRight className="w-3 h-3 text-slate-400" aria-hidden="true" />
                )}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-blue-700 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-700">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title row */}
        <div className="flex items-center gap-2.5">
          {Icon && (
            <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} aria-hidden="true" />
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
        </div>

        {subtitle && (
          <p className="text-slate-600 text-sm mt-1">{subtitle}</p>
        )}
      </div>

      {action && <div className="flex items-center gap-3 flex-wrap">{action}</div>}
    </div>
  );
}
