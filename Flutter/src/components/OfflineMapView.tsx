import React, { useState } from 'react';
import { InspectionTask, ScreenType } from '../types';

interface OfflineMapViewProps {
  inspections: InspectionTask[];
  onSelectInspection: (task: InspectionTask) => void;
  onNavigateScreen: (screen: ScreenType) => void;
  isOnline: boolean;
}

export const OfflineMapView: React.FC<OfflineMapViewProps> = ({
  inspections,
  onSelectInspection,
  onNavigateScreen,
  isOnline,
}) => {
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(inspections[0]);
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'scheduled' | 'draft' | 'completed'>('all');
  const [mapLayer, setMapLayer] = useState<'streets' | 'topo' | 'satellite'>('streets');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [cachedPackDownloaded, setCachedPackDownloaded] = useState(true);

  // Inspector current simulated GPS
  const officerLocation = {
    lat: 28.6139,
    lng: 77.209,
    address: 'Sector 7 Central Field HQ',
  };

  // Filter tasks with valid coordinates
  const filteredTasks = inspections.filter((task) => {
    if (filterType === 'all') return true;
    if (filterType === 'urgent') return task.urgency === 'urgent';
    if (filterType === 'scheduled') return task.status === 'scheduled';
    if (filterType === 'draft') return task.status === 'draft';
    if (filterType === 'completed') return task.status === 'completed' || task.status === 'ready_to_sync';
    return true;
  });

  // Calculate simulated distance in km from officer
  const getDistance = (task: InspectionTask) => {
    const lat1 = officerLocation.lat;
    const lon1 = officerLocation.lng;
    const lat2 = task.location.lat || 28.62;
    const lon2 = task.location.lng || 77.21;
    const dLat = (lat2 - lat1) * 111;
    const dLon = (lon2 - lon1) * 96;
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    return Math.max(0.4, dist).toFixed(1);
  };

  const handleStartNav = (task: InspectionTask) => {
    setSelectedTask(task);
    setIsNavigating(true);
  };

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-28 w-full flex flex-col gap-4 animate-fade-in">
      {/* Top Map Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#c6c5d4]/70 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#000666] text-[22px]">
              map
            </span>
            <h1 className="text-xl font-extrabold text-[#000666] tracking-tight">
              Offline Field Map
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#dcdef7] text-[#000666]">
              {cachedPackDownloaded ? 'CACHED (18.4 MB)' : 'STREAMING'}
            </span>
          </div>
          <p className="text-xs text-[#454652] mt-0.5">
            {isOnline
              ? 'Real-time GPS lock & satellite layer active'
              : 'Operating in standalone offline vector tile mode'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(
            [
              { id: 'all', label: 'All Sites' },
              { id: 'urgent', label: 'Urgent' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'draft', label: 'Drafts' },
              { id: 'completed', label: 'Done' },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                filterType === filter.id
                  ? 'bg-[#000666] text-white shadow-xs'
                  : 'bg-[#f5f2fb] text-[#454652] hover:bg-[#eae7ef]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas Display */}
      <div className="relative w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden border-2 border-[#c6c5d4]/80 shadow-md bg-[#e6ecf2]">
        {/* SVG Styled Vector Map Background */}
        <div
          className={`absolute inset-0 transition-transform duration-300 ${
            mapLayer === 'satellite'
              ? 'bg-[#1b263b]'
              : mapLayer === 'topo'
              ? 'bg-[#e2e8dd]'
              : 'bg-[#f0ede6]'
          }`}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Street Grid Patterns */}
          <svg className="w-full h-full opacity-70" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#d5d0c7" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* River / Canal */}
            <path
              d="M -50,180 Q 200,240 450,190 T 950,220"
              fill="none"
              stroke="#b5d6f5"
              strokeWidth="28"
              strokeLinecap="round"
            />
            <path
              d="M -50,180 Q 200,240 450,190 T 950,220"
              fill="none"
              stroke="#8bc2f0"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Major Arterial Highways */}
            <path d="M 0,320 L 900,120" stroke="#fbd078" strokeWidth="12" fill="none" />
            <path d="M 0,320 L 900,120" stroke="#ffffff" strokeWidth="6" fill="none" />

            <path d="M 380,0 L 420,600" stroke="#fbd078" strokeWidth="10" fill="none" />
            <path d="M 380,0 L 420,600" stroke="#ffffff" strokeWidth="5" fill="none" />

            {/* Secondary Ring Roads */}
            <path d="M 120,80 Q 500,80 780,380" stroke="#ffffff" strokeWidth="6" fill="none" />
            <path d="M 100,450 Q 400,320 820,480" stroke="#ffffff" strokeWidth="5" fill="none" />

            {/* Sector Labels */}
            <text x="80" y="70" fill="#767683" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              NORTH BYPASS SECTOR
            </text>
            <text x="560" y="90" fill="#767683" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              INDUSTRIAL HUB SECTOR 7G
            </text>
            <text x="140" y="420" fill="#767683" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              CENTRAL TRANSPORT DEPOT
            </text>
            <text x="620" y="460" fill="#767683" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              SOUTH MARKET MANDI ZONE
            </text>

            {/* Active Turn-by-Turn Route Polyline when navigating */}
            {isNavigating && selectedTask && (
              <g>
                <path
                  d={`M 480,260 Q 510,210 ${
                    selectedTask.id === 'task_001'
                      ? '620,130'
                      : selectedTask.id === 'task_042'
                      ? '260,110'
                      : selectedTask.id === 'task_4092'
                      ? '640,190'
                      : selectedTask.id === 'task_105'
                      ? '240,410'
                      : '720,390'
                  }`}
                  fill="none"
                  stroke="#1a237e"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                />
                <circle
                  cx={
                    selectedTask.id === 'task_001'
                      ? 620
                      : selectedTask.id === 'task_042'
                      ? 260
                      : selectedTask.id === 'task_4092'
                      ? 640
                      : selectedTask.id === 'task_105'
                      ? 240
                      : 720
                  }
                  cy={
                    selectedTask.id === 'task_001'
                      ? 130
                      : selectedTask.id === 'task_042'
                      ? 110
                      : selectedTask.id === 'task_4092'
                      ? 190
                      : selectedTask.id === 'task_105'
                      ? 410
                      : 390
                  }
                  r="18"
                  fill="#000666"
                  opacity="0.15"
                />
              </g>
            )}
          </svg>

          {/* Officer Current GPS Marker */}
          <div
            className="absolute top-[260px] left-[480px] -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
            title="Your Current Officer GPS Position"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#1a237e]/20 animate-ping absolute"></div>
              <div className="w-7 h-7 rounded-full bg-[#000666] border-2 border-white shadow-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[15px]">navigation</span>
              </div>
              <span className="absolute -bottom-5 bg-[#000666] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                You (Officer)
              </span>
            </div>
          </div>

          {/* Interactive Inspection Site Pins */}
          {filteredTasks.map((task, idx) => {
            // Distinct mock coordinates on vector grid
            const pinCoordinates: Record<string, { top: number; left: number }> = {
              task_001: { top: 130, left: 620 },
              task_042: { top: 110, left: 260 },
              task_4092: { top: 190, left: 640 },
              task_088: { top: 390, left: 720 },
              task_105: { top: 410, left: 240 },
            };

            const coords = pinCoordinates[task.id] || {
              top: 150 + (idx * 60) % 250,
              left: 200 + (idx * 110) % 500,
            };

            const isSelected = selectedTask?.id === task.id;
            const isUrgent = task.urgency === 'urgent';
            const isDone = task.status === 'completed' || task.status === 'ready_to_sync';

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
                className={`absolute -translate-x-1/2 -translate-y-full z-20 cursor-pointer transition-all duration-200 group ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                <div className="flex flex-col items-center">
                  {/* Floating badge for urgent */}
                  {isUrgent && (
                    <span className="bg-[#ba1a1a] text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase mb-0.5 animate-bounce shadow-xs">
                      URGENT
                    </span>
                  )}

                  {/* Pin Body */}
                  <div
                    className={`w-9 h-9 rounded-full shadow-lg flex items-center justify-center border-2 border-white transition-all ${
                      isUrgent
                        ? 'bg-[#ba1a1a] text-white'
                        : isDone
                        ? 'bg-[#2e7d32] text-white'
                        : task.status === 'draft'
                        ? 'bg-[#f9a825] text-black'
                        : 'bg-[#1a237e] text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isUrgent ? 'warning' : isDone ? 'verified' : task.status === 'draft' ? 'edit' : 'scale'}
                    </span>
                  </div>

                  {/* Pin Stem */}
                  <div
                    className={`w-1 h-2 -mt-0.5 ${
                      isUrgent
                        ? 'bg-[#ba1a1a]'
                        : isDone
                        ? 'bg-[#2e7d32]'
                        : 'bg-[#1a237e]'
                    }`}
                  ></div>

                  {/* Label pill on hover or selected */}
                  {(isSelected || isUrgent) && (
                    <div className="bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-md border border-[#c6c5d4] mt-1 text-center whitespace-nowrap">
                      <p className="text-[10px] font-bold text-[#000666] leading-tight truncate max-w-[130px]">
                        {task.title}
                      </p>
                      <p className="text-[8px] text-[#5a5d72] font-mono">{task.appId}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Control Tools Bar (Right side) */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 bg-white/90 backdrop-blur-xs p-1.5 rounded-2xl shadow-md border border-[#c6c5d4]/70">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 1.75))}
            className="w-9 h-9 rounded-xl hover:bg-[#e4e1ea] flex items-center justify-center text-[#1b1b21] transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="w-9 h-9 rounded-xl hover:bg-[#e4e1ea] flex items-center justify-center text-[#1b1b21] transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          <div className="w-full h-px bg-[#c6c5d4]/60 my-0.5"></div>
          <button
            onClick={() => {
              setZoomLevel(1);
              setSelectedTask(inspections[0]);
            }}
            className="w-9 h-9 rounded-xl hover:bg-[#e4e1ea] flex items-center justify-center text-[#000666] transition-colors"
            title="Center on GPS"
          >
            <span className="material-symbols-outlined text-[20px]">my_location</span>
          </button>
          <button
            onClick={() =>
              setMapLayer((l) =>
                l === 'streets' ? 'topo' : l === 'topo' ? 'satellite' : 'streets'
              )
            }
            className="w-9 h-9 rounded-xl hover:bg-[#e4e1ea] flex items-center justify-center text-[#1b1b21] transition-colors"
            title={`Layer: ${mapLayer}`}
          >
            <span className="material-symbols-outlined text-[20px]">layers</span>
          </button>
        </div>

        {/* Turn-by-Turn Instruction Banner when navigating */}
        {isNavigating && selectedTask && (
          <div className="absolute top-4 left-4 right-16 sm:right-auto sm:max-w-md z-30 bg-[#000666] text-white p-3.5 rounded-2xl shadow-xl border border-white/20 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">turn_right</span>
              </div>
              <div>
                <p className="text-xs font-bold leading-snug">
                  In 350m, Turn Right onto Sector 7 Main Road
                </p>
                <p className="text-[10px] text-white/75">
                  Heading to {selectedTask.businessName} • {getDistance(selectedTask)} km (Est. 4 mins)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsNavigating(false)}
              className="p-1 text-white/70 hover:text-white rounded-full hover:bg-white/10"
              title="Stop Navigation"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}

        {/* Selected Task Bottom Float Card */}
        {selectedTask && (
          <div className="absolute bottom-4 left-4 right-4 z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#c6c5d4] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  selectedTask.urgency === 'urgent'
                    ? 'bg-[#ba1a1a]/15 text-[#ba1a1a]'
                    : selectedTask.status === 'completed'
                    ? 'bg-[#2e7d32]/15 text-[#2e7d32]'
                    : 'bg-[#dcdef7] text-[#000666]'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {selectedTask.urgency === 'urgent'
                    ? 'warning'
                    : selectedTask.status === 'completed'
                    ? 'verified'
                    : 'scale'}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#000666]">
                    {selectedTask.appId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      selectedTask.urgency === 'urgent'
                        ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                        : selectedTask.status === 'completed'
                        ? 'bg-[#2e7d32]/10 text-[#2e7d32]'
                        : 'bg-[#f5f2fb] text-[#454652]'
                    }`}
                  >
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1b1b21] leading-tight">
                  {selectedTask.title} • {selectedTask.businessName}
                </h3>
                <p className="text-xs text-[#5a5d72]">
                  {selectedTask.sector} • <span className="font-semibold text-[#000666]">{getDistance(selectedTask)} km away</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isNavigating ? (
                <button
                  onClick={() => handleStartNav(selectedTask)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-full border border-[#000666] text-[#000666] hover:bg-[#dcdef7] text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">directions</span>
                  <span>Navigate</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsNavigating(false)}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-full bg-[#e4e1ea] text-[#454652] text-xs font-bold"
                >
                  End Nav
                </button>
              )}

              <button
                onClick={() => onSelectInspection(selectedTask)}
                className="flex-1 sm:flex-none px-5 py-2 rounded-full bg-[#000666] hover:bg-[#1a237e] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>{selectedTask.status === 'completed' ? 'View Certificate' : 'Begin Inspection'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Offline Map Cache Manager Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#dcdef7] text-[#000666] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">download_for_offline</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1b1b21]">
              District 4 Offline Vector Map Pack
            </h4>
            <p className="text-xs text-[#5a5d72]">
              18.4 MB cached on local storage • Street grids, sector boundaries, and offline route graphs
            </p>
          </div>
        </div>

        <button
          onClick={() => setCachedPackDownloaded(true)}
          className="px-4 py-1.5 rounded-full border border-[#c6c5d4] hover:bg-[#f5f2fb] text-xs font-semibold text-[#1b1b21] transition-colors self-start sm:self-auto"
        >
          Check for Updates
        </button>
      </div>
    </main>
  );
};
