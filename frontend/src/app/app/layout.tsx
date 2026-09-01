"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BusinessHeader, BUSINESS_NAV_ITEMS } from "@/components/layout/BusinessHeader";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Sidebar } from "@/components/layout/Sidebar";

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["BUSINESS"]}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <PublicHeader />
        <BusinessHeader />
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto bg-[#f8fafc]">
          <Sidebar items={BUSINESS_NAV_ITEMS} basePath="/app" theme="blue" />
          <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <SiteFooter />
      </div>
    </AuthGuard>
  );
}
