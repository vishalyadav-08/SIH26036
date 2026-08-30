import React, { useState } from 'react';
import { InspectionTask, OfficerProfile } from '../types';
import { generateInspectionPDF } from '../utils/pdfGenerator';

interface InspectionReportModalProps {
  task: InspectionTask;
  profile: OfficerProfile;
  onClose: () => void;
}

export const InspectionReportModal: React.FC<InspectionReportModalProps> = ({
  task,
  profile,
  onClose,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const certNumber = task.certificateNo || `LM-${task.appId.replace('APP-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const stampId = task.stampId || task.finalAssessment?.verifiedStampId || `IN-DLM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const result = task.finalAssessment?.result || 'pass';
  const completedDate = task.completedDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleDownload = () => {
    setDownloading(true);
    try {
      generateInspectionPDF(task, profile);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyVerificationLink = () => {
    const link = `https://mapansetu.gov.in/verify/${certNumber}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#c6c5d4] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-5 py-4 bg-[#000666] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-white">
                description
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                Official Inspection Certificate
              </h2>
              <p className="text-[11px] text-white/80 font-mono">
                {task.appId} • {certNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-colors"
              title="Print document"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f9a825] hover:bg-[#f9a825]/90 text-xs font-bold text-black transition-all shadow-xs active:scale-95 disabled:opacity-75"
            >
              <span className="material-symbols-outlined text-[16px]">
                {downloading ? 'sync' : 'download'}
              </span>
              <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/15 transition-colors ml-1"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Certificate Preview Body (Printable Area) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f5f2fb] space-y-6">
          <div
            id="printable-certificate"
            className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-[#000666]/30 shadow-md space-y-6 text-[#1b1b21] max-w-2xl mx-auto font-sans relative"
          >
            {/* Government Emblem & Header */}
            <div className="text-center pb-4 border-b-2 border-[#000666]/20">
              <div className="w-12 h-12 mx-auto mb-2 bg-[#000666] rounded-full flex items-center justify-center text-white shadow-inner">
                <span className="material-symbols-outlined text-[28px]">
                  account_balance
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#000666] uppercase tracking-widest">
                Government of India • Ministry of Consumer Affairs
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-[#000666] tracking-tight mt-0.5">
                DEPARTMENT OF LEGAL METROLOGY
              </h1>
              <p className="text-xs text-[#454652] mt-0.5">
                FIELD VERIFICATION DIVISION • THE LEGAL METROLOGY ACT, 2009
              </p>
            </div>

            {/* Certificate Meta Banner */}
            <div className="bg-[#f0f4ff] p-3 rounded-xl border border-[#c6c5d4]/70 flex flex-wrap items-center justify-between text-xs gap-2">
              <div>
                <span className="text-[#5a5d72]">Certificate No: </span>
                <span className="font-mono font-bold text-[#000666]">{certNumber}</span>
              </div>
              <div>
                <span className="text-[#5a5d72]">Date of Verification: </span>
                <span className="font-bold text-[#1b1b21]">{completedDate}</span>
              </div>
              <div>
                <span className="text-[#5a5d72]">Stamp ID: </span>
                <span className="font-mono font-bold text-[#2e7d32]">{stampId}</span>
              </div>
            </div>

            {/* Section 1: Business & Appliance Particulars */}
            <div>
              <h3 className="text-xs font-bold text-[#000666] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">store</span>
                <span>1. Establishment & Apparatus Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#f8f9fa] p-4 rounded-xl border border-[#e4e1ea]">
                <div>
                  <p className="text-[#5a5d72]">Trader / Enterprise:</p>
                  <p className="font-bold text-sm text-[#1b1b21]">{task.businessName}</p>
                </div>
                <div>
                  <p className="text-[#5a5d72]">Apparatus Under Test:</p>
                  <p className="font-bold text-sm text-[#1b1b21]">{task.title}</p>
                </div>
                <div>
                  <p className="text-[#5a5d72]">Location / Sector:</p>
                  <p className="font-medium text-[#1b1b21]">
                    {task.sector} • {task.location.address || 'Geo-Tagged Site'}
                  </p>
                </div>
                <div>
                  <p className="text-[#5a5d72]">Model / Serial No:</p>
                  <p className="font-mono font-semibold text-[#1b1b21]">
                    {task.deviceModel || 'Apex-Series III'} (SN: {task.serialNumber || 'SN-' + task.appId.slice(-4)})
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[#5a5d72]">GPS Coordinates & Accuracy:</p>
                  <p className="font-mono text-xs font-semibold text-[#000666]">
                    {task.location.lat ? `${task.location.lat.toFixed(5)}°N, ${task.location.lng?.toFixed(5)}°E (±${task.location.accuracy || 4.2}m)` : 'Verified On-Site'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Load Test Readings */}
            <div>
              <h3 className="text-xs font-bold text-[#000666] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">speed</span>
                <span>2. Load & Error Tolerance Readings</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-[#c6c5d4]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#e9ecf8] text-[#000666] font-bold">
                    <tr>
                      <th className="p-2.5">Test Parameter</th>
                      <th className="p-2.5">Reference Standard</th>
                      <th className="p-2.5">Indicated Value</th>
                      <th className="p-2.5">Error Margin</th>
                      <th className="p-2.5">Max Permissible Error</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e4e1ea]">
                    {task.readings.map((r) => {
                      const indicated = r.indicatedWeight !== undefined ? `${r.indicatedWeight} ${r.unit}` : '5.000 kg';
                      const diff = r.indicatedWeight !== undefined ? (r.indicatedWeight - r.referenceWeight).toFixed(3) : '0.000';
                      const diffNum = Math.abs(parseFloat(diff));
                      const isPassing = diffNum <= r.maxPermissibleError;
                      return (
                        <tr key={r.id} className="hover:bg-[#f8f9fa]">
                          <td className="p-2.5 font-medium">{r.name}</td>
                          <td className="p-2.5 font-mono">{r.referenceWeight} {r.unit}</td>
                          <td className="p-2.5 font-mono font-semibold">{indicated}</td>
                          <td className="p-2.5 font-mono">
                            {parseFloat(diff) >= 0 ? '+' : ''}{diff} {r.unit}
                          </td>
                          <td className="p-2.5 font-mono text-[#5a5d72]">±{r.maxPermissibleError} {r.unit}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPassing
                                  ? 'bg-[#2e7d32]/10 text-[#2e7d32]'
                                  : 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                              }`}
                            >
                              {isPassing ? 'PASSED' : 'EXCEEDED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Statutory Checkpoints */}
            <div>
              <h3 className="text-xs font-bold text-[#000666] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">checklist</span>
                <span>3. Statutory Physical Verification</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#f8f9fa] p-3.5 rounded-xl border border-[#e4e1ea]">
                {task.checklists.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        c.completed ? 'text-[#2e7d32]' : 'text-[#ba1a1a]'
                      }`}
                    >
                      {c.completed ? 'check_circle' : 'cancel'}
                    </span>
                    <span className="text-[#1b1b21] truncate">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Final Verdict & Officer Endorsement */}
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                result === 'pass'
                  ? 'bg-[#2e7d32]/10 border-[#2e7d32]/40 text-[#2e7d32]'
                  : result === 'fail'
                  ? 'bg-[#ba1a1a]/10 border-[#ba1a1a]/40 text-[#ba1a1a]'
                  : 'bg-[#f9a825]/15 border-[#f9a825]/40 text-[#b26a00]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[36px] filled">
                  {result === 'pass' ? 'verified' : result === 'fail' ? 'gavel' : 'build'}
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider">Statutory Verdict</p>
                  <p className="text-base font-extrabold leading-tight">
                    {result === 'pass'
                      ? 'VERIFIED & CERTIFIED FOR COMMERCIAL USE'
                      : result === 'fail'
                      ? 'REJECTED: NON-COMPLIANT UNDER SECTION 24'
                      : 'CONDITIONAL PASS: RE-CALIBRATION ORDER ISSUED'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-center sm:text-right text-xs">
                <span className="bg-white/80 px-3 py-1 rounded-full font-mono font-bold border border-current">
                  STAMP: {stampId}
                </span>
              </div>
            </div>

            {/* Officer Observation notes */}
            {task.finalAssessment?.officerNotes && (
              <div className="text-xs bg-[#f8f9fa] p-3 rounded-xl border border-[#e4e1ea]">
                <p className="font-bold text-[#000666] mb-0.5">Officer Remarks:</p>
                <p className="text-[#454652]">{task.finalAssessment.officerNotes}</p>
              </div>
            )}

            {/* Signatures & Seal Footer */}
            <div className="pt-6 border-t-2 border-[#e4e1ea] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="text-xs space-y-1">
                <p className="text-[#5a5d72]">Inspecting Legal Metrology Officer:</p>
                <p className="font-bold text-sm text-[#000666]">{profile.name}</p>
                <p className="font-mono text-[11px] text-[#454652]">Badge: {profile.badgeNumber}</p>
                <p className="text-[10px] text-[#2e7d32] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">fingerprint</span>
                  <span>Biometrically Signed & Sealed</span>
                </p>
              </div>

              {/* QR Verification Seal Box */}
              <div className="flex items-center gap-3 bg-[#f0f4ff] p-3 rounded-2xl border border-[#c6c5d4]/70">
                <div className="w-14 h-14 bg-white p-1 rounded-lg border border-[#c6c5d4] flex items-center justify-center shrink-0">
                  {/* High fidelity QR mock */}
                  <div className="w-full h-full bg-[#000666] p-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-2.5 h-2.5 bg-white rounded-xs"></div>
                      <div className="w-2.5 h-2.5 bg-white rounded-xs"></div>
                    </div>
                    <div className="w-2 h-2 bg-white mx-auto rounded-xs"></div>
                    <div className="flex justify-between">
                      <div className="w-2.5 h-2.5 bg-white rounded-xs"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-xs"></div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-[#454652] space-y-0.5">
                  <p className="font-bold text-[#000666]">DIGITAL SECURITY QR</p>
                  <p>Scan to verify authenticity</p>
                  <button
                    onClick={handleCopyVerificationLink}
                    className="text-[#000666] font-bold hover:underline block pt-0.5"
                  >
                    {copiedLink ? 'Link Copied!' : 'Copy Verification URL'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-white border-t border-[#c6c5d4]/60 flex items-center justify-between shrink-0">
          <span className="text-xs text-[#5a5d72]">
            Ready for instant download & printing
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full text-xs font-bold text-[#454652] hover:bg-[#e4e1ea] transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-6 py-2 rounded-full text-xs font-bold bg-[#000666] text-white hover:bg-[#1a237e] transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
