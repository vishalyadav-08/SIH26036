import React, { useState } from 'react';
import { ASSETS } from '../data/initialData';

interface LocationCaptureModalProps {
  onClose: () => void;
  onConfirmLocation?: (lat: number, lng: number, address: string) => void;
}

export const LocationCaptureModal: React.FC<LocationCaptureModalProps> = ({
  onClose,
  onConfirmLocation,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<
    'available' | 'unavailable' | 'denied' | 'acquiring'
  >('available');

  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  }>({
    lat: 28.6139,
    lng: 77.209,
    accuracy: 4.2,
  });

  const handleCaptureLiveGPS = () => {
    setSelectedScenario('acquiring');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            accuracy: Number(pos.coords.accuracy.toFixed(1)),
          });
          setSelectedScenario('available');
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setSelectedScenario('denied');
          } else {
            setSelectedScenario('unavailable');
          }
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      setTimeout(() => {
        setSelectedScenario('available');
      }, 1200);
    }
  };

  const handleApply = () => {
    if (onConfirmLocation) {
      onConfirmLocation(
        currentCoords.lat,
        currentCoords.lng,
        'Okhla Industrial Area Phase III, New Delhi'
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#f8f9fa] w-full max-w-2xl min-h-screen md:min-h-0 md:max-h-[90vh] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#c6c5d4]/60 animate-fade-in">
        {/* Header */}
        <header className="bg-white border-b border-[#c6c5d4]/60 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#eae7ef] rounded-full active:scale-95 transition-all text-[#1b1b21]"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-[#000666] tracking-tight">
              Location Capture
            </h1>
          </div>
          <div className="flex items-center gap-1 text-[#2e7d32]">
            <span className="material-symbols-outlined text-[20px]">cloud_done</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Header Info */}
          <div>
            <h2 className="text-2xl font-bold text-[#1b1b21] tracking-tight">
              Inspection Site GPS
            </h2>
            <p className="text-sm text-[#454652] mt-1 leading-relaxed">
              Review and confirm the location states below. A valid GPS lock is recommended but not mandatory to proceed with the inspection form.
            </p>
          </div>

          {/* Map Preview Card */}
          <div className="bg-[#f3f4f5] rounded-2xl border border-[#c6c5d4]/80 overflow-hidden flex flex-col shadow-xs">
            <div className="relative w-full h-48 sm:h-56 bg-[#e1e3e4] overflow-hidden">
              <img
                src={ASSETS.mapPreview}
                alt="Map Preview"
                className="w-full h-full object-cover opacity-85"
                referrerPolicy="no-referrer"
              />

              {/* Precise Crosshair Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#000666] bg-[#000666]/15 animate-ping opacity-75" />
                  <div className="absolute w-6 h-6 rounded-full bg-[#000666] border-2 border-white shadow-md flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>

              {/* Coordinates Pill on Map */}
              <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono text-[#1b1b21] border border-[#c6c5d4] shadow-xs">
                Lat: {currentCoords.lat}° N, Long: {currentCoords.lng}° E
              </div>
            </div>

            <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white">
              <div>
                <span className="text-sm font-bold text-[#1b1b21] block">
                  Current Coordinates
                </span>
                <span className="text-xs text-[#454652]">
                  Tap to update high-accuracy location lock
                </span>
              </div>

              <button
                onClick={handleCaptureLiveGPS}
                className="w-full sm:w-auto bg-[#000666] hover:bg-[#1a237e] text-white rounded-full px-6 py-3 min-h-[48px] text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
              >
                <span className="material-symbols-outlined filled text-[18px]">
                  my_location
                </span>
                <span>Capture Location</span>
              </button>
            </div>
          </div>

          <hr className="border-[#c6c5d4]/60" />

          {/* GPS Status Scenarios Switcher */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1b1b21]">
                GPS Status Scenarios
              </h3>
              <span className="text-xs text-[#767683]">
                Simulate status modes
              </span>
            </div>

            {/* State 1: Location Available */}
            <div
              onClick={() => setSelectedScenario('available')}
              className={`bg-white rounded-2xl border p-4 flex gap-4 items-start relative overflow-hidden cursor-pointer transition-all ${
                selectedScenario === 'available'
                  ? 'border-[#2e7d32] ring-2 ring-[#2e7d32]/20 shadow-xs'
                  : 'border-[#c6c5d4]/60 hover:bg-[#f5f2fb]'
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#2e7d32]" />
              <div className="mt-0.5 ml-2 bg-[#2e7d32]/10 text-[#2e7d32] p-2 rounded-full shrink-0">
                <span className="material-symbols-outlined filled text-[20px]">
                  check_circle
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-[#1b1b21]">
                    Location Available
                  </span>
                  <span className="text-[10px] font-bold text-[#2e7d32] bg-[#2e7d32]/10 px-2 py-0.5 rounded-full uppercase">
                    High Accuracy
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-2 text-xs">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-[#1b1b21]">
                    <span className="material-symbols-outlined text-[15px] text-[#454652]">
                      pin_drop
                    </span>
                    <span>{currentCoords.lat}° N, {currentCoords.lng}° E</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#454652]">
                    <span className="material-symbols-outlined text-[15px]">
                      radar
                    </span>
                    <span>Accuracy: ± {currentCoords.accuracy}m</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#454652]">
                    <span className="material-symbols-outlined text-[15px]">
                      schedule
                    </span>
                    <span>Captured: Just now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* State 2: Location Unavailable */}
            <div
              onClick={() => setSelectedScenario('unavailable')}
              className={`bg-white rounded-2xl border p-4 flex gap-4 items-start relative overflow-hidden cursor-pointer transition-all ${
                selectedScenario === 'unavailable'
                  ? 'border-[#f9a825] ring-2 ring-[#f9a825]/20 shadow-xs'
                  : 'border-[#c6c5d4]/60 hover:bg-[#f5f2fb]'
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#f9a825]" />
              <div className="mt-0.5 ml-2 bg-[#f9a825]/15 text-[#b26a00] p-2 rounded-full shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  location_disabled
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-[#1b1b21] block">
                  Location Unavailable
                </span>
                <p className="text-xs text-[#454652] mt-1 leading-relaxed">
                  Location services are currently disabled on your device. Inspection can proceed without coordinates.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCaptureLiveGPS();
                  }}
                  className="mt-2.5 border border-[#767683] text-[#1b1b21] rounded-full px-3.5 py-1.5 text-xs font-semibold hover:bg-[#eae7ef] transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    settings
                  </span>
                  <span>Enable Services</span>
                </button>
              </div>
            </div>

            {/* State 3: Permission Denied */}
            <div
              onClick={() => setSelectedScenario('denied')}
              className={`bg-white rounded-2xl border p-4 flex gap-4 items-start relative overflow-hidden cursor-pointer transition-all ${
                selectedScenario === 'denied'
                  ? 'border-[#ba1a1a] ring-2 ring-[#ba1a1a]/20 shadow-xs'
                  : 'border-[#c6c5d4]/60 hover:bg-[#f5f2fb]'
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ba1a1a]" />
              <div className="mt-0.5 ml-2 bg-[#ffdad6] text-[#93000a] p-2 rounded-full shrink-0">
                <span className="material-symbols-outlined filled text-[20px]">
                  warning
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-[#1b1b21] block">
                  Permission Denied
                </span>
                <p className="text-xs text-[#ba1a1a] mt-1 leading-relaxed">
                  Location permission is required to capture coordinates automatically. Please allow access in settings.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCaptureLiveGPS();
                  }}
                  className="mt-2.5 bg-[#ba1a1a] text-white rounded-full px-3.5 py-1.5 text-xs font-semibold hover:bg-[#ba1a1a]/90 transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    app_settings_alt
                  </span>
                  <span>Open Settings</span>
                </button>
              </div>
            </div>

            {/* State 4: Acquiring Satellites */}
            <div
              onClick={() => setSelectedScenario('acquiring')}
              className={`bg-white rounded-2xl border p-4 flex gap-4 items-center relative overflow-hidden cursor-pointer transition-all ${
                selectedScenario === 'acquiring'
                  ? 'border-[#0288D1] ring-2 ring-[#0288D1]/20 shadow-xs'
                  : 'border-[#c6c5d4]/60 hover:bg-[#f5f2fb]'
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#0288D1]" />
              <div className="ml-2 relative flex items-center justify-center w-10 h-10 shrink-0">
                <div className="absolute inset-0 border-2 border-[#0288D1] rounded-full animate-ping opacity-60" />
                <span className="material-symbols-outlined text-[#0288D1] text-[22px]">
                  satellite_alt
                </span>
              </div>
              <div className="flex-1 min-w-0 ml-1">
                <span className="text-sm font-bold text-[#1b1b21] block">
                  Acquiring Satellites...
                </span>
                <span className="text-xs text-[#454652]">
                  Hold device steady. Searching for best signal.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-[#c6c5d4]/60 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#454652] hover:bg-[#eae7ef] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 bg-[#000666] hover:bg-[#1a237e] text-white rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all"
          >
            Confirm & Save GPS Lock
          </button>
        </div>
      </div>
    </div>
  );
};
