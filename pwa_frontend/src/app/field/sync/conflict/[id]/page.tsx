"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/offline/db';
import { syncService } from '@/services/field/sync.service';
import { SyncOperation } from '@/offline/types';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ConflictResolutionScreen({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [operation, setOperation] = useState<SyncOperation | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (!resolvedParams?.id) return;
    
    db.syncQueue.get(resolvedParams.id).then(op => {
      if (op) setOperation(op);
    });
  }, [resolvedParams]);

  if (!operation) return <div className="p-8 text-center text-gray-500">Loading conflict details...</div>;

  const handleResolveClient = async () => {
    setIsResolving(true);
    // Explicitly create a resolution payload 
    const resolutionPayload = {
      ...(operation.payload as any),
      resolvedConflict: true,
      forceOverwrite: true 
    };
    await syncService.resolveConflict(operation.clientOperationId, resolutionPayload);
    setIsResolving(false);
    router.push('/field/sync');
  };

  const handleResolveServer = async () => {
    setIsResolving(true);
    // Discard local operation and accept server
    await db.syncQueue.update(operation.clientOperationId, { status: 'SYNCED', lastError: 'Discarded in favor of server' });
    setIsResolving(false);
    router.push('/field/sync');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link href="/field/sync" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Resolve Conflict</h1>
      </div>

      <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
        <div className="flex items-center gap-3 text-purple-800 mb-4">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="font-bold text-lg">Server Version Mismatch</h2>
        </div>
        <p className="text-sm text-purple-700 mb-4">
          This inspection changed on the server while you were offline. You must explicitly choose how to proceed. 
        </p>
        
        <div className="bg-white rounded-lg p-4 border border-purple-100 text-sm mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase">Your Client Data</div>
              <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(operation.payload, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase">Expected Version</div>
              <div className="mt-1 text-sm font-mono bg-gray-50 p-2 rounded">
                v{operation.expectedServerVersion || 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleResolveClient}
            disabled={isResolving}
            className="flex-1 bg-purple-600 text-white font-medium py-2.5 rounded-lg shadow-sm hover:bg-purple-700 disabled:opacity-50"
          >
            Keep Mine (Overwrite)
          </button>
          <button 
            onClick={handleResolveServer}
            disabled={isResolving}
            className="flex-1 bg-white text-purple-700 font-medium py-2.5 rounded-lg border border-purple-200 shadow-sm hover:bg-purple-50 disabled:opacity-50"
          >
            Discard Mine
          </button>
        </div>
      </div>
    </div>
  );
}
