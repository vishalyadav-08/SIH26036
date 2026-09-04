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
  RefreshCw,
} from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notifications/notifications.service";
import { AppNotification, NotificationType } from "@/types/notification";

const STYLE: Record<NotificationType, { box: string; Icon: typeof Info }> = {
  APPLICATION_UPDATE: { box: "bg-blue-100 text-blue-800", Icon: Info },
  SCHEDULE_UPDATE: { box: "bg-sky-100 text-sky-800", Icon: CalendarClock },
  INSPECTION_RESULT: { box: "bg-violet-100 text-violet-800", Icon: ClipboardCheck },
  CERTIFICATE_ISSUED: { box: "bg-emerald-100 text-emerald-800", Icon: CheckCircle2 },
  CERTIFICATE_REVOKED: { box: "bg-rose-100 text-rose-800", Icon: ShieldOff },
  EXPIRY_WARNING: { box: "bg-amber-100 text-amber-800", Icon: AlertTriangle },
  SYNC_RESULT: { box: "bg-slate-100 text-slate-800", Icon: RefreshCw },
  GENERAL: { box: "bg-slate-100 text-slate-800", Icon: Info },
};

/**
 * The signed-in user's inbox, with per-item and mark-all read. The accent
 * colour follows the portal it is embedded in.
 */
export function NotificationsFeed({
  title,
  subtitle,
  accent = "blue",
  emptyText = "No notifications at this time.",
}: {
  title: string;
  subtitle: string;
  accent?: "blue" | "indigo" | "emerald";
  emptyText?: string;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setNotifications(await getNotifications());
      setError(null);
    } catch {
      setError("Could not load notifications. You may be offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const list = await getNotifications();
        if (mounted) setNotifications(list);
      } catch {
        if (mounted) setError("Could not load notifications. You may be offline.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const accentText = { blue: "text-blue-600", indigo: "text-indigo-600", emerald: "text-emerald-600" }[accent];
  const accentBg = {
    blue: "bg-blue-50/40 hover:bg-blue-50/60",
    indigo: "bg-indigo-50/40 hover:bg-indigo-50/60",
    emerald: "bg-emerald-50/40 hover:bg-emerald-50/60",
  }[accent];
  const accentDot = { blue: "bg-blue-600", indigo: "bg-indigo-600", emerald: "bg-emerald-600" }[accent];
  const accentHover = { blue: "hover:bg-blue-600", indigo: "hover:bg-indigo-600", emerald: "hover:bg-emerald-600" }[accent];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
        <div className="h-10 bg-slate-200 rounded-xl w-64" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={async () => {
              await markAllNotificationsAsRead();
              await load();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className={`w-4 h-4 ${accentText}`} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p>{emptyText}</p>
          </div>
        ) : (
          notifications.map((n) => {
            const { box, Icon } = STYLE[n.type] ?? STYLE.GENERAL;

            return (
              <div
                key={n.id}
                className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                  !n.read ? accentBg : "hover:bg-slate-50/80"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${box}`}>
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
                      {!n.read && <span className={`w-2 h-2 rounded-full ${accentDot}`} />}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.message}</p>
                    <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  {n.link && (
                    <Link
                      href={n.link}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 ${accentHover} text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors`}
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      type="button"
                      onClick={async () => {
                        await markNotificationAsRead(n.id);
                        await load();
                      }}
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
