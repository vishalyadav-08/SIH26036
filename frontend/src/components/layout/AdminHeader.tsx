"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  ClipboardList,
  Users,
  Award,
  Gauge,
  History,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Applications", href: "/admin/applications", icon: ClipboardList },
  { label: "Officers", href: "/admin/officers", icon: Users },
  { label: "Instruments", href: "/admin/instruments", icon: Gauge },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
  { label: "Audit Log", href: "/admin/audit", icon: History },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Admin Badge */}
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 group focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-2xs group-hover:bg-indigo-700 transition-colors">
                <Scale className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none">
                  MapanSetu
                </span>
                <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider mt-0.5">
                  Supervisor Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav
              aria-label="Admin supervisor navigation"
              className="hidden lg:flex items-center gap-1"
            >
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? "bg-indigo-50 text-indigo-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Area: Admin Profile & Sign Out */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/admin/notifications"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors relative"
              title="Departmental Notifications"
              aria-label="Departmental Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </Link>

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-none">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                  {user?.displayName || "Admin Supervisor"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  ADMIN SUPERVISOR
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
              title="Sign out of Admin account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {user?.displayName || "Admin Supervisor"}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {user?.email} • Legal Metrology Department
              </div>
            </div>
          </div>

          <nav aria-label="Mobile admin navigation" className="space-y-1 pt-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-800"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/admin/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 inline-flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
