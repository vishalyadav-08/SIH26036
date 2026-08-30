"use client";

import Link from 'next/link';
import { Search, MapPin, Calendar, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { inspectionsService } from '@/services/field/inspections.service';
import { Inspection } from '@/offline/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function InspectionsList() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: inspections, isLoading, isError, error } = useQuery({
    queryKey: ['inspections', 'assigned'],
    queryFn: () => inspectionsService.getAssigned(),
  });

  const filteredInspections = inspections?.filter(i => 
    i.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Inspections</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by ID or Business..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-3 min-h-[300px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
            <p>Loading assigned inspections...</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
            <p className="text-red-600 font-medium">Failed to load inspections</p>
            <p className="text-xs text-red-500 mt-1">{(error as Error).message}</p>
          </div>
        )}

        {(!isLoading && !isError && filteredInspections.length > 0) && filteredInspections.map(inspection => (
          <InspectionCard key={inspection.id} inspection={inspection} />
        ))}
        
        {(!isLoading && !isError && filteredInspections.length === 0) && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No assigned inspections found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InspectionCard({ inspection }: { inspection: Inspection }) {
  const isDraft = inspection.syncStatus === 'LOCAL_DRAFT';
  const isReady = inspection.syncStatus === 'READY_TO_SYNC';

  return (
    <Link href={`/field/inspections/${inspection.id}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-blue-200 transition-all active:scale-[0.98]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{inspection.businessName}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{inspection.applicationNumber}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-1.5 mb-3">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{inspection.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
          <span>{new Date(inspection.scheduledAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50">
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {inspection.instrumentType}
        </span>
        <span className={cn(
          "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
          isDraft ? "bg-orange-100 text-orange-800" :
          isReady ? "bg-green-100 text-green-800" :
          "bg-blue-100 text-blue-800"
        )}>
          {isDraft && <Clock className="w-3 h-3 mr-1" />}
          {inspection.syncStatus.replace(/_/g, ' ')}
        </span>
      </div>
    </Link>
  );
}
