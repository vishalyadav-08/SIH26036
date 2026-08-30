import React, { useState, useMemo } from 'react';
import { InspectionTask, OfficerProfile, InspectionResult } from '../types';
import { generateInspectionPDF } from '../utils/pdfGenerator';

interface InspectionHistoryScreenProps {
  inspections: InspectionTask[];
  profile: OfficerProfile;
  onOpenReportModal: (task: InspectionTask) => void;
  onStartReInspection: (task: InspectionTask) => void;
}

export const InspectionHistoryScreen: React.FC<InspectionHistoryScreenProps> = ({
  inspections,
  profile,
  onOpenReportModal,
  onStartReInspection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | 'pass' | 'fail' | 'correction'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'month' | 'quarter'>('all');
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<InspectionTask | null>(null);
  const [qrStickerTask, setQrStickerTask] = useState<InspectionTask | null>(null);

  // History tasks (completed or ready to sync or with finalAssessment)
  const historyTasks = useMemo(() => {
    return inspections.filter(
      (t) => t.status === 'completed' || t.status === 'ready_to_sync' || t.finalAssessment
    );
  }, [inspections]);

  // Filtered list
  const filteredHistory = useMemo(() => {
    return historyTasks.filter((task) => {
      // Result filter
      const taskResult = task.finalAssessment?.result || 'pass';
      if (resultFilter !== 'all' && taskResult !== resultFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAppId = task.appId.toLowerCase().includes(q);
        const matchesCert = task.certificateNo?.toLowerCase().includes(q);
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesBusiness = task.businessName.toLowerCase().includes(q);
        const matchesSector = task.sector.toLowerCase().includes(q);
        const matchesSerial = task.serialNumber?.toLowerCase().includes(q);
        if (
          !matchesAppId &&
          !matchesCert &&
          !matchesTitle &&
          !matchesBusiness &&
          !matchesSector &&
          !matchesSerial
        ) {
          return false;
        }
      }

      return true;
    });
  }, [historyTasks, resultFilter, searchQuery]);

  // Compute KPI statistics
  const totalCompleted = historyTasks.length;
  const totalPassed = historyTasks.filter((t) => (t.finalAssessment?.result || 'pass') === 'pass').length;
  const totalFailed = historyTasks.filter((t) => t.finalAssessment?.result === 'fail').length;
  const passRate = totalCompleted > 0 ? ((totalPassed / totalCompleted) * 100).toFixed(1) : '100';

  const handleInstantDownload = (task: InspectionTask, e: React.MouseEvent) => {
    e.stopPropagation();
    generateInspectionPDF(task, profile);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 w-full space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#c6c5d4]/70 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#000666] text-[26px]">
              history_edu
            </span>
            <h1 className="text-2xl font-extrabold text-[#000666] tracking-tight">
              Inspection History & Certificates
            </h1>
          </div>
          <p className="text-xs text-[#5a5d72] mt-0.5">
            Statutory registry of completed field verifications, certificates, and compliance audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#dcdef7] text-[#000666] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>{totalCompleted} Records Total</span>
          </span>
        </div>
      </div>

      {/* KPI Bento Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/70 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#5a5d72]">Total Audits</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#000666]">{totalCompleted}</span>
            <span className="text-[11px] text-[#2e7d32] font-semibold">100% Filed</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/70 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#5a5d72]">Pass Rate</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#2e7d32]">{passRate}%</span>
            <span className="text-[11px] text-[#5a5d72]">Standard</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/70 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#5a5d72]">Stamped & Sealed</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#000666]">{totalPassed}</span>
            <span className="text-[11px] text-[#5a5d72]">Certificates</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/70 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#5a5d72]">Rejections / Seizures</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#ba1a1a]">{totalFailed}</span>
            <span className="text-[11px] text-[#ba1a1a] font-semibold">Non-compliant</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Result Filters */}
      <div className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/70 shadow-xs space-y-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#767683] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Trader, Certificate #, App ID, Serial No, or Sector..."
            className="w-full bg-[#f5f2fb] pl-10 pr-10 py-2.5 rounded-xl border border-[#c6c5d4]/80 text-sm font-medium text-[#1b1b21] focus:bg-white focus:border-[#000666] outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767683] hover:text-[#1b1b21]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setResultFilter('all')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all ${
                resultFilter === 'all'
                  ? 'bg-[#000666] text-white shadow-xs'
                  : 'bg-[#f5f2fb] text-[#454652] hover:bg-[#eae7ef]'
              }`}
            >
              All Records ({historyTasks.length})
            </button>
            <button
              onClick={() => setResultFilter('pass')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1 ${
                resultFilter === 'pass'
                  ? 'bg-[#2e7d32] text-white shadow-xs'
                  : 'bg-[#f5f2fb] text-[#2e7d32] hover:bg-[#2e7d32]/10'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>Passed & Stamped ({totalPassed})</span>
            </button>
            <button
              onClick={() => setResultFilter('fail')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1 ${
                resultFilter === 'fail'
                  ? 'bg-[#ba1a1a] text-white shadow-xs'
                  : 'bg-[#f5f2fb] text-[#ba1a1a] hover:bg-[#ba1a1a]/10'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">cancel</span>
              <span>Rejected ({totalFailed})</span>
            </button>
          </div>

          <div className="text-xs text-[#767683] font-medium">
            Showing {filteredHistory.length} of {historyTasks.length}
          </div>
        </div>
      </div>

      {/* History Records List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-[#c6c5d4]/70 text-center space-y-2">
            <span className="material-symbols-outlined text-[42px] text-[#767683]">
              search_off
            </span>
            <h3 className="text-base font-bold text-[#1b1b21]">No Historical Records Found</h3>
            <p className="text-xs text-[#5a5d72]">
              Try clearing your search query or switching result filters.
            </p>
          </div>
        ) : (
          filteredHistory.map((task) => {
            const res = task.finalAssessment?.result || 'pass';
            const certNo = task.certificateNo || `LM-${task.appId.replace('APP-', '')}-4819`;
            const stamp = task.stampId || task.finalAssessment?.verifiedStampId || `IN-DLM-2026-${task.appId.slice(-4)}`;
            const date = task.completedDate || task.scheduledTime || '24 Aug 2026';

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTaskForDetails(task)}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-[#c6c5d4]/70 hover:border-[#000666]/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      res === 'pass'
                        ? 'bg-[#2e7d32]/10 border-[#2e7d32]/30 text-[#2e7d32]'
                        : res === 'fail'
                        ? 'bg-[#ba1a1a]/10 border-[#ba1a1a]/30 text-[#ba1a1a]'
                        : 'bg-[#f9a825]/15 border-[#f9a825]/30 text-[#b26a00]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[26px]">
                      {res === 'pass' ? 'verified' : res === 'fail' ? 'gavel' : 'build'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#000666] bg-[#dcdef7] px-2 py-0.5 rounded-md">
                        {task.appId}
                      </span>
                      <span className="text-[11px] text-[#5a5d72] font-mono">
                        Cert: {certNo}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          res === 'pass'
                            ? 'bg-[#2e7d32]/10 text-[#2e7d32]'
                            : res === 'fail'
                            ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                            : 'bg-[#f9a825]/15 text-[#b26a00]'
                        }`}
                      >
                        {res === 'pass' ? 'VERIFIED' : res === 'fail' ? 'REJECTED' : 'CONDITIONAL'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1b1b21] group-hover:text-[#000666] transition-colors mt-0.5 truncate">
                      {task.title} • {task.businessName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5a5d72] mt-1">
                      <span>{task.sector}</span>
                      <span>•</span>
                      <span>Date: {date}</span>
                      <span>•</span>
                      <span className="font-mono text-[#2e7d32] font-semibold">Stamp: {stamp}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e4e1ea]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrStickerTask(task);
                    }}
                    className="p-2 rounded-xl text-[#454652] hover:text-[#000666] hover:bg-[#f5f2fb] transition-colors border border-[#c6c5d4]"
                    title="Print Verification QR Sticker"
                  >
                    <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenReportModal(task);
                    }}
                    className="px-3.5 py-1.5 rounded-full border border-[#000666] text-[#000666] hover:bg-[#dcdef7] text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>View Cert</span>
                  </button>

                  <button
                    onClick={(e) => handleInstantDownload(task, e)}
                    className="px-3.5 py-1.5 rounded-full bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95"
                    title="Download Official PDF Certificate"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Historical Task Details Inspection Modal */}
      {selectedTaskForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-[#c6c5d4] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-[#000666] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[24px]">fact_check</span>
                </div>
                <div>
                  <h3 className="text-base font-bold leading-tight">
                    Inspection Audit Record: {selectedTaskForDetails.appId}
                  </h3>
                  <p className="text-xs text-white/80">
                    {selectedTaskForDetails.title} • {selectedTaskForDetails.businessName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTaskForDetails(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/15"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 bg-[#f8f9fa] flex-1 text-[#1b1b21]">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  (selectedTaskForDetails.finalAssessment?.result || 'pass') === 'pass'
                    ? 'bg-[#2e7d32]/10 border-[#2e7d32]/40 text-[#2e7d32]'
                    : 'bg-[#ba1a1a]/10 border-[#ba1a1a]/40 text-[#ba1a1a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[28px] filled">
                    {(selectedTaskForDetails.finalAssessment?.result || 'pass') === 'pass'
                      ? 'verified'
                      : 'gavel'}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Statutory Result</p>
                    <p className="text-sm font-extrabold">
                      {(selectedTaskForDetails.finalAssessment?.result || 'pass') === 'pass'
                        ? 'VERIFIED & CERTIFIED'
                        : 'REJECTED / SEIZURE ORDER'}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold bg-white px-3 py-1 rounded-full border border-current">
                  Stamp: {selectedTaskForDetails.stampId || selectedTaskForDetails.finalAssessment?.verifiedStampId || 'IN-DLM-2026-90412'}
                </span>
              </div>

              {/* Apparatus Details */}
              <div className="bg-white p-4 rounded-2xl border border-[#c6c5d4]/70 space-y-2">
                <h4 className="text-xs font-bold text-[#000666] uppercase tracking-wider">
                  Apparatus & Site Info
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#5a5d72]">Appliance Model: </span>
                    <span className="font-semibold text-[#1b1b21]">{selectedTaskForDetails.deviceModel || 'Standard Series'}</span>
                  </div>
                  <div>
                    <span className="text-[#5a5d72]">Serial Number: </span>
                    <span className="font-mono font-semibold text-[#1b1b21]">{selectedTaskForDetails.serialNumber || 'SN-DEMO-991'}</span>
                  </div>
                  <div>
                    <span className="text-[#5a5d72]">Accuracy Class: </span>
                    <span className="font-semibold text-[#1b1b21]">{selectedTaskForDetails.accuracyClass || 'Class III'}</span>
                  </div>
                  <div>
                    <span className="text-[#5a5d72]">Location / Sector: </span>
                    <span className="font-semibold text-[#1b1b21]">{selectedTaskForDetails.sector}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#5a5d72]">GPS Location: </span>
                    <span className="font-mono text-[#000666]">
                      {selectedTaskForDetails.location.lat ? `${selectedTaskForDetails.location.lat}°N, ${selectedTaskForDetails.location.lng}°E` : 'Locked on-site'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Test Readings Table */}
              <div className="bg-white p-4 rounded-2xl border border-[#c6c5d4]/70 space-y-2">
                <h4 className="text-xs font-bold text-[#000666] uppercase tracking-wider">
                  Load & Error Tolerances
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#f5f2fb] text-[#454652] font-bold">
                      <tr>
                        <th className="p-2">Load Test</th>
                        <th className="p-2">Reference</th>
                        <th className="p-2">Indicated</th>
                        <th className="p-2">Max Permissible Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e4e1ea]">
                      {selectedTaskForDetails.readings.map((r) => (
                        <tr key={r.id}>
                          <td className="p-2 font-medium">{r.name}</td>
                          <td className="p-2 font-mono">{r.referenceWeight} {r.unit}</td>
                          <td className="p-2 font-mono font-bold text-[#000666]">{r.indicatedWeight ?? '--'} {r.unit}</td>
                          <td className="p-2 font-mono text-[#5a5d72]">±{r.maxPermissibleError} {r.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Evidence Photos */}
              {selectedTaskForDetails.evidence.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-[#c6c5d4]/70 space-y-2">
                  <h4 className="text-xs font-bold text-[#000666] uppercase tracking-wider">
                    Attached Photographic Evidence ({selectedTaskForDetails.evidence.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedTaskForDetails.evidence.map((ev) => (
                      <div key={ev.id} className="rounded-xl overflow-hidden border border-[#c6c5d4] bg-[#eae7ef]">
                        <img
                          src={ev.imageUrl}
                          alt={ev.title}
                          className="w-full h-24 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="p-1.5 text-[10px] bg-white">
                          <p className="font-bold text-[#1b1b21] truncate">{ev.title}</p>
                          <p className="text-[#5a5d72]">{ev.capturedAt} • {ev.fileSize}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Officer Notes */}
              {selectedTaskForDetails.finalAssessment?.officerNotes && (
                <div className="bg-white p-4 rounded-2xl border border-[#c6c5d4]/70 space-y-1">
                  <h4 className="text-xs font-bold text-[#000666] uppercase tracking-wider">
                    Officer Observation Notes
                  </h4>
                  <p className="text-xs text-[#454652]">
                    {selectedTaskForDetails.finalAssessment.officerNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[#c6c5d4]/70 flex items-center justify-between shrink-0">
              <button
                onClick={() => setSelectedTaskForDetails(null)}
                className="px-4 py-2 text-xs font-bold text-[#454652] hover:bg-[#e4e1ea] rounded-full transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const t = selectedTaskForDetails;
                    setSelectedTaskForDetails(null);
                    onOpenReportModal(t);
                  }}
                  className="px-4 py-2 rounded-full border border-[#000666] text-[#000666] hover:bg-[#dcdef7] text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>View Certificate</span>
                </button>

                <button
                  onClick={() => {
                    generateInspectionPDF(selectedTaskForDetails, profile);
                  }}
                  className="px-5 py-2 rounded-full bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Verification Sticker Print Modal */}
      {qrStickerTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#c6c5d4] text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e4e1ea]">
              <h3 className="text-base font-bold text-[#000666]">Legal Metrology Sticker</h3>
              <button
                onClick={() => setQrStickerTask(null)}
                className="text-[#767683] hover:text-[#1b1b21]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Sticker Physical Mockup */}
            <div className="p-4 bg-linear-to-br from-[#2e7d32] to-[#1b5e20] text-white rounded-2xl shadow-lg border-2 border-[#81c784] space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold tracking-widest uppercase">
                  GOVT OF INDIA • LEGAL METROLOGY
                </span>
                <span className="text-[9px] font-bold bg-white text-[#2e7d32] px-2 py-0.5 rounded-full">
                  VERIFIED 2026-27
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl text-black flex items-center justify-between gap-3 shadow-inner">
                {/* QR block */}
                <div className="w-16 h-16 bg-[#000666] p-1.5 rounded-lg shrink-0 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-3 h-3 bg-white rounded-xs"></div>
                    <div className="w-3 h-3 bg-white rounded-xs"></div>
                  </div>
                  <div className="w-2.5 h-2.5 bg-white mx-auto rounded-xs"></div>
                  <div className="flex justify-between">
                    <div className="w-3 h-3 bg-white rounded-xs"></div>
                    <div className="w-2 h-2 bg-white rounded-xs"></div>
                  </div>
                </div>

                <div className="text-left text-[10px] space-y-0.5">
                  <p className="font-bold text-[#000666]">{qrStickerTask.title}</p>
                  <p className="text-[#454652] truncate max-w-[140px]">{qrStickerTask.businessName}</p>
                  <p className="font-mono font-bold text-[#2e7d32]">
                    SEAL: {qrStickerTask.stampId || 'IN-DLM-2026-90412'}
                  </p>
                  <p className="text-[9px] text-[#767683]">Officer: {profile.badgeNumber}</p>
                </div>
              </div>

              <p className="text-[8px] text-white/80 uppercase tracking-wider">
                Tampering with this seal is a non-bailable statutory offense
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setQrStickerTask(null)}
                className="px-4 py-2 text-xs font-bold text-[#454652] hover:bg-[#e4e1ea] rounded-full"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 text-xs font-bold bg-[#000666] text-white rounded-full hover:bg-[#1a237e] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Sticker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
