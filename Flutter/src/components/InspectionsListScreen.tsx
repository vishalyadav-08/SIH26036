import React, { useState, useMemo } from 'react';
import { InspectionTask, InspectionStatus } from '../types';

interface InspectionsListScreenProps {
  inspections: InspectionTask[];
  onSelectInspection: (task: InspectionTask) => void;
  onStartNewInspection: () => void;
  onOpenTemplates?: () => void;
}

export const InspectionsListScreen: React.FC<InspectionsListScreenProps> = ({
  inspections,
  onSelectInspection,
  onStartNewInspection,
  onOpenTemplates,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InspectionStatus>('all');

  const filteredInspections = useMemo(() => {
    return inspections.filter((task) => {
      const matchesSearch =
        task.appId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.sector.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inspections, searchQuery, statusFilter]);

  const renderBadge = (status: InspectionStatus) => {
    switch (status) {
      case 'scheduled':
      case 'urgent':
        return (
          <div className="bg-[#dcdef7] text-[#171a2c] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Scheduled</span>
          </div>
        );
      case 'draft':
        return (
          <div className="bg-[#f9a825]/20 text-[#b26a00] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">draft</span>
            <span>Local Draft</span>
          </div>
        );
      case 'ready_to_sync':
        return (
          <div className="bg-[#1a237e] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-xs">
            <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
            <span>Ready to Sync</span>
          </div>
        );
      case 'completed':
        return (
          <div className="bg-[#2e7d32]/20 text-[#2e7d32] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Completed</span>
          </div>
        );
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32 w-full space-y-6">
      {/* Header & Actions */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-3xl font-extrabold text-[#000666] tracking-tight">
            Assigned Inspections
          </h1>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onOpenTemplates && (
              <button
                onClick={onOpenTemplates}
                className="bg-[#f5f2fb] hover:bg-[#eae7ef] text-[#000666] border border-[#c6c5d4] text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">auto_stories</span>
                <span>From Template</span>
              </button>
            )}
            <button
              onClick={onStartNewInspection}
              className="bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#454652] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search App-ID or Business..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#767683]/50 bg-[#f5f2fb] text-[#1b1b21] focus:bg-white focus:border-[#000666] focus:ring-1 focus:ring-[#000666] text-sm outline-none transition-all placeholder:text-[#767683]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#454652] hover:text-[#1b1b21]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-11 px-3.5 pr-8 rounded-xl bg-[#eae7ef] border border-[#c6c5d4] text-[#1b1b21] text-xs font-semibold appearance-none focus:outline-none focus:ring-1 focus:ring-[#000666] cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Local Draft</option>
              <option value="ready_to_sync">Ready to Sync</option>
              <option value="completed">Completed</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#454652] text-[18px] pointer-events-none">
              filter_list
            </span>
          </div>
        </div>

        {/* Filter Quick Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 mt-3 scrollbar-none">
          {[
            { id: 'all', label: 'All (' + inspections.length + ')' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'draft', label: 'Drafts' },
            { id: 'ready_to_sync', label: 'Ready to Sync' },
            { id: 'completed', label: 'Completed' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === pill.id
                  ? 'bg-[#000666] text-white shadow-xs'
                  : 'bg-[#e4e1ea]/70 text-[#454652] hover:bg-[#e4e1ea]'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Inspection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInspections.map((task) => {
          const isCompleted = task.status === 'completed';
          return (
            <div
              key={task.id}
              onClick={() => onSelectInspection(task)}
              className={`bg-white rounded-2xl border border-[#c6c5d4]/70 p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md hover:border-[#000666] transition-all cursor-pointer group active:scale-[0.99] ${
                isCompleted ? 'opacity-80' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-xs font-bold text-[#000666] uppercase tracking-wider mb-1">
                    {task.appId}
                  </div>
                  <h2 className="text-xl font-bold text-[#1b1b21] group-hover:text-[#000666] transition-colors leading-snug">
                    {task.title}
                  </h2>
                  <p className="text-sm text-[#454652] mt-0.5">
                    {task.businessName}
                  </p>
                </div>
                <div>{renderBadge(task.status)}</div>
              </div>

              <div className="mt-auto pt-3 border-t border-[#e4e1ea] flex items-center justify-between text-[#454652]">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="material-symbols-outlined text-[16px]">
                    {isCompleted ? 'event_available' : 'calendar_today'}
                  </span>
                  <span>{task.scheduledTime}</span>
                </div>

                <span className="text-xs font-bold text-[#000666] group-hover:translate-x-1 transition-transform flex items-center">
                  <span>Open</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </span>
              </div>
            </div>
          );
        })}

        {filteredInspections.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-dashed border-[#c6c5d4] p-12 text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl text-[#767683] mb-2">
              search_off
            </span>
            <p className="text-base font-bold text-[#1b1b21]">No inspections found</p>
            <p className="text-xs text-[#454652] mt-1">
              Try adjusting your search query or filter settings
            </p>
          </div>
        )}
      </div>
    </main>
  );
};
