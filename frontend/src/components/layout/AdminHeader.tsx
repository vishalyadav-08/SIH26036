'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Scale,
  Globe,
  Bell,
  User,
  LayoutDashboard,
  FileText,
  Wrench,
  Users,
  CalendarDays,
  Award,
  BellRing,
  ClipboardList,
  Settings,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/applications', label: 'Applications', icon: FileText },
  { href: '/admin/instruments', label: 'Instruments', icon: Wrench },
  { href: '/admin/officers', label: 'Officers', icon: Users },
  { href: '/admin/schedules', label: 'Schedules', icon: CalendarDays },
  { href: '/admin/certificates', label: 'Certificates', icon: Award },
  { href: '/admin/notifications', label: 'Notifications', icon: BellRing },
  { href: '/admin/audit', label: 'Audit', icon: ClipboardList },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminHeader() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#000666] text-white shadow-md border-b border-[#1a237e]">
      {/* Prototype Top Bar */}
      <div className="bg-[#00044d] px-4 py-1 text-xs text-blue-200 border-b border-blue-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-100">MapanSetu</span>
          <span className="text-blue-500" aria-hidden="true">•</span>
          <span>Admin &amp; Supervisor Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-500/40">
            SIH 2026 Prototype
          </span>
          <button
            type="button"
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer bg-blue-900/60 hover:bg-blue-800 px-2 py-0.5 rounded"
            aria-label="Switch language"
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            <span>हिंदी</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand + Nav */}
        <div className="flex items-center gap-6 min-w-0">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="MapanSetu Admin Portal Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center border border-blue-400/40 group-hover:scale-105 transition-transform" aria-hidden="true">
              <Scale className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">MapanSetu Admin</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 text-xs font-medium overflow-x-auto" aria-label="Admin portal navigation">
            {navItems.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap',
                  isActive(href, exact)
                    ? 'bg-blue-800/80 text-white font-semibold shadow-sm'
                    : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                )}
                aria-current={isActive(href, exact) ? 'page' : undefined}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/notifications"
            className="relative p-2 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-100 hover:text-white border border-blue-700/50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-white border border-blue-700/50 transition-colors text-xs font-medium"
            aria-label="Admin profile"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center" aria-hidden="true">
              <User className="w-3 h-3 text-emerald-200" />
            </div>
            <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
