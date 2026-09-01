"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, FileText } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, type StatusValue } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { getCertificates } from "@/services/certificates/certificates.service";
import type { Certificate } from "@/types/certificate";

export default function CertificatesListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCertificates();
        setCertificates(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load certificates. Please try again later.");
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
          title="Certificates" 
          subtitle="Official regulatory verification certificates for your instruments."
        />
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
      ) : certificates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50/50">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-sm mb-4">No certificates issued yet.</p>
          <p className="text-slate-400 text-xs mb-6 max-w-md mx-auto">
            Certificates are issued by the Legal Metrology Department after a successful physical verification of your registered instruments.
          </p>
          <Button asChild variant="outline">
            <Link href="/app/applications">View Applications</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">Certificate No.</th>
                  <th className="px-6 py-4 font-semibold">Instrument</th>
                  <th className="px-6 py-4 font-semibold">Issue Date</th>
                  <th className="px-6 py-4 font-semibold">Valid Until</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {cert.certificateNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium">{cert.instrumentNumber}</div>
                      <div className="text-xs text-slate-500 mt-0.5 capitalize">{String(cert.instrumentType).replace(/_/g, " ").toLowerCase()}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {new Date(cert.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={(cert.status === "VALID" ? "ACTIVE" : cert.status === "INVALID" ? "EXPIRED" : cert.status) as StatusValue} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/app/certificates/${cert.id}`}>View Record</Link>
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
