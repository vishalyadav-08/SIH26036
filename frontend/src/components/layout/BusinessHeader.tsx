"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  Gauge,
  FileCheck2,
  Award,
  Bell,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const BUSINESS_NAV_ITEMS = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Instruments", href: "/app/instruments", icon: Gauge },
  { label: "Applications", href: "/app/applications", icon: FileCheck2 },
  { label: "Certificates", href: "/app/certificates", icon: Award },
  { label: "Notifications", href: "/app/notifications", icon: Bell },
];

export function BusinessHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-8">
            <Link
              href="/app"
              className="flex items-center gap-2.5 group focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs group-hover:bg-blue-700 transition-colors">
                <Scale className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none">
                  MapanSetu
                </span>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mt-0.5">
                  Business Portal
                </span>
              </div>
            </Link>

          </div>

          {/* Right Area: User Profile & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-none">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                  {user?.displayName || "Business User"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {user?.businessId || "BUSINESS"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
              title="Sign out of current account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
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

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          {/* User info in mobile view */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                {user?.displayName || "Business User"}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {user?.email} • {user?.role}
              </div>
            </div>
          </div>

          <nav
            aria-label="Mobile workspace navigation"
            className="space-y-1 pt-1"
          >
            {BUSINESS_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
