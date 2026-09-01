'use client';

import React, { useState } from 'react';
import { VerificationApplication, Officer } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { 
  Search, 
  Filter, 
  Calendar, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ChevronRight, 
  ShieldCheck,
  Building2,
  FileText
} from 'lucide-react';

interface ApplicationQueueViewProps {
  language: Language;
  applications: VerificationApplication[];
  officers: Officer[];
  onAssignOfficer: (app: VerificationApplication) => void;
  onScheduleInspection: (app: VerificationApplication) => void;
  onReviewApplication: (app: VerificationApplication) => void;
  onOpenNewApplication: () => void;
}

export const ApplicationQueueView: React.FC<ApplicationQueueViewProps> = ({
  language,
  applications,
  officers,
  onAssignOfficer,
  onScheduleInspection,
  onReviewApplication,
  onOpenNewApplication,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [officerFilter, setOfficerFilter] = useState('ALL');

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.instrumentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.instrumentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = stateFilter === 'ALL' || app.state === stateFilter;
    const matchesOfficer =
      officerFilter === 'ALL' || (app.officer && app.officer.includes(officerFilter));

    return matchesSearch && matchesState && matchesOfficer;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <FileText className="w-4 h-4 text-blue-700" />
            <span>Operational Verification Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.appQueue}
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">{t.manageAssignSub}</p>
        </div>

        <button
          onClick={onOpenNewApplication}
          className="px-4 py-2.5 bg-[#000666] hover:bg-[#1a237e] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-950/20 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Applications..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
            />
          </div>

          {/* State Filter Dropdown */}
          <div className="relative">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
            >
              <option value="ALL">All States</option>
              <option value="SUBMITTED">SUBMITTED (Unassigned)</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN PROGRESS">IN PROGRESS</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="DRAFT">DRAFT</option>
            </select>
          </div>

          {/* Officer Filter Dropdown */}
          <div className="relative">
            <select
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#000666]"
            >
              <option value="ALL">All Officers</option>
              {officers.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">App ID</th>
                <th className="px-5 py-3.5">Business</th>
                <th className="px-5 py-3.5">Instrument</th>
                <th className="px-5 py-3.5">State</th>
                <th className="px-5 py-3.5">Assigned Officer</th>
                <th className="px-5 py-3.5">Scheduled Date</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {app.id}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      <div>{app.businessName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{app.location}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{app.instrumentType}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{app.instrumentId}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
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
                    <td className="px-5 py-4">
                      {app.officer ? (
                        <div className="flex items-center gap-1.5 font-medium text-slate-900">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{app.officer}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {app.scheduledDate ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.scheduledDate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending Date</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {app.state === 'SUBMITTED' ? (
                          <button
                            onClick={() => onAssignOfficer(app)}
                            className="px-3 py-1.5 bg-[#000666] hover:bg-[#1a237e] text-white font-semibold rounded-lg transition-colors text-[11px] shadow-xs cursor-pointer"
                          >
                            Assign
                          </button>
                        ) : app.state === 'ASSIGNED' ? (
                          <button
                            onClick={() => onScheduleInspection(app)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-[11px] shadow-xs cursor-pointer"
                          >
                            Schedule
                          </button>
                        ) : (
                          <button
                            onClick={() => onReviewApplication(app)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold rounded-lg transition-colors text-[11px] cursor-pointer"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No verification applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredApplications.length}</span> applications in queue
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Real-time dispatch connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
