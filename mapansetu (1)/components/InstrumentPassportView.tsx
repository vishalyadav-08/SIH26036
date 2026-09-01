'use client';

import React from 'react';
import Image from 'next/image';
import { Instrument, VerificationCertificate } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  Calendar, 
  MapPin, 
  Cpu, 
  QrCode, 
  ExternalLink,
  ShieldCheck,
  Camera,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface InstrumentPassportViewProps {
  language: Language;
  instrument: Instrument;
  onBack: () => void;
  onOpenPdfModal: (cert: VerificationCertificate) => void;
  onOpenGallery: (instrument: Instrument) => void;
  onOpenNewApplication: (instrumentId: string) => void;
  certificates: Record<string, VerificationCertificate>;
}

export const InstrumentPassportView: React.FC<InstrumentPassportViewProps> = ({
  language,
  instrument,
  onBack,
  onOpenPdfModal,
  onOpenGallery,
  onOpenNewApplication,
  certificates,
}) => {
  const t = translations[language];

  // Find linked certificate or synthesize one
  const certKey = instrument.certificateId || Object.keys(certificates)[0];
  const linkedCert = certificates[certKey] || {
    certificateNumber: certKey || 'CERT-DEMO-001',
    instrumentId: instrument.id,
    instrumentType: instrument.type,
    manufacturer: instrument.manufacturer,
    serialNumber: instrument.serialNumber,
    issuedDate: instrument.lastInspectionDate || '14 Oct 2025',
    validUntil: instrument.nextDue || '14 Oct 2026',
    status: instrument.status === 'ACTIVE' ? 'VALID' : 'EXPIRED',
    signatureVerified: true,
    payloadIntegrityVerified: true,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    issuedByOfficer: instrument.inspectorName || 'Inspector Ramesh Kumar',
    issuedAtOffice: 'Legal Metrology Department, Govt. of NCT of Delhi',
    merchantName: instrument.merchantName || 'Demo Retail Store',
    merchantAddress: instrument.location || 'New Delhi',
    qrPayload: `https://mapansetu.gov.in/verify/${certKey}`,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t.backToInstruments}</span>
      </button>

      {/* Main Header with Status and Due Date Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {instrument.status === 'ACTIVE' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  EXPIRED
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">Passport ID: {instrument.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {instrument.id} • {instrument.type}
            </h1>
          </div>

          {/* NEXT DUE DATE Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 lg:self-end">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {t.nextDueDate}
              </span>
              <span className={`text-base font-extrabold ${instrument.status === 'ACTIVE' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {instrument.nextDue}
              </span>
            </div>
            {instrument.status === 'EXPIRED' && (
              <button
                onClick={() => onOpenNewApplication(instrument.id)}
                className="ml-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Apply Re-verification
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Master Details & Visual Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Card: Master Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-700" />
              <span>{t.instrumentDetails}</span>
            </h2>

            <dl className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <dt className="text-slate-500 font-medium">{t.manufacturer}</dt>
                <dd className="font-semibold text-slate-900">{instrument.manufacturer}</dd>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <dt className="text-slate-500 font-medium">{t.modelNumber}</dt>
                <dd className="font-mono font-medium text-slate-900">{instrument.modelNumber}</dd>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <dt className="text-slate-500 font-medium">{t.serialNumber}</dt>
                <dd className="font-mono font-bold text-slate-900">{instrument.serialNumber}</dd>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <dt className="text-slate-500 font-medium">Accuracy Class</dt>
                <dd className="font-semibold text-indigo-700">{instrument.accuracyClass}</dd>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <dt className="text-slate-500 font-medium">{t.capacityResolution}</dt>
                <dd className="font-medium text-slate-900">
                  <span className="font-bold">{instrument.capacity}</span> / {instrument.resolution}
                </dd>
              </div>

              <div className="flex justify-between items-start py-1.5">
                <dt className="text-slate-500 font-medium">{t.currentLocation}</dt>
                <dd className="font-medium text-slate-900 text-right max-w-[240px]">
                  <div className="flex items-start justify-end gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span>{instrument.location}</span>
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Model Approved under LM Act</span>
            </div>
            <button
              onClick={() => onOpenPdfModal(linkedCert)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <span>View Latest Stamping Certificate</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Card: Visual Reference */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-700" />
                <span>{t.visualReference}</span>
              </h2>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Seals Intact
              </span>
            </div>

            {/* Hotlinked Image container */}
            <div className="relative w-full h-48 sm:h-56 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group">
              <Image
                src={instrument.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2PrhbZ_pNKm7GywFCjjDbFGXiV13BbeC1WdgPojM-rqNQNBjLckN75yZqMs4P7K_o-ieKRN9nHWZ7HeOdfjpqCgNlFFUfFFyKSkEYlLt7E2Y9KXRNLMgV54qfjWPUfsSpJviATb6cAjUNQKblo-j5PcTKRqoRlfbX9aXG79YcJJDIORoMLSZcGJxwuB13TSIsGlsxjVOZIaSPJhZd9Gp8T3rmJvnu-nZYIhcqMqtCje0xAKPWCOtN'}
                alt={instrument.type}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 left-3 right-3 text-white">
                <span className="text-[11px] font-medium bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  Physical Lead Seal #LM-DL-8821
                </span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <p>
                <span className="font-bold text-slate-900">{instrument.inspectorName || 'Inspector Ramesh Kumar'} noted: </span>
                &quot;Physical inspection completed on {instrument.lastInspectionDate || '14 Oct 2025'}. Device seals are visually intact with zero drift under standard calibrated weights.&quot;
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onOpenGallery(instrument)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-blue-700" />
              <span>{t.viewFullGallery}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Instrument Lifecycle */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{t.instrumentLifecycle}</span>
        </h2>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {instrument.lifecycle.map((event, idx) => (
            <div key={idx} className="relative group">
              {/* Step indicator circle */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white border-2 border-[#000666] flex items-center justify-center text-[10px] font-bold text-[#000666] group-hover:bg-[#000666] group-hover:text-white transition-colors">
                {idx + 1}
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{event.title}</h3>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200 font-mono">
                      {event.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {event.reportLink && (
                    <button
                      onClick={() => onOpenPdfModal(linkedCert)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.viewReport}</span>
                    </button>
                  )}
                  {event.pdfDownload && (
                    <button
                      onClick={() => onOpenPdfModal(linkedCert)}
                      className="px-3 py-1.5 bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloadPdf}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
