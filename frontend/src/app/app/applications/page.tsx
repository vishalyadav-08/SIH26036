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

import { getApplications } from "@/services/applications/applications.service";
import type { Application } from "@/types/application";

export default function ApplicationsListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load applications. Please try again later.");
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
          title="Applications" 
          subtitle="Manage and track your verification requests."
        />
        <Button asChild>
          <Link href="/app/applications/new">
            <Plus className="w-4 h-4 mr-2" />
            New Application
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
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50/50">
          <p className="text-slate-500 font-medium text-sm mb-4">No applications found.</p>
          <p className="text-slate-400 text-xs mb-6">Create a verification application for one of your registered instruments.</p>
          <Button asChild>
            <Link href="/app/applications/new">New Application</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">App No.</th>
                  <th className="px-6 py-4 font-semibold">Instrument</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Date Submitted</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{app.applicationNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">{app.instrumentNumber}</div>
                      <div className="text-xs text-slate-500 mt-0.5 capitalize">{String(app.instrumentType).replace(/_/g, " ").toLowerCase()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.state as StatusValue} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/app/applications/${app.id}`}>View Details</Link>
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
