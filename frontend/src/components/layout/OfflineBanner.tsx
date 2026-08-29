"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { isOfflineSimulated, setOfflineSimulated } from "@/lib/offline-storage";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    Promise.resolve().then(() => {
      setIsOnline(navigator.onLine);
      setIsSimulated(isOfflineSimulated());
    });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleSimulation = () => {
    const newVal = !isSimulated;
    setOfflineSimulated(newVal);
    setIsSimulated(newVal);
    // Dispatch storage event so other components react
    window.dispatchEvent(new Event("storage"));
  };

  const effectiveOffline = !isOnline || isSimulated;

  return (
    <div
      className={`px-4 py-2 text-xs transition-colors flex items-center justify-between border-b ${
        effectiveOffline
          ? "bg-amber-500 text-slate-950 border-amber-600 font-medium"
          : "bg-emerald-600 text-white border-emerald-700"
      }`}
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          {effectiveOffline ? (
            <>
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>
                <strong>Offline Mode Active:</strong> Inspections saved locally to IndexedDB/Storage. Operations will queue as <code>READY_TO_SYNC</code>.
              </span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 shrink-0" />
              <span>
                <strong>Online:</strong> Connected to server API. Direct sync enabled.
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggleSimulation}
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
            effectiveOffline
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-white/20 hover:bg-white/30 text-white"
          }`}
          title="Toggle simulated offline mode for SIH demo testing"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{effectiveOffline ? "Switch Online" : "Simulate Offline"}</span>
        </button>
      </div>
    </div>
  );
}
