'use client';

import React from 'react';
import { VerificationApplication, NotificationItem } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { 
  Plus, 
  PlusCircle, 
  FileText, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ExternalLink,
  Store,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface MerchantDashboardViewProps {
  language: Language;
  applications: VerificationApplication[];
  notifications: NotificationItem[];
  onOpenNewApplication: () => void;
  onOpenRegisterInstrument: () => void;
  onViewAllApplications: () => void;
  onViewInstruments: () => void;
  onSelectApplication: (appId: string) => void;
  onSelectCertificate: (certId: string) => void;
}

export const MerchantDashboardView: React.FC<MerchantDashboardViewProps> = ({
  language,
  applications,
  notifications,
  onOpenNewApplication,
  onOpenRegisterInstrument,
  onViewAllApplications,
  onViewInstruments,
  onSelectApplication,
  onSelectCertificate,
}) => {
  const t = translations[language];

  // Derive counts
  const activeAppsCount = applications.filter(a => a.state !== 'APPROVED' && a.state !== 'REJECTED').length;
  const recentApps = applications.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Store className="w-4 h-4 text-amber-600" />
            <span>Merchant Business Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.goodMorning}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">{t.manageInstrumentsSub}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenNewApplication}
            className="px-4 py-2.5 bg-[#000666] hover:bg-[#1a237e] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-950/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newVerifAppBtn}</span>
          </button>
          <button
            onClick={onOpenRegisterInstrument}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-blue-700" />
            <span>{t.registerInstBtn}</span>
          </button>
        </div>
      </div>

      {/* 3 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Active Applications */}
        <div 
          onClick={onViewAllApplications}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.activeApps}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{activeAppsCount || 12}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              +2 this week
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Pending review & field inspections</p>
        </div>

        {/* Certificates */}
        <div 
          onClick={onViewInstruments}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.certificates}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">8</span>
            <span className="text-xs text-slate-500 font-medium">Active Passports</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Legally stamped & calibrated devices</p>
        </div>

        {/* Expiring Certificates (High-Priority Alert Card) */}
        <div 
          onClick={() => onSelectCertificate('CERT-992')}
          className="bg-amber-50/70 rounded-2xl p-6 border border-amber-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">{t.expiringCerts}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-950">3</span>
            <span className="text-xs text-amber-800 font-bold bg-amber-200/80 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-1">Due within 30 days — initiate renewal</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2/3: Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.recentApps}</h2>
              <p className="text-xs text-slate-500">Real-time status of verification filings</p>
            </div>
            <button
              onClick={onViewAllApplications}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{t.viewAll}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Application ID</th>
                  <th className="px-5 py-3">Instrument</th>
                  <th className="px-5 py-3">State</th>
                  <th className="px-5 py-3">Scheduled Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentApps.map((app) => (
                  <tr 
                    key={app.id}
                    onClick={() => onSelectApplication(app.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {app.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{app.instrumentType}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{app.instrumentId}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          app.state === 'ASSIGNED'
                            ? 'bg-blue-100 text-blue-800'
                            : app.state === 'SUBMITTED'
                            ? 'bg-purple-100 text-purple-800'
                            : app.state === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.state === 'IN PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {app.state}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {app.scheduledDate || 'Pending Schedule'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs font-semibold text-blue-700 group-hover:underline">
                        View →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1/3: Recent Notifications Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">{t.recentNotifs}</h2>
            <span className="text-[11px] font-medium text-slate-400">Live Alerts</span>
          </div>

          <div className="space-y-3.5 flex-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/80 flex items-start gap-3 cursor-pointer"
                onClick={() => {
                  if (n.title.toLowerCase().includes('certificate')) {
                    onSelectCertificate('CERT-992');
                  } else {
                    onViewAllApplications();
                  }
                }}
              >
                <div className="mt-0.5 shrink-0">
                  {n.type === 'warning' && (
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                  {n.type === 'info' && (
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  )}
                  {n.type === 'success' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{n.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-medium mt-1.5 block">{n.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onSelectCertificate('CERT-992')}
              className="w-full py-2 text-center text-xs font-semibold text-[#000666] hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Renew Expiring Certificate (CERT-992)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
