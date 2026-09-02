"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { AppPromoModal } from "@/components/ui/AppPromoModal";
import {
  Search,
  ShieldCheck,
  Scale,
  FileCheck,
  Clock,
  QrCode,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Award,
  Eye,
  FileText,
  LayoutDashboard
} from "lucide-react";

export default function LandingHomepage() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [certInput, setCertInput] = useState("");

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certInput.trim()) {
      router.push(`/verify/${encodeURIComponent(certInput.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#111c2d]">
      <AppPromoModal />
      <PublicHeader />

      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {/* Hero Section */}
        <section className="relative bg-[#f0f3ff] border-b border-[#cbd5e1] py-12 md:py-16 overflow-hidden">
          {/* Subtle Institutional Grid Texture */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #004e9f 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading & CTAs */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white border border-[#cbd5e1] text-[#004e9f] text-xs font-semibold shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-[#004e9f]" aria-hidden="true" />
                  <span>{t("home.badge")}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111c2d] tracking-tight leading-tight">
                  {t("home.hero.title")}
                </h1>

                <p className="text-base sm:text-lg text-[#414753] leading-relaxed max-w-2xl">
                  {t("home.hero.desc")}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/verify"
                    className="inline-flex items-center justify-center gap-2 bg-[#004e9f] hover:bg-[#003366] text-white px-6 py-3 rounded font-semibold text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>{t("home.hero.verifyBtn")}</span>
                  </Link>

                  {isAuthenticated ? (
                    <Link
                      href={user?.role === "BUSINESS" ? "/app" : user?.role === "OFFICER" ? "/field" : "/admin"}
                      className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f0f3ff] text-[#004e9f] border border-[#004e9f] px-6 py-3 rounded font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#f0f3ff] text-[#004e9f] border border-[#004e9f] px-6 py-3 rounded font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-2"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>{t("home.hero.loginBtn")}</span>
                    </Link>
                  )}

                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-1.5 bg-transparent text-[#414753] hover:text-[#004e9f] px-4 py-3 rounded font-medium text-sm transition-colors"
                  >
                    <span>{t("home.hero.howBtn")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Right Column: Hero Visual / Official Instrument Passport Card */}
              <div className="lg:col-span-5">
                <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-md p-6 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-[#cbd5e1]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded bg-[#e7eeff] text-[#004e9f] flex items-center justify-center font-bold">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#111c2d]">Digital Verification Certificate</div>
                        <div className="text-[11px] text-[#414753]">Department of Legal Metrology</div>
                      </div>
                    </div>
                    <span className="bg-[#15803d]/10 text-[#15803d] border border-[#15803d]/30 text-[11px] font-bold px-2 py-0.5 rounded">
                      VERIFIED
                    </span>
                  </div>

                  <div className="py-4 space-y-2.5 text-xs text-[#414753]">
                    <div className="flex justify-between py-1 border-b border-[#cbd5e1]/50">
                      <span className="font-medium text-[#111c2d]">Certificate No:</span>
                      <span className="font-mono font-bold text-[#004e9f]">CERT-2024-8849</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#cbd5e1]/50">
                      <span className="font-medium text-[#111c2d]">Instrument Category:</span>
                      <span>Electronic Weighing Scale (Class III)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#cbd5e1]/50">
                      <span className="font-medium text-[#111c2d]">Verification Officer:</span>
                      <span>LMO / Delhi Central (ID: LMO-DEL-04)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#cbd5e1]/50">
                      <span className="font-medium text-[#111c2d]">Valid Until:</span>
                      <span className="font-semibold text-[#111c2d]">31 March 2027</span>
                    </div>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded p-3 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-8 h-8 text-[#004e9f]" />
                      <div>
                        <div className="text-[11px] font-bold text-[#111c2d]">Cryptographic QR Stamp</div>
                        <div className="text-[10px] text-[#414753]">Scan with any phone to verify</div>
                      </div>
                    </div>
                    <Link
                      href="/verify/CERT-DEMO-001"
                      className="text-xs text-[#004e9f] font-semibold hover:underline"
                    >
                      Sample Lookup →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Certificate Search Bar Banner */}
        <section className="bg-[#003366] text-white py-8 border-b-4 border-[#ff9933]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-5">
                <h2 className="text-xl font-bold text-white mb-1">
                  {t("home.search.heading")}
                </h2>
                <p className="text-xs text-blue-100">
                  {t("home.search.desc")}
                </p>
              </div>

              <div className="md:col-span-7">
                <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      placeholder={t("home.search.placeholder")}
                      aria-label="Certificate Registration Number"
                      className="w-full bg-white text-[#111c2d] placeholder-[#727784] px-4 py-2.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ff9933] border-0"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#ff9933] hover:bg-[#e68a00] text-[#111c2d] px-6 py-2.5 rounded font-bold text-sm transition-colors flex items-center justify-center gap-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <Search className="w-4 h-4" />
                    <span>{t("home.search.btn")}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Service Cards */}
        <section id="services" className="py-14 bg-white border-b border-[#cbd5e1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111c2d] mb-2">
                {t("home.quick.title")}
              </h2>
              <p className="text-sm text-[#414753]">
                Direct access to public lookup and authenticated metrology workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Verify Certificate */}
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-5 hover:border-[#004e9f] transition-all shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded bg-[#e7eeff] text-[#004e9f] flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#111c2d]">{t("home.quick.verify")}</h3>
                  <p className="text-xs text-[#414753] leading-relaxed">
                    {t("home.quick.verifyDesc")}
                  </p>
                </div>
                <Link
                  href="/verify"
                  className="mt-4 text-xs font-bold text-[#004e9f] hover:underline inline-flex items-center gap-1"
                >
                  <span>Verify Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Card 2: Apply for Verification */}
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-5 hover:border-[#004e9f] transition-all shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded bg-[#e7eeff] text-[#004e9f] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#111c2d]">{t("home.quick.apply")}</h3>
                  <p className="text-xs text-[#414753] leading-relaxed">
                    {t("home.quick.applyDesc")}
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-4 text-xs font-bold text-[#004e9f] hover:underline inline-flex items-center gap-1"
                >
                  <span>Sign In to Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Card 3: Track Application */}
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-5 hover:border-[#004e9f] transition-all shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded bg-[#e7eeff] text-[#004e9f] flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#111c2d]">{t("home.quick.track")}</h3>
                  <p className="text-xs text-[#414753] leading-relaxed">
                    {t("home.quick.trackDesc")}
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-4 text-xs font-bold text-[#004e9f] hover:underline inline-flex items-center gap-1"
                >
                  <span>Track Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Card 4: Manage Instruments */}
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-5 hover:border-[#004e9f] transition-all shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded bg-[#e7eeff] text-[#004e9f] flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[#111c2d]">{t("home.quick.manage")}</h3>
                  <p className="text-xs text-[#414753] leading-relaxed">
                    {t("home.quick.manageDesc")}
                  </p>
                </div>
                <Link
                  href="/login"
                  className="mt-4 text-xs font-bold text-[#004e9f] hover:underline inline-flex items-center gap-1"
                >
                  <span>View Passports</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How MapanSetu Works (5-step process) */}
        <section id="how-it-works" className="py-14 bg-[#f8fafc] border-b border-[#cbd5e1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111c2d] mb-2">
                {t("home.workflow.title")}
              </h2>
              <p className="text-sm text-[#414753]">
                {t("home.workflow.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Step 1 */}
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 relative flex flex-col">
                <div className="w-8 h-8 rounded bg-[#004e9f] text-white font-bold text-sm flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="font-bold text-sm text-[#111c2d] mb-1">{t("home.workflow.step1.title")}</h3>
                <p className="text-xs text-[#414753] leading-relaxed">
                  {t("home.workflow.step1.desc")}
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 relative flex flex-col">
                <div className="w-8 h-8 rounded bg-[#004e9f] text-white font-bold text-sm flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="font-bold text-sm text-[#111c2d] mb-1">{t("home.workflow.step2.title")}</h3>
                <p className="text-xs text-[#414753] leading-relaxed">
                  {t("home.workflow.step2.desc")}
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 relative flex flex-col">
                <div className="w-8 h-8 rounded bg-[#004e9f] text-white font-bold text-sm flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="font-bold text-sm text-[#111c2d] mb-1">{t("home.workflow.step3.title")}</h3>
                <p className="text-xs text-[#414753] leading-relaxed">
                  {t("home.workflow.step3.desc")}
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 relative flex flex-col">
                <div className="w-8 h-8 rounded bg-[#004e9f] text-white font-bold text-sm flex items-center justify-center mb-3">
                  4
                </div>
                <h3 className="font-bold text-sm text-[#111c2d] mb-1">{t("home.workflow.step4.title")}</h3>
                <p className="text-xs text-[#414753] leading-relaxed">
                  {t("home.workflow.step4.desc")}
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-white border border-[#cbd5e1] rounded-lg p-4 relative flex flex-col">
                <div className="w-8 h-8 rounded bg-[#15803d] text-white font-bold text-sm flex items-center justify-center mb-3">
                  5
                </div>
                <h3 className="font-bold text-sm text-[#111c2d] mb-1">{t("home.workflow.step5.title")}</h3>
                <p className="text-xs text-[#414753] leading-relaxed">
                  {t("home.workflow.step5.desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why MapanSetu (4 Benefits) */}
        <section className="py-14 bg-white border-b border-[#cbd5e1]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111c2d] mb-2">
                {t("home.why.title")}
              </h2>
              <p className="text-sm text-[#414753]">
                Designed to deliver integrity, transparency, and accessible metrological records.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border border-[#cbd5e1] rounded-lg p-5 bg-[#f8fafc]">
                <div className="w-9 h-9 rounded bg-[#e7eeff] text-[#004e9f] flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#111c2d] mb-1">{t("home.why.traceable")}</h3>
                <p className="text-xs text-[#414753] leading-relaxed">
                  {t("home.why.traceableDesc")}
                </p>
              </div>

              <div className="border border-[#cbd5e1] rounded-lg p-5 bg-[#f8fafc]">
                <div className="w-9 h-9 rounded bg-[#e7eeff] text-[#004e9f] flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#111c2d] mb-1">{t("home.why.transparent")}</h3>
                <p className="text-xs text-[#414753] leading-relaxed">
                  {t("home.why.transparentDesc")}
                </p>
              </div>

              <div className="border border-[#cbd5e1] rounded-lg p-5 bg-[#f8fafc]">
                <div className="w-9 h-9 rounded bg-[#e7eeff] text-[#004e9f] flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#111c2d] mb-1">{t("home.why.evidence")}</h3>
                <p className="text-xs text-[#414753] leading-relaxed">
                  {t("home.why.evidenceDesc")}
                </p>
              </div>

              <div className="border border-[#cbd5e1] rounded-lg p-5 bg-[#f8fafc]">
                <div className="w-9 h-9 rounded bg-[#e7eeff] text-[#004e9f] flex items-center justify-center mb-3">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#111c2d] mb-1">{t("home.why.public")}</h3>
                <p className="text-xs text-[#414753] leading-relaxed">
                  {t("home.why.publicDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Prototype Scope Banner */}
        <section className="py-6 bg-[#fffbeb] border-b border-[#fef3c7]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-[#92400e] leading-relaxed">
              <strong>Statutory Prototype Notice:</strong> MapanSetu is an educational and technological prototype developed for Smart India Hackathon (SIH 2026). The portal coordinates digital records and simulated verification workflows. It does not replace physical inspection by an authorized officer or grant statutory certifications in the physical domain.
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
