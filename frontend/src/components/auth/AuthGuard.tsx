"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";

export interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({
  children,
  allowedRoles = ["BUSINESS"],
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      const redirectTarget = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectTarget}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === "BUSINESS") {
        router.replace("/app");
      } else if (user.role === "OFFICER") {
        router.replace("/field");
      } else {
        router.replace("/admin");
      }
    }
  }, [isAuthenticated, isLoading, user, router, pathname, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3" role="status">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">
            Verifying authorization...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
