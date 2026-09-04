import { UserRole } from "@/types/auth";

export const FIELD_STAFF_ROLES: UserRole[] = ["LMO", "GATC"];

export function getDefaultRouteForRole(role: UserRole): string {
  if (role === "BUSINESS") return "/app";
  if (FIELD_STAFF_ROLES.includes(role)) return "/field";
  return "/admin";
}
