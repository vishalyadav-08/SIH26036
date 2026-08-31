import { api, TOKEN_KEY } from "@/lib/api";
import { LoginCredentials, LoginResponse, User } from "@/types/auth";

const USER_KEY = "mapansetu_user";

/**
 * Talks to the real API. The token is persisted in localStorage because the
 * backend issues a bearer token rather than a cookie session, so the client is
 * responsible for holding it and attaching it (see lib/api.ts).
 */
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login/", credentials);

    authService.persist(data.accessToken, data.user);

    return data;
  },

  /** Google Identity Services hands us an ID token; the API links it to an account. */
  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/google/", { idToken });

    authService.persist(data.accessToken, data.user);

    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/users/me/");

    return data;
  },

  logout() {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  },

  persist(token: string, user: User) {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;

    return window.localStorage.getItem(TOKEN_KEY);
  },

  /**
   * The cached user, used only to render immediately on reload. The server is
   * still asked via me(); this just avoids a blank frame while that resolves.
   */
  getCachedUser(): User | null {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem(USER_KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
};


/* ---------------------------------------------------------------------------
 * Named exports kept for AuthProvider, which was written against these.
 * ------------------------------------------------------------------------- */

export async function loginUser(credentials: LoginCredentials) {
  return authService.login(credentials);
}

export function getStoredToken() {
  return authService.getToken();
}

export function getStoredUser() {
  return authService.getCachedUser();
}

export function setStoredSession(token: string, user: User) {
  authService.persist(token, user);
}

export function clearStoredSession() {
  authService.logout();
}

/** Asks the server who the caller is. The cached user is only a render hint. */
export async function fetchCurrentUser() {
  return authService.me();
}

export async function loginWithGoogleRequest(idToken: string) {
  return authService.loginWithGoogle(idToken);
}

/** Self-registration with email and password. Always creates a BUSINESS account. */
export async function signupWithPassword(payload: {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
  legalName: string;
  contactName: string;
  address: string;
  tradeName?: string;
}) {
  const { data } = await api.post<LoginResponse>("/auth/signup/", payload);

  authService.persist(data.accessToken, data.user);

  return data;
}

/** Self-registration with a Google identity. Also BUSINESS only. */
export async function signupWithGoogle(payload: {
  idToken: string;
  legalName: string;
  contactName: string;
  address: string;
  tradeName?: string;
  phone?: string;
}) {
  const { data } = await api.post<LoginResponse>("/auth/google/signup/", payload);

  authService.persist(data.accessToken, data.user);

  return data;
}
