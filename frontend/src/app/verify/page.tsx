"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronRight,
  Search,
  ShieldCheck,
  Info,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Radio,
} from "lucide-react";
import { getSampleCertificates, SampleCertificate } from "@/services/certificates/certificates.service";

export default function VerifySearchPage() {
  const [certNo, setCertNo] = useState("");
  const [samples, setSamples] = useState<SampleCertificate[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;
    getSampleCertificates()
      .then((data) => {
        if (isMounted) {
          setSamples(data);
          setLoadingSamples(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadingSamples(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (certNo.trim()) {
      router.push(`/verify/${encodeURIComponent(certNo.trim())}`);
    }
  };

  const handleAutofill = (selectedNo: string, autoSubmit = false) => {
    setCertNo(selectedNo);
    if (autoSubmit) {
      router.push(`/verify/${encodeURIComponent(selectedNo)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111c2d]">
      <PublicHeader />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none" tabIndex={-1}>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-[#414753]">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-[#004e9f] focus:outline-none focus:ring-1 focus:ring-[#004e9f] rounded px-1">
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-3.5 h-3.5 text-[#727784]" />
            </li>
            <li aria-current="page" className="font-semibold text-[#111c2d]">
              {t("verify.title")}
            </li>
          </ol>
        </nav>

        <div className="max-w-3xl mx-auto py-4">
          <div className="bg-white border border-[#cbd5e1] rounded-lg p-6 sm:p-10 shadow-xs space-y-6">
            <div className="text-center space-y-2 border-b border-[#cbd5e1] pb-6">
              <div className="w-14 h-14 rounded-full bg-[#e7eeff] text-[#004e9f] flex items-center justify-center mx-auto mb-2 border border-[#cbd5e1]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#004e9f]">
                {t("verify.title")}
              </h1>
              <p className="text-xs sm:text-sm text-[#414753] max-w-xl mx-auto leading-relaxed">
                {t("verify.subtitle")}
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4 max-w-xl mx-auto">
              <div>
                <label htmlFor="certificate-input" className="block text-xs font-semibold text-[#111c2d] mb-1.5">
                  Certificate Registration Number <span className="text-[#b91c1c]">*</span>
                </label>
                <div className="relative">
                  <input
                    id="certificate-input"
                    type="text"
                    value={certNo}
                    onChange={(e) => setCertNo(e.target.value)}
                    placeholder={t("verify.placeholder")}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded px-4 py-3 text-xs sm:text-sm text-[#111c2d] placeholder-[#727784] focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:bg-white font-mono uppercase"
                    required
                  />
                </div>
                {/* Live Prototype Certificate Autofill Bar */}
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Autofill Prototype Certificates (Live Backend):</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live Registry
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {samples.map((s) => {
                      const isValid = s.status === "ACTIVE" || s.status === "VALID";
                      return (
                        <button
                          key={s.certificateNumber}
                          type="button"
                          onClick={() => handleAutofill(s.certificateNumber)}
                          className={`flex items-start justify-between gap-2 p-2.5 rounded border text-left text-xs transition-all cursor-pointer ${
                            certNo === s.certificateNumber
                              ? "border-[#004e9f] bg-blue-50/70 ring-1 ring-[#004e9f]"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {isValid ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              )}
                              <span className="font-mono font-bold text-slate-900 truncate">
                                {s.certificateNumber}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {s.instrumentType.replace(/_/g, " ")} ({s.instrumentNumber})
                            </p>
                          </div>
                          <span
                            className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              isValid
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {isValid ? "VALID" : "REVOKED"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    Click any prototype certificate above to instantly autofill and verify via live Django API.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#004e9f] hover:bg-[#003366] text-white font-bold text-sm rounded transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{t("verify.search")}</span>
              </button>
            </form>

            <div className="bg-[#f0f3ff] border border-[#cbd5e1] rounded p-4 text-xs text-[#414753] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#004e9f]">
                <Info className="w-4 h-4" />
                <span>Verification Guidelines</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px]">
                <li>Only certificates issued through the Department of Legal Metrology registry are verifiable on this platform.</li>
                <li>Verify that the physical instrument serial number and make correspond exactly with the digital record.</li>
                <li>In case of discrepancy or unverified status, report to the department helpline at <strong>1800-11-4000</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
