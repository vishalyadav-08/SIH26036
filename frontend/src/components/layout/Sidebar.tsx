"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Gauge,
  FileCheck2,
  Award,
  Bell,
  User,
  Users,
  ClipboardList,
  History,
  Settings,
  HelpCircle,
  LogOut,
  RefreshCw,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  role: "BUSINESS" | "ADMIN" | "OFFICER";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const getDepartmentConfig = () => {
    switch (role) {
      case "BUSINESS":
        return {
          code: "LM",
          codeBg: "bg-[#004e9f] text-white",
          title: "Legal Metrology",
          subtitle: "Enterprise Services",
          items: [
            { label: "Dashboard", href: "/app", icon: LayoutDashboard },
            { label: "Instruments", href: "/app/instruments", icon: Gauge },
            { label: "Applications", href: "/app/applications", icon: FileCheck2 },
            { label: "Certificates", href: "/app/certificates", icon: Award },
            { label: "Notifications", href: "/app/notifications", icon: Bell },
            { label: "Business Profile", href: "/app/profile", icon: User },
          ],
        };
      case "ADMIN":
        return {
          code: "AD",
          codeBg: "bg-[#3a5f94] text-white",
          title: "Administration",
          subtitle: "Directorate Control Hub",
          items: [
            { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
            { label: "Applications", href: "/admin/applications", icon: ClipboardList },
            { label: "Officers", href: "/admin/officers", icon: Users },
            { label: "Instruments", href: "/admin/instruments", icon: Gauge },
            { label: "Certificates", href: "/admin/certificates", icon: Award },
            { label: "Schedules", href: "/admin/schedules", icon: CalendarCheck },
            { label: "Audit Log", href: "/admin/audit", icon: History },
            { label: "Settings", href: "/admin/settings", icon: Settings },
          ],
        };
      case "OFFICER":
        return {
          code: "FO",
          codeBg: "bg-[#15803d] text-white",
          title: "Field Operations",
          subtitle: "Legal Metrology Officer",
          items: [
            { label: "Dashboard", href: "/field", icon: LayoutDashboard },
            { label: "Inspections", href: "/field/inspections", icon: CheckCircle2 },
            { label: "Sync Center", href: "/field/sync", icon: RefreshCw },
            { label: "Officer Profile", href: "/field/profile", icon: User },
          ],
        };
    }
  };

  const config = getDepartmentConfig();

  const isActive = (href: string) => {
    if (href === "/app" || href === "/admin" || href === "/field") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#cbd5e1] bg-white h-[calc(100vh-4rem)] sticky top-16 shrink-0 select-none">
      {/* Department Badge Header */}
      <div className="p-4 border-b border-[#cbd5e1] flex items-center gap-3 bg-[#f8fafc]">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-xs ${config.codeBg}`}>
          {config.code}
        </div>
        <div className="overflow-hidden">
          <h2 className="text-sm font-bold text-[#111c2d] truncate">{config.title}</h2>
          <p className="text-[11px] text-[#414753] truncate">{config.subtitle}</p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {config.items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                active
                  ? "bg-[#004e9f] text-white shadow-xs font-bold border-l-4 border-[#003366]"
                  : "text-[#414753] hover:bg-[#f0f3ff] hover:text-[#004e9f] border-l-4 border-transparent"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-[#cbd5e1] bg-[#f8fafc] space-y-1">
        <Link
          href="/help"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#414753] hover:text-[#004e9f] hover:bg-[#f0f3ff] transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-[#727784]" />
          <span>Help & Support</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#b91c1c] hover:bg-[#fff1f2] transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 text-[#b91c1c]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
