"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { LogOut, ArrowRight, ShieldCheck } from "lucide-react";

export function GuestGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3" role="status">
          <div className="w-8 h-8 border-3 border-[#004e9f] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">
            Checking session...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const handleContinue = () => {
      if (user.role === "BUSINESS") {
        router.replace("/app");
      } else if (user.role === "OFFICER") {
        router.replace("/field");
      } else {
        router.replace("/admin");
      }
    };

    const handleLogout = () => {
      logout();
      router.replace("/login");
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
        <div className="max-w-md w-full bg-white rounded-lg border border-[#cbd5e1] p-6 shadow-sm text-center space-y-6">
          <div className="w-12 h-12 bg-[#f0f3ff] rounded-full flex items-center justify-center mx-auto text-[#004e9f]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111c2d]">{t("auth.alreadySignedIn")}</h2>
            <p className="text-sm text-[#414753]">
              {t("auth.signedInAs")} <span className="font-semibold text-[#111c2d]">{user.email}</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleContinue}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#004e9f] hover:bg-[#003366] text-white font-bold text-xs rounded transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-2"
            >
              <span>{t("auth.continuePortal")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#414753] border border-[#cbd5e1] font-bold text-xs rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#cbd5e1] focus:ring-offset-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("auth.signOutSwitch")}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
