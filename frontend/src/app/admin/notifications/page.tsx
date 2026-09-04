"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  CheckCheck,
  ArrowRight,
  CalendarClock,
  ShieldOff,
  ClipboardCheck,
} from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notifications/notifications.service";
import { AppNotification, NotificationType } from "@/types/notification";

const STYLE: Record<NotificationType, { box: string; Icon: typeof Info }> = {
  APPLICATION_UPDATE: { box: "bg-indigo-100 text-indigo-800", Icon: Info },
  SCHEDULE_UPDATE: { box: "bg-blue-100 text-blue-800", Icon: CalendarClock },
  INSPECTION_RESULT: { box: "bg-violet-100 text-violet-800", Icon: ClipboardCheck },
  CERTIFICATE_ISSUED: { box: "bg-emerald-100 text-emerald-800", Icon: CheckCircle2 },
  CERTIFICATE_REVOKED: { box: "bg-rose-100 text-rose-800", Icon: ShieldOff },
  EXPIRY_WARNING: { box: "bg-amber-100 text-amber-800", Icon: AlertTriangle },
  SYNC_RESULT: { box: "bg-slate-100 text-slate-800", Icon: Info },
  GENERAL: { box: "bg-slate-100 text-slate-800", Icon: Info },
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setNotifications(await getNotifications());
    } finally {
      setLoading(false);
    }
  };

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

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    await loadData();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    await loadData();
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-64" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Departmental Alerts & Notifications
          </h1>
          <p className="text-xs text-slate-600">
            New verification requests, inspection outcomes, and cancellations that need
            departmental attention
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-indigo-600" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No departmental notifications.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const { box, Icon } = STYLE[n.type] ?? STYLE.GENERAL;

            return (
              <div
                key={n.id}
                className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                  !n.read ? "bg-indigo-50/40 hover:bg-indigo-50/60" : "hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${box}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-xs ${
                          !n.read ? "font-bold text-slate-900" : "font-semibold text-slate-800"
                        }`}
                      >
                        {n.title}
                      </h2>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {n.message}
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  {n.link && (
                    <Link
                      href={n.link}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
