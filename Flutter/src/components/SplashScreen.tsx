import React, { useEffect } from 'react';
import { ASSETS } from '../data/initialData';

interface SplashScreenProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Automatic gentle transition or user can tap anytime
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      onClick={onContinue}
      className="relative h-screen w-screen overflow-hidden flex flex-col justify-between items-center cursor-pointer select-none bg-[#f8f9fa] text-[#1b1b21]"
    >
      {/* Background Graphic with gradient overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ backgroundImage: `url(${ASSETS.splashBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9fa]/40 via-[#f8f9fa]/80 to-[#f8f9fa] z-10 backdrop-blur-[2px]" />
      </div>

      {/* Top Spacer */}
      <div className="z-20 pt-12 text-center">
        <span className="text-[11px] font-bold tracking-widest text-[#000666]/80 uppercase px-3 py-1 bg-white/70 backdrop-blur-xs rounded-full border border-[#c6c5d4]/40 shadow-xs">
          Legal Metrology Inspection System
        </span>
      </div>

      {/* Main Branding Section */}
      <div className="z-20 flex flex-col items-center justify-center px-6 w-full max-w-sm">
        {/* Animated Emblem Card */}
        <div className="mb-6 bg-white p-6 rounded-[32px] shadow-lg border border-[#c6c5d4]/40 flex items-center justify-center w-36 h-36 md:w-44 md:h-44 relative group">
          <div className="absolute inset-0 bg-[#000666]/5 rounded-[32px] animate-pulse" />
          <img
            src={ASSETS.logo}
            alt="MapanSetu Official Logo"
            className="w-full h-full object-contain relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="text-center flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#000666] tracking-tight mb-1">
            MapanSetu
          </h1>
          <p className="text-sm md:text-base font-semibold text-[#5a5d72] tracking-widest uppercase">
            Field Officer Portal
          </p>
        </div>

        {/* Divider & Secure Network Badge */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="w-12 h-1 bg-[#000666]/20 rounded-full" />
          <div className="flex items-center gap-2 text-[#546E7A]">
            <span className="material-symbols-outlined text-[20px] filled text-[#1a237e]">
              security
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#454652]">
              Secure Government Network
            </span>
          </div>
        </div>

        {/* Tap to enter button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onContinue();
          }}
          className="mt-8 px-6 py-2.5 rounded-full bg-[#000666] text-white text-xs font-semibold tracking-wider shadow-md hover:bg-[#000666]/90 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>ENTER PORTAL</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* Footer Pill */}
      <div className="z-20 pb-8 flex justify-center w-full">
        <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#c6c5d4]/60 shadow-xs flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2e7d32] animate-pulse" />
          <span className="text-xs text-[#1b1b21] font-semibold tracking-wide">
            SIH 2026 PROTOTYPE
          </span>
        </div>
      </div>
    </div>
  );
};
