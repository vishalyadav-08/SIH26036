"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BusinessHeader } from "@/components/layout/BusinessHeader";

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["BUSINESS"]}>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <BusinessHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>MapanSetu — Business Workspace</span>
            <span className="text-[11px] text-slate-400">
              SIH26036 Prototype • Metrology Verification System
            </span>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
