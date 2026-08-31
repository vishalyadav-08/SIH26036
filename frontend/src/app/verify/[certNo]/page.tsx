"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  Printer,
  Calendar,
  ArrowRight,
  Shield,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { verifyPublicCertificate } from "@/services/certificates/certificates.service";
import { PublicVerificationResponse } from "@/types/certificate";

interface PageProps {
  params: Promise<{
    certNo: string;
  }>;
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicCertificateVerificationPage({
  params,
}: PageProps) {
  const resolvedParams = use(params);
  const rawCertNo = resolvedParams?.certNo || "";
  const decodedCertNo = decodeURIComponent(rawCertNo);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PublicVerificationResponse | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!decodedCertNo) return;

    verifyPublicCertificate(decodedCertNo)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setData({
            certificateNumber: decodedCertNo,
            verificationStatus: "INVALID",
            certificateStatus: null,
            signatureValid: false,
            payloadHash: null,
            signatureAlgorithm: null,
            issuedAt: null,
            validUntil: null,
            instrumentSummary: null,
            verificationMessage:
              "Unable to complete verification lookup. Please check network connection or verify the certificate number.",
          });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [decodedCertNo]);

  const handleRecheck = () => {
    setLoading(true);
    verifyPublicCertificate(decodedCertNo)
      .then((res) => {
        setData(res);
      })
      .catch(() => {
        setData({
          certificateNumber: decodedCertNo,
          verificationStatus: "INVALID",
          certificateStatus: null,
          signatureValid: false,
          payloadHash: null,
          signatureAlgorithm: null,
          issuedAt: null,
          validUntil: null,
          instrumentSummary: null,
          verificationMessage:
            "Unable to complete verification lookup. Please check network connection or verify the certificate number.",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCopyHash = () => {
    if (data?.payloadHash) {
      navigator.clipboard.writeText(data.payloadHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // Visual status theme configuration
  const statusConfig = {
    VALID: {
      title: "Valid & Active Certificate",
      badgeVariant: "default" as const,
      alertVariant: "default" as const,
      icon: ShieldCheck,
      iconColor: "text-emerald-600",
      description:
        "This instrument certificate is active, currently valid, and its cryptographic digital signature has been verified.",
    },
    EXPIRED: {
      title: "Expired Certificate",
      badgeVariant: "secondary" as const,
      alertVariant: "destructive" as const,
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      description:
        "The statutory validity period for this certificate has lapsed. A periodic re-verification application is required.",
    },
    REVOKED: {
      title: "Revoked Certificate",
      badgeVariant: "destructive" as const,
      alertVariant: "destructive" as const,
      icon: XCircle,
      iconColor: "text-red-600",
      description:
        "This certificate has been administratively revoked by an authorized supervisor and is no longer valid for commercial use.",
    },
    INVALID: {
      title: "Invalid / Record Not Found",
      badgeVariant: "destructive" as const,
      alertVariant: "destructive" as const,
      icon: AlertCircle,
      iconColor: "text-rose-600",
      description:
        "No active or matching verification record exists for this identifier, or cryptographic integrity checks failed.",
    },
  };

  const currentStatus = data?.verificationStatus || "INVALID";
  const theme = statusConfig[currentStatus];
  const StatusIcon = theme.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
                Back to Lookup
              </Link>
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight">MapanSetu</span>
              <Badge variant="secondary" className="hidden sm:inline-flex uppercase tracking-wider text-[10px]">
                SIH26036
              </Badge>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href="/login">
                Portal Sign In
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Verification Container */}
      <main
        aria-busy={loading}
        className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 print:py-0 print:max-w-none print:px-0"
      >
        {loading ? (
          /* Loading Skeleton */
          <div className="space-y-6" role="status" aria-label="Loading verification details">
            <span className="sr-only">Loading certificate verification details...</span>
            <Skeleton className="h-36 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Status Banner */}
            <Card className={currentStatus === "VALID" ? "border-emerald-200 bg-emerald-50/50" : currentStatus === "INVALID" ? "border-rose-200 bg-rose-50/50" : ""}>
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-background border shadow-xs">
                      <StatusIcon className={`w-6 h-6 ${theme.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={theme.badgeVariant} className="uppercase tracking-wider">
                          {currentStatus}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          Public Verification Result
                        </span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-mono">
                        {data?.certificateNumber || decodedCertNo}
                      </h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 shadow-xs">
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-success" />
                          <span className="text-success font-medium">Link Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 shadow-xs">
                      <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Print Receipt</span>
                    </Button>
                  </div>
                </div>

                {/* Status Explanation Message */}
                <div className="pt-2 border-t mt-4">
                  <p className="text-sm leading-relaxed font-medium mt-2">
                    {data?.verificationMessage || theme.description}
                  </p>
                  {data?.revocationReason && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Revocation Reason</AlertTitle>
                      <AlertDescription>
                        {data.revocationReason}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Certificate Lifecycle Details */}
              <Card>
                <CardHeader className="pb-3 border-b mb-4">
                  <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-wider">
                    <FileCheck className="w-5 h-5 text-primary" />
                    Certificate Lifecycle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3.5 text-sm">
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">Certificate No.</dt>
                      <dd className="font-mono font-bold text-right">
                        {data?.certificateNumber || decodedCertNo}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">Certificate Status</dt>
                      <dd className="font-medium">
                        {data?.certificateStatus ? (
                          <Badge variant={theme.badgeVariant} className="uppercase">
                            {data.certificateStatus}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Not Active</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">Date of Issuance</dt>
                      <dd className="font-medium">
                        {formatDate(data?.issuedAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">Valid Until</dt>
                      <dd className={`font-semibold ${currentStatus === "EXPIRED" ? "text-warning" : ""}`}>
                        {formatDate(data?.validUntil)}
                      </dd>
                    </div>
                    {data?.revokedAt && (
                      <div className="flex justify-between items-center text-destructive">
                        <dt className="font-medium">Revoked On</dt>
                        <dd className="font-bold">{formatDate(data.revokedAt)}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
                <CardFooter className="border-t pt-3 mt-4 text-[11px] text-muted-foreground flex items-center gap-1.5 pb-3">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Timestamps verified against standard UTC records</span>
                </CardFooter>
              </Card>

              {/* Card 2: Instrument Summary */}
              <Card>
                <CardHeader className="pb-3 border-b mb-4">
                  <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-wider">
                    <Scale className="w-5 h-5 text-primary" />
                    Instrument Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.instrumentSummary ? (
                    <dl className="space-y-3.5 text-sm">
                      <div className="flex justify-between items-center">
                        <dt className="text-muted-foreground">Instrument ID</dt>
                        <dd className="font-mono font-bold">
                          {data.instrumentSummary.instrumentNumber}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center">
                        <dt className="text-muted-foreground">Instrument Category</dt>
                        <dd className="font-medium capitalize">
                          {data.instrumentSummary.instrumentType.replace(/_/g, " ")}
                        </dd>
                      </div>
                      {data.instrumentSummary.manufacturer && (
                        <div className="flex justify-between items-center">
                          <dt className="text-muted-foreground">Manufacturer</dt>
                          <dd className="font-medium">
                            {data.instrumentSummary.manufacturer}
                          </dd>
                        </div>
                      )}
                      {data.instrumentSummary.model && (
                        <div className="flex justify-between items-center">
                          <dt className="text-muted-foreground">Model</dt>
                          <dd className="font-medium font-mono">
                            {data.instrumentSummary.model}
                          </dd>
                        </div>
                      )}
                      {data.instrumentSummary.capacity !== undefined && (
                        <div className="flex justify-between items-center">
                          <dt className="text-muted-foreground">Rated Capacity</dt>
                          <dd className="font-semibold">
                            {data.instrumentSummary.capacity} {data.instrumentSummary.capacityUnit || "kg"}
                          </dd>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <div className="py-6 text-center text-muted-foreground text-sm flex flex-col items-center">
                      <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                      <p>No instrument summary available for this unverified or invalid identifier.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-3 mt-4 text-[11px] text-muted-foreground pb-3">
                  Minimal disclosure view — owner identity withheld for privacy
                </CardFooter>
              </Card>
            </div>

            {/* Cryptographic Trust & Signature Verification Panel */}
            <Card>
              <CardHeader className="pb-3 border-b mb-4 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-wider">
                  <Shield className="w-5 h-5 text-primary" />
                  Cryptographic Integrity & Signature
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  {data?.signatureValid ? (
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Signature Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-rose-700 bg-rose-50 border-rose-200 gap-1 font-semibold">
                      <XCircle className="w-3.5 h-3.5" />
                      Unverified / Tampered
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-muted-foreground">
                      Canonical Payload SHA-256 Digest:
                    </span>
                    {data?.payloadHash && (
                      <Button variant="ghost" size="sm" onClick={handleCopyHash} className="h-6 px-2 text-[11px] gap-1 text-primary">
                        {copiedHash ? (
                          <>
                            <Check className="w-3 h-3 text-success" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Digest
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="p-3 bg-muted rounded-xl border font-mono break-all text-[11px] select-all">
                    {data?.payloadHash || "Not available (unverified record)"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t text-[11px]">
                  <div>
                    <span className="font-bold">Algorithm: </span>
                    <span className="text-muted-foreground">
                      {data?.signatureAlgorithm || "RSA-PSS with SHA-256 (2048-bit standard)"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">Trust Model: </span>
                    <span className="text-muted-foreground">Authority public-key verification</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions & Next Steps */}
            <Card className="bg-muted/50 print:hidden">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-sm font-bold mb-0.5">
                    Need to check another instrument?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Lookup any other certificate by ID or scan another QR sticker.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button variant="outline" onClick={handleRecheck} className="gap-1.5 shadow-xs">
                    <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                    Re-check
                  </Button>
                  <Button asChild className="gap-1.5 shadow-xs flex-1 sm:flex-initial">
                    <Link href="/">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      New Certificate Lookup
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Demo Testing Switcher (Prototype helper) */}
            <div className="p-4 rounded-xl bg-background border text-xs print:hidden">
              <span className="font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Quick Demo Switcher (SIH Evaluation Fixtures):
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "CERT-DEMO-001", label: "Valid Active" },
                  { id: "CERT-EXPIRED-001", label: "Expired" },
                  { id: "CERT-REVOKED-001", label: "Revoked" },
                  { id: "CERT-TAMPER-001", label: "Invalid / Tampered" },
                ].map((fixture) => (
                  <Button
                    key={fixture.id}
                    variant={decodedCertNo.toUpperCase() === fixture.id ? "default" : "outline"}
                    size="sm"
                    asChild
                    className="gap-1.5"
                  >
                    <Link href={`/verify/${fixture.id}`}>
                      <span className="font-mono font-bold">{fixture.id}</span>
                      <span className={decodedCertNo.toUpperCase() === fixture.id ? "opacity-75" : "text-muted-foreground"}>
                        ({fixture.label})
                      </span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            {/* Prototype & Synthetic Data Disclaimer */}
            <Alert className="bg-muted/50 border-muted">
              <AlertTitle className="text-xs font-semibold">SIH26036 Prototype Scope Notice:</AlertTitle>
              <AlertDescription className="text-[11px] leading-relaxed">
                Verification results are generated in a prototype environment using synthetic datasets and configurable test criteria. The platform coordinates digital verification records and certificate discovery; it does not replace statutory legal metrology authority or claim live government integration.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-200">MapanSetu</span>
              <span>— Smart India Hackathon (SIH26036)</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-slate-200 transition-colors">
                Public Lookup
              </Link>
              <Link href="/login" className="hover:text-slate-200 transition-colors">
                Portal Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

