"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { getNotifications } from "@/services/notifications/notifications.service";
import { AppNotification } from "@/types/notification";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      try {
        const list = await getNotifications();
        if (isMounted) setNotifications(list);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-64" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Departmental Alerts & Notifications
        </h1>
        <p className="text-xs text-slate-600">
          Real-time alerts regarding submitted verification applications, scheduled appointments, and revocations
        </p>
      </div>

      {/* Notifications Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No active departmental notifications.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="p-5 flex items-start gap-4 hover:bg-slate-50/80 transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === "CERTIFICATE_ISSUED"
                    ? "bg-emerald-100 text-emerald-800"
                    : n.type === "EXPIRY_WARNING"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-indigo-100 text-indigo-800"
                }`}
              >
                {n.type === "CERTIFICATE_ISSUED" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : n.type === "EXPIRY_WARNING" ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-900">
                    {n.title}
                  </h2>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {n.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
