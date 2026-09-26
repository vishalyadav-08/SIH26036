"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ComplianceService } from "@/services/compliance";
import { LicensingService } from "@/services/licensing";

export default function NewQuarterlyReturnPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await LicensingService.getLicenses();
        setLicenses(Array.isArray(data) ? data : (data as any)?.results || []);
      } catch (err: any) {
        setError("Failed to load licenses. You need an active license to file a return.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      license: formData.get('license') as string,
      financial_year: formData.get('financial_year') as string,
      quarter: formData.get('quarter') as string,
    };

    try {
      const ret = await ComplianceService.createReturn(payload);
      // Automatically submit the return for MVP demo (in reality they'd add records first)
      await ComplianceService.submitReturn(ret.id);
      router.push('/app/compliance');
    } catch (err: any) {
      setError(err.message || "Failed to file return");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Initiate Quarterly Return</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select the license and period for which you are filing this return.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-md">
        <div>
          <label htmlFor="license" className="block text-sm font-medium text-gray-700">Select License</label>
          <select
            name="license"
            id="license"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">-- Select an active license --</option>
            {licenses.map(lic => (
              <option key={lic.id} value={lic.id}>
                {lic.license_number} ({lic.category})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="financial_year" className="block text-sm font-medium text-gray-700">Financial Year</label>
            <select
              name="financial_year"
              id="financial_year"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
            </select>
          </div>
          <div>
            <label htmlFor="quarter" className="block text-sm font-medium text-gray-700">Quarter</label>
            <select
              name="quarter"
              id="quarter"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="Q1">Q1 (Apr-Jun)</option>
              <option value="Q2">Q2 (Jul-Sep)</option>
              <option value="Q3">Q3 (Oct-Dec)</option>
              <option value="Q4">Q4 (Jan-Mar)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {submitting ? 'Creating...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
