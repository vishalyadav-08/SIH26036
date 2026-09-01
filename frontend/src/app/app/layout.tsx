import { ReactNode } from "react";
import { BusinessHeader } from "@/components/layout/BusinessHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata = {
  title: "MapanSetu Business Portal",
  description: "Manage instruments and applications.",
};

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["BUSINESS"]}>
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111c2d]">
        <BusinessHeader />
        
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
          <Sidebar role="BUSINESS" />
          
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
