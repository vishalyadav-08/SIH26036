"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Calendar,
  Scale,
  CheckCircle2,
  Lock,
  Mail
} from "lucide-react";

export default function TermsPage() {
  const { t } = useLanguage();

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "purpose", title: "2. Platform Purpose & Scope" },
    { id: "responsibilities", title: "3. User & Business Responsibilities" },
    { id: "account", title: "4. Account Security" },
    { id: "accuracy", title: "5. Information Accuracy" },
    { id: "records", title: "6. Digital Records & Certificates" },
    { id: "disclaimer", title: "7. Statutory Prototype Disclaimer" },
    { id: "ip", title: "8. Intellectual Property" },
    { id: "external", title: "9. External Links" },
    { id: "availability", title: "10. Service Availability & Changes" },
    { id: "contact", title: "11. Contact" },
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
              {t("terms.title")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="mb-8 border-b border-[#cbd5e1] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#004e9f] mb-2">
            {t("terms.title")}
          </h1>
          <p className="text-sm sm:text-base text-[#414753] max-w-3xl leading-relaxed">
            {t("terms.subtitle")}
          </p>

          <div className="flex flex-wrap gap-3 mt-4 text-xs text-[#414753]">
            <span className="inline-flex items-center gap-1.5 bg-white border border-[#cbd5e1] px-3 py-1 rounded">
              <Clock className="w-3.5 h-3.5 text-[#004e9f]" />
              <span>Last Updated: <strong>October 2024</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-[#cbd5e1] px-3 py-1 rounded">
              <Calendar className="w-3.5 h-3.5 text-[#15803d]" />
              <span>Effective Date: <strong>November 2024</strong></span>
            </span>
          </div>
        </header>

        {/* Layout Grid: Sticky TOC Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table of Contents (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111c2d] pb-2 border-b border-[#cbd5e1] mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#004e9f]" />
                <span>Table of Contents</span>
              </h2>
              <nav aria-label="Terms sections" className="space-y-1">
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

          {/* Legal Document Content (9 Cols) */}
          <div className="lg:col-span-9 bg-white border border-[#cbd5e1] rounded-lg p-6 sm:p-8 shadow-xs space-y-8 text-xs sm:text-sm text-[#414753] leading-relaxed">
            {/* 1. Acceptance of Terms */}
            <section id="acceptance" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#004e9f]" />
                <span>1. Acceptance of Terms</span>
              </h2>
              <p>
                By accessing, browsing, or using the MapanSetu portal, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and all applicable laws and regulations of India. If you do not agree to these terms, please do not use this portal.
              </p>
            </section>

            {/* 2. Platform Purpose */}
            <section id="purpose" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#004e9f]" />
                <span>2. Platform Purpose &amp; Scope</span>
              </h2>
              <p>
                MapanSetu is designed to coordinate digital workflows, registration profiles, inspection evidence, and certificate lifecycle records under the Legal Metrology framework. The portal coordinates interactions among commercial establishments, registered manufacturers/repairers, and authorized Legal Metrology Officers.
              </p>
            </section>

            {/* 3. User Responsibilities */}
            <section id="responsibilities" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#004e9f]" />
                <span>3. User &amp; Business Responsibilities</span>
              </h2>
              <p>Users of the MapanSetu portal agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate, current, and verifiable details for all registered instruments and establishment addresses.</li>
                <li>Submit timely verification and stamping applications before the statutory expiry of existing calibration certificates.</li>
                <li>Ensure instruments submitted for inspection comply with standard weight and measures specifications.</li>
                <li>Not engage in tampering, unauthorized record alteration, or fraudulent certificate presentation.</li>
              </ul>
            </section>

            {/* 4. Account Security */}
            <section id="account" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#004e9f]" />
                <span>4. Account Security &amp; Confidentiality</span>
              </h2>
              <p>
                Authorized users are solely responsible for maintaining the confidentiality of their login credentials, passwords, and two-factor authentication tokens. Any action performed through an authenticated account shall be deemed authorized by the account holder.
              </p>
            </section>

            {/* 5. Information Accuracy */}
            <section id="accuracy" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                5. Information Accuracy
              </h2>
              <p>
                While the Department of Legal Metrology strives to maintain current and precise data on the portal, data entries submitted by commercial applicants are subject to on-site physical inspection and verification by authorized officers prior to statutory certification.
              </p>
            </section>

            {/* 6. Digital Records */}
            <section id="records" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                6. Digital Records &amp; Public Lookup
              </h2>
              <p>
                Digital certificates issued through MapanSetu include a unique Certificate Registration Number and cryptographic hash. Public users may query certificate validity via the portal&apos;s verification tool. The displayed verification result reflects the latest recorded state in the central registry.
              </p>
            </section>

            {/* 7. Statutory Prototype Disclaimer (IMPORTANT) */}
            <section id="disclaimer" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#b45309] border-b border-[#fef3c7] pb-1.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#b45309]" />
                <span>7. Statutory Prototype Scope &amp; Disclaimer</span>
              </h2>
              <div className="bg-[#fffbeb] border-l-4 border-[#b45309] p-4 rounded-r text-xs text-[#92400e] space-y-2">
                <p className="font-bold">
                  Important Notice regarding Demonstration &amp; Prototype Operations:
                </p>
                <p>
                  MapanSetu is currently a technological workflow coordination prototype developed for the Smart India Hackathon (SIH 2026).
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The platform does not physically calibrate or test weighing and measuring instruments.</li>
                  <li>The platform does not replace statutory physical inspections conducted by an authorized Legal Metrology Officer.</li>
                  <li>Sample certificates, demo QR codes, and simulated audit records do not constitute statutory certification in the physical domain unless issued by authorized jurisdictional authorities.</li>
                </ul>
              </div>
            </section>

            {/* 8. Intellectual Property */}
            <section id="ip" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                8. Intellectual Property
              </h2>
              <p>
                All portal software, design layout, emblems, graphical elements, and documentation are protected by applicable intellectual property laws of India. For full terms on content reuse, please refer to our <Link href="/copyright-policy" className="text-[#004e9f] hover:underline font-semibold">Copyright Policy</Link>.
              </p>
            </section>

            {/* 9. External Links */}
            <section id="external" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                9. External Links
              </h2>
              <p>
                This portal may contain links to official Indian Government websites (such as India.gov.in and Department portals). The Department is not responsible for the contents or privacy practices of external third-party portals. For details, view our <Link href="/hyperlinking-policy" className="text-[#004e9f] hover:underline font-semibold">Hyperlinking Policy</Link>.
              </p>
            </section>

            {/* 10. Service Availability */}
            <section id="availability" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                10. Service Availability &amp; Modifications
              </h2>
              <p>
                The Department reserves the right to modify, suspend, or update features, services, or documentation on MapanSetu without prior notice during scheduled maintenance windows or system upgrades.
              </p>
            </section>

            {/* 11. Contact */}
            <section id="contact" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#004e9f]" />
                <span>11. Contact</span>
              </h2>
              <p>
                For legal inquiries, terms clarification, or official correspondence:
              </p>
              <div className="bg-[#f8fafc] border border-[#cbd5e1] p-3 rounded text-xs">
                <p className="font-bold text-[#111c2d]">Department of Legal Metrology</p>
                <p>Ministry of Consumer Affairs, Food &amp; Public Distribution, Krishi Bhawan, New Delhi - 110001</p>
                <p>Email: <a href="mailto:dirwm-ca@nic.in" className="text-[#004e9f] hover:underline">dirwm-ca@nic.in</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
