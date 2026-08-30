import React, { useState } from 'react';
import { InspectionTask, InspectionResult } from '../../types';
import { BiometricAuthModal } from '../BiometricAuthModal';

interface Step4ReviewProps {
  task: InspectionTask;
  isOnline: boolean;
  onEditStep: (step: number) => void;
  onSubmit: (result: InspectionResult, notes: string) => void;
  onOpenLocation: () => void;
  onPreviewCertificate?: () => void;
}

export const Step4Review: React.FC<Step4ReviewProps> = ({
  task,
  isOnline,
  onEditStep,
  onSubmit,
  onOpenLocation,
  onPreviewCertificate,
}) => {
  const [result, setResult] = useState<InspectionResult>(task.finalAssessment?.result || 'pass');
  const [notes, setNotes] = useState(task.finalAssessment?.officerNotes || '');
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const completedChecklistCount = task.checklists.filter((c) => c.completed).length;
  const recordedReadingsCount = task.readings.filter((r) => r.indicatedWeight !== undefined).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBiometricModal(true);
  };

  const handleConfirmedSubmission = () => {
    setShowBiometricModal(false);
    onSubmit(result, notes);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Warning/Status Banner */}
      <div
        className={`px-4 py-3 rounded-2xl flex items-center justify-between gap-3 border ${
          isOnline
            ? 'bg-[#2e7d32]/10 border-[#2e7d32]/30 text-[#2e7d32]'
            : 'bg-[#f9a825]/20 border-[#f9a825]/40 text-[#454652]'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px] shrink-0 text-[#f9a825]">
            {isOnline ? 'cloud_done' : 'cloud_off'}
          </span>
          <p className="text-sm font-medium">
            {isOnline ? 'Connected: Ready to upload to cloud' : 'Ready to sync once online'}
          </p>
        </div>

        {onPreviewCertificate && (
          <button
            type="button"
            onClick={onPreviewCertificate}
            className="px-3.5 py-1.5 rounded-full bg-white border border-[#c6c5d4] hover:bg-[#f5f2fb] text-xs font-bold text-[#000666] shadow-xs flex items-center gap-1 shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Draft Certificate</span>
          </button>
        )}
      </div>

      {/* Summary Header */}
      <div>
        <p className="text-xs font-bold text-[#767683] uppercase tracking-wider mb-0.5">
          Inspection Summary
        </p>
        <h2 className="text-2xl font-extrabold text-[#1b1b21] tracking-tight">
          {task.appId} | {task.title}
        </h2>
        <p className="text-sm text-[#454652]">{task.businessName} • {task.sector}</p>
      </div>

      {/* Bento Grid Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Checklist Card */}
        <div className="bg-white rounded-2xl border border-[#c6c5d4]/70 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-[#dcdef7] text-[#171a2c] p-2.5 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined filled text-[20px]">
                  checklist
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1b1b21]">Checklist</h3>
                <p className="text-xs text-[#454652]">
                  {completedChecklistCount}/{task.checklists.length} Completed
                </p>
              </div>
            </div>
            <button
              onClick={() => onEditStep(1)}
              className="text-[#000666] hover:bg-[#dcdef7] rounded-full p-1.5 transition-colors"
              title="Edit Checklist"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>
          <div className="w-full bg-[#e4e1ea] rounded-full h-2">
            <div
              className="bg-[#2e7d32] h-2 rounded-full transition-all"
              style={{
                width: `${(completedChecklistCount / task.checklists.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Readings Card */}
        <div className="bg-white rounded-2xl border border-[#c6c5d4]/70 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#dcdef7] text-[#171a2c] p-2.5 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined filled text-[20px]">
                  speed
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1b1b21]">Readings</h3>
                <p className="text-xs text-[#454652]">
                  {recordedReadingsCount}/{task.readings.length} Recorded
                </p>
              </div>
            </div>
            <button
              onClick={() => onEditStep(2)}
              className="text-[#000666] hover:bg-[#dcdef7] rounded-full p-1.5 transition-colors"
              title="Edit Readings"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[#454652]">
            {task.readings.map((r) => (
              <span
                key={r.id}
                className="bg-[#f5f2fb] px-2 py-0.5 rounded border border-[#c6c5d4]"
              >
                {r.referenceWeight}kg: {r.indicatedWeight ?? '--'}kg
              </span>
            ))}
          </div>
        </div>

        {/* Evidence Card */}
        <div className="bg-white rounded-2xl border border-[#c6c5d4]/70 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-[#dcdef7] text-[#171a2c] p-2.5 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined filled text-[20px]">
                  photo_camera
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1b1b21]">Evidence</h3>
                <p className="text-xs text-[#454652]">
                  {task.evidence.length} items attached
                </p>
              </div>
            </div>
            <button
              onClick={() => onEditStep(3)}
              className="text-[#000666] hover:bg-[#dcdef7] rounded-full p-1.5 transition-colors"
              title="Edit Evidence"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {task.evidence.map((ev) => (
              <div
                key={ev.id}
                className="w-14 h-14 rounded-xl bg-[#eeeeef] shrink-0 overflow-hidden border border-[#c6c5d4] relative"
                title={ev.title}
              >
                <img
                  src={ev.imageUrl}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-2xl border border-[#c6c5d4]/70 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-[#dcdef7] text-[#171a2c] p-2.5 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined filled text-[20px]">
                  location_on
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1b1b21]">Location</h3>
                <p className="text-xs text-[#454652]">
                  {task.location.address || 'Captured GPS Coordinates'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenLocation}
              className="text-[#000666] hover:bg-[#dcdef7] rounded-full p-1.5 transition-colors"
              title="View GPS Details"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>

          <div
            onClick={onOpenLocation}
            className="bg-[#f5f2fb] h-16 rounded-xl border border-[#c6c5d4]/60 flex items-center justify-center gap-2 cursor-pointer hover:bg-[#eae7ef] transition-colors"
          >
            <span className="material-symbols-outlined text-[#000666]">map</span>
            <span className="text-xs font-mono font-semibold text-[#1b1b21]">
              {task.location.lat}° N, {task.location.lng}° E (±{task.location.accuracy || 4.2}m)
            </span>
          </div>
        </div>
      </div>

      {/* Final Assessment Section */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#c6c5d4]/70 p-6 shadow-xs space-y-6">
        <h3 className="text-xl font-bold text-[#1b1b21] pb-3 border-b border-[#e4e1ea]">
          Final Statutory Assessment
        </h3>

        {/* Radio Option Cards */}
        <div>
          <label className="block text-xs font-bold text-[#767683] uppercase tracking-wider mb-3">
            Inspection Result
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* PASS */}
            <label
              onClick={() => setResult('pass')}
              className={`rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                result === 'pass'
                  ? 'bg-[#2e7d32]/10 border-[#2e7d32] text-[#2e7d32] shadow-xs'
                  : 'border-[#c6c5d4]/80 text-[#454652] hover:bg-[#f5f2fb]'
              }`}
            >
              <input
                type="radio"
                name="result"
                value="pass"
                checked={result === 'pass'}
                onChange={() => setResult('pass')}
                className="sr-only"
              />
              <span className="material-symbols-outlined text-[32px] filled">
                check_circle
              </span>
              <span className="text-sm font-bold tracking-wide">PASS</span>
            </label>

            {/* FAIL */}
            <label
              onClick={() => setResult('fail')}
              className={`rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                result === 'fail'
                  ? 'bg-[#ba1a1a]/10 border-[#ba1a1a] text-[#ba1a1a] shadow-xs'
                  : 'border-[#c6c5d4]/80 text-[#454652] hover:bg-[#f5f2fb]'
              }`}
            >
              <input
                type="radio"
                name="result"
                value="fail"
                checked={result === 'fail'}
                onChange={() => setResult('fail')}
                className="sr-only"
              />
              <span className="material-symbols-outlined text-[32px] filled">
                cancel
              </span>
              <span className="text-sm font-bold tracking-wide">FAIL</span>
            </label>

            {/* REQUIRES CORRECTION */}
            <label
              onClick={() => setResult('correction')}
              className={`rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center ${
                result === 'correction'
                  ? 'bg-[#f9a825]/15 border-[#f9a825] text-[#b26a00] shadow-xs'
                  : 'border-[#c6c5d4]/80 text-[#454652] hover:bg-[#f5f2fb]'
              }`}
            >
              <input
                type="radio"
                name="result"
                value="correction"
                checked={result === 'correction'}
                onChange={() => setResult('correction')}
                className="sr-only"
              />
              <span className="material-symbols-outlined text-[32px]">
                build
              </span>
              <span className="text-xs font-bold tracking-wide uppercase">
                Requires Correction
              </span>
            </label>
          </div>
        </div>

        {/* Officer Notes */}
        <div>
          <label
            htmlFor="officer-notes"
            className="block text-xs font-bold text-[#767683] uppercase tracking-wider mb-2"
          >
            Officer Notes & Observations
          </label>
          <textarea
            id="officer-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any final observations, calibration adjustments, or seal numbers..."
            className="w-full bg-[#f5f2fb] border border-[#767683]/50 rounded-xl p-3.5 text-sm text-[#1b1b21] focus:bg-white focus:border-[#000666] focus:ring-1 focus:ring-[#000666] outline-none transition-all resize-none"
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 h-14 bg-[#000666] hover:bg-[#1a237e] text-white font-semibold text-base rounded-full flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">
              fingerprint
            </span>
            <span>Biometric Sign & Submit</span>
          </button>
        </div>
      </form>

      {/* Biometric Sign-off Modal */}
      {showBiometricModal && (
        <BiometricAuthModal
          title="Digital Signature Authentication"
          subtitle="Authorize statutory submission and legal certificate generation with your biometric token"
          actionLabel="Sign & Seal"
          onSuccess={handleConfirmedSubmission}
          onCancel={() => setShowBiometricModal(false)}
        />
      )}
    </div>
  );
};
