"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldCheck,
  QrCode,
  Scale,
  Building2,
  FileCheck2,
  ArrowRight,
  Camera,
  AlertCircle,
  CheckCircle2,
  Shield,
  FileText,
} from "lucide-react";

export default function PublicVerificationLandingPage() {
  const router = useRouter();
  const [certNo, setCertNo] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certNo.trim();

    if (!trimmed) {
      setInputError("Please enter a valid certificate number.");
      return;
    }

    // Basic sanitization/format validation per API contract rules
    if (!/^[A-Za-z0-9\-_./]+$/.test(trimmed) || trimmed.length > 64) {
      setInputError(
        "Certificate number contains invalid characters or is too long."
      );
      return;
    }

    setInputError(null);
    router.push(`/verify/${encodeURIComponent(trimmed)}`);
  };

  const handleQuickLookup = (sampleId: string) => {
    setCertNo(sampleId);
    setInputError(null);
    router.push(`/verify/${encodeURIComponent(sampleId)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  MapanSetu
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  SIH26036
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Legal Metrology Digital Verification System
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <span>Portal Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200 bg-linear-to-b from-white to-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Public Verification Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Verify Legal Metrology Certificates
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Authenticate digital verification records for regulated weighing
              and measuring instruments. Enter a certificate number or scan the
              issued QR code to confirm active validity and cryptographic integrity.
            </p>

            {/* Certificate Search Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-sm border border-slate-200 text-left">
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label
                    htmlFor="certificateNumber"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Certificate Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      id="certificateNumber"
                      type="text"
                      value={certNo}
                      onChange={(e) => {
                        setCertNo(e.target.value);
                        if (inputError) setInputError(null);
                      }}
                      placeholder="e.g. CERT-DEMO-001"
                      className={`block w-full pl-10 pr-4 py-3 text-base rounded-xl border ${
                        inputError
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                      } bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 transition-all font-mono`}
                      autoComplete="off"
                    />
                  </div>
                  {inputError && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{inputError}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500">
                    No login required. Minimal disclosure verification.
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-xl text-sm transition-colors shadow-xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Verify Certificate</span>
                  </button>
                </div>
              </form>

              {/* Demo Sample Quick Links */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  Demo & Sample Fixtures (Prototype Testing):
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "CERT-DEMO-001", label: "Valid Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
                    { id: "CERT-EXPIRED-001", label: "Expired", color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
                    { id: "CERT-REVOKED-001", label: "Revoked", color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" },
                  ].map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleQuickLookup(sample.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${sample.color}`}
                    >
                      <span className="font-mono font-bold">{sample.id}</span>
                      <span className="opacity-75">({sample.label})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QR Code Guidance Section */}
        <section className="py-14 md:py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                How QR Verification Works
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Every verified instrument carries an official certificate sticker with an embedded verification QR code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                  Step 1
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Locate QR Code
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Find the printed certificate sticker affixed to the verified weighing scale or measuring instrument.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Step 2
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Scan with Camera
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Use any standard mobile camera or QR reader. No specialized app installation is required.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-start">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
                  Step 3
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Instant Verification
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Inspect the live status, validity expiration date, and cryptographic signature confirmation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Portal Navigation & Role Entrypoints */}
        <section className="py-14 md:py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
                Authorized Workspaces
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Sign in to manage instrument passports, submit verification applications, or conduct field inspections.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Business Portal Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Instrument Owners & Businesses
                  </h3>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Register weighing instruments, submit periodic verification requests, track application progress, and download digital certificates.
                  </p>
                  <ul className="space-y-2 mb-6 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Digital Instrument Passport & timeline</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Online verification application submission</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Automated expiry alerts & re-verification</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-between px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <span>Business Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Admin & Officer Portal Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Supervisors & Legal Metrology Officers
                  </h3>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Manage the application triage queue, allocate officers, schedule inspection visits, and record cryptographic audit logs.
                  </p>
                  <ul className="space-y-2 mb-6 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Application assignment & workload scheduling</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Cryptographic certificate issuance & revocation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Tamper-evident audit chain viewer</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-between px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <span>Admin & Officer Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Cryptography Highlights */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Canonical SHA-256 Hashes
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tamper-evident certificate payloads verified against recorded digests.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Minimal Public Disclosure
                  </h4>
                  <p className="text-xs text-slate-500">
                    Public verification returns certificate status without exposing private owner records.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Complete Audit Traceability
                  </h4>
                  <p className="text-xs text-slate-500">
                    Every state transition, officer inspection, and certificate lifecycle event is audited.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">MapanSetu</span>
              <span>— Smart India Hackathon (SIH26036)</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-slate-200 transition-colors">
                Portal Login
              </Link>
              <Link href="/verify/CERT-DEMO-001" className="hover:text-slate-200 transition-colors">
                Sample Verification
              </Link>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            <p>
              Prototype scope. Synthetic data only. The software coordinates verification work and certificate lifecycle management — it does not perform physical statutory verification, grant legal approval, or claim live government integration.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

