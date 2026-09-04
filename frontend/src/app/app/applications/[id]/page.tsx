"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, FileCheck2, CalendarClock, UserCheck, ShieldCheck } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, type StatusValue } from "@/components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { getApplicationById } from "@/services/applications/applications.service";
import type { Application } from "@/types/application";

export default function ApplicationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<Application | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getApplicationById(id);
        if (!data) {
          setError("Application not found.");
        } else {
          setApplication(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load application details.");
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

  if (loading || !application) {
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-3 text-slate-500 hover:text-slate-900">
          <Link href="/app/applications">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Link>
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <PageHeader 
            title={application.applicationNumber} 
            subtitle={`Submitted on ${new Date(application.createdAt).toLocaleDateString()}`}
          />
          <div className="flex items-center gap-3">
            <StatusBadge status={application.state as StatusValue} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileCheck2 className="w-5 h-5 text-indigo-600" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason for Verification</div>
                <div className="font-medium text-slate-900 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {application.reason}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Instrument</div>
                  <Link href={`/app/instruments/${application.instrumentId}`} className="font-medium text-blue-700 hover:underline flex items-center gap-1 group">
                    {application.instrumentNumber}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                  </Link>
                  <div className="text-xs text-slate-500 mt-1 capitalize">{String(application.instrumentType).replace(/_/g, " ").toLowerCase()}</div>
                </div>
                
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Business</div>
                  <div className="font-medium text-slate-900">{application.businessName || "Your Business"}</div>
                  <div className="text-xs text-slate-500 font-mono mt-1">{application.businessId}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {application.certificateNumber && (
            <Alert className="bg-emerald-50 border-emerald-200">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <AlertTitle className="text-emerald-800">Verification Completed</AlertTitle>
              <AlertDescription className="text-emerald-700 mt-2">
                This application has resulted in the issuance of a new certificate.
                <div className="mt-4">
                  <Button asChild variant="outline" className="border-emerald-200 text-emerald-800 hover:bg-emerald-100">
                    <Link href={`/app/certificates/${application.certificateId || application.certificateNumber}`}>
                      View Certificate {application.certificateNumber}
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {application.state === "REJECTED" && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Application Rejected</AlertTitle>
              <AlertDescription className="mt-2">
                This verification application was rejected by the LMO. Please review your instrument and submit a new application when the issues are resolved.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarClock className="w-5 h-5 text-blue-600" />
                Scheduling & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Scheduled Date</div>
                {application.scheduledDate ? (
                  <div className="font-medium text-slate-900">
                    {new Date(application.scheduledDate).toLocaleDateString()}
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(application.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ) : (
                  <div className="font-medium text-slate-400 italic">Pending schedule</div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned LMO</div>
                {application.assignedOfficerName ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{application.assignedOfficerName}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">Legal Metrology Officer (LMO)</div>
                    </div>
                  </div>
                ) : (
                  <div className="font-medium text-slate-400 italic">Pending assignment</div>
                )}
              </div>

              <hr className="border-slate-100" />
              
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Timeline</div>
                <div className="space-y-4">
                  <div className="flex gap-3 relative before:absolute before:left-[11px] before:top-6 before:bottom-[-20px] before:w-[2px] before:bg-slate-100 last:before:hidden">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Application Submitted</div>
                      <div className="text-xs text-slate-500 mt-0.5">{new Date(application.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  {application.updatedAt && application.updatedAt !== application.createdAt && (
                    <div className="flex gap-3 relative before:absolute before:left-[11px] before:top-6 before:bottom-[-20px] before:w-[2px] before:bg-slate-100 last:before:hidden">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 z-10 ring-4 ring-white">
                        <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Last Updated</div>
                        <div className="text-xs text-slate-500 mt-0.5">{new Date(application.updatedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
