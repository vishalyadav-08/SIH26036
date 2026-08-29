export type NotificationType =
  | "APPLICATION_UPDATE"
  | "CERTIFICATE_ISSUED"
  | "EXPIRY_WARNING"
  | "GENERAL";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}
