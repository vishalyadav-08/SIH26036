# Field App Execution Plan

This document contains the exact, copy-pasteable code for the entire Field Mobile PWA (Offline-First). The application uses React, Vite, Dexie.js for offline storage, and Workbox for PWA service workers.

## 1. Project Configuration

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Mapansetu Field App',
        short_name: 'Mapansetu',
        description: 'Offline-first field inspection app for Mapansetu',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapansetu\.com\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60 // 24 hours
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
```

## 2. Offline Database

### `src/db/database.ts`
```typescript
import Dexie, { Table } from 'dexie';

export interface InspectionTask {
  id: string;
  establishmentName: string;
  address: string;
  scheduledDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface PendingSync {
  id?: number;
  taskId: string;
  payload: any;
  photos: Blob[];
  timestamp: number;
  status: 'pending' | 'failed';
  errorMessage?: string;
}

export class FieldDatabase extends Dexie {
  tasks!: Table<InspectionTask, string>;
  pendingSync!: Table<PendingSync, number>;

  constructor() {
    super('MapansetuFieldDB');
    this.version(1).stores({
      tasks: 'id, status, scheduledDate',
      pendingSync: '++id, taskId, status, timestamp'
    });
  }
}

export const db = new FieldDatabase();
```

## 3. Core Hooks

### `src/hooks/useNetwork.ts`
```typescript
import { useState, useEffect } from 'react';

export function useNetwork() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### `src/hooks/useGeoLocation.ts`
```typescript
import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeoLocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false
        });
      },
      (error) => {
        setLocation(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location;
}
```

## 4. Synchronization Service

### `src/features/sync/syncService.ts`
```typescript
import { db } from '@/db/database';
import { api } from '@/services/api';

export class SyncService {
  static async syncPendingData() {
    if (!navigator.onLine) return;

    const pendingItems = await db.pendingSync
      .where('status')
      .equals('pending')
      .toArray();

    for (const item of pendingItems) {
      try {
        const formData = new FormData();
        formData.append('data', JSON.stringify(item.payload));
        
        item.photos.forEach((photo, index) => {
          formData.append(`photo_${index}`, photo, `photo_${index}.jpg`);
        });

        await api.post(`/inspections/${item.taskId}/complete`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Update task status
        await db.tasks.update(item.taskId, { status: 'completed' });
        
        // Remove from pending sync
        if (item.id) {
          await db.pendingSync.delete(item.id);
        }
      } catch (error: any) {
        if (item.id) {
          await db.pendingSync.update(item.id, {
            status: 'failed',
            errorMessage: error.message || 'Sync failed'
          });
        }
      }
    }
  }

  static async pullTasks() {
    if (!navigator.onLine) return;

    try {
      const response = await api.get('/inspector/tasks/today');
      const tasks = response.data;
      
      // Clear existing pending tasks and bulk add new ones
      await db.transaction('rw', db.tasks, async () => {
        const existingTasks = await db.tasks.toArray();
        const completedIds = existingTasks
          .filter(t => t.status === 'completed')
          .map(t => t.id);
          
        const newTasks = tasks.filter((t: any) => !completedIds.includes(t.id));
        
        await db.tasks.where('status').equals('pending').delete();
        await db.tasks.bulkAdd(newTasks);
      });
    } catch (error) {
      console.error('Failed to pull tasks:', error);
    }
  }
}
```

## 5. Application Core

### `src/App.tsx`
```tsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useNetwork } from '@/hooks/useNetwork';
import { SyncService } from '@/features/sync/syncService';
import TopHeader from '@/components/layout/TopHeader';
import BottomNav from '@/components/layout/BottomNav';
import QueuePage from '@/features/queue/QueuePage';
import InspectionForm from '@/features/inspection/InspectionForm';
import SyncPage from '@/features/sync/SyncPage';

export default function App() {
  const isOnline = useNetwork();

  useEffect(() => {
    if (isOnline) {
      SyncService.syncPendingData();
      SyncService.pullTasks();
    }
  }, [isOnline]);

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen bg-gray-50">
        <TopHeader />
        <main className="flex-1 overflow-y-auto pb-16 pt-14">
          <Routes>
            <Route path="/" element={<QueuePage />} />
            <Route path="/inspect/:taskId" element={<InspectionForm />} />
            <Route path="/sync" element={<SyncPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
```

## 6. Layout Components

### `src/components/layout/TopHeader.tsx`
```tsx
import React from 'react';
import { useNetwork } from '@/hooks/useNetwork';
import { Wifi, WifiOff } from 'lucide-react';

export default function TopHeader() {
  const isOnline = useNetwork();

  return (
    <header className="fixed top-0 w-full h-14 bg-indigo-600 text-white flex items-center justify-between px-4 z-50 shadow-md">
      <h1 className="text-lg font-bold">Mapansetu Field</h1>
      <div className="flex items-center gap-2 text-sm">
        {isOnline ? (
          <><Wifi size={16} /> <span className="hidden sm:inline">Online</span></>
        ) : (
          <><WifiOff size={16} className="text-red-300" /> <span className="hidden sm:inline text-red-100">Offline</span></>
        )}
      </div>
    </header>
  );
}
```

### `src/components/layout/BottomNav.tsx`
```tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ListTodo, RefreshCcw } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';

export default function BottomNav() {
  const pendingSyncCount = useLiveQuery(
    () => db.pendingSync.count()
  ) || 0;

  return (
    <nav className="fixed bottom-0 w-full h-16 bg-white border-t border-gray-200 flex justify-around items-center pb-safe z-50">
      <NavLink 
        to="/" 
        className={({ isActive }) => `flex flex-col items-center p-2 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}
      >
        <ListTodo size={24} />
        <span className="text-xs mt-1">Tasks</span>
      </NavLink>
      
      <NavLink 
        to="/sync" 
        className={({ isActive }) => `flex flex-col items-center p-2 relative ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}
      >
        <div className="relative">
          <RefreshCcw size={24} />
          {pendingSyncCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
              {pendingSyncCount}
            </span>
          )}
        </div>
        <span className="text-xs mt-1">Sync</span>
      </NavLink>
    </nav>
  );
}
```

## 7. Feature: Task Queue

### `src/features/queue/QueuePage.tsx`
```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';

export default function QueuePage() {
  const navigate = useNavigate();
  const tasks = useLiveQuery(
    () => db.tasks.where('status').notEqual('completed').toArray()
  );

  if (!tasks) return <div className="p-4 text-center">Loading tasks...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Today's Inspections</h2>
      
      {tasks.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-500">
          No pending tasks for today.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => navigate(`/inspect/${task.id}`)}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 active:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{task.establishmentName}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  <span>{task.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="shrink-0" />
                  <span>{new Date(task.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                <div className="flex items-center text-indigo-600 text-sm font-medium">
                  Start Inspection <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 8. Feature: Inspection Form

### `src/features/inspection/InspectionForm.tsx`
```tsx
import React, { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { Camera, X, Save, AlertTriangle } from 'lucide-react';

// Standard error calculation logic
function calculateError(observed: number, standard: number): number {
  return ((observed - standard) / standard) * 100;
}

function getErrorStatus(errorPercent: number, tolerance: number): 'pass' | 'fail' {
  return Math.abs(errorPercent) <= tolerance ? 'pass' : 'fail';
}

export default function InspectionForm() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const location = useGeoLocation();
  const webcamRef = useRef<Webcam>(null);
  
  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Form State
  const [instrumentId, setInstrumentId] = useState('');
  const [standardWeight, setStandardWeight] = useState<number>(0);
  const [observedWeight, setObservedWeight] = useState<number>(0);
  const [tolerance, setTolerance] = useState<number>(0.1); // 0.1%
  const [remarks, setRemarks] = useState('');

  const task = useLiveQuery(
    () => db.tasks.get(taskId || '')
  );

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhotos(prev => [...prev, imageSrc]);
      setShowCamera(false);
    }
  }, [webcamRef]);

  // Convert base64 to Blob
  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) return;

    const errorPercent = standardWeight > 0 ? calculateError(observedWeight, standardWeight) : 0;
    const status = standardWeight > 0 ? getErrorStatus(errorPercent, tolerance) : 'pass';

    const payload = {
      instrumentId,
      standardWeight,
      observedWeight,
      errorPercent,
      status,
      remarks,
      location: {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy
      },
      timestamp: new Date().toISOString()
    };

    const photoBlobs = photos.map(p => dataURItoBlob(p));

    await db.transaction('rw', db.pendingSync, db.tasks, async () => {
      await db.pendingSync.add({
        taskId,
        payload,
        photos: photoBlobs,
        timestamp: Date.now(),
        status: 'pending'
      });
      await db.tasks.update(taskId, { status: 'completed' });
    });

    navigate('/');
  };

  if (!task) return <div className="p-4">Loading task...</div>;

  const errorPercent = standardWeight > 0 ? calculateError(observedWeight, standardWeight) : 0;
  const isFailing = standardWeight > 0 && getErrorStatus(errorPercent, tolerance) === 'fail';

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">{task.establishmentName}</h2>
        <p className="text-gray-600 text-sm">{task.address}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Instrument Details */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold mb-3 border-b pb-2">Instrument Data</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instrument ID / Serial No.</label>
              <input 
                required
                type="text" 
                value={instrumentId}
                onChange={e => setInstrumentId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Standard Weight (kg)</label>
                <input 
                  required
                  type="number" 
                  step="0.001"
                  value={standardWeight || ''}
                  onChange={e => setStandardWeight(parseFloat(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observed Weight (kg)</label>
                <input 
                  required
                  type="number" 
                  step="0.001"
                  value={observedWeight || ''}
                  onChange={e => setObservedWeight(parseFloat(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {standardWeight > 0 && (
              <div className={`p-3 rounded-md flex items-start gap-2 ${isFailing ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                {isFailing && <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
                <div>
                  <div className="font-medium">Error: {errorPercent.toFixed(3)}%</div>
                  <div className="text-sm opacity-90">{isFailing ? 'Exceeds tolerance limit' : 'Within tolerance limit'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <h3 className="font-semibold">Evidence Photos</h3>
            <span className="text-xs text-gray-500">{photos.length}/3 captured</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {photos.map((p, i) => (
              <div key={i} className="relative aspect-square">
                <img src={p} className="w-full h-full object-cover rounded" alt={`Evidence ${i+1}`} />
                <button 
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {photos.length < 3 && !showCamera && (
              <button 
                type="button"
                onClick={() => setShowCamera(true)}
                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded text-gray-500 bg-gray-50 active:bg-gray-100"
              >
                <Camera size={24} className="mb-1" />
                <span className="text-xs font-medium">Add Photo</span>
              </button>
            )}
          </div>

          {showCamera && (
            <div className="relative rounded overflow-hidden bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full"
              />
              <div className="absolute bottom-4 w-full flex justify-center gap-4">
                <button type="button" onClick={() => setShowCamera(false)} className="bg-gray-600 text-white px-4 py-2 rounded-full">Cancel</button>
                <button type="button" onClick={capturePhoto} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium shadow-lg">Capture</button>
              </div>
            </div>
          )}
        </div>

        {/* Remarks */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-semibold mb-3 border-b pb-2">Remarks</h3>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Add any additional observations..."
          />
        </div>

        {/* Geo Status */}
        <div className="text-xs text-center text-gray-500">
          Location: {location.loading ? 'Acquiring...' : 
                     location.error ? <span className="text-red-500">{location.error}</span> : 
                     <span className="text-green-600">Acquired ({location.accuracy?.toFixed(0)}m accuracy)</span>}
        </div>

        {/* Submit */}
        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-indigo-700 shadow-md"
        >
          <Save size={20} />
          Save & Mark Completed
        </button>
      </form>
    </div>
  );
}
```

## 9. Feature: Sync Status Page

### `src/features/sync/SyncPage.tsx`
```tsx
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import { SyncService } from './syncService';
import { useNetwork } from '@/hooks/useNetwork';
import { RefreshCcw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function SyncPage() {
  const isOnline = useNetwork();
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingItems = useLiveQuery(
    () => db.pendingSync.orderBy('timestamp').reverse().toArray()
  );

  const handleSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      await SyncService.syncPendingData();
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-amber-500" />;
      case 'failed': return <AlertCircle size={16} className="text-red-500" />;
      default: return <CheckCircle size={16} className="text-green-500" />;
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold">Sync Status</h2>
          <p className="text-sm text-gray-600">Manage offline data</p>
        </div>
        <button
          onClick={handleSync}
          disabled={!isOnline || isSyncing || pendingItems?.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            !isOnline || pendingItems?.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
          }`}
        >
          <RefreshCcw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm mb-4 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>You are currently offline. Data is saved locally and can be synced when your connection is restored.</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Pending Uploads</h3>
          <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
            {pendingItems?.length || 0}
          </span>
        </div>
        
        {pendingItems?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
            <p>All data is synced up to date.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {pendingItems?.map(item => (
              <li key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-gray-900">Task: {item.taskId}</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium capitalize px-2 py-1 bg-gray-50 rounded border border-gray-100">
                    {getStatusIcon(item.status)}
                    <span>{item.status}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Completed: {new Date(item.timestamp).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Photos attached: {item.photos.length}
                </div>
                {item.errorMessage && (
                  <div className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-100">
                    Error: {item.errorMessage}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```
