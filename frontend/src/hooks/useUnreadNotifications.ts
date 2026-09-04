"use client";

import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "@/services/notifications/notifications.service";

const POLL_MS = 60_000;

/**
 * Unread count for the header bell. Polls gently and refreshes when the tab
 * regains focus; a failed call leaves the last known value rather than
 * flashing zero.
 */
export function useUnreadNotifications(enabled = true) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const refresh = async () => {
      try {
        const value = await getUnreadNotificationCount();
        if (!cancelled) setCount(value);
      } catch {
        // Keep the last known value.
      }
    };

    refresh();
    const interval = setInterval(refresh, POLL_MS);
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled]);

  return count ?? 0;
}
