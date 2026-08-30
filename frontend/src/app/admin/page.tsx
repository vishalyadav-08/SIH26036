import Link from 'next/link';
import {
  FileText,
  Users,
  CalendarDays,
  ShieldCheck,
  Plus,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Wrench,
  Award,
  BellRing,
  Settings,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

/** Skeleton row for loading state */
function TableSkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-slate-100 rounded animate-pulse" style={{ width: `${50 + i * 7}%` }} />
        </td>
      ))}
    </tr>
  );
}

const quickNavTiles = [
  { label: 'Applications', href: '/admin/applications', icon: FileText, bg: 'bg-blue-50', color: 'text-blue-700', hover: 'group-hover:bg-blue-600' },
  { label: 'Officers', href: '/admin/officers', icon: Users, bg: 'bg-indigo-50', color: 'text-indigo-700', hover: 'group-hover:bg-indigo-600' },
  { label: 'Schedules', href: '/admin/schedules', icon: CalendarDays, bg: 'bg-violet-50', color: 'text-violet-700', hover: 'group-hover:bg-violet-600' },
  { label: 'Instruments', href: '/admin/instruments', icon: Wrench, bg: 'bg-slate-50', color: 'text-slate-700', hover: 'group-hover:bg-slate-600' },
  { label: 'Certificates', href: '/admin/certificates', icon: Award, bg: 'bg-emerald-50', color: 'text-emerald-700', hover: 'group-hover:bg-emerald-600' },
  { label: 'Audit Log', href: '/admin/audit', icon: ClipboardList, bg: 'bg-amber-50', color: 'text-amber-700', hover: 'group-hover:bg-amber-600' },
  { label: 'Notifications', href: '/admin/notifications', icon: BellRing, bg: 'bg-rose-50', color: 'text-rose-700', hover: 'group-hover:bg-rose-600' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, bg: 'bg-slate-50', color: 'text-slate-600', hover: 'group-hover:bg-slate-500' },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <PageHeader
        title="Admin Dashboard"
        subtitle="Operational overview of applications, officers, and scheduled inspections."
        icon={LayoutDashboard}
        iconColor="text-blue-700"
        action={
          <Link
            href="/admin/applications/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#000666] hover:bg-[#1a237e] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-950/20"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New Application
          </Link>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Pending Applications"
          value="—"
          icon={FileText}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          ctaLabel="Review queue"
          ctaHref="/admin/applications?status=SUBMITTED"
        />
        <StatCard
          label="Assigned"
          value="—"
          icon={ShieldCheck}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-700"
          ctaLabel="View assigned"
          ctaHref="/admin/applications?status=ASSIGNED"
        />
        <StatCard
          label="Scheduled"
          value="—"
          icon={CalendarDays}
          iconBg="bg-violet-50"
          iconColor="text-violet-700"
          ctaLabel="View schedules"
          ctaHref="/admin/schedules"
        />
        <StatCard
          label="Active Officers"
          value="—"
          icon={Users}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          ctaLabel="Manage officers"
          ctaHref="/admin/officers"
        />
      </div>

      {/* Application Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Application Queue</h2>
          <Link
            href="/admin/applications"
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-[#000666] transition-colors"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="Application queue">
            <caption className="sr-only">Recent verification applications in the queue</caption>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-left">
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">App ID</th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Applicant</th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Instrument Type</th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Officer</th>
                <th scope="col" className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Filed On</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeletonRow />
              <TableSkeletonRow />
              <TableSkeletonRow />
              <TableSkeletonRow />
            </tbody>
          </table>
        </div>

        {/* Status badge reference strip */}
        <div className="px-6 py-3 border-t border-slate-100 flex flex-wrap gap-2 bg-slate-50/50">
          <span className="text-[10px] text-slate-400 font-medium self-center mr-1">Status references:</span>
          {(['SUBMITTED', 'ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS', 'COMPLETED', 'REJECTED'] as const).map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      {/* Quick Navigation Tiles */}
      <h2 className="text-sm font-bold text-slate-900 mb-4">Quick Navigation</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {quickNavTiles.map(({ label, href, icon: Icon, bg, color, hover }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-2 bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-[#000666]/30 transition-all text-center"
          >
            <div className={`w-9 h-9 rounded-lg ${bg} ${color} flex items-center justify-center ${hover} group-hover:text-white transition-colors`} aria-hidden="true">
              <Icon className="w-[18px] h-[18px]" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
