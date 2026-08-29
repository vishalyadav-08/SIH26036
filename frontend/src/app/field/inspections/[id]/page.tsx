"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckSquare, Activity, Camera, FileCheck, Loader2, Download, CloudOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectionsService } from '@/services/field/inspections.service';
import { offlineService } from '@/services/field/offline.service';
import { useState, useEffect } from 'react';
import { Inspection } from '@/offline/types';

export default function InspectionOverview() {
  const params = useParams() as { id: string };
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => setIsOnline(navigator.onLine), 0);
    const updateOnline = () => setIsOnline(true);
    const updateOffline = () => setIsOnline(false);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOffline);

    // Check if cached
    offlineService.getCachedInspection(params.id).then(res => {
      if (res) setCachedAt(res.cachedAt);
    });

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOffline);
    };
  }, [params.id]);

  const { data: inspection, isLoading, isError } = useQuery({
    queryKey: ['inspections', params.id],
    queryFn: async () => {
      if (!navigator.onLine) {
        const cached = await offlineService.getCachedInspection(params.id);
        if (cached) return cached.snapshot as Inspection;
        throw new Error("Offline and not cached");
      }
      return inspectionsService.getById(params.id);
    },
  });

  const cacheMutation = useMutation({
    mutationFn: async (insp: Inspection) => {
      await offlineService.cacheInspection(insp);
      setCachedAt(Date.now());
    }
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => inspectionsService.startInspection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections', params.id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p>Loading application data...</p>
      </div>
    );
  }

  if (isError || !inspection) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200 m-4">
        <CloudOff className="w-8 h-8 mx-auto text-red-400 mb-2" />
        <p className="text-red-600 font-medium">Inspection unavailable</p>
        <p className="text-sm text-red-500 mt-1">This inspection is not cached for offline use. Connect to the internet to load it.</p>
        <Link href="/field/inspections" className="mt-4 text-blue-600 font-medium inline-block text-sm">
          Return to List
        </Link>
      </div>
    );
  }

  const isStarted = inspection.applicationState !== 'ASSIGNED';

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <Link href="/field/inspections" className="p-2 -ml-2 bg-transparent rounded-full hover:bg-gray-100 active:bg-gray-200">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 line-clamp-1">{inspection.businessName}</h1>
      </div>

      {!isOnline && cachedAt && (
        <div className="bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-lg flex justify-between items-center">
          <span className="font-semibold flex items-center gap-1"><CloudOff className="w-3 h-3"/> Offline Mode</span>
          <span>Last updated: {new Date(cachedAt).toLocaleTimeString()}</span>
        </div>
      )}

      {isOnline && !cachedAt && (
        <button 
          onClick={() => cacheMutation.mutate(inspection)}
          disabled={cacheMutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {cacheMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span className="font-medium text-sm">Save for Offline</span>
        </button>
      )}

      {cachedAt && isOnline && (
        <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 py-2 rounded-lg border border-green-100 text-sm">
          <CheckSquare className="w-4 h-4" />
          <span className="font-medium">Available Offline</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Application Details</h2>
            <p className="text-xs text-gray-500">{inspection.applicationNumber}</p>
          </div>
          <span className="inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
            {inspection.syncStatus.replace(/_/g, ' ')}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500 text-xs">Instrument No.</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{inspection.instrumentNumber}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs">Type</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{inspection.instrumentType}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-gray-500 text-xs">Location</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{inspection.location}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-gray-500 text-xs">State</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{inspection.applicationState}</dd>
          </div>
        </dl>
      </div>

      {!isStarted ? (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <h3 className="font-medium text-blue-900 mb-2">Ready to Start</h3>
          <p className="text-sm text-blue-700 mb-4">You must start this inspection to unlock the workflow steps.</p>
          <button 
            onClick={() => startMutation.mutate(params.id)}
            disabled={startMutation.isPending || (!isOnline && !cachedAt)}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center"
          >
            {startMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            Start Inspection
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Workflow Steps</h3>
          
          <WorkflowLink 
            href={`/field/inspections/${inspection.id}/checklist`}
            icon={<CheckSquare className="w-5 h-5" />}
            title="1. Checklist"
            description="Basic compliance verification"
            status="pending"
          />
          
          <WorkflowLink 
            href={`/field/inspections/${inspection.id}/readings`}
            icon={<Activity className="w-5 h-5" />}
            title="2. Readings"
            description="Enter instrument test values"
            status="pending"
          />
          
          <WorkflowLink 
            href={`/field/inspections/${inspection.id}/evidence`}
            icon={<Camera className="w-5 h-5" />}
            title="3. Evidence"
            description="Capture photos and documents"
            status="pending"
          />
          
          <WorkflowLink 
            href={`/field/inspections/${inspection.id}/review`}
            icon={<FileCheck className="w-5 h-5" />}
            title="4. Review & Sign-off"
            description="Finalize decision and save"
            status="pending"
          />
        </div>
      )}
    </div>
  );
}

function WorkflowLink({ href, icon, title, description, status }: { 
  href: string; icon: React.ReactNode; title: string; description: string; status: 'completed' | 'pending' | 'locked' 
}) {
  const isLocked = status === 'locked';
  return (
    <Link 
      href={isLocked ? '#' : href}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
        isLocked 
          ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' 
          : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm active:scale-[0.98]'
      }`}
      aria-disabled={isLocked}
    >
      <div className={`p-2 rounded-lg ${isLocked ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
