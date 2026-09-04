"use client";

import { NotificationsFeed } from "@/components/notifications/NotificationsFeed";

export default function FieldNotificationsPage() {
  return (
    <NotificationsFeed
      title="Officer Notifications"
      subtitle="Cases assigned to you, visit bookings, revocations, and offline sync outcomes"
      accent="emerald"
      emptyText="No notifications. New assignments and sync results will appear here."
    />
  );
}
