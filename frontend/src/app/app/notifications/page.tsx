"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, FileText, AlertTriangle, Info, ShieldCheck, ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "@/services/notifications/notifications.service";
import type { AppNotification, NotificationType } from "@/types/notification";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "APPLICATION_UPDATE":
      return <FileText className="w-5 h-5 text-blue-600" />;
    case "CERTIFICATE_ISSUED":
      return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
    case "EXPIRY_WARNING":
      return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    case "GENERAL":
    default:
      return <Info className="w-5 h-5 text-slate-500" />;
  }
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      // Sort to show newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Notifications" 
          subtitle="Updates and alerts regarding your business compliance."
        />
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead} className="shrink-0 text-slate-600 hover:text-slate-900">
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-slate-50/50">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-2">You&apos;re all caught up</p>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            You don&apos;t have any notifications at the moment. We&apos;ll alert you here when there are updates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`group flex flex-col sm:flex-row gap-4 p-5 rounded-xl border transition-colors ${
                notif.read ? "bg-white border-slate-200" : "bg-blue-50/30 border-blue-200 shadow-sm"
              }`}
            >
              <div className="shrink-0 flex items-start gap-4">
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${notif.read ? "bg-transparent" : "bg-blue-600"}`} aria-label={notif.read ? "Read" : "Unread"} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  notif.read ? "bg-slate-100" : "bg-blue-100"
                }`}>
                  {getNotificationIcon(notif.type)}
                </div>
              </div>
              
              <div className="flex-1 space-y-1 mt-0.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <h3 className={`text-base font-semibold ${notif.read ? "text-slate-700" : "text-slate-900"}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleString(undefined, { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${notif.read ? "text-slate-600" : "text-slate-800"}`}>
                  {notif.message}
                </p>
                
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  {notif.link && (
                    <Button variant={notif.read ? "outline" : "default"} size="sm" asChild className="h-8 text-xs">
                      <Link href={notif.link}>
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1.5" />
                      </Link>
                    </Button>
                  )}
                  {!notif.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="h-8 text-xs text-slate-600 hover:text-slate-900"
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
