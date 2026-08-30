import React from 'react';
import { ScreenType, OfficerProfile } from '../types';
import { ASSETS } from '../data/initialData';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
  profile: OfficerProfile;
  onOpenLocationModal: () => void;
  onStartNewInspection: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  isOnline,
  onToggleOnline,
  profile,
  onOpenLocationModal,
  onStartNewInspection,
}) => {
  if (!isOpen) return null;

  const navItems: { screen: ScreenType; label: string; icon: string; desc?: string }[] = [
    { screen: 'dashboard', label: 'Field Dashboard', icon: 'dashboard', desc: 'Overview & work queue' },
    { screen: 'templates', label: 'Inspection Templates', icon: 'auto_stories', desc: 'Checklist configurations by business' },
    { screen: 'map', label: 'Offline Field Map', icon: 'map', desc: 'GPS sites & turn-by-turn routing' },
    { screen: 'inspections', label: 'Assigned Inspections', icon: 'fact_check', desc: 'Browse scheduled & drafts' },
    { screen: 'history', label: 'Inspection History & Reports', icon: 'history_edu', desc: 'Completed certificates & audits' },
    { screen: 'sync', label: 'Sync Center', icon: 'sync', desc: 'Offline queue & cloud sync' },
    { screen: 'conflict', label: 'Conflict Resolver Demo', icon: 'warning', desc: 'Review offline server conflicts' },
    { screen: 'profile', label: 'Officer Profile', icon: 'person', desc: 'Officer credentials & stats' },
    { screen: 'security-sessions', label: 'Security & Sessions', icon: 'shield', desc: 'Devices, PIN & biometrics' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-80 max-w-[85vw] bg-[#f8f9fa] h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto border-r border-[#c6c5d4]/50">
        {/* Header */}
        <div>
          <div className="p-5 bg-[#1a237e] text-white flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-sm">
                <img
                  src={ASSETS.logo}
                  alt="MapanSetu Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                SIH 2026 PROTOTYPE
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight">MapanSetu</h2>
              <p className="text-xs text-white/80">Legal Metrology Field Portal</p>
            </div>

            {/* Officer Mini Card */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/15">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/40 shrink-0 bg-white">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
                <p className="text-[11px] text-white/70 font-mono">{profile.badgeNumber}</p>
              </div>
            </div>
          </div>

          {/* Offline/Online Simulation Toggle Box */}
          <div className="m-3 p-3 rounded-xl bg-[#e4e1ea]/60 border border-[#c6c5d4]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isOnline ? 'text-[#2e7d32]' : 'text-[#ba1a1a]'
                  }`}
                >
                  {isOnline ? 'wifi' : 'wifi_off'}
                </span>
                <div>
                  <p className="text-xs font-semibold text-[#1b1b21]">Network Simulator</p>
                  <p className="text-[10px] text-[#454652]">
                    {isOnline ? 'Online & Connected' : 'Simulating Offline Mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={onToggleOnline}
                className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all shadow-xs ${
                  isOnline
                    ? 'bg-[#2e7d32] text-white hover:bg-[#2e7d32]/90'
                    : 'bg-[#ba1a1a] text-white hover:bg-[#ba1a1a]/90'
                }`}
              >
                {isOnline ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>

          {/* Direct Navigation Links */}
          <div className="px-2 py-2 space-y-1">
            <p className="px-3 text-[11px] font-bold text-[#767683] uppercase tracking-wider mb-1">
              Main Navigation
            </p>
            {navItems.map((item) => {
              const isActive = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  onClick={() => {
                    onNavigate(item.screen);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isActive
                      ? 'bg-[#dcdef7] text-[#000666] font-semibold'
                      : 'text-[#1b1b21] hover:bg-[#eae7ef]'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      isActive ? 'text-[#000666] filled' : 'text-[#454652]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{item.label}</p>
                    {item.desc && (
                      <p className="text-[11px] text-[#454652] truncate font-normal">
                        {item.desc}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tool Quick Actions */}
          <div className="px-2 py-2 border-t border-[#c6c5d4]/40 mt-1">
            <p className="px-3 text-[11px] font-bold text-[#767683] uppercase tracking-wider mb-1">
              Field Tools
            </p>

            <button
              onClick={() => {
                onStartNewInspection();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-[#1b1b21] hover:bg-[#eae7ef] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-[#1a237e]">
                add_circle
              </span>
              <span className="text-sm font-medium">Start New Inspection</span>
            </button>

            <button
              onClick={() => {
                onOpenLocationModal();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-[#1b1b21] hover:bg-[#eae7ef] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-[#1a237e]">
                my_location
              </span>
              <span className="text-sm font-medium">GPS Location Capture</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#c6c5d4]/40 bg-[#f5f2fb]">
          <div className="flex items-center justify-between text-xs text-[#454652]">
            <span>App Version: v3.2.1</span>
            <span className="font-mono">SIH-2026</span>
          </div>
          <p className="text-[10px] text-[#767683] mt-1">
            Ministry of Consumer Affairs • Legal Metrology Division
          </p>
        </div>
      </div>
    </div>
  );
};
