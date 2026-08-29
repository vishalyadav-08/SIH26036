"use client";

import { User, Mail, Shield, LogOut, Database, Wifi, Loader2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLiveQuery } from 'dexie-react-hooks';
import { userService } from '@/services/field/user.service';
import { db } from '@/offline/db';
import { useState, useEffect } from 'react';

export default function ProfileScreen() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => userService.getMe()
  });

  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const unsyncedCount = useLiveQuery(() => 
    db?.syncQueue.where('status').anyOf('READY_TO_SYNC', 'SYNCING', 'FAILED', 'CONFLICT').count() ?? 0
  ) ?? 0;

  const handleSignOut = () => {
    if (unsyncedCount > 0) {
      const confirm = window.confirm(`You have ${unsyncedCount} unsynced operations. Clearing local data may permanently remove this work.\n\nAre you sure you want to sign out?`);
      if (!confirm) return;
    }
    // Perform sign out (clear session, IDB, etc.)
    window.alert('Sign out triggered. In production this clears session cookies and local data.');
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <User className="w-8 h-8" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Officer'}</h2>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
            <Mail className="w-4 h-4" />
            <span>{user?.email || 'Loading...'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700">Role</span>
            </div>
            <span className="text-gray-900 text-sm">{user?.role || '-'}</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className={`w-5 h-5 ${isOnline ? 'text-green-500' : 'text-orange-500'}`} />
              <span className="font-medium text-gray-700">Connection</span>
            </div>
            <span className={`${isOnline ? 'text-green-600' : 'text-orange-600'} font-semibold text-sm`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-700">Unsynced Work</span>
              </div>
              <span className="text-gray-900 font-medium text-sm">{unsyncedCount} items</span>
            </div>
            {unsyncedCount > 0 && (
              <div className="flex items-start gap-2 bg-orange-50 p-2 rounded text-xs text-orange-800 border border-orange-100 mt-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>You have unsynced work stored locally. Signing out may result in data loss.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="pt-4">
        <button 
          onClick={handleSignOut}
          className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl font-semibold shadow-sm hover:bg-red-50 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
