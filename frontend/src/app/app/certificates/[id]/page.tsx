"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Printer,
  Scale,
  ShieldCheck,
  KeyRound,
  XCircle,
} from "lucide-react";
import { getCertificateById } from "@/services/certificates/certificates.service";
import { Certificate } from "@/types/certificate";
import { AuditHashBadge } from "@/components/admin/AuditHashBadge";

export default function BusinessCertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const found = await getCertificateById(resolvedParams.id);
        if (isMounted) setCert(found);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-48" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
        <p className="text-sm text-slate-600">Certificate record not found.</p>
        <Link
          href="/app/certificates"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Certificates</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="print:hidden">
        <Link
          href="/app/certificates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Certificates Directory</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {cert.certificateNumber}
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                cert.status === "VALID"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : cert.status === "EXPIRED"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {cert.status === "VALID" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : cert.status === "EXPIRED" ? (
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{cert.status}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <Link
              href={`/verify/${cert.certificateNumber}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Open Public Verifier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Official Certificate Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-300 p-8 sm:p-12 shadow-sm space-y-8 relative overflow-hidden">
        {/* Decorative corner emblem */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full pointer-events-none -z-0 opacity-50" />

        {/* Certificate Masthead */}
        <div className="text-center space-y-2 border-b border-slate-200 pb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Government Legal Metrology Department
          </h2>
          <p className="text-xs uppercase tracking-widest font-bold text-blue-700">
            Certificate of Verification & Stamping
          </p>
          <div className="font-mono text-xs font-bold text-slate-600">
            Certificate ID: {cert.certificateNumber}
          </div>
        </div>

        {/* Certificate Body */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-800 leading-relaxed">
          <p>
            This is to certify that the weights and measures instrument described below has been officially inspected, calibrated, and tested in accordance with the statutory requirements of the <strong>Legal Metrology Act</strong> and is stamped as compliant.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 text-xs block">Commercial Entity:</span>
                <span className="font-bold text-slate-900">{cert.businessName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Instrument Identifier:</span>
                <span className="font-mono font-bold text-slate-900">{cert.instrumentNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Instrument Category:</span>
                <span className="font-semibold text-slate-800">{cert.instrumentType.replace(/_/g, " ")}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-500 text-xs block">Date of Issuance:</span>
                <span className="font-mono font-bold text-slate-900">
                  {new Date(cert.issuedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Statutory Validity Until:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {new Date(cert.validUntil).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Issuing Officer:</span>
                <span className="font-semibold text-slate-800">{cert.issuerOfficerName}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Security Details */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Digital Signature & Cryptographic Digest</span>
            </div>
            <div className="text-slate-300">
              Algorithm: <span className="text-white font-bold">{cert.signatureAlgorithm}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-slate-400">Payload Hash:</span>
              <AuditHashBadge hash={cert.payloadHash} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
