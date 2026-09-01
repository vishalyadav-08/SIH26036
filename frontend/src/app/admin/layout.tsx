"use client";

import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111c2d]">
        <PublicHeader />
        <AdminHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <SiteFooter />
      </div>
    </AuthGuard>
  );
}
