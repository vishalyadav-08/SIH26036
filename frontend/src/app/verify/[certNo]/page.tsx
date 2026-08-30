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
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-300",
      bannerBg: "bg-emerald-50/50 border-emerald-200",
      accentBg: "bg-emerald-600",
      icon: ShieldCheck,
      iconColor: "text-emerald-600",
      description:
        "This instrument certificate is active, currently valid, and its cryptographic digital signature has been verified.",
    },
    EXPIRED: {
      title: "Expired Certificate",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-300",
      bannerBg: "bg-amber-50/50 border-amber-200",
      accentBg: "bg-amber-600",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
      description:
        "The statutory validity period for this certificate has lapsed. A periodic re-verification application is required.",
    },
    REVOKED: {
      title: "Revoked Certificate",
      badgeColor: "bg-red-50 text-red-800 border-red-300",
      bannerBg: "bg-red-50/50 border-red-200",
      accentBg: "bg-red-600",
      icon: XCircle,
      iconColor: "text-red-600",
      description:
        "This certificate has been administratively revoked by an authorized supervisor and is no longer valid for commercial use.",
    },
    INVALID: {
      title: "Invalid / Record Not Found",
      badgeColor: "bg-rose-50 text-rose-800 border-rose-300",
      bannerBg: "bg-rose-50/50 border-rose-200",
      accentBg: "bg-rose-600",
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Lookup</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 tracking-tight">
                MapanSetu
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hidden sm:inline-block">
                SIH26036
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <span>Portal Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
          <div
            className="space-y-6 animate-pulse"
            role="status"
            aria-label="Loading verification details"
          >
            <span className="sr-only">
              Loading certificate verification details...
            </span>
            <div className="h-36 bg-slate-200 rounded-2xl w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-slate-200 rounded-2xl" />
              <div className="h-48 bg-slate-200 rounded-2xl" />
            </div>
            <div className="h-32 bg-slate-200 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Status Banner */}
            <div
              className={`rounded-2xl border p-6 sm:p-8 bg-white shadow-xs ${theme.bannerBg}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${theme.badgeColor}`}
                  >
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${theme.badgeColor}`}
                      >
                        {currentStatus}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        Public Verification Result
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                      {data?.certificateNumber || decodedCertNo}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    aria-label={
                      copiedLink
                        ? "Verification link copied to clipboard"
                        : "Copy verification link"
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <span
                        className="inline-flex items-center gap-1.5"
                        role="status"
                        aria-live="polite"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">
                          Link Copied
                        </span>
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>

              {/* Status Explanation Message */}
              <div className="pt-2 border-t border-slate-200/60">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {data?.verificationMessage || theme.description}
                </p>
                {data?.revocationReason && (
                  <div className="mt-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                    <span className="font-bold">Revocation Reason: </span>
                    <span>{data.revocationReason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Certificate Lifecycle Details */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Certificate Lifecycle
                    </h2>
                  </div>

                  <dl className="space-y-3.5 text-sm">
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500">Certificate No.</dt>
                      <dd className="font-mono font-bold text-slate-900 text-right">
                        {data?.certificateNumber || decodedCertNo}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500">Certificate Status</dt>
                      <dd className="font-medium text-slate-900">
                        {data?.certificateStatus ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${theme.badgeColor}`}
                          >
                            {data.certificateStatus}
                          </span>
                        ) : (
                          <span className="text-slate-400">Not Active</span>
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500">Date of Issuance</dt>
                      <dd className="font-medium text-slate-900">
                        {formatDate(data?.issuedAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-slate-500">Valid Until</dt>
                      <dd
                        className={`font-semibold ${
                          currentStatus === "EXPIRED"
                            ? "text-amber-700 font-bold"
                            : "text-slate-900"
                        }`}
                      >
                        {formatDate(data?.validUntil)}
                      </dd>
                    </div>
                    {data?.revokedAt && (
                      <div className="flex justify-between items-center text-red-700">
                        <dt className="font-medium">Revoked On</dt>
                        <dd className="font-bold">{formatDate(data.revokedAt)}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Timestamps verified against standard UTC records</span>
                </div>
              </div>

              {/* Card 2: Instrument Summary */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Instrument Summary
                    </h2>
                  </div>

                  {data?.instrumentSummary ? (
                    <dl className="space-y-3.5 text-sm">
                      <div className="flex justify-between items-center">
                        <dt className="text-slate-500">Instrument ID</dt>
                        <dd className="font-mono font-bold text-slate-900">
                          {data.instrumentSummary.instrumentNumber}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center">
                        <dt className="text-slate-500">Instrument Category</dt>
                        <dd className="font-medium text-slate-900 capitalize">
                          {data.instrumentSummary.instrumentType.replace(
                            /_/g,
                            " "
                          )}
                        </dd>
                      </div>
                      {data.instrumentSummary.manufacturer && (
                        <div className="flex justify-between items-center">
                          <dt className="text-slate-500">Manufacturer</dt>
                          <dd className="font-medium text-slate-900">
                            {data.instrumentSummary.manufacturer}
                          </dd>
                        </div>
                      )}
                      {data.instrumentSummary.model && (
                        <div className="flex justify-between items-center">
                          <dt className="text-slate-500">Model</dt>
                          <dd className="font-medium text-slate-900 font-mono">
                            {data.instrumentSummary.model}
                          </dd>
                        </div>
                      )}
                      {data.instrumentSummary.capacity !== undefined && (
                        <div className="flex justify-between items-center">
                          <dt className="text-slate-500">Rated Capacity</dt>
                          <dd className="font-semibold text-slate-900">
                            {data.instrumentSummary.capacity}{" "}
                            {data.instrumentSummary.capacityUnit || "kg"}
                          </dd>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <div className="py-6 text-center text-slate-500 text-sm">
                      <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p>
                        No instrument summary available for this unverified or
                        invalid identifier.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>
                    Minimal disclosure view — owner identity withheld for privacy
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Trust & Signature Verification Panel */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Cryptographic Integrity & Signature
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  {data?.signatureValid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Signature Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Unverified / Tampered</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-600">
                      Canonical Payload SHA-256 Digest:
                    </span>
                    {data?.payloadHash && (
                      <button
                        type="button"
                        onClick={handleCopyHash}
                        aria-label={
                          copiedHash
                            ? "Payload digest copied to clipboard"
                            : "Copy payload digest"
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      >
                        {copiedHash ? (
                          <span
                            className="inline-flex items-center gap-1"
                            role="status"
                            aria-live="polite"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </span>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Digest</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-800 break-all text-[11px] select-all">
                    {data?.payloadHash || "Not available (unverified record)"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-slate-600 text-[11px] border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700">Algorithm: </span>
                    <span>
                      {data?.signatureAlgorithm ||
                        "RSA-PSS with SHA-256 (2048-bit standard)"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Trust Model: </span>
                    <span>Authority public-key verification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Next Steps */}
            <div className="bg-slate-100/80 rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <div className="text-center sm:text-left">
                <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                  Need to check another instrument?
                </h3>
                <p className="text-xs text-slate-600">
                  Lookup any other certificate by ID or scan another QR sticker.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleRecheck}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Re-check</span>
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex-1 sm:flex-initial"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>New Certificate Lookup</span>
                </Link>
              </div>
            </div>

            {/* Demo Testing Switcher (Prototype helper) */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs print:hidden">
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Demo Switcher (SIH Evaluation Fixtures):
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: "CERT-DEMO-001",
                    label: "Valid Active",
                    color:
                      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                  },
                  {
                    id: "CERT-EXPIRED-001",
                    label: "Expired",
                    color:
                      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
                  },
                  {
                    id: "CERT-REVOKED-001",
                    label: "Revoked",
                    color:
                      "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
                  },
                  {
                    id: "CERT-TAMPER-001",
                    label: "Invalid / Tampered",
                    color:
                      "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
                  },
                ].map((fixture) => (
                  <Link
                    key={fixture.id}
                    href={`/verify/${fixture.id}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                      decodedCertNo.toUpperCase() === fixture.id
                        ? "ring-2 ring-blue-500 font-bold"
                        : ""
                    } ${fixture.color}`}
                  >
                    <span className="font-mono font-bold">{fixture.id}</span>
                    <span className="opacity-75">({fixture.label})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Prototype & Synthetic Data Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100 text-[11px] text-slate-500 leading-relaxed border border-slate-200/60">
              <p className="font-semibold text-slate-600 mb-0.5">
                SIH26036 Prototype Scope Notice:
              </p>
              <p>
                Verification results are generated in a prototype environment
                using synthetic datasets and configurable test criteria. The
                platform coordinates digital verification records and
                certificate discovery; it does not replace statutory legal
                metrology authority or claim live government integration.
              </p>
            </div>
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
              <Link
                href="/login"
                className="hover:text-slate-200 transition-colors"
              >
                Portal Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

