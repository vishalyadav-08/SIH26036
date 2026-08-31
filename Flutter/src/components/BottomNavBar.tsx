import React from 'react';
import { ScreenType } from '../types';

interface BottomNavBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  syncQueueCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onNavigate,
  syncQueueCount,
}) => {
  const tabs: { id: ScreenType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'inspections', label: 'Inspections', icon: 'fact_check' },
    { id: 'sync', label: 'Sync', icon: 'sync' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#f5f2fb] border-t border-[#c6c5d4]/40 h-20 px-2 flex justify-around items-center md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="flex flex-col items-center justify-center relative flex-1 py-1 active:scale-90 transition-transform duration-150"
          >
            <div
              className={`rounded-2xl px-5 py-1 flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#dcdef7] text-[#171a2c]'
                  : 'text-[#454652] hover:bg-[#eae7ef]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[24px] ${
                  isActive ? 'filled font-bold' : ''
                }`}
              >
                {tab.icon}
              </span>

              {/* Badge for Sync button */}
              {tab.id === 'sync' && syncQueueCount > 0 && (
                <span className="absolute -top-0.5 right-[28%] bg-[#f9a825] text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {syncQueueCount}
                </span>
              )}
            </div>
            <span
              className={`text-xs mt-1 tracking-tight ${
                isActive
                  ? 'font-bold text-[#000666]'
                  : 'font-medium text-[#454652]'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
