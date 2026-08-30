import React from 'react';
import { ScreenType, OfficerProfile } from '../types';
import { ASSETS } from '../data/initialData';

interface TopAppBarProps {
  currentScreen?: ScreenType;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onNavigateBack?: () => void;
  onMenuClick?: () => void;
  onOpenMenu?: () => void;
  onProfileClick?: () => void;
  onOpenProfile?: () => void;
  onCloseClick?: () => void;
  isOnline: boolean;
  onToggleOnline?: () => void;
  profile?: OfficerProfile;
  avatarUrl?: string;
  rightAction?: React.ReactNode;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentScreen = 'dashboard',
  title = 'MapanSetu',
  subtitle,
  onBack,
  onNavigateBack,
  onMenuClick,
  onOpenMenu,
  onProfileClick,
  onOpenProfile,
  onCloseClick,
  isOnline,
  onToggleOnline,
  profile,
  avatarUrl,
  rightAction,
}) => {
  const handleBack = onBack || onNavigateBack;
  const handleMenu = onMenuClick || onOpenMenu;
  const handleProfile = onProfileClick || onOpenProfile;

  // Screens with custom back/close buttons
  const isWizard = currentScreen === 'inspection-flow';
  const isConflict = currentScreen === 'conflict';
  const isSecurity = currentScreen === 'security-sessions';
  const isProfile = currentScreen === 'profile';
  const isLocation = currentScreen === 'location-capture';
  const isMap = currentScreen === 'map';
  const isHistory = currentScreen === 'history';

  const officerAvatar = avatarUrl || profile?.avatarUrl || ASSETS.officerAvatar;
  const officerName = profile?.name || 'Officer';

  return (
    <header className="bg-[#f8f9fa] border-b border-[#c6c5d4]/40 sticky top-0 z-40 w-full transition-shadow duration-200">
      <div className="flex justify-between items-center px-4 h-16 w-full max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {isConflict ? (
            <button
              onClick={onCloseClick || handleBack}
              aria-label="Close"
              className="text-[#454652] hover:bg-[#eae7ef] rounded-full p-2 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          ) : (isWizard || isSecurity || isProfile || isLocation || isMap || isHistory) ? (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="text-[#1b1b21] hover:bg-[#eae7ef] rounded-full p-2 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
          ) : (
            <button
              onClick={handleMenu}
              aria-label="Open Navigation Menu"
              className="text-[#454652] hover:bg-[#eae7ef] rounded-full p-2 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
          )}

          <div>
            <h1 className="font-bold text-[#000666] text-xl tracking-tight leading-tight flex items-center gap-2">
              {title}
              {/* Small live connectivity indicator pill */}
              <button
                onClick={onToggleOnline}
                className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                  isOnline
                    ? 'bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/30 hover:bg-[#2e7d32]/20'
                    : 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30 hover:bg-[#ffdad6]/80'
                }`}
                title={isOnline ? 'Online (Click to toggle Offline)' : 'Offline (Click to toggle Online)'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-[#2e7d32]' : 'bg-[#ba1a1a]'
                  }`}
                />
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </button>
            </h1>
            {subtitle && (
              <p className="text-xs text-[#454652] font-normal leading-none mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {rightAction}

          {/* Officer Avatar Button */}
          {!isConflict && handleProfile && (
            <button
              onClick={handleProfile}
              className="hover:ring-2 hover:ring-[#1a237e] rounded-full p-0.5 active:scale-95 transition-all shrink-0 cursor-pointer"
              title="View Officer Profile"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#c6c5d4] bg-white">
                <img
                  src={officerAvatar}
                  alt={officerName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
