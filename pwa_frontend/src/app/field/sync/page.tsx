"use client";

import Link from 'next/link';
import { RefreshCw, Clock, CheckCircle, Database, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { offlineService } from '@/services/field/offline.service';
import { syncService } from '@/services/field/sync.service';
import { SyncOperation } from '@/offline/types';
import { db } from '@/offline/db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function SyncCenterScreen() {
  const [isSyncing, setIsSyncing] = useState(false);

  // Use Dexie live query for real-time reactivity
  const queue = useLiveQuery(() => db ? db.syncQueue.toArray() : []) || [];
  const draftsCount = useLiveQuery(() => db ? db.inspectionDrafts.count() : 0) || 0;
  
  const readyCount = queue.filter(q => q.status === 'READY_TO_SYNC').length;
  const syncingCount = queue.filter(q => q.status === 'SYNCING').length;
  const syncedCount = queue.filter(q => q.status === 'SYNCED').length;
  const failedCount = queue.filter(q => q.status === 'FAILED').length;
  const conflictCount = queue.filter(q => q.status === 'CONFLICT').length;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await syncService.triggerSync();
    setIsSyncing(false);
  };

  const handleRetry = async (id: string) => {
    await syncService.retryOperation(id);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sync Center</h1>
      </div>

      {/* Sync Status Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Local Data Storage</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-[250px] mx-auto">
          {readyCount > 0 
            ? `${readyCount} operations waiting to sync with the server.`
            : "No pending items to sync."}
        </p>

        <button 
          onClick={handleSyncNow}
          disabled={isSyncing || readyCount === 0}
          className="mt-6 w-full max-w-[200px] flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatBox value={draftsCount} label="Local Drafts" />
        <StatBox value={readyCount} label="Ready" color="text-orange-700" bg="bg-orange-50" border="border-orange-100" />
        <StatBox value={syncingCount} label="Syncing" color="text-blue-700" bg="bg-blue-50" border="border-blue-100" />
        <StatBox value={failedCount} label="Failed" color="text-red-700" bg="bg-red-50" border="border-red-100" />
        <StatBox value={conflictCount} label="Conflict" color="text-purple-700" bg="bg-purple-50" border="border-purple-100" />
        <StatBox value={syncedCount} label="Synced" color="text-green-700" bg="bg-green-50" border="border-green-100" />
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Operations Log</h3>
        
        {queue.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-8 text-center">
            <CheckCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900">Queue is empty</h4>
          </div>
        )}

        {queue.sort((a, b) => b.createdAt - a.createdAt).map(op => (
          <OperationCard key={op.clientOperationId} op={op} onRetry={() => handleRetry(op.clientOperationId)} />
        ))}
      </div>
    </div>
  );
}

function StatBox({ value, label, color = "text-gray-900", bg = "bg-white", border = "border-gray-100" }: { value: number, label: string, color?: string, bg?: string, border?: string }) {
  return (
    <div className={`${bg} border ${border} rounded-xl p-4 shadow-sm`}>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

function OperationCard({ op, onRetry }: { op: SyncOperation, onRetry: () => void }) {
  const getIcon = () => {
    switch (op.status) {
      case 'READY_TO_SYNC': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'SYNCING': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'SYNCED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'CONFLICT': return <AlertTriangle className="w-4 h-4 text-purple-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (op.status) {
      case 'READY_TO_SYNC': return 'bg-orange-100 text-orange-700';
      case 'SYNCING': return 'bg-blue-100 text-blue-700';
      case 'SYNCED': return 'bg-green-100 text-green-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      case 'CONFLICT': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex p-1.5 rounded-lg ${getStatusColor().split(' ')[0]}`}>
            {getIcon()}
          </span>
          <div>
            <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{op.operationType.replace(/_/g, ' ')}</h4>
            <p className="text-xs text-gray-500">{op.entityType} • {new Date(op.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${getStatusColor()}`}>
          {op.status.replace(/_/g, ' ')}
        </span>
      </div>

      {op.lastError && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
          Error: {op.lastError} (Attempts: {op.attemptCount})
        </div>
      )}

      <div className="mt-3 flex gap-2 justify-end">
        {op.status === 'FAILED' && (
          <button onClick={onRetry} className="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1.5 bg-blue-50 rounded">
            Retry
          </button>
        )}
        {op.status === 'CONFLICT' && (
          <Link href={`/field/sync/conflict/${op.clientOperationId}`} className="text-xs font-medium text-purple-600 hover:text-purple-800 px-3 py-1.5 bg-purple-50 rounded">
            Resolve
          </Link>
        )}
      </div>
    </div>
  );
}
