import React, { useState } from 'react';

interface ConflictResolutionScreenProps {
  onResolveLocal: () => void;
  onResolveServer: () => void;
  onMergeAndReview: () => void;
  onClose: () => void;
}

export const ConflictResolutionScreen: React.FC<ConflictResolutionScreenProps> = ({
  onResolveLocal,
  onResolveServer,
  onMergeAndReview,
  onClose,
}) => {
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'server' | null>(null);

  const handleKeepLocal = () => {
    setSelectedResolution('local');
    setTimeout(() => {
      onResolveLocal();
    }, 400);
  };

  const handleKeepServer = () => {
    setSelectedResolution('server');
    setTimeout(() => {
      onResolveServer();
    }, 400);
  };

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 pb-28 max-w-3xl mx-auto w-full flex flex-col gap-8 animate-fade-in">
      {/* Header Section */}
      <section className="text-center flex flex-col items-center gap-3 mt-4">
        <div className="w-20 h-20 rounded-full bg-[#f9a825]/20 flex items-center justify-center mb-1">
          <span className="material-symbols-outlined text-[44px] text-[#f9a825] filled">
            warning
          </span>
        </div>
        <h2 className="text-3xl font-extrabold text-[#1b1b21] tracking-tight">
          Conflict Detected
        </h2>
        <p className="text-sm sm:text-base text-[#454652] max-w-lg leading-relaxed">
          This inspection was modified on the server while you were working offline. Please resolve the data conflict below.
        </p>
      </section>

      {/* Comparison Grid (Side by side on md, stacked on sm) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Version Card */}
        <div
          className={`bg-white border rounded-2xl p-6 flex flex-col gap-4 shadow-xs relative overflow-hidden transition-all ${
            selectedResolution === 'local'
              ? 'border-[#000666] ring-2 ring-[#000666]/30'
              : 'border-[#c6c5d4]/70'
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-[#dcdef7]" />
          <div className="flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-[#5a5d72] filled text-[24px]">
              smartphone
            </span>
            <h3 className="text-lg font-bold text-[#1b1b21]">
              Your Local Version
            </h3>
          </div>
          <p className="text-xs text-[#454652]">
            Last saved by you in field (5 minutes ago)
          </p>

          <div className="bg-[#f5f2fb] rounded-xl p-4 mt-1 border border-[#c6c5d4]/40">
            <span className="text-[10px] font-bold text-[#767683] uppercase tracking-wider block mb-1">
              Indicated Value (10kg Test)
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1b1b21]">
              10.055 kg
            </span>
            <p className="text-[11px] text-[#ba1a1a] font-medium mt-1">
              +0.055kg (Out of normal tolerance)
            </p>
          </div>

          <div className="mt-auto pt-2">
            <button
              onClick={handleKeepLocal}
              className="w-full bg-[#dcdef7] hover:bg-[#dcdef7]/80 text-[#171a2c] font-semibold text-xs rounded-xl h-11 transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">
                check
              </span>
              <span>Keep Local Version</span>
            </button>
          </div>
        </div>

        {/* Server Version Card */}
        <div
          className={`bg-white border rounded-2xl p-6 flex flex-col gap-4 shadow-xs relative overflow-hidden transition-all ${
            selectedResolution === 'server'
              ? 'border-[#f9a825] ring-2 ring-[#f9a825]/40'
              : 'border-[#f9a825]/60 ring-1 ring-[#f9a825]/20'
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-[#f9a825]" />
          <div className="flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-[#b26a00] filled text-[24px]">
              cloud
            </span>
            <h3 className="text-lg font-bold text-[#1b1b21]">
              Server Version
            </h3>
          </div>
          <p className="text-xs text-[#454652]">
            Updated by Central Metrology System (10 minutes ago)
          </p>

          <div className="bg-[#f9a825]/10 rounded-xl p-4 mt-1 border border-[#f9a825]/30">
            <span className="text-[10px] font-bold text-[#767683] uppercase tracking-wider block mb-1">
              Indicated Value (10kg Test)
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#1b1b21]">
              10.050 kg
            </span>
            <p className="text-[11px] text-[#2e7d32] font-medium mt-1">
              +0.050kg (Within tolerance limit)
            </p>
          </div>

          <div className="mt-auto pt-2">
            <button
              onClick={handleKeepServer}
              className="w-full bg-[#f9a825] hover:bg-[#f9a825]/90 text-black font-semibold text-xs rounded-xl h-11 transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">
                cloud_download
              </span>
              <span>Keep Server Version</span>
            </button>
          </div>
        </div>
      </section>

      {/* Secondary Action: Merge */}
      <section className="flex justify-center mt-2">
        <button
          onClick={onMergeAndReview}
          className="flex items-center gap-2 text-[#000666] hover:bg-[#dcdef7] px-6 py-3 rounded-full text-xs font-bold transition-all active:scale-95 border border-[#000666]/30"
        >
          <span className="material-symbols-outlined text-[18px]">
            merge_type
          </span>
          <span>Merge & Review Side-by-Side</span>
        </button>
      </section>
    </main>
  );
};
