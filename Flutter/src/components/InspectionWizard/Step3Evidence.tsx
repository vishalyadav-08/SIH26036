import React, { useRef } from 'react';
import { EvidenceItem } from '../../types';
import { ASSETS } from '../../data/initialData';

interface Step3EvidenceProps {
  evidenceList: EvidenceItem[];
  onAddEvidence: (item: EvidenceItem) => void;
  onRemoveEvidence: (id: string) => void;
  onBack: () => void;
  onSaveAndContinue: () => void;
}

export const Step3Evidence: React.FC<Step3EvidenceProps> = ({
  evidenceList,
  onAddEvidence,
  onRemoveEvidence,
  onBack,
  onSaveAndContinue,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapturePhoto = () => {
    // Generate simulated or uploaded evidence photo
    const sampleTitles = [
      'Machine Nameplate',
      'Anti-Tamper Lead Wire Seal',
      'Digital Scale Calibration Display',
      'Trader Verification Certificate',
    ];
    const sampleImages = [
      ASSETS.machineNameplate,
      ASSETS.evidenceSeal,
      ASSETS.evidenceScale,
    ];

    const nextIndex = evidenceList.length % sampleTitles.length;
    const newEvidence: EvidenceItem = {
      id: `ev_${Date.now()}`,
      title: sampleTitles[nextIndex] || 'Inspection Photo Evidence',
      type: 'photo',
      imageUrl: sampleImages[nextIndex % sampleImages.length],
      capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      locationStatus: 'captured',
      fileSize: `${(1.5 + Math.random()).toFixed(1)} MB`,
      isLocalOnly: true,
    };

    onAddEvidence(newEvidence);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newEvidence: EvidenceItem = {
        id: `ev_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: 'document',
        imageUrl: ASSETS.machineNameplate,
        capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        locationStatus: 'captured',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        isLocalOnly: true,
      };
      onAddEvidence(newEvidence);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Instructions */}
      <div>
        <h2 className="text-xl font-bold text-[#1b1b21]">Required Evidence</h2>
        <p className="text-sm text-[#454652] mt-1 leading-relaxed">
          Please capture or upload photos of the machine nameplate, general condition, and any identified defects.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleCapturePhoto}
          className="bg-[#000666] hover:bg-[#1a237e] text-white h-14 rounded-full flex items-center justify-center gap-2.5 px-6 font-semibold text-sm shadow-sm active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined filled text-[22px]">
            photo_camera
          </span>
          <span>Capture Photo</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#f5f2fb] text-[#1b1b21] border border-[#767683]/50 h-14 rounded-full flex items-center justify-center gap-2.5 px-6 font-semibold text-sm hover:bg-[#eae7ef] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">
            upload_file
          </span>
          <span>Upload Document</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Captured Evidence List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1b1b21]">
            Captured Items ({evidenceList.length})
          </h3>
          <span className="text-xs text-[#767683]">
            Min 1 required for pass
          </span>
        </div>

        {evidenceList.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#c6c5d4] p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#767683] mb-2">
              add_a_photo
            </span>
            <p className="text-sm font-semibold text-[#1b1b21]">No evidence captured yet</p>
            <p className="text-xs text-[#454652] mt-1">
              Tap "Capture Photo" to snap the machine nameplate
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evidenceList.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#c6c5d4]/70 rounded-2xl overflow-hidden shadow-xs flex flex-col group"
              >
                {/* Photo Preview Banner */}
                <div className="relative w-full h-48 bg-[#eeeeef] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Status Badge */}
                  {item.isLocalOnly && (
                    <div className="absolute top-3 right-3 bg-[#f9a825]/90 backdrop-blur-xs text-[#1b1b21] px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">
                        cloud_off
                      </span>
                      <span className="text-[10px] font-extrabold tracking-wider uppercase">
                        LOCAL ONLY
                      </span>
                    </div>
                  )}

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8">
                    <h4 className="text-base font-bold text-white leading-tight">
                      {item.title}
                    </h4>
                  </div>
                </div>

                {/* Card Footer / Metadata & Actions */}
                <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white">
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#454652]">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">
                        schedule
                      </span>
                      <span>Captured {item.capturedAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">
                        location_on
                      </span>
                      <span>Location: Captured</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">
                        sd_card
                      </span>
                      <span>Size: {item.fileSize}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={handleCapturePhoto}
                      title="Retake Photo"
                      className="text-[#000666] hover:bg-[#dcdef7] rounded-full p-2 flex items-center justify-center transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        replay
                      </span>
                    </button>
                    <button
                      onClick={() => onRemoveEvidence(item.id)}
                      title="Delete Item"
                      className="text-[#ba1a1a] hover:bg-[#ffdad6] rounded-full p-2 flex items-center justify-center transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 flex justify-between items-center gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-full font-semibold text-sm text-[#000666] hover:bg-[#dcdef7] active:scale-95 transition-all"
        >
          Back
        </button>
        <button
          onClick={onSaveAndContinue}
          className="h-12 px-8 bg-[#000666] hover:bg-[#1a237e] text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <span>Save & Continue</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
