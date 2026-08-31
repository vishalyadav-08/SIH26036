"use client";

import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { 
  Building2, 
  Scale, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck2,
  AlertTriangle,
  Info
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function PublicLandingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <PublicHeader />

      <main className="flex-1">
        {/* Government Style Hero Section */}
        <section className="relative bg-gradient-to-b from-[#000666] to-[#0a192f] border-b-4 border-amber-500 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" aria-hidden="true">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M0 40V0H40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-400/30 text-blue-200 text-xs font-medium uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('home.title')}</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {t('home.hero.title')}
              </h1>
              
              <p className="text-lg text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t('home.hero.desc')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="/verify"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  <Search className="w-5 h-5" />
                  <span>{t('home.hero.verifyBtn')}</span>
                </Link>
                
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 backdrop-blur-sm transition-colors w-full sm:w-auto"
                >
                  <Building2 className="w-5 h-5" />
                  <span>{t('home.hero.loginBtn')}</span>
                </Link>
              </div>
            </div>

            {/* Quick Stats / Info Widget */}
            <div className="lg:w-1/2 w-full max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{t('home.services.title')}</h3>
                    <p className="text-xs text-slate-500">Fast, transparent, and digital</p>
                  </div>
                </div>
                
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{t('home.services.registration')}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{t('home.services.registrationDesc')}</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{t('home.services.verification')}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{t('home.services.verificationDesc')}</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">{t('home.services.public')}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{t('home.services.publicDesc')}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Warning / Alert Banner */}
        <section className="bg-amber-50 border-b border-amber-100 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 font-medium leading-snug">
              Important: MapanSetu is currently a prototype for SIH 2026. Data is synthetic and does not represent real-world instruments or valid legal certification.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-center">
              <div className="py-4">
                <div className="text-3xl font-extrabold text-blue-600">45,000+</div>
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mt-1">{t('home.stats.verified')}</div>
              </div>
              <div className="py-4">
                <div className="text-3xl font-extrabold text-emerald-600">12,000+</div>
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mt-1">{t('home.stats.businesses')}</div>
              </div>
              <div className="py-4">
                <div className="text-3xl font-extrabold text-purple-600">700+</div>
                <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider mt-1">{t('home.stats.districts')}</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-slate-200 text-sm tracking-wide">MapanSetu</span>
              </div>
              <p className="text-[11px] leading-relaxed max-w-md">
                {t('footer.desc')}
              </p>
            </div>
            
            <div className="flex flex-col md:items-end space-y-4">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider">{t('footer.links')}</h4>
              <nav className="flex flex-col md:items-end gap-2">
                <Link href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
                <Link href="#" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
                <Link href="#" className="hover:text-white transition-colors">{t('footer.accessibility')}</Link>
              </nav>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            &copy; {new Date().getFullYear()} MapanSetu Prototype (SIH26036).
          </div>
        </div>
      </footer>
    </div>
  );
}
