"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Gauge,
  FileCheck2,
  Award,
  Bell,
  User,
} from "lucide-react";

export const BUSINESS_NAV_ITEMS = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Instruments", href: "/app/instruments", icon: Gauge },
  { label: "Applications", href: "/app/applications", icon: FileCheck2 },
  { label: "Certificates", href: "/app/certificates", icon: Award },
  { label: "Notifications", href: "/app/notifications", icon: Bell },
  { label: "Profile", href: "/app/profile", icon: User },
];


export function BusinessSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#cbd5e1] bg-white h-[calc(100vh-4rem)] sticky top-16 shrink-0">
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
        <nav aria-label="Business primary navigation" className="space-y-1">
          {BUSINESS_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 w-full justify-start h-10 px-3 rounded text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#f0f3ff] text-[#004e9f]"
                    : "text-[#414753] hover:text-[#004e9f] hover:bg-[#f0f3ff]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}
