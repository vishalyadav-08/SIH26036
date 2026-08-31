"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, type StatusValue } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { getInstruments } from "@/services/instruments/instruments.service";
import type { Instrument } from "@/types/instrument";

export default function InstrumentsListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getInstruments();
        setInstruments(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load instruments. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Instruments" 
          subtitle="Manage your registered measuring devices."
        />
        <Button asChild>
          <Link href="/app/instruments/new">
            <Plus className="w-4 h-4 mr-2" />
            Register Instrument
          </Link>
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : instruments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50/50">
          <p className="text-slate-500 font-medium text-sm mb-4">No instruments found.</p>
          <p className="text-slate-400 text-xs mb-6">Register your first measuring device to get started.</p>
          <Button asChild>
            <Link href="/app/instruments/new">Register Instrument</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Instrument ID</th>
                  <th className="px-6 py-4 font-semibold">Type & Model</th>
                  <th className="px-6 py-4 font-semibold">Capacity</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Next Verification</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {instruments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{inst.instrumentNumber}</div>
                      {inst.serialNumber && (
                        <div className="text-xs text-slate-500 font-mono mt-0.5">SN: {inst.serialNumber}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 capitalize">{String(inst.instrumentType).replace(/_/g, " ").toLowerCase()}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{inst.manufacturer} {inst.model}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {inst.capacity} {inst.capacityUnit}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inst.status as StatusValue} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {inst.nextVerificationDue ? new Date(inst.nextVerificationDue).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/app/instruments/${inst.id}`}>View Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
