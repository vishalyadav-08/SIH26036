"use client";

import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";

export interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

function checkRoleAllowed(userRole: UserRole, allowed: UserRole[]): boolean {
  if (allowed.includes(userRole)) return true;
  // GATC and ADMIN are authorization-equivalent supervisory roles
  if (
    (allowed.includes("ADMIN") || allowed.includes("GATC")) &&
    (userRole === "ADMIN" || userRole === "GATC")
  ) {
    return true;
  }
  // LMO and OFFICER are authorization-equivalent field officer roles
  if (
    (allowed.includes("OFFICER") || allowed.includes("LMO")) &&
    (userRole === "OFFICER" || userRole === "LMO")
  ) {
    return true;
  }
  return false;
}

export function AuthGuard({
  children,
  allowedRoles = ["BUSINESS"],
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowedKey = allowedRoles.join(",");
  const isAllowed = user ? checkRoleAllowed(user.role, allowedRoles) : false;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      const redirectTarget = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectTarget}`);
      return;
    }
  }, [isAuthenticated, isLoading, user, router, pathname, allowedKey]);

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

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
        <div className="max-w-sm w-full bg-white rounded-xl border border-[#cbd5e1] p-6 shadow-xs text-center space-y-4">
          <div className="w-8 h-8 border-3 border-[#004e9f] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#111c2d]">Authentication Required</h2>
            <p className="text-xs text-[#414753]">Redirecting to authorized login...</p>
          </div>
          <Link
            href={`/login?redirect=${encodeURIComponent(pathname || "/admin")}`}
            className="inline-block text-xs font-semibold text-[#004e9f] hover:underline"
          >
            Click here if not redirected automatically
          </Link>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-[#cbd5e1] p-6 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#111c2d]">Access Restricted</h2>
            <p className="text-xs text-[#414753] leading-relaxed">
              You are signed in as <strong className="text-[#111c2d]">{user.email}</strong> ({user.role}). This portal requires{" "}
              <strong className="text-[#004e9f]">
                {allowedRoles.map((r) => (r === "ADMIN" || r === "GATC" ? "GATCs" : r === "OFFICER" || r === "LMO" ? "LMO" : "Business")).join(" / ")}
              </strong>{" "}
              privileges.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                if (user.role === "BUSINESS") router.replace("/app");
                else if (user.role === "OFFICER" || user.role === "LMO") router.replace("/field");
                else router.replace("/admin");
              }}
              className="flex-1 px-4 py-2.5 bg-[#004e9f] hover:bg-[#003366] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Go to My Workspace
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="flex-1 px-4 py-2.5 border border-[#cbd5e1] text-[#414753] hover:bg-[#f8fafc] rounded-lg text-xs font-semibold transition-colors"
            >
              Switch Account / Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

