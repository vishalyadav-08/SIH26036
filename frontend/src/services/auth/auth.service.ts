import { api } from "@/lib/api";
import { LoginCredentials, LoginResponse, User } from "@/types/auth";

const TOKEN_KEY = "mapansetu_access_token";
const USER_KEY = "mapansetu_user";

// Documented Synthetic Prototype Demo Accounts (docs/DEMO_PLAN.md)
export const DEMO_ACCOUNTS: Record<
  string,
  { password: string; response: LoginResponse }
> = {
  "business@example.test": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-business-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-08-30T12:00:00Z",
      user: {
        id: "usr-demo-biz-001",
        email: "business@example.test",
        displayName: "Demo Business Owner",
        role: "BUSINESS",
        businessId: "biz-demo-001",
        active: true,
      },
    },
  },
  "admin@example.test": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-admin-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-08-30T12:00:00Z",
      user: {
        id: "usr-demo-adm-001",
        email: "admin@example.test",
        displayName: "Supervisor Admin",
        role: "ADMIN",
        active: true,
      },
    },
  },
  "officer@example.test": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-officer-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-08-30T12:00:00Z",
      user: {
        id: "usr-demo-off-001",
        email: "officer@example.test",
        displayName: "Inspector Sharma (LMO)",
        role: "OFFICER",
        active: true,
      },
    },
  },
};

export async function loginUser(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const normalizedEmail = credentials.email.trim().toLowerCase();

  try {
    const res = await api.post<LoginResponse>("/auth/login", {
      email: normalizedEmail,
      password: credentials.password,
    });
    return res.data;
  } catch (error: unknown) {
    // If backend is offline or in prototype demo environment, fall back to synthetic demo accounts
    const demoAccount = DEMO_ACCOUNTS[normalizedEmail];
    if (demoAccount && demoAccount.password === credentials.password) {
      return demoAccount.response;
    }

    // Pass through or raise generic invalid credentials error
    throw error;
  }
}

export async function fetchCurrentUser(): Promise<User> {
  try {
    const res = await api.get<User>("/users/me");
    return res.data;
  } catch (error: unknown) {
    // If backend is unavailable or during offline prototype testing, fallback to stored user session
    const storedUser = getStoredUser();
    if (storedUser) {
      return storedUser;
    }
    throw error;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredSession(token: string, user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
