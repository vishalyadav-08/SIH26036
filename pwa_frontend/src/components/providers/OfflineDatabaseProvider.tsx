"use client";

import { useEffect, useState } from "react";
import { db } from "@/offline/db";

export function OfflineDatabaseProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initDb = async () => {
      if (!db) return;
      
      try {
        if (!db.isOpen()) {
          await db.open();
        }
        if (mounted) {
          // Initialization success
        }
      } catch (err) {
        console.error("Failed to initialize MapanSetuOffline database:", err);
        if (mounted) {
          setError("Local offline storage is unavailable.");
        }
      }
    };

    initDb();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {error && (
        <div className="bg-red-50 text-red-600 text-xs text-center py-1 font-medium z-50 relative">
          {error}
        </div>
      )}
      {children}
    </>
  );
}
