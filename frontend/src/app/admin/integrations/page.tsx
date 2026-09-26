"use client";

import { useEffect, useState } from "react";
import { IntegrationsService } from "@/services/integrations";
import { Link2, ShieldCheck, Activity } from "lucide-react";

export default function IntegrationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const logsData = await IntegrationsService.getLogs();
        setLogs(Array.isArray(logsData) ? logsData : (logsData as any)?.results || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">National System Integrations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor API sync status with NSWS, DigiLocker, and PARIVESH.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white overflow-hidden rounded-lg shadow p-5 border-l-4 border-indigo-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link2 className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">NSWS Integration</dt>
              <dd className="text-lg font-medium text-gray-900">Active (Live Sync)</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow p-5 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">DigiLocker</dt>
              <dd className="text-lg font-medium text-gray-900">Connected</dd>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md mt-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-gray-400" />
            Recent Sync Logs
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {logs.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500 text-sm">
              No recent integration logs.
            </li>
          ) : (
            logs.map((log) => (
              <li key={log.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {log.integration_type}: {log.action}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-xs text-gray-500">
                      Time: {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
