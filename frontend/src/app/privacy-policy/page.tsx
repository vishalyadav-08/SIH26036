"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronRight,
  Shield,
  Lock,
  FileText,
  Clock,
  Calendar,
  Eye,
  Database,
  UserCheck,
  Mail
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  const sections = [
    { id: "intro", title: "1. Introduction" },
    { id: "collection", title: "2. Information We Collect" },
    { id: "usage", title: "3. Purpose and Use of Information" },
    { id: "security", title: "4. Data Security & Storage" },
    { id: "sharing", title: "5. Sharing & Disclosure" },
    { id: "retention", title: "6. Data Retention Policy" },
    { id: "cookies", title: "7. Cookies & Local Storage" },
    { id: "rights", title: "8. User Rights & Inquiries" },
    { id: "changes", title: "9. Updates to this Policy" },
    { id: "contact", title: "10. Contact Details" },
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
              {t("privacy.title")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="mb-8 border-b border-[#cbd5e1] pb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#004e9f] mb-2">
            {t("privacy.title")}
          </h1>
          <p className="text-sm sm:text-base text-[#414753] max-w-3xl leading-relaxed">
            {t("privacy.subtitle")}
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

        {/* Layout Grid: Sticky TOC Sidebar + Formal Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table of Contents (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 bg-white border border-[#cbd5e1] rounded-lg p-4 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#111c2d] pb-2 border-b border-[#cbd5e1] mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#004e9f]" />
                <span>Table of Contents</span>
              </h2>
              <nav aria-label="Privacy sections" className="space-y-1">
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
            {/* 1. Introduction */}
            <section id="intro" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#004e9f]" />
                <span>1. Introduction</span>
              </h2>
              <p>
                Welcome to MapanSetu, the official digital coordination portal of the Department of Legal Metrology, Government of India. The Department is committed to safeguarding personal information, commercial data, and metrological records processed through this platform.
              </p>
              <p>
                This Privacy Policy describes the categories of information we collect, the lawful purposes of processing, storage safeguards, and your rights concerning data submitted through MapanSetu.
              </p>
            </section>

            {/* 2. Information Collection */}
            <section id="collection" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#004e9f]" />
                <span>2. Information We Collect</span>
              </h2>
              <p>
                We collect information directly provided by users during registration, application filing, inspection reporting, or general inquiries:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Identity &amp; Contact Data:</strong> Name, official designation, telephone number, email address, and entity authorization details.</li>
                <li><strong>Commercial &amp; Establishment Details:</strong> Trade name, business address, GSTIN/registration number, and instrument location coordinates.</li>
                <li><strong>Instrument Technical Specifications:</strong> Make, model approval number, serial number, accuracy class, verification certificate history, and inspection test photos.</li>
                <li><strong>System &amp; Access Logs:</strong> IP address, device browser type, access timestamps, and authenticated session tokens.</li>
              </ul>
            </section>

            {/* 3. Purpose of Collection */}
            <section id="usage" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#004e9f]" />
                <span>3. Purpose and Use of Information</span>
              </h2>
              <p>Information collected via MapanSetu is strictly utilized for official governance purposes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Facilitating instrument registration and statutory verification applications.</li>
                <li>Enabling Legal Metrology Officers to conduct jurisdictional field inspections and upload evidence.</li>
                <li>Generating digitally verifiable calibration certificates and public QR lookup registers.</li>
                <li>Providing automated reminders for periodic instrument re-verification prior to statutory expiry.</li>
                <li>Maintaining institutional audit trails to prevent fraud and consumer exploitation.</li>
              </ul>
            </section>

            {/* 4. Data Security */}
            <section id="security" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#004e9f]" />
                <span>4. Data Security &amp; Storage</span>
              </h2>
              <p>
                We apply comprehensive technical and administrative security measures to protect data against unauthorized access, loss, alteration, or disclosure:
              </p>
              <div className="bg-[#f0f3ff] border-l-4 border-[#004e9f] p-3.5 rounded-r text-xs">
                <p>
                  All data in transit is encrypted using Transport Layer Security (TLS 1.3). Digital certificates are cryptographically signed, and internal role-based access control (RBAC) ensures only authorized officers access sensitive inspection data.
                </p>
              </div>
            </section>

            {/* 5. Sharing & Disclosure */}
            <section id="sharing" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#004e9f]" />
                <span>5. Sharing &amp; Disclosure</span>
              </h2>
              <p>
                Personal and business data is not sold, rented, or shared with commercial entities. Disclosures are limited to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Public Verification:</strong> Limited certificate status details (Certificate No, Validity, Model, Business Name) are accessible publicly for consumer verification.</li>
                <li><strong>Statutory Authorities:</strong> Information may be shared with law enforcement or judicial bodies when mandated by applicable Indian laws or court directives.</li>
              </ul>
            </section>

            {/* 6. Data Retention */}
            <section id="retention" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                6. Data Retention Policy
              </h2>
              <p>
                Verification records, instrument passports, and inspection audit logs are preserved in accordance with the Department of Legal Metrology record retention guidelines and statutory audit mandates.
              </p>
            </section>

            {/* 7. Cookies & Local Storage */}
            <section id="cookies" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                7. Cookies &amp; Local Storage
              </h2>
              <p>
                MapanSetu uses essential cookies and local storage items solely to manage secure user sessions, maintain language preferences (English/Hindi), and retain accessibility settings (font scale and contrast). No third-party tracking or advertising cookies are utilized.
              </p>
            </section>

            {/* 8. User Rights */}
            <section id="rights" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                8. User Rights &amp; Inquiries
              </h2>
              <p>
                Registered business users may review and update their profile details through their dashboard. Requests for correction of statutory records can be submitted to the assigned jurisdictional officer or via the <Link href="/contact" className="text-[#004e9f] hover:underline font-semibold">Contact Us</Link> portal.
              </p>
            </section>

            {/* 9. Updates to this Policy */}
            <section id="changes" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5">
                9. Updates to this Policy
              </h2>
              <p>
                The Department of Legal Metrology reserves the right to update this policy to reflect technological advancements, legislative changes, or service enhancements. The &ldquo;Last Updated&rdquo; timestamp will indicate the latest revision date.
              </p>
            </section>

            {/* 10. Contact Details */}
            <section id="contact" className="scroll-mt-24 space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-[#111c2d] border-b border-[#f0f3ff] pb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#004e9f]" />
                <span>10. Contact Details</span>
              </h2>
              <p>
                For questions regarding this Privacy Policy or data protection practices, please contact:
              </p>
              <div className="bg-[#f8fafc] border border-[#cbd5e1] p-3 rounded text-xs">
                <p className="font-bold text-[#111c2d]">Public Grievance &amp; Data Officer</p>
                <p>Department of Legal Metrology, Krishi Bhawan, New Delhi - 110001</p>
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
