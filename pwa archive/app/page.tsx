"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Gauge,
  FileCheck2,
  Award,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  Bell,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getInstruments } from "@/services/instruments/instruments.service";
import { getApplications } from "@/services/applications/applications.service";
import { getNotifications } from "@/services/notifications/notifications.service";
import { Instrument } from "@/types/instrument";
import { Application } from "@/types/application";
import { AppNotification } from "@/types/notification";

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [insData, appData, notifData] = await Promise.all([
          getInstruments(),
          getApplications(),
          getNotifications(),
        ]);

        if (isMounted) {
          setInstruments(insData);
          setApplications(appData);
          setNotifications(notifData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute KPI metrics
  const totalInstruments = instruments.length;
  const activeInstruments = instruments.filter(
    (ins) => ins.status === "ACTIVE"
  ).length;
  const pendingApplications = applications.filter(
    (app) => app.state === "SUBMITTED" || app.state === "SCHEDULED" || app.state === "ASSIGNED"
  ).length;
  const completedCertificates = applications.filter(
    (app) => app.state === "COMPLETED" && app.certificateNumber
  ).length;
  const expiredOrDue = instruments.filter(
    (ins) => ins.status === "PENDING_VERIFICATION" || ins.status === "EXPIRED"
  ).length;

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            SUBMITTED
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            SCHEDULED
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Clock className="w-3 h-3" />
            ASSIGNED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {state}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse" role="status" aria-label="Loading dashboard data">
        <span className="sr-only">Loading dashboard...</span>
        {/* Header Skeleton */}
        <div className="h-20 bg-slate-200 rounded-2xl w-full" />
        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200 rounded-2xl" />
          <div className="h-72 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Greeting & Quick Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {user?.displayName || "Business Partner"}
            </h1>
          </div>
          <p className="text-sm text-slate-600">
            Legal Metrology verification workspace • Business ID:{" "}
            <span className="font-mono font-semibold text-slate-800">
              {user?.businessId || "biz-demo-001"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/app/instruments/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Instrument</span>
          </Link>
          <Link
            href="/app/applications/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>New Application</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Instruments */}
        <Link
          href="/app/instruments"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Instruments
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {totalInstruments}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              {activeInstruments} active
            </span>
          </div>
        </Link>

        {/* Card 2: In-Progress Applications */}
        <Link
          href="/app/applications"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Verification
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {pendingApplications}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              pending visits
            </span>
          </div>
        </Link>

        {/* Card 3: Active Certificates */}
        <Link
          href="/app/certificates"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Certificates
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {completedCertificates}
            </span>
            <span className="text-xs text-emerald-600 font-medium">
              verified
            </span>
          </div>
        </Link>

        {/* Card 4: Action Required / Expiring */}
        <Link
          href="/app/instruments"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Attention Required
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {expiredOrDue}
            </span>
            <span className="text-xs text-rose-600 font-medium">
              verification due
            </span>
          </div>
        </Link>
      </div>

      {/* Main Content Area: Recent Applications & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Applications
                </h2>
                <p className="text-xs text-slate-500">
                  Track statutory verification progress and inspector assignment
                </p>
              </div>
              <Link
                href="/app/applications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-sm font-medium text-slate-600">
                  No verification applications found
                </div>
                <Link
                  href="/app/applications/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start New Application</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 rounded-xl px-2 -mx-2 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {app.applicationNumber}
                        </span>
                        {getStatusBadge(app.state)}
                      </div>
                      <div className="text-xs text-slate-600">
                        {app.instrumentNumber} • {app.instrumentType.replace(/_/g, " ")}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                        {app.assignedOfficerName ? (
                          <span>{app.assignedOfficerName}</span>
                        ) : (
                          <span className="italic">Awaiting Officer</span>
                        )}
                      </div>

                      {app.certificateNumber ? (
                        <Link
                          href={`/verify/${app.certificateNumber}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                        >
                          <span>Cert: {app.certificateNumber}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <Link
                          href={`/app/applications/${app.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Notifications & Quick Verifier */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Updates
                </h2>
              </div>
              <Link
                href="/app/notifications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {notifications.slice(0, 3).map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1 text-xs"
                >
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>{notif.title}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Public Certificate Verification Tool */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm">Public Verifier</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verify cryptographic digital signatures on any issued certificate
              number publicly.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 pt-1"
            >
              <span>Go to Public Certificate Lookup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
