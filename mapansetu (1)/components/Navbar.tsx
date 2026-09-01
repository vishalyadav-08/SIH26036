'use client';

import React, { useState } from 'react';
import { UserRole } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { 
  Scale, 
  Globe, 
  Bell, 
  User, 
  ShieldCheck, 
  Store, 
  Search, 
  LogOut, 
  ChevronDown, 
  BookOpen, 
  HelpCircle,
  QrCode,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  unreadNotifsCount: number;
  onOpenQrScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  userRole,
  setUserRole,
  language,
  setLanguage,
  unreadNotifsCount,
  onOpenQrScanner,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const t = translations[language];

  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setShowRoleDropdown(false);
    if (role === 'officer') {
      setCurrentView('admin_dashboard');
    } else if (role === 'merchant') {
      setCurrentView('merchant_dashboard');
    } else {
      setCurrentView('public_verify');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#000666] text-white shadow-md border-b border-[#1a237e]">
      {/* Top Govt Bar */}
      <div className="bg-[#00044d] px-4 py-1 text-xs text-blue-200 border-b border-blue-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            Government of India • Ministry of Consumer Affairs, Food & Public Distribution
          </span>
          <span className="hidden md:inline text-blue-400">|</span>
          <span className="hidden md:inline">Department of Legal Metrology</span>
        </div>
        <div className="flex items-center gap-3 font-medium">
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-500/40">
            {t.prototypeBadge}
          </span>
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer bg-blue-900/60 hover:bg-blue-800 px-2 py-0.5 rounded"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'हिंदी (HI)' : 'English (EN)'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => {
              if (userRole === 'officer') setCurrentView('admin_dashboard');
              else if (userRole === 'merchant') setCurrentView('merchant_dashboard');
              else setCurrentView('public_verify');
            }}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-inner border border-blue-400/40 group-hover:scale-105 transition-transform">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-white">{t.appTitle}</span>
              </div>
              <span className="text-[11px] text-blue-200 block -mt-1 font-medium tracking-wide">
                National Metrology Gateway
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setCurrentView('public_verify')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'public_verify' || currentView === 'public_result'
                  ? 'bg-blue-800/80 text-white font-semibold shadow-sm'
                  : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4 text-blue-300" />
              {t.verification}
            </button>

            {userRole === 'merchant' && (
              <>
                <button
                  onClick={() => setCurrentView('merchant_dashboard')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    currentView === 'merchant_dashboard'
                      ? 'bg-blue-800/80 text-white font-semibold'
                      : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                  }`}
                >
                  {t.dashboard}
                </button>
                <button
                  onClick={() => setCurrentView('instruments')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    currentView === 'instruments' || currentView === 'instrument_passport' || currentView === 'register_instrument'
                      ? 'bg-blue-800/80 text-white font-semibold'
                      : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                  }`}
                >
                  {t.instruments}
                </button>
                <button
                  onClick={() => setCurrentView('application_queue')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    currentView === 'application_queue'
                      ? 'bg-blue-800/80 text-white font-semibold'
                      : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                  }`}
                >
                  {t.applications}
                </button>
              </>
            )}

            {userRole === 'officer' && (
              <>
                <button
                  onClick={() => setCurrentView('admin_dashboard')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    currentView === 'admin_dashboard'
                      ? 'bg-blue-800/80 text-white font-semibold'
                      : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                  }`}
                >
                  {t.operationalDashboard}
                </button>
                <button
                  onClick={() => setCurrentView('application_queue')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    currentView === 'application_queue'
                      ? 'bg-blue-800/80 text-white font-semibold'
                      : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                  }`}
                >
                  {t.appQueue}
                </button>
                <button
                  onClick={() => setCurrentView('instruments')}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    currentView === 'instruments' || currentView === 'instrument_passport'
                      ? 'bg-blue-800/80 text-white font-semibold'
                      : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                  }`}
                >
                  {t.instruments}
                </button>
              </>
            )}

            <button
              onClick={() => setCurrentView('resources')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'resources'
                  ? 'bg-blue-800/80 text-white font-semibold'
                  : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-300" />
              {t.resources}
            </button>
            <button
              onClick={() => setCurrentView('help')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'help'
                  ? 'bg-blue-800/80 text-white font-semibold'
                  : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-blue-300" />
              {t.help}
            </button>
          </nav>
        </div>

        {/* Right Action Icons & Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Quick QR Scanner button */}
          <button
            onClick={onOpenQrScanner}
            className="p-2 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-100 hover:text-white border border-blue-700/50 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-sm"
            title="Scan Physical QR Code"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-lg bg-blue-900/80 hover:bg-blue-800 text-blue-100 hover:text-white border border-blue-700/50 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#000666]">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">Notifications</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {unreadNotifsCount} New
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Certificate Expiring Soon</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Certificate CERT-992 for Electronic Weighing Scale expires in 7 days.
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Application Assigned</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Application APP-2026-041 assigned to Inspector Ramesh Kumar.
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">Yesterday</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-900/90 hover:bg-blue-800 text-white border border-blue-700/60 transition-all cursor-pointer shadow-sm text-xs font-medium"
            >
              {userRole === 'officer' && (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
              {userRole === 'merchant' && (
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Store className="w-3.5 h-3.5" />
                </div>
              )}
              {userRole === 'public' && (
                <div className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-300 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="text-left">
                <span className="block font-semibold leading-tight">
                  {userRole === 'officer' && 'Officer Admin'}
                  {userRole === 'merchant' && 'Demo Retail Store'}
                  {userRole === 'public' && 'Public Citizen'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-300 ml-0.5" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Switch Active Portal Role
                </div>
                <button
                  onClick={() => handleRoleSelect('merchant')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    userRole === 'merchant' ? 'bg-amber-50 font-semibold text-amber-900' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-semibold">Demo Retail Store</div>
                      <div className="text-[10px] text-slate-500">Merchant / Business Owner</div>
                    </div>
                  </div>
                  {userRole === 'merchant' && <span className="text-amber-600 text-xs font-bold">✓</span>}
                </button>

                <button
                  onClick={() => handleRoleSelect('officer')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    userRole === 'officer' ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-semibold">Legal Metrology Officer</div>
                      <div className="text-[10px] text-slate-500">Operational Admin & Inspector</div>
                    </div>
                  </div>
                  {userRole === 'officer' && <span className="text-emerald-600 text-xs font-bold">✓</span>}
                </button>

                <button
                  onClick={() => handleRoleSelect('public')}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    userRole === 'public' ? 'bg-blue-50 font-semibold text-blue-900' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-semibold">Public Citizen Mode</div>
                      <div className="text-[10px] text-slate-500">Verify Certificates & QR</div>
                    </div>
                  </div>
                  {userRole === 'public' && <span className="text-blue-600 text-xs font-bold">✓</span>}
                </button>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      setCurrentView('login');
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Go to Sign-In Screen</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
