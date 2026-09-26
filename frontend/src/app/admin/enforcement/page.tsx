"use client";

import { useEffect, useState } from "react";
import { EnforcementService } from "@/services/enforcement";
import { AlertCircle, Plus, Search, Shield, FileText, FileWarning } from "lucide-react";

export default function EnforcementDashboard() {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [complaintsData, actionsData, noticesData] = await Promise.all([
          EnforcementService.getComplaints(),
          EnforcementService.getActions(),
          EnforcementService.getNotices()
        ]);
        
        setComplaints(Array.isArray(complaintsData) ? complaintsData : (complaintsData as any)?.results || []);
        setActions(Array.isArray(actionsData) ? actionsData : (actionsData as any)?.results || []);
        setNotices(Array.isArray(noticesData) ? noticesData : (noticesData as any)?.results || []);
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
        <h1 className="text-2xl font-bold text-gray-900">Enforcement & Complaints Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage consumer complaints, inspections, and prosecution notices.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white overflow-hidden rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Assigned Complaints</dt>
                <dd className="text-lg font-medium text-gray-900">{complaints.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Enforcement Actions</dt>
                <dd className="text-lg font-medium text-gray-900">{actions.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileWarning className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Notices Issued</dt>
                <dd className="text-lg font-medium text-gray-900">{notices.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md mt-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Consumer Complaints</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {complaints.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500 text-sm">
              No pending complaints.
            </li>
          ) : (
            complaints.map((comp) => (
              <li key={comp.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {comp.complaint_type} vs {comp.business_name}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      {comp.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Reporter: {comp.consumer_name} | {comp.business_address}
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
