'use client';

import React from 'react';
import { VerificationApplication, AuditLog } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { 
  Plus, 
  Download, 
  LayoutDashboard, 
  FileText, 
  Scale, 
  Users, 
  Calendar, 
  Award, 
  ShieldAlert, 
  Settings, 
  HelpCircle, 
  TrendingUp, 
  UserCheck, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Activity
} from 'lucide-react';

interface AdminDashboardViewProps {
  language: Language;
  applications: VerificationApplication[];
  auditLogs: AuditLog[];
  onOpenNewApplication: () => void;
  onNavigate: (view: string) => void;
  onAssignOfficer: (app: VerificationApplication) => void;
  onReviewApplication: (app: VerificationApplication) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  language,
  applications,
  auditLogs,
  onOpenNewApplication,
  onNavigate,
  onAssignOfficer,
  onReviewApplication,
}) => {
  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
            {/* Sidebar Title */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{t.adminPanel}</span>
              </div>
              <p className="text-xs text-slate-500">{t.operationalManagement}</p>
            </div>

            {/* "+ New Verification" Button */}
            <button
              onClick={onOpenNewApplication}
              className="w-full py-2.5 px-4 bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-950/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newVerification}</span>
            </button>

            {/* Sidebar Menu Items */}
            <nav className="space-y-1 text-xs">
              <button
                onClick={() => onNavigate('admin_dashboard')}
                className="w-full px-3 py-2 rounded-xl text-left font-semibold flex items-center gap-2.5 bg-blue-50 text-blue-900 border border-blue-200 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-800" />
                <span>{t.dashboard}</span>
              </button>

              <button
                onClick={() => onNavigate('application_queue')}
                className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>{t.applications}</span>
              </button>

              <button
                onClick={() => onNavigate('instruments')}
                className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Scale className="w-4 h-4 text-slate-500" />
                <span>{t.instruments}</span>
              </button>

              <button
                onClick={() => onNavigate('officers')}
                className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>{t.officers}</span>
              </button>

              <button
                onClick={() => onNavigate('schedules')}
                className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{t.schedules}</span>
              </button>

              <button
                onClick={() => onNavigate('public_verify')}
                className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Award className="w-4 h-4 text-slate-500" />
                <span>{t.certificates}</span>
              </button>

              <button
                onClick={() => onNavigate('audit')}
                className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-slate-500" />
                <span>{t.audit}</span>
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>{t.settings}</span>
              </button>

              <button
                onClick={() => onNavigate('help')}
                className="w-full px-3 py-2 rounded-xl text-left font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>{t.helpCenter}</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Right Main Content (3 Columns in Grid) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Header & Export Report Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t.operationalDashboard}
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">{t.systemOversightSub}</p>
            </div>

            <button
              onClick={() => alert('Exporting monthly operational compliance PDF report...')}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4 text-blue-700" />
              <span>{t.exportReport}</span>
            </button>
          </div>

          {/* 3 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Total Applications */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t.totalApps}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">14,208</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12% from last month</span>
              </div>
            </div>

            {/* Officer Workload */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t.officerWorkload}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">84%</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }} />
              </div>
            </div>

            {/* Expiring Certificates */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t.expiringCerts}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-700">342</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold mt-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Requires inspector outreach</span>
              </div>
            </div>
          </div>

          {/* 2-Column: Applications by State & Admin Audit Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications by State Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    {t.appsByState}
                  </h2>
                  <button
                    onClick={() => onNavigate('application_queue')}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-3">
                  {applications.slice(4, 8).map((app) => (
                    <div
                      key={app.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-slate-900">{app.id}</div>
                        <div className="text-[11px] text-slate-600">{app.businessName}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.state === 'ASSIGNED'
                              ? 'bg-blue-100 text-blue-800'
                              : app.state === 'SUBMITTED'
                              ? 'bg-purple-100 text-purple-800'
                              : app.state === 'IN PROGRESS'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {app.state}
                        </span>

                        {app.state === 'SUBMITTED' ? (
                          <button
                            onClick={() => onAssignOfficer(app)}
                            className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs"
                          >
                            Assign
                          </button>
                        ) : (
                          <button
                            onClick={() => onReviewApplication(app)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-[11px] font-semibold cursor-pointer"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Audit Activity */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>{t.adminAuditActivity}</span>
                </h2>
                <span className="text-[11px] text-slate-400">Live Stream</span>
              </div>

              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{log.title}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                        {log.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
