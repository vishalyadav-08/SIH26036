"use client";

import Link from 'next/link';
import { ClipboardList, Clock, CheckCircle, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLiveQuery } from 'dexie-react-hooks';
import { inspectionsService } from '@/services/field/inspections.service';
import { db } from '@/offline/db';

export default function FieldDashboard() {
  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections', 'assigned'],
    queryFn: () => inspectionsService.getAssigned()
  });

  // Fetch real offline stats from Dexie
  const draftsCount = useLiveQuery(() => db?.inspectionDrafts.count() ?? 0) ?? 0;
  const readyToSyncCount = useLiveQuery(() => db?.syncQueue.where('status').equals('READY_TO_SYNC').count() ?? 0) ?? 0;
  const failedCount = useLiveQuery(() => db?.syncQueue.where('status').equals('FAILED').count() ?? 0) ?? 0;
  const conflictCount = useLiveQuery(() => db?.syncQueue.where('status').equals('CONFLICT').count() ?? 0) ?? 0;

  const pendingCount = inspections.filter(i => i.applicationState !== 'COMPLETED').length;

  return (
    <div className="space-y-6 pb-20">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Officer</p>
      </section>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatusCard 
          title="Pending Work" 
          value={isLoading ? '-' : pendingCount} 
          icon={<Clock className="w-5 h-5 text-blue-500" />} 
          href="/field/inspections"
        />
        <StatusCard 
          title="Assigned" 
          value={isLoading ? '-' : inspections.length} 
          icon={<ClipboardList className="w-5 h-5 text-indigo-500" />} 
          href="/field/inspections"
        />
        <StatusCard 
          title="Local Drafts" 
          value={draftsCount} 
          icon={<CheckCircle className="w-5 h-5 text-orange-500" />} 
          href="/field/inspections"
        />
        <StatusCard 
          title="Ready to Sync" 
          value={readyToSyncCount} 
          icon={<AlertTriangle className="w-5 h-5 text-green-500" />} 
          href="/field/sync"
        />
      </div>

      {(failedCount > 0 || conflictCount > 0) && (
        <section className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2 text-red-800 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            Action Required
          </div>
          <p className="text-sm text-red-700">
            You have {failedCount > 0 ? `${failedCount} failed` : ''} 
            {failedCount > 0 && conflictCount > 0 ? ' and ' : ''} 
            {conflictCount > 0 ? `${conflictCount} conflicted` : ''} sync operations requiring attention.
          </p>
          <Link href="/field/sync" className="mt-3 inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
            Resolve Now
          </Link>
        </section>
      )}

      {/* Next Inspection / Actions */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 mt-6">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="space-y-3">
          <Link 
            href="/field/inspections"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-md text-blue-700">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Open Inspections</p>
                <p className="text-xs text-gray-500">View your assigned cases</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link 
            href="/field/sync"
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-100"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-md text-green-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Sync Data</p>
                <p className="text-xs text-gray-500">{readyToSyncCount} operations pending</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatusCard({ title, value, icon, href }: { title: string; value: number | string; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="flex flex-col p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all active:scale-95">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </Link>
  );
}
