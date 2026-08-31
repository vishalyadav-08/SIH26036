"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Building2, Scale, ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, type StatusValue } from "@/components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { getInstrumentById } from "@/services/instruments/instruments.service";
import type { Instrument } from "@/types/instrument";

export default function InstrumentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instrument, setInstrument] = useState<Instrument | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getInstrumentById(id);
        if (!data) {
          setError("Instrument not found.");
        } else {
          setInstrument(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load instrument details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading || !instrument) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" disabled className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-3 text-slate-500 hover:text-slate-900">
          <Link href="/app/instruments">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Instruments
          </Link>
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <PageHeader 
            title={instrument.instrumentNumber} 
            subtitle={`Registered on ${new Date(instrument.createdAt).toLocaleDateString()}`}
          />
          <div className="flex items-center gap-3">
            <StatusBadge status={instrument.status as StatusValue} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="w-5 h-5 text-blue-600" />
              Technical Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</div>
              <div className="font-medium text-slate-900 capitalize">{String(instrument.instrumentType).replace(/_/g, " ").toLowerCase()}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Manufacturer</div>
                <div className="font-medium text-slate-900">{instrument.manufacturer}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Model</div>
                <div className="font-medium text-slate-900">{instrument.model}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Capacity</div>
                <div className="font-medium text-slate-900">{instrument.capacity} {instrument.capacityUnit}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Serial Number</div>
                <div className="font-medium text-slate-900 font-mono">{instrument.serialNumber || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Location & Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div className="font-medium text-slate-900">{instrument.location || "Not specified"}</div>
              </div>
            </div>
            
            <hr className="border-slate-100" />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Verified</div>
                <div className="font-medium text-slate-900">
                  {instrument.lastVerifiedAt ? new Date(instrument.lastVerifiedAt).toLocaleDateString() : 'Never'}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Next Due</div>
                <div className={`font-medium ${instrument.status === 'EXPIRED' ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                  {instrument.nextVerificationDue ? new Date(instrument.nextVerificationDue).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
            
            {instrument.activeCertificateNo && (
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Certificate</div>
                <div className="font-medium text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 inline-block font-mono text-sm mt-1">
                  {instrument.activeCertificateNo}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {instrument.status === "PENDING_VERIFICATION" && (
        <Alert className="bg-amber-50 border-amber-200">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Pending Verification</AlertTitle>
          <AlertDescription className="text-amber-700">
            This instrument has not been verified yet. You must submit a verification application before it can be legally used in trade.
          </AlertDescription>
          <Button asChild className="mt-4" variant="outline">
             <Link href="/app/applications/new">Create Application</Link>
          </Button>
        </Alert>
      )}
      
      {instrument.status === "EXPIRED" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Certificate Expired</AlertTitle>
          <AlertDescription>
            The verification certificate for this instrument has expired. Please apply for re-verification immediately.
          </AlertDescription>
          <Button asChild className="mt-4" variant="outline">
             <Link href="/app/applications/new">Apply for Re-verification</Link>
          </Button>
        </Alert>
      )}

    </div>
  );
}
