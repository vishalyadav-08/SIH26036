"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronRight,
  Accessibility,
  Keyboard,
  Eye,
  Type,
  Globe,
  Sliders,
  FileCheck2,
  PhoneCall,
  ShieldCheck
} from "lucide-react";

export default function AccessibilityPage() {
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
              {t("access.title")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="mb-8 border-b border-[#cbd5e1] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#004e9f] mb-2">
            {t("access.title")}
          </h1>
          <p className="text-sm sm:text-base text-[#414753] max-w-3xl leading-relaxed">
            {t("access.subtitle")}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Approach (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white rounded-lg border border-[#cbd5e1] p-6 shadow-xs">
              <h2 className="text-lg font-bold text-[#111c2d] mb-4 flex items-center gap-2 border-b border-[#f0f3ff] pb-2">
                <Accessibility className="w-5 h-5 text-[#004e9f]" />
                <span>Our Approach to Digital Accessibility</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Keyboard Navigation */}
                <div className="bg-[#f8fafc] border-l-4 border-[#004e9f] p-4 rounded-r border-y border-r border-[#cbd5e1]">
                  <div className="flex items-center gap-2 mb-1">
                    <Keyboard className="w-4 h-4 text-[#3a5f94]" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#111c2d]">Keyboard Navigation</h3>
                  </div>
                  <p className="text-xs text-[#414753] leading-relaxed">
                    All interactive elements (buttons, links, inputs, and tabs) can be operated using standard keyboard tabs with visible high-contrast focus indicators.
                  </p>
                </div>

                {/* Screen Reader Support */}
                <div className="bg-[#f8fafc] border-l-4 border-[#004e9f] p-4 rounded-r border-y border-r border-[#cbd5e1]">
                  <div className="flex items-center gap-2 mb-1">
                    <FileCheck2 className="w-4 h-4 text-[#3a5f94]" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#111c2d]">Screen Reader Support</h3>
                  </div>
                  <p className="text-xs text-[#414753] leading-relaxed">
                    The portal utilizes semantic HTML, ARIA landmarks, and descriptive labels so assistive screen readers (NVDA, JAWS, TalkBack) can easily interpret content.
                  </p>
                </div>

                {/* Text Resize */}
                <div className="bg-[#f8fafc] border-l-4 border-[#004e9f] p-4 rounded-r border-y border-r border-[#cbd5e1]">
                  <div className="flex items-center gap-2 mb-1">
                    <Type className="w-4 h-4 text-[#3a5f94]" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#111c2d]">Text Scaling (Up to 200%)</h3>
                  </div>
                  <p className="text-xs text-[#414753] leading-relaxed">
                    Text can be resized without loss of content or functionality using the dedicated A-, A, and A+ buttons in the global utility bar or browser zoom.
                  </p>
                </div>

                {/* High Contrast */}
                <div className="bg-[#f8fafc] border-l-4 border-[#004e9f] p-4 rounded-r border-y border-r border-[#cbd5e1]">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-[#3a5f94]" />
                    <h3 className="font-bold text-xs sm:text-sm text-[#111c2d]">High Contrast Mode</h3>
                  </div>
                  <p className="text-xs text-[#414753] leading-relaxed">
                    A dedicated high-contrast mode enhances foreground/background contrast ratios to assist users with visual impairments or color vision differences.
                  </p>
                </div>
              </div>
            </section>

            {/* Compliance Standards */}
            <section className="bg-white rounded-lg border border-[#cbd5e1] p-6 shadow-xs">
              <h2 className="text-base font-bold text-[#111c2d] mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#15803d]" />
                <span>Accessibility Standards &amp; Conformance</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#414753] leading-relaxed mb-4">
                MapanSetu is designed following the Web Content Accessibility Guidelines (WCAG 2.1 Level AA) and the Guidelines for Indian Government Websites (GIGW 3.0).
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#f0f3ff] text-[#004e9f] px-3 py-1 rounded text-xs font-semibold border border-[#004e9f]/20">
                  WCAG 2.1 Level AA Target
                </span>
                <span className="bg-[#f0f3ff] text-[#004e9f] px-3 py-1 rounded text-xs font-semibold border border-[#004e9f]/20">
                  GIGW 3.0 Guidelines
                </span>
                <span className="bg-[#f0f3ff] text-[#004e9f] px-3 py-1 rounded text-xs font-semibold border border-[#004e9f]/20">
                  WAI-ARIA 1.2 Attributes
                </span>
                <span className="bg-[#f0f3ff] text-[#004e9f] px-3 py-1 rounded text-xs font-semibold border border-[#004e9f]/20">
                  Bilingual English &amp; Hindi
                </span>
              </div>
            </section>
          </div>

          {/* Right Column: Visual Utility Guide & Report CTA (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Guide to Utility Bar */}
            <div className="bg-[#f0f3ff] border border-[#cbd5e1] rounded-lg p-5 shadow-xs">
              <h3 className="font-bold text-sm text-[#111c2d] mb-3 flex items-center gap-2 border-b border-[#cbd5e1] pb-2">
                <Sliders className="w-4 h-4 text-[#004e9f]" />
                <span>Using Accessibility Controls</span>
              </h3>
              <p className="text-xs text-[#414753] mb-4">
                Located at the top-right of every page, the utility bar provides instant access:
              </p>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 bg-white p-2.5 rounded border border-[#cbd5e1]">
                  <span className="font-bold text-[#004e9f] bg-[#e7eeff] px-1.5 py-0.5 rounded text-[11px] shrink-0">
                    A- A A+
                  </span>
                  <div>
                    <strong className="block text-[#111c2d]">Text Size Adjust</strong>
                    <span className="text-[#414753] text-[11px]">Toggle between small, normal, and large font scales.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-2.5 rounded border border-[#cbd5e1]">
                  <Eye className="w-4 h-4 text-[#004e9f] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#111c2d]">High Contrast</strong>
                    <span className="text-[#414753] text-[11px]">Inverts background and sharpens text outlines for maximum readability.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-2.5 rounded border border-[#cbd5e1]">
                  <Globe className="w-4 h-4 text-[#004e9f] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#111c2d]">Language Toggle</strong>
                    <span className="text-[#414753] text-[11px]">Instantly switch interface content between English and Hindi.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Accessibility Issue */}
            <div className="bg-white border border-[#cbd5e1] rounded-lg p-5 shadow-xs text-center space-y-3">
              <h3 className="font-bold text-sm text-[#111c2d]">Report an Accessibility Barrier</h3>
              <p className="text-xs text-[#414753] leading-relaxed">
                If you encounter any difficulty accessing content or navigating this portal, please let us know.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-1.5 bg-[#004e9f] text-white hover:bg-[#003366] text-xs font-semibold px-4 py-2 rounded transition-colors shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Contact Accessibility Support</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
