"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { FieldHeader, FIELD_NAV_ITEMS } from "@/components/layout/FieldHeader";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { Sidebar } from "@/components/layout/Sidebar";

export default function FieldLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["OFFICER"]}>
      <div className="min-h-screen bg-[#f8fafc] text-[#111c2d] flex flex-col">
        <PublicHeader />
        <OfflineBanner />
        <FieldHeader />
        <div className="flex flex-1 max-w-7xl w-full mx-auto">
          <Sidebar items={FIELD_NAV_ITEMS} basePath="/field" theme="emerald" />
          <main className="flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
        <SiteFooter />
      </div>
    </AuthGuard>
  );

