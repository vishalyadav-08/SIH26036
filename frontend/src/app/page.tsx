import Link from 'next/link';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  QrCode,
  FileCheck2,
  Database,
  Scale,
  ClipboardList,
} from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] text-[#1E293B]">
      <PublicHeader />

      <main id="main-content" className="flex-1 flex flex-col">
        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16 w-full">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-700" aria-hidden="true" />
              <span>National Verification Gateway — SIH 2026 Prototype</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              Verify Weighing &amp;{' '}
              <span className="text-[#000666]">Measuring</span>{' '}
              Instrument Certificates
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Instantly verify the authenticity and validity of any Legal Metrology
              certificate issued under the Legal Metrology Act, 2009. Enter a
              certificate number or scan a QR code.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-6 sm:p-8 mb-8">
            <form action="/verify" method="get">
              <label
                htmlFor="cert-number"
                className="block text-sm font-semibold text-slate-800 mb-2"
              >
                Certificate Number
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400"
                    aria-hidden="true"
                  >
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    id="cert-number"
                    name="cert"
                    type="text"
                    placeholder="e.g. CERT-2026-00001"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666] focus:border-transparent uppercase font-mono tracking-wider transition-all placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
                    aria-describedby="cert-hint"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#000666] hover:bg-[#1a237e] text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-950/20 flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Verify Certificate</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <p id="cert-hint" className="mt-2 text-xs text-slate-500">
                Certificate numbers are printed on the physical verification sticker or accessible in your Instrument Passport.
              </p>
            </form>

            {/* QR alternative */}
            <div className="mt-5 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-slate-500">
              <span className="font-medium">Or scan the QR code:</span>
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200"
              >
                <QrCode className="w-4 h-4 text-slate-500" aria-hidden="true" />
                Scan QR Code
              </button>
              <span className="hidden sm:inline text-slate-300" aria-hidden="true">|</span>
              <span className="text-slate-400 text-[11px]">
                Demo certificates: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">CERT-DEMO-001</code>{' '}
                <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">CERT-DEMO-002</code>
              </span>
            </div>
          </div>
        </section>

        {/* ── How It Works ────────────────────────────────────────────────── */}
        <section className="bg-white border-y border-slate-200 py-12" aria-labelledby="how-it-works-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2
              id="how-it-works-heading"
              className="text-xl font-bold text-slate-900 text-center mb-8"
            >
              How Verification Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '1',
                  icon: Search,
                  title: 'Enter Certificate Number',
                  description:
                    'Type the certificate number from the instrument\'s verification sticker, or scan the printed QR code.',
                  iconBg: 'bg-blue-50',
                  iconColor: 'text-blue-700',
                },
                {
                  step: '2',
                  icon: Database,
                  title: 'Signature Verified',
                  description:
                    'The system checks the certificate\'s cryptographic signature against the metrology database.',
                  iconBg: 'bg-indigo-50',
                  iconColor: 'text-indigo-700',
                },
                {
                  step: '3',
                  icon: FileCheck2,
                  title: 'Status Displayed',
                  description:
                    'You instantly see whether the certificate is ACTIVE, EXPIRED, or REVOKED — with issue and expiry dates.',
                  iconBg: 'bg-emerald-50',
                  iconColor: 'text-emerald-700',
                },
              ].map(({ step, icon: Icon, title, description, iconBg, iconColor }) => (
                <div
                  key={step}
                  className="relative bg-[#f7f9fb] rounded-2xl p-6 border border-slate-200"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-4`}
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center" aria-hidden="true">
                    {step}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Authorized Portals ──────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full" aria-labelledby="portals-heading">
          <h2
            id="portals-heading"
            className="text-xl font-bold text-slate-900 mb-2"
          >
            Authorized Workspaces
          </h2>
          <p className="text-slate-600 text-sm mb-6">
            Sign in to access your role-specific portal.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Business Portal */}
            <Link
              href="/login"
              className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-[#000666]/30 block"
              aria-label="Business Portal — for merchants and business owners"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors" aria-hidden="true">
                  <Scale className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 mb-1">Business Portal</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    For merchants and business owners. Register instruments, submit
                    verification applications, and track certificates.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#000666]">
                    Sign in to Business Portal
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Admin Portal */}
            <Link
              href="/login"
              className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-[#000666]/30 block"
              aria-label="Admin & Supervisor Portal — for Legal Metrology officers"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors" aria-hidden="true">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 mb-1">Admin &amp; Supervisor Portal</div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    For Legal Metrology officers and supervisors. Process applications,
                    assign officers, schedule inspections, and manage certificates.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#000666]">
                    Sign in to Admin Portal
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
