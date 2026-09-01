"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BusinessHeader, BUSINESS_NAV_ITEMS } from "@/components/layout/BusinessHeader";
import { Sidebar } from "@/components/layout/Sidebar";

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["BUSINESS"]}>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <BusinessHeader />
        <div className="flex flex-1 max-w-7xl w-full mx-auto">
          <Sidebar items={BUSINESS_NAV_ITEMS} basePath="/app" theme="blue" />
          <main className="flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
        </div>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>MapanSetu — Business Portal</span>
            <span className="text-[11px] text-slate-400">
              SIH26036 Prototype
            </span>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
