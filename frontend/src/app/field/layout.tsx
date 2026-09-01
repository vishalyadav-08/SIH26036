import { ReactNode } from "react";
import { FieldHeader } from "@/components/layout/FieldHeader";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata = {
  title: "MapanSetu Field Operations",
  description: "Field Officer offline-first application.",
};

export default function FieldLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["OFFICER"]}>
      <div className="min-h-screen bg-[#f8fafc] text-[#111c2d] flex flex-col">
        <PublicHeader />
        <OfflineBanner />
        <FieldHeader />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <SiteFooter />
      </div>
    </AuthGuard>
  );
}
