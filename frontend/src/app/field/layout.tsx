import { ReactNode } from "react";
import { FieldHeader } from "@/components/layout/FieldHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata = {
  title: "MapanSetu LMO Operations",
  description: "LMO offline-first application.",
};

export default function FieldLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["OFFICER", "LMO"]}>
      <div className="min-h-screen bg-[#f8fafc] text-[#111c2d] flex flex-col">
        <OfflineBanner />
        <FieldHeader />
        
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
          <Sidebar role="OFFICER" />
          
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
