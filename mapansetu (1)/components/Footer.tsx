'use client';

import React from 'react';
import { Language, translations } from '@/lib/translations';
import { Shield, ExternalLink } from 'lucide-react';

interface FooterProps {
  language: Language;
  onOpenHelp: () => void;
  onOpenResources: () => void;
}

export const Footer: React.FC<FooterProps> = ({ language, onOpenHelp, onOpenResources }) => {
  const t = translations[language];

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>MapanSetu</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              National Legal Metrology Verification and Instrument Digital Passport Portal under the Legal Metrology Act, 2009.
            </p>
          </div>

          <div>
            <span className="text-slate-200 font-semibold text-xs uppercase tracking-wider block mb-2">
              Legal Metrology Portals
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={onOpenResources} className="hover:text-blue-300 transition-colors text-left">
                  Standards & OIML Specifications
                </button>
              </li>
              <li>
                <button onClick={onOpenResources} className="hover:text-blue-300 transition-colors text-left">
                  Verification Fee Schedule
                </button>
              </li>
              <li>
                <button onClick={onOpenResources} className="hover:text-blue-300 transition-colors text-left">
                  Model Approval Repository
                </button>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-slate-200 font-semibold text-xs uppercase tracking-wider block mb-2">
              Assistance & Redressal
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={onOpenHelp} className="hover:text-blue-300 transition-colors text-left">
                  Consumer National Toll-Free: 1915
                </button>
              </li>
              <li>
                <button onClick={onOpenHelp} className="hover:text-blue-300 transition-colors text-left">
                  Report Tampered Weighing Scale
                </button>
              </li>
              <li>
                <button onClick={onOpenHelp} className="hover:text-blue-300 transition-colors text-left">
                  Officer Directory & Grievance
                </button>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-slate-200 font-semibold text-xs uppercase tracking-wider block mb-2">
              Compliance & Security
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
              All digital certificates are cryptographically signed with SHA-256 HMAC and verifiable against central state metrology ledgers.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Govt Cloud Node • Online
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>{t.footerCopyright}</div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={onOpenResources} className="hover:text-white transition-colors">{t.about}</button>
            <button onClick={onOpenHelp} className="hover:text-white transition-colors">{t.accessibility}</button>
            <button onClick={onOpenResources} className="hover:text-white transition-colors">{t.privacy}</button>
            <button onClick={onOpenResources} className="hover:text-white transition-colors">{t.terms}</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
