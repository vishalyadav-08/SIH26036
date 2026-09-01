"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronRight,
  Link2,
  ExternalLink,
  AlertCircle,
  FileText,
  CheckCircle2,
  Mail
} from "lucide-react";

export default function HyperlinkingPolicyPage() {
  const { t } = useLanguage();

  const sections = [
    { id: "internal", title: "1. Links to Internal Pages" },
    { id: "external", title: "2. Links to External Websites" },
    { id: "linking-in", title: "3. Linking to MapanSetu from Other Websites" },
    { id: "disclaimer", title: "4. External Website Disclaimer" },
    { id: "availability", title: "5. Link Maintenance & Availability" },
    { id: "prohibited", title: "6. Prohibited Linking Practices" },
    { id: "contact", title: "7. Contact & Permissions" },
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
              {t("hyper.title")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="mb-8 border-b border-[#cbd5e1] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#004e9f] mb-2">
            {t("hyper.title")}
          </h1>
          <p className="text-sm sm:text-base text-[#414753] max-w-3xl leading-relaxed">
            {t("hyper.subtitle")}
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
              <nav aria-label="Hyperlinking sections" className="space-y-1">
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
            {/* Visual Link Indicators Showcase Box */}
            <div className="bg-[#f0f3ff] border border-[#cbd5e1] rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#004e9f] flex items-center gap-1.5">
                <Link2 className="w-4 h-4" />
                <span>Visual Link Indicators Used on This Portal</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded border border-[#cbd5e1]">
                  <strong className="block text-[#111c2d] mb-1">Internal Navigation Link:</strong>
                  <p className="text-[#414753] mb-1.5">Navigates within MapanSetu in the same window.</p>
                  <Link href="/about" className="text-[#004e9f] font-semibold hover:underline">
                    Sample Internal Link (About Us)
                  </Link>
                </div>

                <div className="bg-white p-3 rounded border border-[#cbd5e1]">
                  <strong className="block text-[#111c2d] mb-1">External Government Link:</strong>
                  <p className="text-[#414753] mb-1.5">Opens in an external browser tab with an icon.</p>
                  <a
                    href="https://www.india.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#004e9f] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Sample External Link (India.gov.in)</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#727784]" aria-label="(Opens in new window)" />
                  </a>
                </div>
              </div>
            </div>

            {/* 1. Internal Links */}
            <section id="internal" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#004e9f]" />
                <span>1. Links to Internal Pages</span>
              </h2>
              <p>
                Navigation between pages within the MapanSetu portal is designed to maintain session context, role permissions, and accessibility preferences. Internal links are keyboard-navigable and provide clear descriptive anchor text.
              </p>
            </section>

            {/* 2. External Links */}
            <section id="external" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#004e9f]" />
                <span>2. Links to External Websites</span>
              </h2>
              <p>
                At various locations on this portal, hyperlinks are provided to other official websites or portals maintained by government departments, statutory bodies, or standard organizations (such as OIML or National Portal of India).
              </p>
              <p>
                All external links are clearly marked with an external link indicator and open in a new window to alert the user that they are leaving the MapanSetu domain.
              </p>
            </section>

            {/* 3. Linking In */}
            <section id="linking-in" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#004e9f]" />
                <span>3. Linking to MapanSetu from Other Websites</span>
              </h2>
              <p>
                We welcome hyperlinks directed to the MapanSetu portal from other websites, provided that:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The hyperlink must not misrepresent the nature of your relationship with the Department of Legal Metrology.</li>
                <li>The pages of MapanSetu must not be loaded into HTML frames on your website without express authorization.</li>
                <li>The link must clearly indicate that it leads to the official MapanSetu portal.</li>
              </ul>
            </section>

            {/* 4. External Disclaimer */}
            <section id="disclaimer" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#b45309]" />
                <span>4. External Website Disclaimer</span>
              </h2>
              <p>
                The Department of Legal Metrology is not responsible for the contents, reliability, security, or privacy policies of any linked external websites. The inclusion of any link does not necessarily imply an endorsement or recommendation of the views expressed within them.
              </p>
            </section>

            {/* 5. Link Availability */}
            <section id="availability" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                5. Link Maintenance &amp; Availability
              </h2>
              <p>
                We cannot guarantee that these external links will work continuously and we have no control over the availability of the linked third-party pages.
              </p>
            </section>

            {/* 6. Prohibited Practices */}
            <section id="prohibited" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                6. Prohibited Linking Practices
              </h2>
              <p>
                Websites featuring defamatory, obscene, misleading, fraudulent, or unlawful content are strictly prohibited from creating links to MapanSetu or referencing its verification records.
              </p>
            </section>

            {/* 7. Contact */}
            <section id="contact" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#004e9f]" />
                <span>7. Contact &amp; Permissions</span>
              </h2>
              <p>
                For permission to link or report broken links on this portal, please reach out through our <Link href="/contact" className="text-[#004e9f] hover:underline font-semibold">Contact Us</Link> page.
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
