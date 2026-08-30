"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertTriangle, FileCheck, Loader2, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offlineService } from '@/services/field/offline.service';
import { DecisionPayload } from '@/services/field/inspections.service';
import { useState, useEffect } from 'react';

export default function ReviewScreen() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [decision, setDecision] = useState<DecisionPayload['decision'] | null>(null);
  const [notes, setNotes] = useState('');
  const [gps, setGps] = useState<DecisionPayload['gpsLocation']>(null);
  const [gpsStatus, setGpsStatus] = useState('Fetching...');

  const { data: inspection, isLoading } = useQuery({
    queryKey: ['inspections', params.id],
    queryFn: async () => {
      const cached = await offlineService.getCachedInspection(params.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (cached?.snapshot as any) || null;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: DecisionPayload) => {
      // 1. Validate local data conceptually
      // 2. Save decision to inspection drafts
      await offlineService.saveDraft(params.id, {
        result: payload.decision,
        notes: payload.notes,
        gpsLocation: payload.gpsLocation,
        localState: 'READY_TO_SYNC'
      });
      // 3. Create syncQueue operation
      await offlineService.enqueueSyncOperation({
        clientOperationId: crypto.randomUUID(),
        entityType: 'INSPECTION',
        entityId: params.id,
        operationType: 'SUBMIT_DECISION',
        payload,
        expectedServerVersion: '1'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      router.push('/field/inspections');
    }
  });

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          });
          setGpsStatus('Available');
        },
        (err) => {
          setGpsStatus(err.code === err.PERMISSION_DENIED ? 'Permission denied' : 'Unavailable');
        }
      );
    } else {
      setTimeout(() => setGpsStatus('Unsupported device'), 0);
    }
  }, []);

  const handleSubmit = () => {
    if (!decision) return;
    if (!window.confirm("Are you sure you want to submit this inspection? The server controls the final state transition.")) return;

    submitMutation.mutate({ decision, notes, gpsLocation: gps });
  };

  if (isLoading || !inspection) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Link href={`/field/inspections/${params.id}`} className="p-2 -ml-2 bg-transparent rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Review & Sign-off</h1>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Offline Mode Active: Submitting this form will save your decision locally and queue it for future sync.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Inspection Summary</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between border-b pb-3 border-gray-100 text-sm">
            <span className="text-gray-500">Business</span>
            <span className="font-medium text-gray-900">{inspection.businessName}</span>
          </div>
          <div className="flex justify-between border-b pb-3 border-gray-100 text-sm">
            <span className="text-gray-500">GPS / Time</span>
            <span className="font-medium flex items-center gap-1 text-gray-900">
              {gps ? <MapPin className="w-3 h-3 text-green-500" /> : null}
              {gpsStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Decision Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Final Decision</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button 
            onClick={() => setDecision('PASS')}
            className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
              decision === 'PASS' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-6 h-6 mb-2" />
            <span className="font-bold">PASS</span>
          </button>
          
          <button 
            onClick={() => setDecision('REQUIRES_CORRECTION')}
            className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
              decision === 'REQUIRES_CORRECTION' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="w-6 h-6 mb-2" />
            <span className="font-bold text-sm text-center leading-tight">REQUIRES<br/>CORRECTION</span>
          </button>

          <button 
            onClick={() => setDecision('FAIL')}
            className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${
              decision === 'FAIL' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileCheck className="w-6 h-6 mb-2" />
            <span className="font-bold text-sm">FAIL</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Final Remarks</label>
        <textarea 
          rows={3} 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border-gray-200 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3" 
          placeholder="Add any final notes for the report..."
        />
      </div>

      {submitMutation.isError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          Failed to submit decision: {(submitMutation.error as Error).message}
        </div>
      )}

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-between z-10 md:static md:bg-transparent md:border-0 md:p-0">
        <Link 
          href={`/field/inspections/${params.id}/evidence`}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          Back
        </Link>
        <button 
          onClick={handleSubmit}
          disabled={!decision || submitMutation.isPending}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {submitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Decision
        </button>
      </div>
    </div>
  );
}
