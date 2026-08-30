import Link from 'next/link';
import {
  FileText,
  Wrench,
  Award,
  BellRing,
  Plus,
  PlusCircle,
  ChevronRight,
  Store,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

/** Skeleton row for loading state */
function TableSkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function BusinessDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <PageHeader
        title="Good morning"
        subtitle="Here's an overview of your instruments and verification applications."
        icon={Store}
        iconColor="text-amber-600"
        action={
          <>
            <Link
              href="/app/applications/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#000666] hover:bg-[#1a237e] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-950/20"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              New Application
            </Link>
            <Link
              href="/app/instruments/register"
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-300 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4 text-blue-700" aria-hidden="true" />
              Register Instrument
            </Link>
          </>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Active Applications"
          value="—"
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
          ctaLabel="View all applications"
          ctaHref="/app/applications"
        />
        <StatCard
          label="Registered Instruments"
          value="—"
          icon={Wrench}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-700"
          ctaLabel="View instruments"
          ctaHref="/app/instruments"
        />
        <StatCard
          label="Valid Certificates"
          value="—"
          icon={Award}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          ctaLabel="View certificates"
          ctaHref="/app/certificates"
        />
        <StatCard
          label="Notifications"
          value="—"
          icon={BellRing}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          ctaLabel="View notifications"
          ctaHref="/app/notifications"
        />
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Applications</h2>
          <Link
            href="/app/applications"
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-[#000666] transition-colors"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="Recent applications">
            <caption className="sr-only">Your most recent verification applications</caption>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Application ID</th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Instrument</th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Type</th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Filed On</th>
              </tr>
            </thead>
            <tbody>
              {/* Skeleton loading rows — replace with real data from API */}
              <TableSkeletonRow />
              <TableSkeletonRow />
              <TableSkeletonRow />
            </tbody>
          </table>
        </div>

        {/* Empty state — shown when no applications exist */}
        <div className="hidden px-6 py-12 text-center" aria-live="polite">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-700 mb-1">No applications yet</p>
          <p className="text-xs text-slate-500 mb-4">
            Submit a verification application for your registered instruments.
          </p>
          <Link
            href="/app/applications/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-semibold rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            New Application
          </Link>
        </div>

        {/* Sample status badge preview (for development reference) */}
        <div className="px-6 py-3 border-t border-slate-100 flex flex-wrap gap-2 bg-slate-50/50">
          <span className="text-[10px] text-slate-400 font-medium self-center mr-1">Status references:</span>
          {(['DRAFT', 'SUBMITTED', 'ASSIGNED', 'SCHEDULED', 'COMPLETED', 'REJECTED'] as const).map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/app/instruments/register"
          className="group flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-[#000666]/30 transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors" aria-hidden="true">
            <Wrench className="w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Register New Instrument</div>
            <div className="text-xs text-slate-500">Add a weighing or measuring instrument</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-[#000666] transition-colors" aria-hidden="true" />
        </Link>

        <Link
          href="/app/certificates"
          className="group flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-[#000666]/30 transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors" aria-hidden="true">
            <Award className="w-[18px] h-[18px]" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">View Certificates</div>
            <div className="text-xs text-slate-500">Check validity and download certificates</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-[#000666] transition-colors" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
