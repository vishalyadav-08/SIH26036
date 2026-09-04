import { USE_MOCK_API, api } from "@/lib/api";
import { LoginCredentials, LoginResponse, User } from "@/types/auth";

const TOKEN_KEY = "mapansetu_access_token";
const USER_KEY = "mapansetu_user";

// Documented Synthetic Prototype Demo Accounts (docs/DEMO_PLAN.md)
export const DEMO_ACCOUNTS: Record<
  string,
  { password: string; response: LoginResponse }
> = {
  // 1. Business Portal Accounts
  "info@shreebalaji.demo": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-business-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-12-31T23:59:59Z",
      user: {
        id: "usr-demo-biz-001",
        email: "info@shreebalaji.demo",
        displayName: "Synthetic Biz Owner",
        role: "BUSINESS",
        businessId: "biz-demo-001",
        active: true,
      },
    },
  },
  "business@mapansetu.in": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-business-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-12-31T23:59:59Z",
      user: {
        id: "usr-demo-biz-002",
        email: "business@mapansetu.in",
        displayName: "Shree Balaji Weighing Solutions",
        role: "BUSINESS",
        businessId: "biz-demo-001",
        active: true,
      },
    },
  },

  // 2. LMO (Legal Metrology Officer) Accounts
  "vinod.sharma@lmo.up.gov.demo": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-officer-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-12-31T23:59:59Z",
      user: {
        id: "usr-demo-off-001",
        email: "vinod.sharma@lmo.up.gov.demo",
        displayName: "Vinod Sharma (LMO)",
        role: "LMO",
        active: true,
      },
    },
  },
  "lmo@mapansetu.in": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-officer-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-12-31T23:59:59Z",
      user: {
        id: "usr-demo-off-002",
        email: "lmo@mapansetu.in",
        displayName: "Vinod Sharma (LMO)",
        role: "LMO",
        active: true,
      },
    },
  },

  // 3. GATCs (Government Approved Test Centre) Accounts
  "gatc@up.gov.demo": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-gatc-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-12-31T23:59:59Z",
      user: {
        id: "usr-demo-gatc-001",
        email: "gatc@up.gov.demo",
        displayName: "Demo Test Centre (GATC)",
        role: "GATC",
        active: true,
      },
    },
  },
  "gatc@mapansetu.in": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-gatc-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-12-31T23:59:59Z",
      user: {
        id: "usr-demo-gatc-002",
        email: "gatc@mapansetu.in",
        displayName: "Government Approved Test Centre",
        role: "GATC",
        active: true,
      },
    },
  },

  // 4. Admin Supervisor Accounts
  "admin@up.gov.demo": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-admin-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-12-31T23:59:59Z",
      user: {
        id: "usr-demo-adm-001",
        email: "admin@up.gov.demo",
        displayName: "Demo Supervisor (GATC)",
        role: "ADMIN",
        active: true,
      },
    },
  },
  "admin@mapansetu.in": {
    password: "synthetic-password",
    response: {
      accessToken: "demo-jwt-admin-token-sih26036",
      tokenType: "Bearer",
      expiresAt: "2026-12-31T23:59:59Z",
      user: {
        id: "usr-demo-adm-002",
        email: "admin@mapansetu.in",
        displayName: "Central Admin Supervisor",
        role: "ADMIN",
        active: true,
      },
    },
  },
};

export async function loginUser(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const normalizedEmail = credentials.email.trim().toLowerCase();

  if (USE_MOCK_API) {
    const demoAccount = DEMO_ACCOUNTS[normalizedEmail];
    if (demoAccount && demoAccount.password === credentials.password) {
      return demoAccount.response;
    }
    throw new Error("Invalid credentials");
  }

  // Real API
  const res = await api.post<LoginResponse>("/auth/login/", {
    email: normalizedEmail,
    password: credentials.password,
  });
  return res as unknown as LoginResponse;
}

export async function fetchCurrentUser(): Promise<User> {
  if (USE_MOCK_API) {
    const storedUser = getStoredUser();
    if (storedUser) {
      return storedUser;
    }
    throw new Error("No mocked user session");
  }

  // Real API
  const res = await api.get<User>("/users/me/");
  return res as unknown as User;
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
