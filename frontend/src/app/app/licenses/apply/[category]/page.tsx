"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LicensingService, LicenseApplicationPayload, licenseCategoryEnum } from "@/services/licensing";

export default function LicenseApplicationForm() {
  const params = useParams();
  const router = useRouter();
  const categoryStr = params.category as string;
  const category = licenseCategoryEnum.parse(categoryStr);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload: LicenseApplicationPayload = {
      category,
      license_type: 'NEW',
      validity_years: 1,
      premises_address: formData.get('premises_address') as string,
      premises_proof_type: formData.get('premises_proof_type') as string,
      gst_number: formData.get('gst_number') as string,
      pan_number: formData.get('pan_number') as string,
    };

    try {
      const response = await LicensingService.createApplication(payload);
      // We could redirect to payment or dashboard. For now, to dashboard
      router.push('/app/licenses');
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Apply for {category} License</h1>
        <p className="mt-1 text-sm text-gray-500">
          Please fill out the form below. Additional documents will be required in the next step.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">{error}</h3>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-md">
        <div>
          <label htmlFor="premises_address" className="block text-sm font-medium text-gray-700">Premises Address</label>
          <textarea
            name="premises_address"
            id="premises_address"
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="premises_proof_type" className="block text-sm font-medium text-gray-700">Premises Ownership Type</label>
          <select
            name="premises_proof_type"
            id="premises_proof_type"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="OWNED">Owned</option>
            <option value="RENTED">Rented</option>
            <option value="LEASED">Leased</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="gst_number" className="block text-sm font-medium text-gray-700">GST Number</label>
            <input
              type="text"
              name="gst_number"
              id="gst_number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="pan_number" className="block text-sm font-medium text-gray-700">PAN Number</label>
            <input
              type="text"
              name="pan_number"
              id="pan_number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
          >
            {submitting ? 'Submitting...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
