"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Camera, Image as ImageIcon, MapPin, Trash2, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { offlineService } from '@/services/field/offline.service';
import { db } from '@/offline/db';

export default function EvidenceScreen() {
  const params = useParams() as { id: string };
  const [evidenceList, setEvidenceList] = useState<{id?: number, name: string, url: string, gps: boolean}[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load offline evidence on mount
  useEffect(() => {
    if (!db) return;
    db.evidenceBlobs.where('inspectionId').equals(params.id).toArray().then(blobs => {
      const loaded = blobs.map(b => ({
        id: b.id,
        name: b.fileName,
        url: URL.createObjectURL(b.data),
        gps: !!b.gpsLocation
      }));
      setEvidenceList(loaded);
    });
  }, [params.id]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      let gpsLocation = null;
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          gpsLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          };
        } catch (e) {
          console.warn('GPS Error:', e);
        }
      }

      if (db) {
        const id = await db.evidenceBlobs.put({
          inspectionId: params.id,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          data: file,
          capturedAt: Date.now(),
          gpsLocation
        });
        return { id, url: URL.createObjectURL(file), gps: !!gpsLocation, name: file.name };
      }
      return { url: URL.createObjectURL(file), gps: false, name: file.name };
    },
    onSuccess: (data) => {
      setEvidenceList(prev => [...prev, data]);
      setErrorMsg('');
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || 'Failed to capture evidence');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File rejected: Maximum size is 10 MiB.");
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("File rejected: Unsupported file format.");
      return;
    }
    
    uploadMutation.mutate(file);
  };

  const removeEvidence = async (index: number) => {
    const item = evidenceList[index];
    if (item.id && db) {
      await db.evidenceBlobs.delete(item.id);
    }
    setEvidenceList(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link href={`/field/inspections/${params.id}`} className="p-2 -ml-2 bg-transparent rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Evidence</h1>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-800">
        <p><strong>Note:</strong> Photos captured here will be compressed and stamped with GPS coordinates when available.</p>
      </div>

      {errorMsg && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {errorMsg}
        </div>
      )}

      {/* Capture Controls */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          {uploadMutation.isPending ? <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" /> : <Camera className="w-8 h-8 text-gray-400 mb-2" />}
          <span className="font-medium text-gray-700 text-sm">Take Photo</span>
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          {uploadMutation.isPending ? <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" /> : <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />}
          <span className="font-medium text-gray-700 text-sm">Upload File</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg, image/png, image/webp, application/pdf" 
          onChange={handleFileChange}
        />
      </div>

      {/* Captured Evidence List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Captured Evidence ({evidenceList.length})</h3>
        
        {evidenceList.map((ev, idx) => (
          <div key={idx} className="flex gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
              <img src={ev.url} alt="evidence" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900 line-clamp-1">{ev.name}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{ev.gps ? 'GPS Captured' : 'No GPS'}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">Attached</span>
                <button onClick={() => removeEvidence(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {evidenceList.length === 0 && !uploadMutation.isPending && (
          <p className="text-sm text-gray-500 text-center py-4">No evidence attached yet.</p>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-between z-10 md:static md:bg-transparent md:border-0 md:p-0">
        <Link 
          href={`/field/inspections/${params.id}/readings`}
          className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          Back
        </Link>
        <Link 
          href={`/field/inspections/${params.id}/review`}
          className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
        >
          Next: Review
        </Link>
      </div>
    </div>
  );
}
