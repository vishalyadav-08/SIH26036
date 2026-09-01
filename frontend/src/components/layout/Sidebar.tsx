"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  items: NavItem[];
  basePath: string;
  theme?: "indigo" | "blue" | "emerald";
}

export function Sidebar({ items, basePath, theme = "indigo" }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === basePath) {
      return pathname === basePath;
    }
    return pathname.startsWith(href);
  };

  const themeClasses = {
    indigo: {
      activeBg: "bg-indigo-50",
      activeText: "text-indigo-800",
      hoverBg: "hover:bg-slate-50",
      hoverText: "hover:text-slate-900",
    },
    blue: {
      activeBg: "bg-blue-50",
      activeText: "text-blue-700",
      hoverBg: "hover:bg-slate-50",
      hoverText: "hover:text-slate-900",
    },
    emerald: {
      activeBg: "bg-emerald-50",
      activeText: "text-emerald-800",
      hoverBg: "hover:bg-slate-50",
      hoverText: "hover:text-slate-900",
    },
  };

  const currentTheme = themeClasses[theme];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav aria-label="Sidebar navigation" className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? `${currentTheme.activeBg} ${currentTheme.activeText}`
                    : `text-slate-600 ${currentTheme.hoverBg} ${currentTheme.hoverText}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
