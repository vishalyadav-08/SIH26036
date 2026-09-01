"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronRight,
  Landmark,
  Layers,
  Store,
  Scale,
  FileText,
  UserCheck,
  Calendar,
  Award,
  AlertCircle,
  Eye,
  ShieldAlert,
  Building,
  MapPin,
  Mail,
  Phone
} from "lucide-react";

export default function AboutPage() {
  const { t } = useLanguage();

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
              {t("nav.about")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="mb-8 border-b border-[#cbd5e1] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#004e9f] mb-2">
            {t("about.title")}
          </h1>
          <p className="text-sm sm:text-base text-[#414753] max-w-3xl leading-relaxed">
            {t("about.subtitle")}
          </p>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Narrative (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: About the Platform */}
            <section aria-labelledby="about-platform" className="bg-white p-6 border border-[#cbd5e1] rounded-lg shadow-xs">
              <h2 id="about-platform" className="text-lg font-bold text-[#111c2d] mb-3 flex items-center gap-2 border-b border-[#f0f3ff] pb-2">
                <Landmark className="w-5 h-5 text-[#004e9f]" />
                <span>{t("about.platform.title")}</span>
              </h2>
              <p className="text-sm text-[#414753] leading-relaxed mb-3">
                {t("about.platform.p1")}
              </p>
              <p className="text-sm text-[#414753] leading-relaxed">
                {t("about.platform.p2")}
              </p>
            </section>

            {/* Section 2: What MapanSetu Coordinates */}
            <section aria-labelledby="coordinates" className="bg-white p-6 border border-[#cbd5e1] rounded-lg shadow-xs">
              <h2 id="coordinates" className="text-lg font-bold text-[#111c2d] mb-3 flex items-center gap-2 border-b border-[#f0f3ff] pb-2">
                <Layers className="w-5 h-5 text-[#004e9f]" />
                <span>{t("about.coord.title")}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#414753] mb-4">
                {t("about.coord.desc")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex items-start gap-3 bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1]/60">
                  <Store className="w-5 h-5 text-[#3a5f94] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-[#111c2d]">{t("about.coord.biz")}</h3>
                    <p className="text-xs text-[#414753] mt-0.5">{t("about.coord.bizDesc")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1]/60">
                  <Scale className="w-5 h-5 text-[#3a5f94] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-[#111c2d]">{t("about.coord.inst")}</h3>
                    <p className="text-xs text-[#414753] mt-0.5">{t("about.coord.instDesc")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1]/60">
                  <FileText className="w-5 h-5 text-[#3a5f94] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-[#111c2d]">{t("about.coord.app")}</h3>
                    <p className="text-xs text-[#414753] mt-0.5">{t("about.coord.appDesc")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1]/60">
                  <UserCheck className="w-5 h-5 text-[#3a5f94] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-[#111c2d]">{t("about.coord.assign")}</h3>
                    <p className="text-xs text-[#414753] mt-0.5">{t("about.coord.assignDesc")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1]/60">
                  <Calendar className="w-5 h-5 text-[#3a5f94] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-[#111c2d]">{t("about.coord.sched")}</h3>
                    <p className="text-xs text-[#414753] mt-0.5">{t("about.coord.schedDesc")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1]/60">
                  <Award className="w-5 h-5 text-[#3a5f94] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-[#111c2d]">{t("about.coord.cert")}</h3>
                    <p className="text-xs text-[#414753] mt-0.5">{t("about.coord.certDesc")}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Problem Being Addressed */}
            <section aria-labelledby="problem-statement" className="bg-white p-6 border border-[#cbd5e1] rounded-lg shadow-xs">
              <h2 id="problem-statement" className="text-lg font-bold text-[#111c2d] mb-3 flex items-center gap-2 border-b border-[#f0f3ff] pb-2">
                <AlertCircle className="w-5 h-5 text-[#b45309]" />
                <span>{t("about.problem.title")}</span>
              </h2>
              <p className="text-sm text-[#414753] leading-relaxed mb-3">
                {t("about.problem.p1")}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#414753] mb-3">
                <li>{t("about.problem.i1")}</li>
                <li>{t("about.problem.i2")}</li>
                <li>{t("about.problem.i3")}</li>
                <li>{t("about.problem.i4")}</li>
              </ul>
            </section>
          </div>

          {/* Right Column: Vision, Limits, Department Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Vision Card */}
            <div className="bg-[#004e9f] text-white p-5 rounded-lg shadow-xs">
              <h3 className="font-bold text-base mb-2 flex items-center gap-2 text-white">
                <Eye className="w-5 h-5 text-[#ff9933]" />
                <span>{t("about.vision.title")}</span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-50 leading-relaxed">
                {t("about.vision.desc")}
              </p>
            </div>

            {/* Platform Limitations Card */}
            <div className="bg-white p-5 border border-[#ffdad6] rounded-lg shadow-xs">
              <h3 className="font-bold text-sm text-[#b91c1c] mb-2 flex items-center gap-2 border-b border-[#ffdad6] pb-1.5">
                <ShieldAlert className="w-4 h-4 text-[#b91c1c]" />
                <span>{t("about.limits.title")}</span>
              </h3>
              <p className="text-xs font-semibold text-[#111c2d] mb-2">
                {t("about.limits.p")}
              </p>
              <ul className="space-y-2 text-xs text-[#414753]">
                <li className="flex items-start gap-1.5">
                  <span className="text-[#b91c1c] font-bold">✕</span>
                  <span>{t("about.limits.i1")}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#b91c1c] font-bold">✕</span>
                  <span>{t("about.limits.i2")}</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-[#b91c1c] font-bold">✕</span>
                  <span>{t("about.limits.i3")}</span>
                </li>
              </ul>
            </div>

            {/* Department Information Card */}
            <div className="bg-[#f0f3ff] p-5 border border-[#cbd5e1] rounded-lg shadow-xs">
              <h3 className="font-bold text-sm text-[#111c2d] mb-3 flex items-center gap-2 border-b border-[#cbd5e1] pb-1.5">
                <Building className="w-4 h-4 text-[#004e9f]" />
                <span>{t("about.dept.title")}</span>
              </h3>
              <div className="space-y-3 text-xs text-[#414753]">
                <div>
                  <p className="font-bold text-[#111c2d]">{t("about.dept.name")}</p>
                  <p className="text-[11px] text-[#414753]">{t("about.dept.gov")}</p>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#004e9f] shrink-0 mt-0.5" />
                  <span>{t("about.dept.addr")}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#004e9f] shrink-0" />
                  <a href={`mailto:${t("about.dept.email")}`} className="text-[#004e9f] hover:underline">
                    {t("about.dept.email")}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#004e9f] shrink-0" />
                  <span>{t("about.dept.phone")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
