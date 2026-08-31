import React from 'react';
import { InspectionTask, OfficerProfile } from '../types';

interface DashboardScreenProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  profile: OfficerProfile;
  inspections: InspectionTask[];
  onStartInspection: (task: InspectionTask) => void;
  onViewAllInspections: () => void;
  onGoToSync: () => void;
  onOpenDetails: (task: InspectionTask) => void;
  onOpenMap?: () => void;
  onOpenHistory?: () => void;
  onOpenTemplates?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  isOnline,
  onToggleOnline,
  profile,
  inspections,
  onStartInspection,
  onViewAllInspections,
  onGoToSync,
  onOpenDetails,
  onOpenMap,
  onOpenHistory,
  onOpenTemplates,
}) => {
  // Compute workload numbers dynamically
  const assignedCount = inspections.filter((t) => t.status === 'scheduled' || t.status === 'urgent').length;
  const inProgressCount = inspections.filter((t) => t.status === 'draft').length > 0 ? 1 : 0;
  const draftsCount = inspections.filter((t) => t.status === 'draft').length;
  const readyToSyncCount = inspections.filter((t) => t.status === 'ready_to_sync').length + (isOnline ? 0 : 1);

  // Urgent and Scheduled items
  const urgentTask = inspections.find((t) => t.urgency === 'urgent') || inspections[0];
  const scheduledTask = inspections.find((t) => t.id === 'task_001') || inspections[0];

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 md:px-12 pb-32 max-w-7xl mx-auto w-full space-y-8">
      {/* Dashboard Header & Connectivity Bar */}
      <section className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1b1b21] tracking-tight mb-1">
            Dashboard
          </h2>
          <p className="text-base text-[#454652]">
            Welcome back to the field, {profile.name}.
          </p>
        </div>

        {/* Connectivity Status Card with Interactive Toggle */}
        <div className="flex items-center bg-[#f5f2fb] rounded-xl p-2 border border-[#c6c5d4]/40 shadow-xs">
          <div
            onClick={onToggleOnline}
            className="flex items-center gap-2.5 pr-4 border-r border-[#c6c5d4] cursor-pointer group select-none"
            title="Click to toggle network state simulation"
          >
            <span
              className={`material-symbols-outlined filled text-[24px] transition-colors ${
                isOnline ? 'text-[#2e7d32]' : 'text-[#ba1a1a]'
              }`}
            >
              {isOnline ? 'wifi' : 'wifi_off'}
            </span>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#1b1b21] group-hover:text-[#000666]">
                {isOnline ? 'Online & Synchronized' : 'Offline Mode Active'}
              </p>
              <p className="text-[11px] text-[#454652]">
                {isOnline ? 'Connected to secure network' : 'Local storage fallback'}
              </p>
            </div>
          </div>

          <div className="pl-4 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#454652] text-[20px]">
              schedule
            </span>
            <div>
              <p className="text-[10px] text-[#454652] uppercase font-bold tracking-wider">
                Last Sync
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#1b1b21]">
                {profile.lastSync}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Buttons */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => onStartInspection(scheduledTask)}
          className="bg-[#000666] hover:bg-[#1a237e] text-white font-semibold text-xs sm:text-sm rounded-xl h-12 px-3 flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Inspection</span>
        </button>

        {onOpenTemplates && (
          <button
            onClick={onOpenTemplates}
            className="bg-[#f5f2fb] hover:bg-[#eae7ef] text-[#000666] font-semibold text-xs sm:text-sm rounded-xl h-12 px-3 flex items-center justify-center gap-1.5 transition-all border border-[#c6c5d4] active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            <span>Templates</span>
          </button>
        )}

        {onOpenMap && (
          <button
            onClick={onOpenMap}
            className="bg-[#dcdef7] hover:bg-[#c8ccf7] text-[#000666] font-semibold text-xs sm:text-sm rounded-xl h-12 px-3 flex items-center justify-center gap-1.5 transition-all border border-[#c6c5d4]/50 active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            <span>Offline Map</span>
          </button>
        )}

        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="bg-white hover:bg-[#f5f2fb] text-[#1b1b21] font-semibold text-xs sm:text-sm rounded-xl h-12 px-3 flex items-center justify-center gap-1.5 transition-all border border-[#c6c5d4] active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">history_edu</span>
            <span>History</span>
          </button>
        )}

        <button
          onClick={onGoToSync}
          className="bg-[#f5f2fb] hover:bg-[#eae7ef] text-[#171a2c] font-semibold text-xs sm:text-sm rounded-xl h-12 px-3 flex items-center justify-center gap-1.5 transition-all border border-[#c6c5d4]/60 active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">sync</span>
          <span>Sync Center</span>
        </button>
      </section>

      {/* Workload Overview Bento Grid */}
      <section>
        <h3 className="text-xl font-bold text-[#1b1b21] mb-4 tracking-tight">
          Workload Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Assigned */}
          <div
            onClick={onViewAllInspections}
            className="bg-white rounded-2xl p-5 border border-[#c6c5d4]/60 shadow-xs flex flex-col justify-between hover:border-[#000666] transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-[#000666] text-[28px]">
                assignment
              </span>
              <span className="text-4xl font-extrabold text-[#000666] leading-none">
                {assignedCount || 4}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1b1b21] group-hover:text-[#000666]">Assigned</p>
              <p className="text-xs text-[#454652]">Pending action</p>
            </div>
          </div>

          {/* In Progress */}
          <div
            onClick={onViewAllInspections}
            className="bg-white rounded-2xl p-5 border border-[#c6c5d4]/60 shadow-xs flex flex-col justify-between hover:border-[#f9a825] transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-[#f9a825] text-[28px]">
                pending_actions
              </span>
              <span className="text-4xl font-extrabold text-[#1b1b21] leading-none">
                {inProgressCount || 1}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1b1b21] group-hover:text-[#f9a825]">In Progress</p>
              <p className="text-xs text-[#454652]">Currently active</p>
            </div>
          </div>

          {/* Local Drafts */}
          <div
            onClick={onViewAllInspections}
            className="bg-white rounded-2xl p-5 border border-[#c6c5d4]/60 shadow-xs flex flex-col justify-between hover:border-[#5a5d72] transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-[#5a5d72] text-[28px]">
                draft
              </span>
              <span className="text-4xl font-extrabold text-[#1b1b21] leading-none">
                {draftsCount || 2}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-[#1b1b21] group-hover:text-[#5a5d72]">Local Drafts</p>
              <p className="text-xs text-[#454652]">Saved on device</p>
            </div>
          </div>

          {/* Ready to Sync */}
          <div
            onClick={onGoToSync}
            className="bg-white rounded-2xl p-5 border border-[#c6c5d4]/60 shadow-xs flex flex-col justify-between relative overflow-hidden hover:border-[#2e7d32] transition-all cursor-pointer group"
          >
            <div className="absolute right-0 top-0 w-16 h-16 bg-[#2e7d32]/10 rounded-bl-full flex items-start justify-end p-2 pointer-events-none" />
            <div className="flex justify-between items-start mb-4 z-10 relative">
              <span className="material-symbols-outlined text-[#2e7d32] text-[28px]">
                cloud_upload
              </span>
              <span className="text-4xl font-extrabold text-[#2e7d32] leading-none">
                {readyToSyncCount || 3}
              </span>
            </div>
            <div className="z-10 relative">
              <p className="text-sm font-bold text-[#1b1b21] group-hover:text-[#2e7d32]">Ready to Sync</p>
              <p className="text-xs text-[#454652]">Requires connection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Work Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#1b1b21] tracking-tight">
            Today's Work
          </h3>
          <button
            onClick={onViewAllInspections}
            className="text-sm font-bold text-[#000666] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="space-y-3">
          {/* Urgent Task Card */}
          <div className="bg-white rounded-2xl p-5 border-l-4 border-[#ba1a1a] border-y border-r border-[#c6c5d4]/60 shadow-xs flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#ffdad6] text-[#93000a] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Urgent
                </span>
                <span className="text-xs text-[#454652] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {urgentTask.sector}
                </span>
              </div>
              <h4 className="text-base font-bold text-[#1b1b21] leading-tight">
                {urgentTask.title}
              </h4>
              <p className="text-sm text-[#454652] mt-1 line-clamp-2">
                {urgentTask.description}
              </p>
            </div>

            <div className="flex gap-2 sm:flex-col justify-end w-full sm:w-auto shrink-0">
              <button
                onClick={() => onStartInspection(urgentTask)}
                className="flex-1 sm:flex-none bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-semibold rounded-xl h-10 px-5 flex items-center justify-center active:scale-95 transition-all shadow-xs"
              >
                Begin
              </button>
              <button
                onClick={() => onOpenDetails(urgentTask)}
                className="flex-1 sm:flex-none bg-[#f5f2fb] hover:bg-[#eae7ef] text-[#1b1b21] text-xs font-semibold rounded-xl h-10 px-5 flex items-center justify-center border border-[#c6c5d4] active:scale-95 transition-all"
              >
                Details
              </button>
            </div>
          </div>

          {/* Scheduled Task Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#c6c5d4]/60 shadow-xs flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-[#dcdef7] text-[#171a2c] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Scheduled
                </span>
                <span className="text-xs text-[#454652] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {scheduledTask.scheduledTime}
                </span>
              </div>
              <h4 className="text-base font-bold text-[#1b1b21] leading-tight">
                {scheduledTask.title}
              </h4>
              <p className="text-sm text-[#454652] mt-1 line-clamp-2">
                {scheduledTask.description}
              </p>
            </div>

            <div className="flex gap-2 sm:flex-col justify-end w-full sm:w-auto shrink-0">
              <button
                onClick={() => onStartInspection(scheduledTask)}
                className="flex-1 sm:flex-none bg-[#f5f2fb] hover:bg-[#eae7ef] text-[#1b1b21] text-xs font-semibold rounded-xl h-10 px-5 flex items-center justify-center border border-[#c6c5d4] active:scale-95 transition-all"
              >
                Start Soon
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
