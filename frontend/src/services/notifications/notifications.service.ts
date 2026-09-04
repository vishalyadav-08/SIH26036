import { api } from "@/lib/api";
import { Paginated } from "@/types/instrument";
import { AppNotification, NotificationType } from "@/types/notification";

export type { AppNotification, NotificationType };

export interface NotificationQuery {
  unreadOnly?: boolean;
  type?: NotificationType;
  page?: number;
  pageSize?: number;
}

/**
 * The caller's own inbox. The server scopes every call to the signed-in
 * recipient; there is no way to read or mark someone else's notification.
 */
export const notificationsService = {
  async list(params: NotificationQuery = {}) {
    const { data } = await api.get<Paginated<AppNotification>>("/notifications/", {
      params,
    });

    return data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await api.get<{ unreadCount: number }>("/notifications/unread-count/");

    return data.unreadCount;
  },

  /** Idempotent: marking twice keeps the first readAt. */
  async markRead(id: string): Promise<AppNotification> {
    const { data } = await api.post<AppNotification>(`/notifications/${id}/read/`);

    return data;
  },

  async markAllRead(): Promise<number> {
    const { data } = await api.post<{ markedRead: number }>("/notifications/read-all/");

    return data.markedRead;
  },
};

export default notificationsService;

/* Named exports kept for the existing pages, unwrapping the list envelope. */

export async function getNotifications(params: NotificationQuery = {}) {
  return (await notificationsService.list({ pageSize: 50, ...params })).items;
}

export async function getUnreadNotificationCount() {
  return notificationsService.unreadCount();
}

export async function markNotificationAsRead(id: string) {
  await notificationsService.markRead(id);
}

export async function markAllNotificationsAsRead() {
  await notificationsService.markAllRead();
}
