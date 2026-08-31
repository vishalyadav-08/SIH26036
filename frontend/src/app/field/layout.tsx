import { ReactNode } from "react";
import { FieldHeader } from "@/components/layout/FieldHeader";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { AuthGuard } from "@/components/auth/AuthGuard";

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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <OfflineBanner />
        <FieldHeader />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
