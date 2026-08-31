"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge, type StatusValue } from "@/components/ui/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, Gauge, FileCheck2, Award, CalendarClock } from "lucide-react";

import { getApplications } from "@/services/applications/applications.service";
import { getInstruments } from "@/services/instruments/instruments.service";
import { getCertificates } from "@/services/certificates/certificates.service";

import type { Application } from "@/types/application";
import type { Instrument } from "@/types/instrument";
import type { Certificate } from "@/types/certificate";

export default function BusinessDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [apps, insts, certs] = await Promise.all([
          getApplications(),
          getInstruments(),
          getCertificates()
        ]);
        setApplications(apps);
        setInstruments(insts);
        setCertificates(certs);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title="Dashboard" 
          subtitle="Overview of your business instruments and applications."
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate metrics
  const pendingActionsCount = applications.filter(a => a.state === "REJECTED").length + 
    certificates.filter(c => c.status === "EXPIRED" || c.status === "REVOKED" || c.status === "INVALID").length;
  
  const activeInstruments = instruments.filter(i => i.status === "ACTIVE").length;
  const activeCertificates = certificates.filter(c => c.status === "VALID").length;

  // Recent applications for the list
  const recentApplications = applications.slice(0, 3);
  
  // Pending Actions (e.g. scheduled inspections, or rejected apps, or expired certificates)
  const actionRequiredApps = applications.filter(a => 
    a.state === "SCHEDULED" || a.state === "REJECTED"
  );
  const actionRequiredCerts = certificates.filter(c => 
    c.status === "EXPIRED" || c.status === "REVOKED" || c.status === "INVALID"
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard" 
        subtitle="Overview of your business instruments, applications, and certificates."
      />

      {/* Summary Metrics Section */}
      <section aria-label="Summary Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl w-full" />
            ))
          ) : (
            <>
              <StatCard
                label="Instruments"
                value={instruments.length}
                trend={activeInstruments > 0 ? `${activeInstruments} Active` : undefined}
                icon={Gauge}
                ctaLabel="View Instruments"
                ctaHref="/app/instruments"
              />
              <StatCard
                label="Applications"
                value={applications.length}
                icon={FileCheck2}
                iconColor="text-indigo-700"
                iconBg="bg-indigo-50"
                ctaLabel="View Applications"
                ctaHref="/app/applications"
              />
              <StatCard
                label="Certificates"
                value={certificates.length}
                trend={activeCertificates > 0 ? `${activeCertificates} Valid` : undefined}
                icon={Award}
                iconColor="text-emerald-700"
                iconBg="bg-emerald-50"
                ctaLabel="View Certificates"
                ctaHref="/app/certificates"
              />
              <StatCard
                label="Action Required"
                value={pendingActionsCount}
                icon={AlertCircle}
                iconColor="text-amber-700"
                iconBg="bg-amber-50"
                className={pendingActionsCount > 0 ? "border-amber-200 bg-amber-50/30" : ""}
              />
            </>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Applications Section */}
          <section aria-label="Recent Applications">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Recent Applications</CardTitle>
                  <CardDescription>Your latest verification requests</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex text-blue-700">
                  <Link href="/app/applications">
                    View all <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4 mt-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : recentApplications.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-xl mt-4">
                    <p className="text-slate-500 font-medium text-sm mb-4">No applications yet</p>
                    <p className="text-slate-400 text-xs mb-4">Submit a verification application to get started.</p>
                    <Button asChild>
                      <Link href="/app/applications/new">Create Application</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b">
                          <tr>
                            <th className="px-4 py-3 font-semibold">App No.</th>
                            <th className="px-4 py-3 font-semibold">Instrument</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {recentApplications.map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-900">
                                {app.applicationNumber}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {app.instrumentType.replace("_", " ")}
                              </td>
                              <td className="px-4 py-3">
                                <StatusBadge status={app.state as StatusValue} />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-blue-700">
                                  <Link href={`/app/applications/${app.id}`}>View</Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <Button variant="outline" size="sm" asChild className="w-full mt-4 sm:hidden">
                  <Link href="/app/applications">View all applications</Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Instruments Section */}
          <section aria-label="Instruments Summary">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Instruments Summary</CardTitle>
                  <CardDescription>Registered measuring devices</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-24 w-full mt-4" />
                ) : instruments.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed rounded-xl mt-4">
                    <p className="text-slate-500 text-sm font-medium">No instruments registered</p>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {instruments.slice(0, 4).map(inst => (
                      <div key={inst.id} className="flex items-center justify-between p-3 border rounded-xl hover:border-slate-300 transition-colors">
                        <div>
                          <div className="font-semibold text-sm text-slate-900">{inst.instrumentNumber}</div>
                          <div className="text-xs text-slate-500 capitalize">{String(inst.instrumentType).replace("_", " ").toLowerCase()}</div>
                        </div>
                        <StatusBadge status={inst.status as StatusValue} />
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="secondary" size="sm" asChild className="w-full mt-4">
                  <Link href="/app/instruments">View all instruments</Link>
                </Button>
              </CardContent>
            </Card>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Action Required Section */}
          <section aria-label="Action Required">
            <Card className="border-amber-200 bg-amber-50/10 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-amber-600" />
                  Needs Attention
                </CardTitle>
                <CardDescription>Upcoming schedules & required actions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-20 w-full mt-2" />
                ) : (actionRequiredApps.length === 0 && actionRequiredCerts.length === 0) ? (
                  <div className="p-4 bg-white rounded-xl border border-slate-100 text-center">
                    <p className="text-sm text-slate-500 font-medium">You&apos;re all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {actionRequiredApps.map(app => (
                      <div key={app.id} className="p-3 bg-white border border-amber-100 rounded-xl shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm text-slate-900">{app.applicationNumber}</span>
                          <StatusBadge status={app.state as StatusValue} />
                        </div>
                        <p className="text-xs text-slate-600 mb-2 truncate">
                          {app.state === "SCHEDULED" ? `Scheduled: ${app.scheduledDate ? new Date(app.scheduledDate).toLocaleDateString() : 'Pending'}` : app.reason}
                        </p>
                        <Button variant="outline" size="sm" className="w-full h-7 text-xs" asChild>
                          <Link href={`/app/applications/${app.id}`}>Review</Link>
                        </Button>
                      </div>
                    ))}
                    {actionRequiredCerts.map(cert => (
                      <div key={cert.id} className="p-3 bg-white border border-rose-100 rounded-xl shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm text-slate-900">{cert.certificateNumber}</span>
                          <StatusBadge status={(cert.status === "VALID" ? "ACTIVE" : cert.status === "INVALID" ? "EXPIRED" : cert.status) as StatusValue} />
                        </div>
                        <p className="text-xs text-slate-600 mb-2 truncate">
                          Expired on {new Date(cert.validUntil).toLocaleDateString()}
                        </p>
                        <Button variant="outline" size="sm" className="w-full h-7 text-xs" asChild>
                          <Link href={`/app/certificates/${cert.id}`}>View Details</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Certificates Section */}
          <section aria-label="Certificates Summary">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Certificates</CardTitle>
                <CardDescription>Recent verifications</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-16 w-full mt-2" />
                ) : certificates.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed rounded-xl mt-2">
                    <p className="text-slate-500 text-sm font-medium">No certificates yet</p>
                  </div>
                ) : (
                  <div className="mt-2 space-y-3">
                    {certificates.slice(0, 3).map(cert => (
                      <div key={cert.id} className="flex justify-between items-center p-3 border rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-slate-900 truncate">{cert.certificateNumber}</div>
                          <div className="text-[10px] text-slate-500 truncate">{cert.instrumentType.replace("_", " ")}</div>
                        </div>
                        <StatusBadge status={(cert.status === "VALID" ? "ACTIVE" : cert.status === "INVALID" ? "EXPIRED" : cert.status) as StatusValue} />
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" asChild className="w-full text-blue-700">
                      <Link href="/app/certificates">View all certificates</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </div>
  );
}
