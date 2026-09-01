"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { AlertCircle, Home, Search, Mail } from "lucide-react";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111c2d]">
      <PublicHeader />

      <main id="main-content" className="flex-1 flex items-center justify-center p-6 focus:outline-none" tabIndex={-1}>
        <div className="max-w-xl w-full bg-white border border-[#cbd5e1] rounded-lg p-8 sm:p-10 text-center shadow-md my-8 space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#f0f3ff] text-[#004e9f] flex items-center justify-center mx-auto border border-[#cbd5e1]">
            <AlertCircle className="w-10 h-10 text-[#004e9f]" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <span className="text-5xl sm:text-6xl font-extrabold text-[#004e9f] tracking-tight block">
              404
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d]">
              {t("notfound.title")}
            </h1>
            <p className="text-xs sm:text-sm text-[#414753] max-w-md mx-auto leading-relaxed">
              {t("notfound.desc")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#004e9f] hover:bg-[#003366] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded transition-colors shadow-xs"
            >
              <Home className="w-4 h-4" />
              <span>{t("notfound.home")}</span>
            </Link>

            <Link
              href="/verify"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f0f3ff] text-[#004e9f] border border-[#004e9f] text-xs sm:text-sm font-semibold px-5 py-2.5 rounded transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>{t("notfound.verify")}</span>
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f8fafc] text-[#414753] border border-[#cbd5e1] text-xs sm:text-sm font-semibold px-5 py-2.5 rounded transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{t("notfound.contact")}</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
