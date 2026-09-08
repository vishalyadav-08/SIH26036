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
  { label: "LMOs", href: "/admin/officers", icon: Users },
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
    <header className="bg-white border-b border-[#cbd5e1] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Admin Badge */}
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 group focus:outline-hidden"
            >
              <div className="w-9 h-9 rounded bg-[#004e9f] text-white flex items-center justify-center shadow-xs group-hover:bg-[#003366] transition-colors">
                <Scale className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#111c2d] tracking-tight leading-none">
                  MapanSetu
                </span>
                <span className="text-[10px] font-semibold text-[#004e9f] uppercase tracking-wider mt-0.5">
                  GATCs Portal
                </span>
              </div>
            </Link>


          </div>

          {/* Right Area: Admin Profile & Sign Out */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/admin/notifications"
              className="p-2 text-[#414753] hover:text-[#004e9f] hover:bg-[#f0f3ff] rounded transition-colors relative"
              title="Departmental Notifications"
              aria-label="Departmental Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#004e9f] ring-2 ring-white" />
            </Link>

            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded bg-[#f8fafc] border border-[#cbd5e1]">
              <div className="w-7 h-7 rounded bg-[#f0f3ff] text-[#004e9f] flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-none">
                <div className="text-xs font-bold text-[#111c2d] truncate max-w-[130px]">
                  {user?.displayName || "GATC Supervisor"}
                </div>
                <div className="text-[10px] text-[#414753] font-mono mt-0.5">
                  GATCS SUPERVISOR
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#414753] hover:text-[#b91c1c] bg-white hover:bg-[#fff1f2] border border-[#cbd5e1] hover:border-[#fecdd3] rounded transition-colors cursor-pointer"
              title="Sign out of GATC account"
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
              className="p-2 rounded text-[#414753] hover:bg-[#f0f3ff] focus:outline-hidden"
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
        <div className="lg:hidden border-t border-[#cbd5e1] bg-white px-4 pt-3 pb-5 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded bg-[#f8fafc] border border-[#cbd5e1]">
            <div className="w-9 h-9 rounded bg-[#f0f3ff] text-[#004e9f] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#111c2d]">
                {user?.displayName || "GATC Supervisor"}
              </div>
              <div className="text-[10px] text-[#414753] font-mono">
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-colors ${
                    active
                      ? "bg-[#004e9f] text-white"
                      : "text-[#111c2d] hover:bg-[#f0f3ff] hover:text-[#004e9f]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-[#cbd5e1] flex items-center justify-between">
            <Link
              href="/admin/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-[#414753] hover:text-[#004e9f] inline-flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#b91c1c] bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fecdd3] rounded transition-colors cursor-pointer"
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
