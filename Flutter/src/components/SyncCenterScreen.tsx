import React, { useState } from 'react';
import { SyncQueueItem } from '../types';

interface SyncCenterScreenProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  syncQueue: SyncQueueItem[];
  onSyncAll: () => void;
  onRetryItem: (item: SyncQueueItem) => void;
  onTriggerConflictDemo: () => void;
}

export const SyncCenterScreen: React.FC<SyncCenterScreenProps> = ({
  isOnline,
  onToggleOnline,
  syncQueue,
  onSyncAll,
  onRetryItem,
  onTriggerConflictDemo,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const handleStartSync = () => {
    if (!isOnline) {
      alert('Device is currently in Offline Mode. Please enable connection or toggle network simulator to online.');
      return;
    }

    setIsSyncing(true);
    setSyncProgress(10);

    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          onSyncAll();
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const pendingCount = syncQueue.filter((i) => i.status !== 'synced').length;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-32 w-full space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1b1b21] tracking-tight mb-1">
          Sync Center
        </h1>
        <p className="text-sm text-[#454652]">
          Manage your offline database synchronization and cloud backups.
        </p>
      </div>

      {/* Connectivity Banner */}
      {!isOnline ? (
        <div className="w-full bg-[#ffdad6] text-[#93000a] rounded-2xl p-4 flex items-start justify-between gap-3 border border-[#ba1a1a]/30 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5 text-[22px]">
              wifi_off
            </span>
            <div>
              <h3 className="text-sm font-bold">Offline Mode Active</h3>
              <p className="text-xs text-[#93000a]/90 mt-0.5">
                All inspections are stored safely in local database. Syncing will resume when connectivity returns.
              </p>
            </div>
          </div>
          <button
            onClick={onToggleOnline}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#ba1a1a] text-white hover:bg-[#ba1a1a]/90 shrink-0"
          >
            Go Online
          </button>
        </div>
      ) : (
        <div className="w-full bg-[#2e7d32]/10 text-[#2e7d32] rounded-2xl p-4 flex items-start justify-between gap-3 border border-[#2e7d32]/30 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5 text-[22px] filled">
              cloud_done
            </span>
            <div>
              <h3 className="text-sm font-bold">Online & Synchronized</h3>
              <p className="text-xs text-[#2e7d32]/90 mt-0.5">
                Connected to secure government servers. High speed upload active.
              </p>
            </div>
          </div>
          <button
            onClick={onToggleOnline}
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#2e7d32] text-white hover:bg-[#2e7d32]/90 shrink-0"
          >
            Simulate Offline
          </button>
        </div>
      )}

      {/* Sync Status Card */}
      <div className="w-full bg-white rounded-2xl p-6 shadow-xs border border-[#c6c5d4]/70 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#dcdef7] text-[#171a2c] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">
              cloud_upload
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1b1b21]">
              {pendingCount > 0 ? `${pendingCount} Items Ready` : 'All Items Up to Date'}
            </h3>
            <p className="text-xs text-[#454652] mt-0.5">
              {isOnline
                ? 'Ready for instant cloud synchronization.'
                : 'Waiting for network connection to sync.'}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-2">
          <button
            onClick={handleStartSync}
            disabled={!isOnline || isSyncing || pendingCount === 0}
            className={`w-full sm:w-auto h-12 px-8 rounded-full font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all ${
              !isOnline || pendingCount === 0
                ? 'bg-[#e4e1ea] text-[#767683] cursor-not-allowed opacity-75'
                : isSyncing
                ? 'bg-[#1a237e] text-white animate-pulse'
                : 'bg-[#000666] hover:bg-[#1a237e] text-white active:scale-95'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isSyncing ? 'animate-spin' : ''
              }`}
            >
              sync
            </span>
            <span>{isSyncing ? `Syncing (${syncProgress}%)...` : 'Sync All Data'}</span>
          </button>

          {/* Quick Trigger Conflict Demo Button */}
          <button
            onClick={onTriggerConflictDemo}
            className="text-[11px] font-semibold text-[#000666] hover:underline"
          >
            Demo: Test Conflict Resolution Flow →
          </button>
        </div>
      </div>

      {/* Progress Bar when syncing */}
      {isSyncing && (
        <div className="w-full bg-[#e4e1ea] rounded-full h-2 overflow-hidden">
          <div
            className="bg-[#000666] h-2 rounded-full transition-all duration-300"
            style={{ width: `${syncProgress}%` }}
          />
        </div>
      )}

      {/* Pending Operations List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1b1b21]">
            Pending Operations
          </h3>
          <span className="text-xs text-[#767683]">
            Offline-first database queue
          </span>
        </div>

        <div className="space-y-3">
          {syncQueue.map((item) => {
            const isFailed = item.status === 'failed';
            return (
              <div
                key={item.id}
                className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-all ${
                  isFailed
                    ? 'bg-[#ffdad6]/20 border-[#ffdad6]'
                    : 'bg-white border-[#c6c5d4]/70'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`material-symbols-outlined mt-0.5 text-[22px] shrink-0 ${
                      isFailed
                        ? 'text-[#ba1a1a]'
                        : item.type === 'draft'
                        ? 'text-[#5a5d72]'
                        : 'text-[#000666]'
                    }`}
                  >
                    {isFailed ? 'error' : item.type === 'draft' ? 'draft' : 'image'}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#1b1b21] leading-tight">
                      {item.appId} • {item.title}
                    </p>
                    {isFailed && item.errorMsg ? (
                      <p className="text-xs text-[#ba1a1a] font-medium mt-0.5">
                        Failed: {item.errorMsg}
                      </p>
                    ) : (
                      <p className="text-xs text-[#454652] mt-0.5">
                        {item.type === 'draft' ? 'Local Draft' : 'Evidence attachment in queue'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isFailed ? (
                    <button
                      onClick={() => onRetryItem(item)}
                      className="h-8 px-4 rounded-full border border-[#ba1a1a] text-[#ba1a1a] font-semibold text-xs hover:bg-[#ffdad6] transition-colors flex items-center gap-1 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        refresh
                      </span>
                      <span>Retry</span>
                    </button>
                  ) : item.status === 'queue' ? (
                    <span className="text-xs font-semibold text-[#000666] px-3 py-1 bg-[#dcdef7] rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">
                        cloud_queue
                      </span>
                      <span>Queue</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[#454652] px-3 py-1 bg-[#e4e1ea] rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};
