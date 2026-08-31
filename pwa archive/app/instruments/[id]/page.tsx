"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Award,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { getInstrumentById } from "@/services/instruments/instruments.service";
import { Instrument } from "@/types/instrument";

export default function InstrumentPassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const found = await getInstrumentById(resolvedParams.id);
        if (isMounted) setInstrument(found);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-48" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!instrument) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
        <p className="text-sm text-slate-600">Instrument record not found.</p>
        <Link
          href="/app/instruments"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Registered Instruments</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/app/instruments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Instruments Registry</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {instrument.instrumentNumber}
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                instrument.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : instrument.status === "PENDING_VERIFICATION"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {instrument.status === "ACTIVE" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : instrument.status === "PENDING_VERIFICATION" ? (
                <Clock className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              )}
              <span>{instrument.status.replace(/_/g, " ")}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/app/applications/new?instrumentId=${encodeURIComponent(
                instrument.id
              )}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Apply for Verification</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Specifications & Verification Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Specifications Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Gauge className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Technical Specifications
            </h2>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Category:</span>
              <span className="font-bold text-slate-900">
                {instrument.instrumentType.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Manufacturer:</span>
              <span className="font-semibold text-slate-800">
                {instrument.manufacturer}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Model:</span>
              <span className="font-mono text-slate-800">{instrument.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Serial Number:</span>
              <span className="font-mono text-slate-800">
                {instrument.serialNumber || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Rated Capacity:</span>
              <span className="font-mono font-bold text-slate-900">
                0 – {instrument.capacity} {instrument.capacityUnit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Premises Location:</span>
              <span className="text-slate-700 text-right">
                {instrument.location || "Registered Premises"}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Verification & Certification Status
            </h2>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Active Certificate:</span>
              <span>
                {instrument.activeCertificateNo ? (
                  <Link
                    href={`/verify/${instrument.activeCertificateNo}`}
                    target="_blank"
                    className="font-mono font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    <span>{instrument.activeCertificateNo}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-slate-400 italic">No Active Certificate</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Last Verified:</span>
              <span className="font-mono text-slate-800">
                {instrument.lastVerifiedAt
                  ? new Date(instrument.lastVerifiedAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Next Verification Due:</span>
              <span className="font-mono font-bold text-slate-900">
                {instrument.nextVerificationDue
                  ? new Date(instrument.nextVerificationDue).toLocaleDateString()
                  : "Verification Required"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Registration Date:</span>
              <span className="font-mono text-slate-700">
                {new Date(instrument.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {instrument.activeCertificateNo && (
            <div className="pt-2">
              <Link
                href={`/verify/${instrument.activeCertificateNo}`}
                target="_blank"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Open Public Certificate Verifier</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
