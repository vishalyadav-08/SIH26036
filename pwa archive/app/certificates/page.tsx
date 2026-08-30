"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ArrowRight,
  XCircle,
} from "lucide-react";
import { getCertificates } from "@/services/certificates/certificates.service";
import { Certificate } from "@/types/certificate";
import { AuditHashBadge } from "@/components/admin/AuditHashBadge";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All Certificates", value: "ALL" },
  { label: "Valid & Active", value: "VALID" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Revoked", value: "REVOKED" },
];

export default function BusinessCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const list = await getCertificates();
        if (isMounted) setCertificates(list);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = certificates.filter((c) => {
    if (selectedFilter !== "ALL" && c.status !== selectedFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.certificateNumber.toLowerCase().includes(q) ||
        c.instrumentNumber.toLowerCase().includes(q) ||
        c.businessName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-64" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Statutory Verification Certificates
        </h1>
        <p className="text-xs text-slate-600">
          Official digital certificates and cryptographic stamping issued by Legal Metrology Officers
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by certificate number or instrument ID..."
            className="block w-full pl-10 pr-4 py-2.5 bg-white text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setSelectedFilter(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedFilter === f.value
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Award className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No certificates found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3 px-4">Certificate #</th>
                  <th className="py-3 px-4">Instrument</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Cryptographic Hash</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link
                        href={`/app/certificates/${cert.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {cert.certificateNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-slate-800">
                        {cert.instrumentNumber}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {cert.instrumentType.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          cert.status === "VALID"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : cert.status === "EXPIRED"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {cert.status === "VALID" ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : cert.status === "EXPIRED" ? (
                          <Clock className="w-3 h-3 text-amber-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        )}
                        <span>{cert.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {new Date(cert.validUntil).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <AuditHashBadge hash={cert.payloadHash} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/verify/${cert.certificateNumber}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                          title="Open public certificate verifier"
                        >
                          <span>Public Verify</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        <Link
                          href={`/app/certificates/${cert.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
