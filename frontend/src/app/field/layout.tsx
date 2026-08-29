"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { FieldHeader } from "@/components/layout/FieldHeader";
import { OfflineBanner } from "@/components/layout/OfflineBanner";

export default function FieldLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["OFFICER"]}>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <OfflineBanner />
        <FieldHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>MapanSetu — Field Officer PWA (Offline First)</span>
            <span className="text-[11px] text-slate-400">
              SIH26036 Prototype • Local Metrology Verification
            </span>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
