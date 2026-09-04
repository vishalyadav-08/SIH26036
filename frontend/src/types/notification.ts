/** Mirrors backend notifications.Notification.Type. */
export type NotificationType =
  | "APPLICATION_UPDATE"
  | "SCHEDULE_UPDATE"
  | "INSPECTION_RESULT"
  | "CERTIFICATE_ISSUED"
  | "CERTIFICATE_REVOKED"
  | "EXPIRY_WARNING"
  | "SYNC_RESULT"
  | "GENERAL";

export interface AppNotification {
  id: string;
  /** The recipient. Every row is for exactly one person. */
  userId: string;
  businessId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  readAt?: string | null;
  relatedEntityType?: string;
  relatedEntityId?: string | null;
  /** A path for this recipient's role, e.g. /app/applications/<id>. */
  link?: string;
  createdAt: string;
}
