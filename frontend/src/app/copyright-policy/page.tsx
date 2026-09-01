"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronRight,
  Copyright,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  FileText,
  Mail,
  Scale
} from "lucide-react";

export default function CopyrightPolicyPage() {
  const { t } = useLanguage();

  const sections = [
    { id: "copyright", title: "1. Copyright Statement" },
    { id: "ownership", title: "2. Ownership of Content" },
    { id: "permitted", title: "3. Permitted Reproduction" },
    { id: "commercial", title: "4. Commercial Use & Authorization" },
    { id: "thirdparty", title: "5. Third-Party Content" },
    { id: "attribution", title: "6. Attribution Requirements" },
    { id: "concerns", title: "7. Reporting Copyright Concerns" },
    { id: "contact", title: "8. Contact Information" },
  ];

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
              {t("copy.title")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="mb-8 border-b border-[#cbd5e1] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#004e9f] mb-2">
            {t("copy.title")}
          </h1>
          <p className="text-sm sm:text-base text-[#414753] max-w-3xl leading-relaxed">
            {t("copy.subtitle")}
          </p>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table of Contents (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111c2d] pb-2 border-b border-[#cbd5e1] mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#004e9f]" />
                <span>Table of Contents</span>
              </h2>
              <nav aria-label="Copyright sections" className="space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-xs text-[#414753] hover:text-[#004e9f] hover:bg-[#f0f3ff] px-2.5 py-1.5 rounded transition-colors"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Policy Content (9 Cols) */}
          <div className="lg:col-span-9 bg-white border border-[#cbd5e1] rounded-lg p-6 sm:p-8 shadow-xs space-y-8 text-xs sm:text-sm text-[#414753] leading-relaxed">
            {/* 1. Copyright Statement */}
            <section id="copyright" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Copyright className="w-4 h-4 text-[#004e9f]" />
                <span>1. Copyright Statement</span>
              </h2>
              <p>
                © {new Date().getFullYear()} Department of Legal Metrology, Ministry of Consumer Affairs, Food &amp; Public Distribution, Government of India. All rights reserved.
              </p>
              <p>
                The material featured on this website is subject to copyright protection unless otherwise specified.
              </p>
            </section>

            {/* 2. Ownership of Content */}
            <section id="ownership" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#004e9f]" />
                <span>2. Ownership of Content</span>
              </h2>
              <p>
                All text, graphics, logos, icons, user interfaces, visual design systems, and software source code published on MapanSetu are the property of the Department of Legal Metrology or are utilized under statutory public service guidelines.
              </p>
            </section>

            {/* 3. Permitted Reproduction */}
            <section id="permitted" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#004e9f]" />
                <span>3. Permitted Non-Commercial Reproduction</span>
              </h2>
              <p>
                Material featured on this portal may be reproduced free of charge in any format or media for personal, educational, or informational non-commercial use, subject to the following conditions:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The material must be reproduced accurately and not used in a misleading or derogatory context.</li>
                <li>Where material is being published or issued to others, the source must be prominently acknowledged.</li>
                <li>The permission to reproduce this material does not extend to any material on this site which is identified as being copyright of a third party.</li>
              </ul>
            </section>

            {/* 4. Commercial Use */}
            <section id="commercial" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#004e9f]" />
                <span>4. Commercial Use &amp; Authorization</span>
              </h2>
              <p>
                Reproduction of portal content for commercial exploitation, advertising, or resale requires prior written authorization from the Department of Legal Metrology. Applications for such authorization should be submitted via the <Link href="/contact" className="text-[#004e9f] hover:underline font-semibold">Contact Us</Link> portal.
              </p>
            </section>

            {/* 5. Third-Party Content */}
            <section id="thirdparty" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                5. Third-Party Content &amp; Trademarks
              </h2>
              <p>
                Manufacturer logos, trade names, and model brand identifiers displayed in instrument passports belong to their respective proprietary owners and are displayed strictly for statutory identification and verification purposes.
              </p>
            </section>

            {/* 6. Attribution */}
            <section id="attribution" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                6. Attribution Requirements
              </h2>
              <p>
                When citing verification data or statutory notices from MapanSetu in public records or academic publications, cite as:
              </p>
              <div className="bg-[#f8fafc] border border-[#cbd5e1] p-3 rounded text-xs font-mono text-[#111c2d]">
                &ldquo;Source: MapanSetu — Department of Legal Metrology, Government of India (https://mapansetu.gov.in)&rdquo;
              </div>
            </section>

            {/* 7. Reporting Concerns */}
            <section id="concerns" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#b45309]" />
                <span>7. Reporting Copyright Concerns</span>
              </h2>
              <p>
                If you believe any content or material on this platform infringes upon any intellectual property rights, please notify our department promptly with full documentary evidence.
              </p>
            </section>

            {/* 8. Contact */}
            <section id="contact" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#004e9f]" />
                <span>8. Contact Information</span>
              </h2>
              <p>
                Copyright Officer, Department of Legal Metrology, Krishi Bhawan, New Delhi - 110001.<br />
                Email: <a href="mailto:dirwm-ca@nic.in" className="text-[#004e9f] hover:underline">dirwm-ca@nic.in</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
