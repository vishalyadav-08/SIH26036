'use client';

import React, { useState } from 'react';
import { VerificationCertificate } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { 
  Search, 
  QrCode, 
  FileCheck2, 
  Database, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  FileText, 
  Download, 
  ExternalLink,
  Lock,
  Calendar,
  Building2,
  Cpu,
  Hash,
  Sparkles
} from 'lucide-react';

interface PublicVerifyViewProps {
  language: Language;
  certificates: Record<string, VerificationCertificate>;
  onSelectInstrument: (instId: string) => void;
  onOpenQrScanner: () => void;
  onOpenPdfModal: (cert: VerificationCertificate) => void;
  initialCertNumber?: string;
}

export const PublicVerifyView: React.FC<PublicVerifyViewProps> = ({
  language,
  certificates,
  onSelectInstrument,
  onOpenQrScanner,
  onOpenPdfModal,
  initialCertNumber = '',
}) => {
  const t = translations[language];
  const [certInput, setCertInput] = useState(initialCertNumber || '');
  const [hasSearched, setHasSearched] = useState(Boolean(initialCertNumber));
  const [resultCert, setResultCert] = useState<VerificationCertificate | null>(
    initialCertNumber ? certificates[initialCertNumber] || null : null
  );

  const handleVerify = (e?: React.FormEvent, customCert?: string) => {
    if (e) e.preventDefault();
    const query = (customCert ?? certInput).trim().toUpperCase();
    if (!query) return;

    setCertInput(query);
    setHasSearched(true);
    const found = certificates[query] || null;
    setResultCert(found);
  };

  const handleReset = () => {
    setCertInput('');
    setHasSearched(false);
    setResultCert(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-in fade-in duration-200">
      {!hasSearched ? (
        /* SCREEN 1: Search Form & How It Works */
        <div>
          {/* Hero Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold mb-4 border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>National Verification Gateway</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {t.verifyCertTitle}
            </h1>
            <p className="text-slate-600 mt-2 text-sm sm:text-base leading-relaxed">
              {t.verifyCertSubtitle}
            </p>
          </div>

          {/* Search Box Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 p-6 sm:p-8 mb-10">
            <form onSubmit={(e) => handleVerify(e)}>
              <label htmlFor="certInput" className="block text-sm font-semibold text-slate-800 mb-2">
                {t.certNumberLabel}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    id="certInput"
                    type="text"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="e.g. CERT-DEMO-001"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666] focus:border-transparent uppercase font-mono tracking-wider transition-all placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#000666] hover:bg-[#1a237e] text-white font-semibold rounded-xl transition-all shadow-md shadow-blue-950/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>{t.verifyCertBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Demo Chips */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-medium">Try demo certificates:</span>
              <button
                type="button"
                onClick={() => {
                  setCertInput('CERT-DEMO-001');
                  handleVerify(undefined, 'CERT-DEMO-001');
                }}
                className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 font-mono font-medium transition-colors"
              >
                CERT-DEMO-001 (Valid)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCertInput('CERT-992');
                  handleVerify(undefined, 'CERT-992');
                }}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200 font-mono font-medium transition-colors"
              >
                CERT-992 (Valid)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCertInput('CERT-EXP-004');
                  handleVerify(undefined, 'CERT-EXP-004');
                }}
                className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg border border-amber-200 font-mono font-medium transition-colors"
              >
                CERT-EXP-004 (Expired)
              </button>
            </div>

            {/* QR Code Alternative Banner */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{t.scanQrInstead}</h4>
                  <p className="text-xs text-slate-500 leading-normal">{t.scanQrDesc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenQrScanner}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-colors shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>Launch QR Scanner</span>
              </button>
            </div>
          </div>

          {/* How Verification Works 3 Bento Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider text-xs">
                {t.howVerificationWorks}
              </h3>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Legal Metrology Act 2009 Standards
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{t.step1Title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{t.step1Desc}</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{t.step2Title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{t.step2Desc}</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">{t.step3Title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{t.step3Desc}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SCREEN 2: Verification Result View */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Query: <span className="font-mono text-slate-900 font-bold">{certInput}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {t.verificationResult}
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm">{t.verificationResultSub}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {t.backToSearch}
              </button>
            </div>
          </div>

          {resultCert ? (
            <>
              {/* Status Banner */}
              {resultCert.status === 'VALID' ? (
                <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white">
                        {t.validBadge}
                      </span>
                      <span className="text-xs font-medium text-emerald-800">
                        Official Verification Stamped
                      </span>
                    </div>
                    <p className="text-sm text-emerald-950 font-semibold mt-1">
                      {t.validDesc}
                    </p>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Issued under Rule 11 of the Legal Metrology (General) Rules, 2011.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-600 text-white">
                        {t.expiredBadge}
                      </span>
                    </div>
                    <p className="text-sm text-amber-950 font-semibold mt-1">
                      {t.expiredDesc}
                    </p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      This instrument must be re-verified by an authorized Legal Metrology officer before commercial use.
                    </p>
                  </div>
                </div>
              )}

              {/* Grid with Certificate Details & Technical Checks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Certificate Details Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    {t.certDetails}
                  </h3>

                  <dl className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <dt className="text-slate-500 font-medium">Certificate Number</dt>
                      <dd className="font-mono font-bold text-slate-900">{resultCert.certificateNumber}</dd>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <dt className="text-slate-500 font-medium">Instrument ID</dt>
                      <dd className="font-mono font-semibold text-blue-700">
                        <button
                          type="button"
                          onClick={() => onSelectInstrument(resultCert.instrumentId)}
                          className="hover:underline flex items-center gap-1"
                        >
                          {resultCert.instrumentId}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </dd>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <dt className="text-slate-500 font-medium">Instrument Type</dt>
                      <dd className="font-semibold text-slate-800">{resultCert.instrumentType}</dd>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <dt className="text-slate-500 font-medium">Manufacturer</dt>
                      <dd className="font-medium text-slate-800">{resultCert.manufacturer}</dd>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <dt className="text-slate-500 font-medium">Serial Number</dt>
                      <dd className="font-mono text-slate-800">{resultCert.serialNumber}</dd>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <dt className="text-slate-500 font-medium">Issued Date</dt>
                      <dd className="font-medium text-slate-800">{resultCert.issuedDate}</dd>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-slate-50">
                      <dt className="text-slate-500 font-medium">Valid Until</dt>
                      <dd className={`font-bold ${resultCert.status === 'VALID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {resultCert.validUntil}
                      </dd>
                    </div>

                    <div className="flex justify-between items-start py-1">
                      <dt className="text-slate-500 font-medium">Merchant / Premises</dt>
                      <dd className="font-medium text-slate-800 text-right max-w-[200px]">
                        <div>{resultCert.merchantName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{resultCert.merchantAddress}</div>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Technical Checks Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      {t.technicalChecks}
                    </h3>

                    <div className="space-y-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-blue-600" />
                            {t.sigVerified}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold">
                            PASSED
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Digitally signed with Legal Metrology Officer Private Key certificate.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {t.payloadIntegrity}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold">
                            PASSED
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          SHA-256 hash matches central registry tamper-proof log.
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Cryptographic Fingerprint (SHA-256):
                        </span>
                        <div className="font-mono text-[10px] text-slate-700 bg-white p-2 rounded border border-slate-200 break-all select-all">
                          {resultCert.sha256Hash}
                        </div>
                      </div>

                      <div className="text-xs text-slate-600">
                        <span className="font-medium text-slate-700">Issued by: </span>
                        {resultCert.issuedByOfficer}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => onOpenPdfModal(resultCert)}
                      className="w-full py-2.5 px-4 bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{t.downloadPdf}</span>
                    </button>
                    <button
                      onClick={() => onSelectInstrument(resultCert.instrumentId)}
                      className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{t.instrumentPassport}</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* NOT FOUND Result */
            <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8" />
              </div>
              <span className="inline-block px-3 py-1 bg-red-600 text-white font-extrabold text-xs rounded-full mb-2">
                {t.notFoundBadge}
              </span>
              <h3 className="text-lg font-bold text-red-950 mt-1">Certificate Not Found</h3>
              <p className="text-xs text-red-800 mt-2 leading-relaxed">
                No active or historical record was found matching <span className="font-mono font-bold">{certInput}</span> in the National Legal Metrology database. Please check for typographical errors or scan the physical QR code directly.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {t.verifyAnother}
                </button>
                <button
                  onClick={onOpenQrScanner}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan Physical QR</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
