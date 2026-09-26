"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { LicensingService } from "@/services/licensing";

export default function LicenseDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [appsData, licensesData] = await Promise.all([
          LicensingService.getApplications(),
          LicensingService.getLicenses()
        ]);
        
        // Ensure we are setting arrays
        setApplications(Array.isArray(appsData) ? appsData : (appsData as any)?.results || []);
        setLicenses(Array.isArray(licensesData) ? licensesData : (licensesData as any)?.results || []);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load licensing data. Please try again later.");
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

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex items-center text-red-800">
          <AlertCircle className="mr-2 h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">License Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your Manufacturer, Dealer, Repairer, and Packer licenses.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/app/licenses/apply"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Apply for License
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Licenses */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5 sm:flex sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Active Licenses</h3>
          </div>
          <div className="px-6 py-5">
            {licenses.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No active licenses found.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {licenses.map((lic) => (
                  <li key={lic.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{lic.license_number}</p>
                        <p className="truncate text-sm text-gray-500">Category: {lic.category}</p>
                        <p className="truncate text-sm text-gray-500">Valid until: {lic.valid_until}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* License Applications */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-5 sm:flex sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Applications</h3>
          </div>
          <div className="px-6 py-5">
            {applications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent applications.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <li key={app.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {app.state === 'APPROVED' ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : app.state === 'REJECTED' ? (
                          <AlertCircle className="h-6 w-6 text-red-500" />
                        ) : (
                          <Clock className="h-6 w-6 text-yellow-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{app.application_number}</p>
                        <p className="truncate text-sm text-gray-500">{app.category} ({app.license_type})</p>
                        <p className="truncate text-sm text-gray-500">Status: <span className="font-semibold">{app.state}</span></p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
