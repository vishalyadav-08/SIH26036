'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  VerificationApplication, 
  VerificationCertificate, 
  Instrument, 
  Officer 
} from '@/lib/types';
import { 
  X, 
  ShieldCheck, 
  Calendar, 
  UserCheck, 
  QrCode, 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  Camera, 
  Layers, 
  Lock, 
  HelpCircle, 
  BookOpen, 
  Check, 
  Building2, 
  ExternalLink 
} from 'lucide-react';

/* =========================================================
   1. ASSIGN OFFICER MODAL
   ========================================================= */
interface AssignOfficerModalProps {
  application: VerificationApplication | null;
  officers: Officer[];
  onClose: () => void;
  onAssign: (appId: string, officerName: string) => void;
}

export const AssignOfficerModal: React.FC<AssignOfficerModalProps> = ({
  application,
  officers,
  onClose,
  onAssign,
}) => {
  const [selectedOfficer, setSelectedOfficer] = useState(officers[0]?.name || '');

  if (!application) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-800" />
            <h3 className="text-base font-bold text-slate-900">Assign Legal Metrology Officer</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs mb-4 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Application ID:</span>
            <span className="font-mono font-bold text-slate-900">{application.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Business:</span>
            <span className="font-semibold text-slate-800">{application.businessName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Instrument:</span>
            <span className="text-slate-700">{application.instrumentType}</span>
          </div>
        </div>

        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Select Qualified Field Inspector:
        </label>
        <div className="space-y-2 mb-6">
          {officers.map((officer) => (
            <div
              key={officer.id}
              onClick={() => setSelectedOfficer(officer.name)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                selectedOfficer === officer.name
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 font-semibold text-blue-950'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
              }`}
            >
              <div>
                <div className="font-bold text-slate-900">{officer.name}</div>
                <div className="text-[11px] text-slate-500">{officer.designation} • {officer.jurisdiction}</div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {officer.assignedCount} Active
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onAssign(application.id, selectedOfficer);
              onClose();
            }}
            className="px-4 py-2 bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-semibold rounded-xl shadow-md"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   2. SCHEDULE INSPECTION MODAL
   ========================================================= */
interface ScheduleInspectionModalProps {
  application: VerificationApplication | null;
  onClose: () => void;
  onSchedule: (appId: string, date: string) => void;
}

export const ScheduleInspectionModal: React.FC<ScheduleInspectionModalProps> = ({
  application,
  onClose,
  onSchedule,
}) => {
  const [scheduledDate, setScheduledDate] = useState('2026-10-28');
  const [slot, setSlot] = useState('Morning Slot (10:00 AM - 01:00 PM)');

  if (!application) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-800" />
            <h3 className="text-base font-bold text-slate-900">Schedule Physical Inspection</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Field Inspection Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Inspection Time Slot
            </label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800"
            >
              <option value="Morning Slot (10:00 AM - 01:00 PM)">Morning Slot (10:00 AM - 01:00 PM)</option>
              <option value="Afternoon Slot (02:00 PM - 05:00 PM)">Afternoon Slot (02:00 PM - 05:00 PM)</option>
            </select>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
            <span className="font-bold">Notice: </span>
            Merchant must keep standard reference working weights accessible for the verification officer.
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const formatted = new Date(scheduledDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              onSchedule(application.id, formatted);
              onClose();
            }}
            className="px-4 py-2 bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-semibold rounded-xl shadow-md"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   3. NEW APPLICATION MODAL
   ========================================================= */
interface NewApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  instruments: Instrument[];
  selectedInstrumentId?: string;
  onSubmit: (newApp: VerificationApplication) => void;
}

export const NewApplicationModal: React.FC<NewApplicationModalProps> = ({
  isOpen,
  onClose,
  instruments,
  selectedInstrumentId,
  onSubmit,
}) => {
  const [instId, setInstId] = useState(selectedInstrumentId || instruments[0]?.id || '');
  const [verifType, setVerifType] = useState('Periodic Re-verification (Annual)');
  const [remarks, setRemarks] = useState('Renewal verification before validity expiration.');

  if (!isOpen) return null;

  const chosenInst = instruments.find((i) => i.id === instId) || instruments[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: VerificationApplication = {
      id: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      businessName: chosenInst?.merchantName || 'Demo Retail Store',
      instrumentId: chosenInst?.id || 'INST-2026-98241',
      instrumentType: chosenInst?.type || 'Electronic Weighing Scale',
      state: 'SUBMITTED',
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      feePaid: 450,
      location: chosenInst?.location || 'Sector 14, New Delhi',
      remarks,
    };
    onSubmit(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-800" />
            <h3 className="text-base font-bold text-slate-900">New Verification Application</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Measuring Instrument *
            </label>
            <select
              value={instId}
              onChange={(e) => setInstId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
            >
              {instruments.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.id} — {inst.type} ({inst.serialNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Verification Category *
            </label>
            <select
              value={verifType}
              onChange={(e) => setVerifType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
            >
              <option value="Periodic Re-verification (Annual)">Periodic Re-verification (Annual)</option>
              <option value="Initial Stamping Verification">Initial Stamping Verification (New Instrument)</option>
              <option value="Post-Repair Re-Verification">Post-Repair Re-Verification (Broken Seal)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Statutory Verification Fee
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="text-slate-600">Standard Schedule Fee (Rule 11)</span>
              <span className="font-bold text-slate-900 text-sm font-mono">₹450.00 (Paid Online)</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Applicant Remarks & Access Notes
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#000666] hover:bg-[#1a237e] text-white font-semibold rounded-xl shadow-md shadow-blue-950/20"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   4. CERTIFICATE PDF / PRINT MODAL
   ========================================================= */
interface CertificatePdfModalProps {
  certificate: VerificationCertificate | null;
  onClose: () => void;
}

export const CertificatePdfModal: React.FC<CertificatePdfModalProps> = ({
  certificate,
  onClose,
}) => {
  if (!certificate) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-8">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Official Verification Certificate Document</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Government Certificate Design */}
        <div className="border-4 border-double border-slate-800 p-6 sm:p-8 bg-[#fdfdfb] text-slate-900 rounded-lg relative">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Scale className="w-72 h-72 text-slate-900" />
          </div>

          {/* Certificate Header */}
          <div className="text-center pb-4 border-b-2 border-slate-800 mb-5 relative">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#000666] text-white flex items-center justify-center shadow-md">
              <Scale className="w-7 h-7" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-slate-900">
              Government of India • Department of Legal Metrology
            </h2>
            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
              Certificate of Verification and Stamping
            </p>
            <p className="text-[10px] text-slate-500 italic mt-0.5">
              Issued under Rule 11 of the Legal Metrology (General) Rules, 2011
            </p>
          </div>

          {/* Certificate Number & QR in Header */}
          <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg border border-slate-300 text-xs mb-5">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Certificate Number</span>
              <span className="font-mono font-extrabold text-sm text-slate-900">{certificate.certificateNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Validity Status</span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-700 text-white">
                {certificate.status}
              </span>
            </div>
          </div>

          {/* Certificate Table Details */}
          <div className="space-y-2.5 text-xs mb-6">
            <div className="grid grid-cols-3 py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Instrument Description:</span>
              <span className="col-span-2 font-bold text-slate-900">{certificate.instrumentType}</span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Manufacturer / Model:</span>
              <span className="col-span-2 text-slate-800">{certificate.manufacturer}</span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Serial Number:</span>
              <span className="col-span-2 font-mono font-bold text-slate-900">{certificate.serialNumber}</span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Merchant / User:</span>
              <span className="col-span-2 text-slate-900 font-semibold">{certificate.merchantName}</span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Premises Address:</span>
              <span className="col-span-2 text-slate-700">{certificate.merchantAddress}</span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Date of Verification:</span>
              <span className="col-span-2 text-slate-800 font-medium">{certificate.issuedDate}</span>
            </div>
            <div className="grid grid-cols-3 py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Next Due Date:</span>
              <span className="col-span-2 font-extrabold text-emerald-800">{certificate.validUntil}</span>
            </div>
          </div>

          {/* Bottom Signatures & Seal */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-800 items-end">
            <div>
              <div className="w-20 h-20 bg-slate-100 rounded border border-slate-300 p-1 flex items-center justify-center mb-2">
                <QrCode className="w-16 h-16 text-slate-800" />
              </div>
              <div className="text-[9px] font-mono text-slate-500 break-all">
                SHA-256: {certificate.sha256Hash.slice(0, 24)}...
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block border-b border-slate-800 pb-1 mb-1 font-serif text-sm font-bold text-slate-900 italic">
                {certificate.issuedByOfficer}
              </div>
              <div className="text-[10px] font-bold text-slate-800">Authorized Legal Metrology Inspector</div>
              <div className="text-[9px] text-slate-500">{certificate.issuedAtOffice}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   5. GALLERY MODAL
   ========================================================= */
interface GalleryModalProps {
  instrument: Instrument | null;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({ instrument, onClose }) => {
  if (!instrument) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-700" />
            <h3 className="text-base font-bold text-slate-900">
              Inspection Photographic Evidence & Calibration Seals
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
            <div className="relative h-48 w-full">
              <Image
                src={instrument.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2PrhbZ_pNKm7GywFCjjDbFGXiV13BbeC1WdgPojM-rqNQNBjLckN75yZqMs4P7K_o-ieKRN9nHWZ7HeOdfjpqCgNlFFUfFFyKSkEYlLt7E2Y9KXRNLMgV54qfjWPUfsSpJviATb6cAjUNQKblo-j5PcTKRqoRlfbX9aXG79YcJJDIORoMLSZcGJxwuB13TSIsGlsxjVOZIaSPJhZd9Gp8T3rmJvnu-nZYIhcqMqtCje0xAKPWCOtN'}
                alt="Device Front View"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-2.5 text-xs">
              <span className="font-bold text-slate-900 block">Photo 1: Overall Physical Stamping Plate</span>
              <span className="text-[11px] text-slate-500">Captured on {instrument.lastInspectionDate || '14 Oct 2025'}</span>
            </div>
          </div>

          <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
            <div className="relative h-48 w-full bg-slate-900 flex items-center justify-center p-4 text-center">
              <div className="border-2 border-dashed border-slate-600 p-4 rounded-lg">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <span className="text-xs font-mono text-emerald-300 font-bold block">
                  LEAD SEAL ID: #LM-DL-88219
                </span>
                <span className="text-[10px] text-slate-400">Tamper-evident wire seal intact</span>
              </div>
            </div>
            <div className="p-2.5 text-xs">
              <span className="font-bold text-slate-900 block">Photo 2: Official Lead Wire Seal Stamp</span>
              <span className="text-[11px] text-slate-500">Certified by {instrument.inspectorName || 'Inspector Ramesh Kumar'}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900"
          >
            Close Gallery
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   6. QR SCANNER SIMULATION MODAL
   ========================================================= */
interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (certNumber: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
}) => {
  const [scanning, setScanning] = useState(true);

  if (!isOpen) return null;

  const handleSimulateScan = (cert: string) => {
    onScanResult(cert);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 text-center">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 text-left">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-700" />
            <h3 className="text-base font-bold text-slate-900">QR Code Camera Scanner</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder simulation */}
        <div className="relative w-full h-56 bg-slate-950 rounded-2xl overflow-hidden mb-4 flex items-center justify-center border-2 border-slate-700">
          <div className="w-40 h-40 border-2 border-emerald-400 rounded-xl relative flex items-center justify-center">
            {/* Animated Laser Scanning Line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-md shadow-emerald-400/80 animate-bounce" />
            <QrCode className="w-20 h-20 text-slate-600 opacity-60" />
          </div>
          <span className="absolute bottom-3 text-[11px] text-emerald-300 font-mono">
            Point camera at certificate QR code...
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-4">
          Select a sample certificate to simulate instantaneous QR code scanning:
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => handleSimulateScan('CERT-DEMO-001')}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-xl border border-emerald-300 transition-colors"
          >
            CERT-DEMO-001 (Valid)
          </button>
          <button
            onClick={() => handleSimulateScan('CERT-992')}
            className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-mono font-bold rounded-xl border border-blue-300 transition-colors"
          >
            CERT-992 (Valid)
          </button>
          <button
            onClick={() => handleSimulateScan('CERT-EXP-004')}
            className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-mono font-bold rounded-xl border border-amber-300 transition-colors"
          >
            CERT-EXP-004 (Expired)
          </button>
          <button
            onClick={() => handleSimulateScan('CERT-INVALID-999')}
            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-mono font-bold rounded-xl border border-red-300 transition-colors"
          >
            INVALID-QR (Tampered)
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
