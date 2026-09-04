import { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata = {
  title: "MapanSetu GATCs Portal",
  description: "GATC oversight and verification management.",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard allowedRoles={["ADMIN", "GATC"]}>
      <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111c2d]">
        <AdminHeader />
        
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
          <Sidebar role="ADMIN" />
          
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
