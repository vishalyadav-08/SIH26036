import Link from 'next/link';
import { Scale } from 'lucide-react';

const footerLinks = {
  resources: [
    { label: 'Standards & OIML Specifications', href: '#' },
    { label: 'Verification Fee Schedule', href: '#' },
    { label: 'Model Approval Repository', href: '#' },
    { label: 'Act & Rules Reference', href: '#' },
  ],
  help: [
    { label: 'Consumer Helpline: 1915', href: '#' },
    { label: 'Report Tampered Weighing Scale', href: '#' },
    { label: 'Officer Directory & Grievance', href: '#' },
    { label: 'Help & FAQs', href: '#' },
  ],
  portal: [
    { label: 'About MapanSetu', href: '#' },
    { label: 'Accessibility Statement', href: '#' },
    { label: 'Privacy Notice', href: '#' },
    { label: 'Terms of Use', href: '#' },
  ],
};

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center" aria-hidden="true">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-sm">MapanSetu</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-4">
              Online Verification &amp; Instrument Lifecycle Management for weighing
              and measuring instruments under the Legal Metrology Act, 2009.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-400 font-semibold">
              SIH 2026 Prototype
            </div>
          </div>

          {/* Col 2: Resources */}
          <div>
            <span className="text-slate-200 font-semibold text-[11px] uppercase tracking-wider block mb-3">
              Resources
            </span>
            <ul className="space-y-2 text-[11px]">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Help */}
          <div>
            <span className="text-slate-200 font-semibold text-[11px] uppercase tracking-wider block mb-3">
              Assistance &amp; Redressal
            </span>
            <ul className="space-y-2 text-[11px]">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-blue-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Compliance */}
          <div>
            <span className="text-slate-200 font-semibold text-[11px] uppercase tracking-wider block mb-3">
              Compliance &amp; Security
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Digital certificates in this prototype are cryptographically signed.
              This is an SIH 2026 demonstration — not a live government service.
            </p>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              This prototype does not claim affiliation with any government
              department. Canonical statuses and workflows follow the MapanSetu
              PRD &amp; API contract.
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="text-slate-500">
            © {new Date().getFullYear()} MapanSetu — SIH 2026 Prototype. Not an official government website.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            {footerLinks.portal.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
