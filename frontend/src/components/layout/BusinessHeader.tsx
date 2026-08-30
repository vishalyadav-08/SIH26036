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
  Wrench,
  FileText,
  Award,
  BellRing,
  UserCircle,
} from 'lucide-react';

const navItems = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/app/instruments', label: 'Instruments', icon: Wrench },
  { href: '/app/applications', label: 'Applications', icon: FileText },
  { href: '/app/certificates', label: 'Certificates', icon: Award },
  { href: '/app/notifications', label: 'Notifications', icon: BellRing },
  { href: '/app/profile', label: 'Profile', icon: UserCircle },
];

export function BusinessHeader() {
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
          <span>Business Portal</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand + Nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/app"
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="MapanSetu Business Portal Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center border border-blue-400/40 group-hover:scale-105 transition-transform" aria-hidden="true">
              <Scale className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">MapanSetu</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 text-sm font-medium" aria-label="Business portal navigation">
            {navItems.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors',
                  isActive(href, exact)
                    ? 'bg-blue-800/80 text-white font-semibold shadow-sm'
                    : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                )}
                aria-current={isActive(href, exact) ? 'page' : undefined}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/app/notifications"
            className="relative p-2 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-100 hover:text-white border border-blue-700/50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/app/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-white border border-blue-700/50 transition-colors text-xs font-medium"
            aria-label="Your profile"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-400/30 flex items-center justify-center" aria-hidden="true">
              <User className="w-3 h-3 text-indigo-200" />
            </div>
            <span className="hidden sm:inline">My Account</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
