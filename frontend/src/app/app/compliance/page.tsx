"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle, Clock, AlertCircle, FileText } from "lucide-react";
import { ComplianceService } from "@/services/compliance";
import { LicensingService } from "@/services/licensing";

export default function ComplianceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returns, setReturns] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [returnsData, licensesData] = await Promise.all([
          ComplianceService.getReturns(),
          LicensingService.getLicenses()
        ]);
        
        setReturns(Array.isArray(returnsData) ? returnsData : (returnsData as any)?.results || []);
        setLicenses(Array.isArray(licensesData) ? licensesData : (licensesData as any)?.results || []);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load compliance data.");
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance & Returns</h1>
          <p className="mt-1 text-sm text-gray-500">
            File quarterly returns for your Manufacturer or Dealer/Repairer licenses.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/app/compliance/new"
            className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            File New Return
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex items-center text-red-800">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Your Filed Returns</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {returns.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500 text-sm">
              No returns filed yet.
            </li>
          ) : (
            returns.map((ret) => (
              <li key={ret.id} className="py-4 px-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {ret.financial_year} - {ret.quarter}
                      </p>
                      <p className="flex items-center text-sm text-gray-500">
                        Due: {new Date(ret.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex items-center space-x-4">
                    <p className="text-sm text-gray-500 hidden sm:block">
                      Sold: {ret.total_sold} | Mfg: {ret.total_manufactured}
                    </p>
                    {ret.status === 'SUBMITTED' || ret.status === 'LATE_SUBMITTED' ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <CheckCircle className="mr-1 h-4 w-4" /> Submitted
                      </span>
                    ) : ret.status === 'OVERDUE' ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        <AlertCircle className="mr-1 h-4 w-4" /> Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        <Clock className="mr-1 h-4 w-4" /> Draft
                      </span>
                    )}
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
