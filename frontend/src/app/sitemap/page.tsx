"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  ChevronRight,
  Map,
  Home,
  Info,
  Search,
  HelpCircle,
  Accessibility,
  Mail,
  Shield,
  FileText,
  Link2,
  Copyright,
  Lock,
  Scale,
  Award,
  Layers,
  UserCheck,
  LayoutDashboard
} from "lucide-react";

export default function SitemapPage() {
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
              {t("sitemap.title")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="mb-8 border-b border-[#cbd5e1] pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Map className="w-6 h-6 text-[#004e9f]" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#004e9f]">
              {t("sitemap.title")}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[#414753] max-w-3xl leading-relaxed">
            {t("sitemap.subtitle")}
          </p>
        </header>

        {/* 3 Major Sitemap Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Group 1: Public Citizen Services */}
          <div className="bg-white border border-[#cbd5e1] rounded-lg p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#004e9f] border-b border-[#cbd5e1] pb-2 mb-4 flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>Public Citizen Services</span>
              </h2>

              <ul className="space-y-3 text-xs">
                <li>
                  <Link href="/" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Home (P-01)</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Overview, quick lookup, and service entry.</p>
                </li>

                <li>
                  <Link href="/about" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>About MapanSetu (P-02)</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Department background, mission, and scope.</p>
                </li>

                <li>
                  <Link href="/verify" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Verify Certificate</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Public certificate registry and QR verification.</p>
                </li>

                <li>
                  <Link href="/help" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Help &amp; FAQ (P-04)</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Frequently asked questions and guides.</p>
                </li>

                <li>
                  <Link href="/accessibility" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Accessibility className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Accessibility Information (P-05)</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Standards, text scaling, and contrast guide.</p>
                </li>

                <li>
                  <Link href="/contact" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Contact Us (P-03)</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Helpline, office addresses, and query form.</p>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-3 border-t border-[#cbd5e1]/60 text-[11px] text-[#727784]">
              Publicly accessible without login
            </div>
          </div>

          {/* Group 2: Policies & Guidelines */}
          <div className="bg-white border border-[#cbd5e1] rounded-lg p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#004e9f] border-b border-[#cbd5e1] pb-2 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Policies &amp; Legal Notices</span>
              </h2>

              <ul className="space-y-3 text-xs">
                <li>
                  <Link href="/privacy-policy" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Privacy Policy (P-06)</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Data collection, security, and retention rules.</p>
                </li>

                <li>
                  <Link href="/terms" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Terms &amp; Disclaimer (P-07)</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Terms of use and statutory prototype limits.</p>
                </li>

                <li>
                  <Link href="/hyperlinking-policy" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Hyperlinking Policy (P-08)</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Internal and external linking regulations.</p>
                </li>

                <li>
                  <Link href="/copyright-policy" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Copyright className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Copyright Policy (P-09)</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Intellectual property and reproduction rules.</p>
                </li>

                <li>
                  <Link href="/sitemap" className="font-semibold text-[#004e9f] flex items-center gap-2">
                    <Map className="w-3.5 h-3.5 text-[#004e9f]" />
                    <span>Site Map (P-10)</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">This navigation overview directory.</p>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-3 border-t border-[#cbd5e1]/60 text-[11px] text-[#727784]">
              Statutory government disclosures
            </div>
          </div>

          {/* Group 3: Authenticated Portals */}
          <div className="bg-[#f0f3ff] border border-[#cbd5e1] rounded-lg p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-2 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#111c2d] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#b45309]" />
                  <span>Authenticated Services</span>
                </h2>
                <span className="bg-[#b45309]/10 text-[#b45309] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#b45309]/30">
                  LOGIN REQUIRED
                </span>
              </div>

              <ul className="space-y-3 text-xs">
                <li>
                  <Link href="/login" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Portal Sign In</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Business, LMO &amp; GATC login.</p>
                </li>

                <li>
                  <Link href="/app" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Business Dashboard</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Establishment overview and active status.</p>
                </li>

                <li>
                  <Link href="/app/instruments" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Instrument Passports</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Registered weights, scales, and serials.</p>
                </li>

                <li>
                  <Link href="/app/applications" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Verification Applications</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">File and track stamping requests.</p>
                </li>

                <li>
                  <Link href="/app/certificates" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>Issued Certificates</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">Download calibration certificates.</p>
                </li>

                <li>
                  <Link href="/admin" className="font-semibold text-[#111c2d] hover:text-[#004e9f] flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-[#3a5f94]" />
                    <span>GATCs / LMO Console</span>
                  </Link>
                  <p className="text-[#414753] text-[11px] pl-5.5">LMO assignment and supervision.</p>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-3 border-t border-[#cbd5e1]/60 text-[11px] text-[#727784]">
              Requires verified credentials
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
