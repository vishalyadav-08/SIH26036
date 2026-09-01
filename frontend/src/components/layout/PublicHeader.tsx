"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { StateEmblem } from "@/components/ui/StateEmblem";
import { 
  Menu, 
  X, 
  Eye, 
  Globe, 
  LogIn, 
  CheckCircle2, 
  Home, 
  Info, 
  HelpCircle, 
  Mail, 
  FileCheck,
  LayoutDashboard
} from "lucide-react";

export function PublicHeader() {
  const { language, setLanguage, fontSize, setFontSize, contrast, toggleContrast, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", labelKey: "nav.home", icon: Home },
    { href: "/about", labelKey: "nav.about", icon: Info },
    { href: "/#services", labelKey: "nav.services", icon: CheckCircle2 },
    { href: "/verify", labelKey: "nav.verify", icon: FileCheck },
    { href: "/help", labelKey: "nav.help", icon: HelpCircle },
    { href: "/contact", labelKey: "nav.contact", icon: Mail },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Skip to Main Content Link for WCAG Keyboard Nav */}
      <a href="#main-content" className="skip-link">
        {t("util.skip")}
      </a>

      {/* Global Government Utility Bar */}
      <div className="bg-[#f0f3ff] border-b border-[#cbd5e1] w-full py-1.5 px-4 sm:px-8 flex justify-between md:justify-end items-center gap-3 sm:gap-6 text-xs text-[#414753] font-medium z-50">
        <div className="md:hidden flex items-center gap-2 text-[11px] font-semibold text-[#004e9f]">
          <span>{t("brand.gov")}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <a
            href="#main-content"
            className="hidden md:inline hover:text-[#004e9f] focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-1 px-1 rounded"
          >
            {t("util.skip")}
          </a>

          <span className="hidden md:inline w-px h-3.5 bg-[#cbd5e1]" aria-hidden="true" />

          {/* Font Size Adjusters */}
          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-[#cbd5e1]/60" aria-label="Text Size Controls">
            <button
              type="button"
              onClick={() => setFontSize("small")}
              className={`px-1 rounded hover:text-[#004e9f] transition-colors focus:outline-none focus:ring-1 focus:ring-[#004e9f] ${
                fontSize === "small" ? "font-bold text-[#004e9f]" : ""
              }`}
              title="Decrease text size (A-)"
              aria-label="Decrease text size"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize("normal")}
              className={`px-1 rounded hover:text-[#004e9f] transition-colors focus:outline-none focus:ring-1 focus:ring-[#004e9f] ${
                fontSize === "normal" ? "font-bold text-[#004e9f]" : ""
              }`}
              title="Normal text size (A)"
              aria-label="Normal text size"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize("large")}
              className={`px-1 rounded hover:text-[#004e9f] transition-colors focus:outline-none focus:ring-1 focus:ring-[#004e9f] ${
                fontSize === "large" || fontSize === "larger" ? "font-bold text-[#004e9f]" : ""
              }`}
              title="Increase text size (A+)"
              aria-label="Increase text size"
            >
              A+
            </button>
          </div>

          <span className="w-px h-3.5 bg-[#cbd5e1]" aria-hidden="true" />

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleContrast}
            className={`flex items-center gap-1 hover:text-[#004e9f] focus:outline-none focus:ring-2 focus:ring-[#004e9f] rounded px-1.5 py-0.5 ${
              contrast === "high" ? "bg-black text-yellow-300 font-bold border border-yellow-300 rounded" : ""
            }`}
            title="Toggle High Contrast Mode"
            aria-label="Toggle High Contrast Mode"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{t("util.contrast")}</span>
          </button>

          <span className="w-px h-3.5 bg-[#cbd5e1]" aria-hidden="true" />

          {/* Language Switcher */}
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-[#004e9f]" aria-hidden="true" />
            <select
              aria-label="Select Language / भाषा चुनें"
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
              className="bg-transparent border-none text-xs font-semibold text-[#111c2d] hover:text-[#004e9f] cursor-pointer focus:ring-1 focus:ring-[#004e9f] py-0 pl-1 pr-4 rounded"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Government Header */}
      <header className="bg-white border-b border-[#cbd5e1] sticky top-0 z-40 shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Brand Logo & Identity */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-2 rounded p-1"
              aria-label="MapanSetu Home - Department of Legal Metrology"
            >
              <StateEmblem size="md" />
              <div className="flex flex-col">
                <span className="font-bold text-xl sm:text-2xl text-[#004e9f] tracking-tight leading-none group-hover:text-[#003366] transition-colors">
                  {t("brand.name")}
                </span>
                <span className="text-[11px] sm:text-xs text-[#414753] font-medium leading-tight mt-1">
                  {t("brand.dept")}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 sm:gap-2 font-medium text-sm text-[#414753]" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`px-3 py-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#004e9f] ${
                      active
                        ? "text-[#004e9f] font-bold border-b-2 border-[#004e9f] rounded-b-none bg-[#f0f3ff]/60"
                        : "hover:text-[#004e9f] hover:bg-[#f0f3ff]"
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Action CTA */}
            <div className="hidden sm:flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  href={user?.role === "BUSINESS" ? "/app" : user?.role === "OFFICER" ? "/field" : "/admin"}
                  className="bg-[#004e9f] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#003366] transition-colors focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-2 flex items-center gap-1.5 shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-[#004e9f] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#003366] transition-colors focus:outline-none focus:ring-2 focus:ring-[#004e9f] focus:ring-offset-2 flex items-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  <span>{t("nav.login")}</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              {isAuthenticated ? (
                <Link
                  href={user?.role === "BUSINESS" ? "/app" : user?.role === "OFFICER" ? "/field" : "/admin"}
                  className="bg-[#004e9f] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#003366] flex items-center gap-1"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-[#004e9f] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#003366] flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t("nav.login")}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="text-[#111c2d] p-1.5 rounded hover:bg-[#f0f3ff] focus:outline-none focus:ring-2 focus:ring-[#004e9f]"
                aria-label={t("nav.openMenu")}
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-6 h-6 text-[#111c2d]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation (GIGW 3.0 / UX4G compliant) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col border-r border-[#cbd5e1] z-50 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#cbd5e1] flex items-center justify-between bg-[#f0f3ff]">
              <div className="flex items-center gap-2.5">
                <StateEmblem size="sm" />
                <div>
                  <div className="font-bold text-base text-[#004e9f] leading-tight">
                    {t("brand.name")}
                  </div>
                  <div className="text-[10px] text-[#414753] leading-tight">
                    {t("brand.dept")}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#414753] hover:text-[#111c2d] p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#004e9f]"
                aria-label={t("nav.closeMenu")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links List */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="Mobile Navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#004e9f] text-white font-semibold"
                        : "text-[#111c2d] hover:bg-[#f0f3ff] hover:text-[#004e9f]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{t(link.labelKey)}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#cbd5e1] bg-[#f8fafc] space-y-2">
              <Link
                href="/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-[#e7eeff] text-[#004e9f] border border-[#004e9f]/30 px-4 py-2.5 rounded text-sm font-semibold hover:bg-[#dee8ff] transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                <span>{t("nav.verify")}</span>
              </Link>
              {isAuthenticated ? (
                <Link
                  href={user?.role === "BUSINESS" ? "/app" : user?.role === "OFFICER" ? "/field" : "/admin"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#004e9f] text-white px-4 py-2.5 rounded text-sm font-semibold hover:bg-[#003366] transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#004e9f] text-white px-4 py-2.5 rounded text-sm font-semibold hover:bg-[#003366] transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t("nav.login")}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
