import axios, { InternalAxiosRequestConfig } from "axios";

import { HOST } from "@/config/host";

if (!HOST.backend) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}

export const TOKEN_KEY = "mapansetu_access_token";

export const api = axios.create({
  baseURL: HOST.api,
  headers: { "Content-Type": "application/json" },
});

/**
 * The API authenticates with a bearer token in the Authorization header
 * (ARCHITECTURE.md section 7), so the token has to be attached per request.
 *
 * It is read from localStorage at call time rather than captured once at
 * module load: the module is evaluated before anyone signs in, so a captured
 * value would be permanently null for the first session.
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window === "undefined") return config;

  const token = window.localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Called when the session is unusable. This layer reports the fact; it does
 * not navigate. A hard redirect here would fire on the public certificate
 * verification page too — which is meant to work with no account at all.
 */
type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

const PUBLIC_PATHS = ["/auth/login", "/auth/google", "/certificates/verify"];

function isPublicPath(url?: string) {
  return url ? PUBLIC_PATHS.some((p) => url.includes(p)) : false;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // A 401 on the login route means "wrong password", not "session expired".
    // Clearing state there would be wrong, so public routes are exempt.
    if (status === 401 && !isPublicPath(url)) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(TOKEN_KEY);
      }

      onUnauthorized?.();
    }

    return Promise.reject(error);
  }
);
