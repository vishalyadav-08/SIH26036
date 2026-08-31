"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FieldHeader } from "@/components/layout/FieldHeader";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { useAuth } from "@/hooks/useAuth";

export default function FieldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    } else if (!isLoading && isAuthenticated && user?.role !== "OFFICER") {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (!mounted || isLoading || !isAuthenticated || user?.role !== "OFFICER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium tracking-wide">
            Loading Field workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <OfflineBanner />
      <FieldHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
