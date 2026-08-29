import { api } from "@/lib/api";
import { AppNotification } from "@/types/notification";

const NOTIFICATIONS_STORAGE_KEY = "mapansetu_notifications_store";

export const INITIAL_DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-001",
    userId: "usr-demo-biz-001",
    title: "Verification Application Submitted",
    message:
      "Application APP-2026-0002 for Platform Scale (INS-DEMO-002) has been queued for officer review.",
    type: "APPLICATION_UPDATE",
    read: false,
    link: "/app/applications/app-uuid-002",
    createdAt: "2026-08-28T14:25:00Z",
  },
  {
    id: "notif-002",
    userId: "usr-demo-biz-001",
    title: "Digital Certificate Issued",
    message:
      "Certificate CERT-DEMO-001 has been cryptographically signed and issued for Electronic Scale.",
    type: "CERTIFICATE_ISSUED",
    read: true,
    link: "/verify/CERT-DEMO-001",
    createdAt: "2026-08-15T09:35:00Z",
  },
  {
    id: "notif-003",
    userId: "usr-demo-biz-001",
    title: "Instrument Verification Due",
    message:
      "Platform Scale (INS-DEMO-002) certificate has expired. Verification application submitted.",
    type: "EXPIRY_WARNING",
    read: true,
    link: "/app/instruments/ins-uuid-002",
    createdAt: "2026-08-15T00:00:00Z",
  },
];

function getStoredNotifications(): AppNotification[] {
  if (typeof window === "undefined") return INITIAL_DEMO_NOTIFICATIONS;
  const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(INITIAL_DEMO_NOTIFICATIONS)
    );
    return INITIAL_DEMO_NOTIFICATIONS;
  }
  try {
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return INITIAL_DEMO_NOTIFICATIONS;
  }
}

function saveStoredNotifications(notifs: AppNotification[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
}

export async function getNotifications(): Promise<AppNotification[]> {
  try {
    const res = await api.get<AppNotification[]>("/notifications");
    return res.data;
  } catch {
    return getStoredNotifications();
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await api.post(`/notifications/${id}/read`);
  } catch {
    const notifs = getStoredNotifications();
    const index = notifs.findIndex((n) => n.id === id);
    if (index >= 0) {
      notifs[index].read = true;
      saveStoredNotifications(notifs);
    }
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await api.post("/notifications/read-all");
  } catch {
    const notifs = getStoredNotifications();
    const updated = notifs.map((n) => ({ ...n, read: true }));
    saveStoredNotifications(updated);
  }
}
