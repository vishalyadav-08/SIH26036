"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  ClipboardCheck,
  RefreshCw,
  User,
  LogOut,
  Menu,
  X,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getSyncQueue } from "@/lib/offline-storage";

export const FIELD_NAV_ITEMS = [
  { label: "Dashboard", href: "/field", icon: LayoutDashboard },
  { label: "Inspections", href: "/field/inspections", icon: ClipboardCheck },
  { label: "Sync Center", href: "/field/sync", icon: RefreshCw },
  { label: "Profile", href: "/field/profile", icon: User },
];

export function FieldHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const queue = getSyncQueue();
      const pending = queue.filter((q) => q.status === "READY_TO_SYNC");
      setPendingSyncCount(pending.length);
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    const interval = setInterval(updateCount, 2000);

    return () => {
      window.removeEventListener("storage", updateCount);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/field") {
      return pathname === "/field";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-[#cbd5e1] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Officer Badge */}
          <div className="flex items-center gap-6">
            <Link
              href="/field"
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
                  Field Officer PWA
                </span>
              </div>
            </Link>


          </div>

          {/* Right Area: Officer User Profile & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded bg-[#f8fafc] border border-[#cbd5e1]">
              <div className="w-7 h-7 rounded bg-[#f0f3ff] text-[#004e9f] flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-none">
                <div className="text-xs font-bold text-[#111c2d] truncate max-w-[140px]">
                  {user?.displayName || "Field Officer"}
                </div>
                <div className="text-[10px] text-[#414753] font-mono mt-0.5">
                  OFFICER (LMO)
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#414753] hover:text-[#b91c1c] bg-white hover:bg-[#fff1f2] border border-[#cbd5e1] hover:border-[#fecdd3] rounded transition-colors cursor-pointer"
              title="Sign out of Officer account"
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
        <div className="md:hidden border-t border-[#cbd5e1] bg-white px-4 pt-3 pb-5 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded bg-[#f8fafc] border border-[#cbd5e1]">
            <div className="w-9 h-9 rounded bg-[#f0f3ff] text-[#004e9f] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#111c2d]">
                {user?.displayName || "Field Officer"}
              </div>
              <div className="text-[10px] text-[#414753] font-mono">
                {user?.email} &bull; Legal Metrology Officer
              </div>
            </div>
          </div>

          <nav aria-label="Mobile officer navigation" className="space-y-1 pt-1">
            {FIELD_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded text-xs font-semibold transition-colors ${
                    active
                      ? "bg-[#004e9f] text-white"
                      : "text-[#111c2d] hover:bg-[#f0f3ff] hover:text-[#004e9f]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.href === "/field/sync" && pendingSyncCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-white text-[#004e9f]">
                      {pendingSyncCount} pending
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-[#cbd5e1]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#b91c1c] bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#fecdd3] rounded transition-colors cursor-pointer"
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
