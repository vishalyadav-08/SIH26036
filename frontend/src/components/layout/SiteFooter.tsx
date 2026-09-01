"use client";

import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { StateEmblem } from "@/components/ui/StateEmblem";
import { ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-[#cbd5e1] text-[#414753] text-sm mt-auto" role="contentinfo">
      {/* Top Banner with Prototype Notice */}
      <div className="bg-[#f0f3ff] border-b border-[#cbd5e1] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#414753]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#004e9f] shrink-0" aria-hidden="true" />
            <span>{t("home.notice")}</span>
          </div>
          <span className="font-semibold bg-[#e7eeff] text-[#004e9f] px-2.5 py-0.5 rounded border border-[#004e9f]/20 shrink-0">
            SIH 2026 Prototype
          </span>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-[#cbd5e1]">
          {/* Column 1: Identity & Department */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <StateEmblem size="sm" />
              <div>
                <div className="font-bold text-lg text-[#004e9f] leading-tight">
                  {t("brand.name")}
                </div>
                <div className="text-xs font-semibold text-[#111c2d]">
                  {t("brand.dept")}
                </div>
              </div>
            </div>
            <p className="text-xs text-[#414753] leading-relaxed">
              Digital workflow coordination platform for weighing and measuring instruments under the Legal Metrology framework.
            </p>
            <div className="text-[11px] text-[#414753] pt-1">
              <p className="font-semibold text-[#111c2d]">Krishi Bhawan, New Delhi - 110001</p>
              <p>Email: <a href="mailto:dirwm-ca@nic.in" className="text-[#004e9f] hover:underline">dirwm-ca@nic.in</a></p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#111c2d] mb-3 pb-1 border-b border-[#cbd5e1]">
              {t("footer.quick")}
            </h2>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("nav.verify")}
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("nav.help")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("util.accessibility")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#111c2d] mb-3 pb-1 border-b border-[#cbd5e1]">
              {t("footer.policies")}
            </h2>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy-policy" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("privacy.title")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("terms.title")}
                </Link>
              </li>
              <li>
                <Link href="/hyperlinking-policy" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("hyper.title")}
                </Link>
              </li>
              <li>
                <Link href="/copyright-policy" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("copy.title")}
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="hover:text-[#004e9f] hover:underline transition-colors">
                  {t("sitemap.title")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Government Standards & Compliance */}
          <div className="space-y-3">
            <h2 className="font-bold text-xs uppercase tracking-wider text-[#111c2d] mb-3 pb-1 border-b border-[#cbd5e1]">
              {t("footer.resources")}
            </h2>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.india.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#004e9f] hover:underline inline-flex items-center gap-1"
                >
                  <span>{t("footer.indiaPortal")}</span>
                  <ExternalLink className="w-3 h-3 text-[#727784]" aria-label="(Opens in a new window)" />
                </a>
              </li>
              <li>
                <a
                  href="https://consumeraffairs.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#004e9f] hover:underline inline-flex items-center gap-1"
                >
                  <span>{t("footer.consumerMinistry")}</span>
                  <ExternalLink className="w-3 h-3 text-[#727784]" aria-label="(Opens in a new window)" />
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded p-2.5 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#15803d] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>GIGW 3.0 &amp; WCAG 2.1 AA</span>
                </div>
                <p className="text-[#414753] leading-tight">
                  Designed following Indian Government digital service accessibility &amp; UX4G guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#414753]">
          <p>© {new Date().getFullYear()} {t("footer.rights")}</p>
          <div className="flex items-center gap-4 text-xs">
            <span>{t("footer.updated")}</span>
            <span className="text-[#cbd5e1]">|</span>
            <Link href="/sitemap" className="hover:text-[#004e9f] hover:underline">
              {t("sitemap.title")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
