'use client';

import Link from 'next/link';
import { Scale, Globe, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function PublicHeader() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-[#000666] text-white shadow-md border-b border-[#1a237e]">
      {/* Prototype Top Bar */}
      <div className="bg-[#00044d] px-4 py-1 text-xs text-blue-200 border-b border-blue-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-300" aria-hidden="true" />
          <span className="font-medium">MapanSetu</span>
          <span className="text-blue-400" aria-hidden="true">|</span>
          <span>Online Verification &amp; Instrument Lifecycle</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-500/40">
            SIH 2026 Prototype
          </span>
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer bg-blue-900/60 hover:bg-blue-800 px-2 py-0.5 rounded"
            aria-label="Switch language"
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="MapanSetu Home"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-inner border border-blue-400/40 group-hover:scale-105 transition-transform" aria-hidden="true">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight text-white leading-tight">
              MapanSetu
            </div>
            <span className="text-[11px] text-blue-200 block -mt-0.5 font-medium tracking-wide">
              {t('home.title')}
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium" aria-label="Public navigation">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md text-blue-100 hover:bg-blue-900/50 hover:text-white transition-colors"
          >
            {t('nav.home')}
          </Link>
          <Link
            href="/verify"
            className="px-3 py-1.5 rounded-md text-blue-100 hover:bg-blue-900/50 hover:text-white transition-colors"
          >
            {t('nav.verify')}
          </Link>
        </nav>

        {/* Sign In CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-colors"
          >
            {t('nav.login')}
          </Link>
        </div>
      </div>
    </header>
  );
}
