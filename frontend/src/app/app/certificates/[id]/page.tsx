"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Award, FileText, Scale, ShieldCheck, Download, ExternalLink, Info } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge, type StatusValue } from "@/components/ui/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { getCertificateById } from "@/services/certificates/certificates.service";
import type { Certificate } from "@/types/certificate";

export default function CertificateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCertificateById(id);
        if (!data) {
          setError("Certificate not found.");
        } else {
          setCertificate(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load certificate details.");
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
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/app/certificates">Return to Certificates</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading || !certificate) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" disabled className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const displayStatus = certificate.status === "REVOKED" ? "REVOKED" 
    : (certificate.status === "INVALID" || certificate.status === "EXPIRED") ? "EXPIRED" 
    : "ACTIVE";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <Button variant="ghost" asChild className="mb-2 -ml-3 text-slate-500 hover:text-slate-900">
          <Link href="/app/certificates">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Link>
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div className="flex items-center gap-3">
            <Award className="w-10 h-10 text-emerald-600 hidden sm:block" />
            <PageHeader 
              title={certificate.certificateNumber} 
              subtitle="Official Regulatory Verification Certificate"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <StatusBadge status={displayStatus as StatusValue} className="text-sm px-3 py-1" />
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href={`/verify/${certificate.certificateNumber}`} target="_blank" rel="noopener noreferrer">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Public Verification
                <ExternalLink className="w-3 h-3 ml-2 opacity-70" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {displayStatus === "REVOKED" && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800">Certificate Revoked</AlertTitle>
          <AlertDescription className="text-red-700 mt-2">
            <p className="mb-2">This certificate was officially revoked on {certificate.revokedAt ? new Date(certificate.revokedAt).toLocaleString() : 'an unspecified date'}.</p>
            <p className="font-medium">Reason: {certificate.revocationReason || 'Violations of statutory regulations.'}</p>
          </AlertDescription>
        </Alert>
      )}

      {displayStatus === "EXPIRED" && certificate.status !== "REVOKED" && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Certificate Expired</AlertTitle>
          <AlertDescription className="text-amber-700 mt-1">
            This certificate exceeded its statutory validity period on {new Date(certificate.validUntil).toLocaleDateString()}. Please apply for re-verification immediately.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="w-5 h-5 text-slate-700" />
              Instrument Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Instrument ID</div>
                <Link href={`/app/instruments/${certificate.instrumentId}`} className="font-medium text-blue-700 hover:underline flex items-center gap-1 group">
                  {certificate.instrumentNumber}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                </Link>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</div>
                <div className="font-medium text-slate-900 capitalize">{String(certificate.instrumentType).replace(/_/g, " ").toLowerCase()}</div>
              </div>
            </div>
            
            <hr className="border-slate-100" />

            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Business Name</div>
              <div className="font-medium text-slate-900">{certificate.businessName}</div>
              <div className="text-xs text-slate-500 font-mono mt-1">ID: {certificate.businessId}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-slate-700" />
              Verification Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Issue Date</div>
                <div className="font-medium text-slate-900">{new Date(certificate.issuedAt).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Valid Until</div>
                <div className={`font-medium ${displayStatus === 'EXPIRED' ? 'text-red-600 font-bold' : 'text-slate-900'}`}>
                  {new Date(certificate.validUntil).toLocaleDateString()}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Application Ref</div>
                <Link href={`/app/applications/${certificate.applicationId}`} className="font-medium text-blue-700 hover:underline flex items-center gap-1 group">
                  {certificate.applicationNumber}
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                </Link>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Issued By</div>
                <div className="font-medium text-slate-900 truncate" title={certificate.issuerOfficerName}>
                  {certificate.issuerOfficerName}
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Cryptographic Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Digital Signature Hash</div>
            <div className="font-mono text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 break-all text-slate-700">
              {certificate.payloadHash}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Algorithm</div>
              <div className="font-medium text-sm text-slate-900">{certificate.signatureAlgorithm}</div>
            </div>
            
            <div className="flex items-center gap-2">
              {certificate.pdfObjectKey ? (
                <Button variant="secondary" className="w-full sm:w-auto" disabled title="PDF download endpoint is currently unavailable in this environment">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              ) : (
                <Button variant="secondary" className="w-full sm:w-auto" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  PDF Unavailable
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-xs text-slate-500 mt-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              This certificate is secured by a cryptographic signature. Anyone can verify its authenticity by scanning the official QR code or entering the Certificate No. at the public verification portal. Download functionality is restricted pending backend PDF generation services.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
