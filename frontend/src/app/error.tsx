"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { ServerCrash, RotateCcw, Home, Mail } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();
  const referenceId = error?.digest ? `ERR-${error.digest.slice(0, 8).toUpperCase()}` : "ERR-500-A98B7C";

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111c2d]">
      <PublicHeader />

      <main id="main-content" className="flex-1 flex items-center justify-center p-6 focus:outline-none" tabIndex={-1}>
        <div className="max-w-xl w-full bg-white border border-[#cbd5e1] rounded-lg p-8 sm:p-10 text-center shadow-md my-8 space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#ffdad6] text-[#b91c1c] flex items-center justify-center mx-auto border border-[#b91c1c]/20">
            <ServerCrash className="w-10 h-10 text-[#b91c1c]" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <span className="text-5xl sm:text-6xl font-extrabold text-[#b91c1c] tracking-tight block">
              500
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111c2d]">
              {t("error.title")}
            </h1>
            <p className="text-xs sm:text-sm text-[#414753] max-w-md mx-auto leading-relaxed">
              {t("error.desc")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#004e9f] hover:bg-[#003366] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-[#004e9f]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t("error.retry")}</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f0f3ff] text-[#004e9f] border border-[#004e9f] text-xs sm:text-sm font-semibold px-5 py-2.5 rounded transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>{t("notfound.home")}</span>
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f8fafc] text-[#414753] border border-[#cbd5e1] text-xs sm:text-sm font-semibold px-5 py-2.5 rounded transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>{t("notfound.contact")}</span>
            </Link>
          </div>

          <div className="border-t border-[#cbd5e1] pt-4 text-xs text-[#727784] space-y-1">
            <p>Reference Identifier: <span className="font-mono font-semibold text-[#111c2d]">{referenceId}</span></p>
            <p className="text-[11px]">Please quote this reference ID if contacting departmental technical support.</p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
