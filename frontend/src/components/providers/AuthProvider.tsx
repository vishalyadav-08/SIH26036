"use client";

import { useEffect, useState, useCallback, ReactNode } from "react";

import { setUnauthorizedHandler } from "@/lib/api";
import { AuthContext } from "@/contexts/auth-context";
import { User, LoginCredentials } from "@/types/auth";
import {
  loginUser,
  getStoredToken,
  getStoredUser,
  setStoredSession,
  clearStoredSession,
  fetchCurrentUser,
  loginWithGoogleRequest,
} from "@/services/auth/auth.service";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    /**
     * Bootstrap must ask the server, not just read localStorage.
     *
     * The stored token is a real JWT that expires. Trusting it unchecked meant
     * a returning user looked signed in while every request 401'd. The cached
     * values are used only to render immediately; the server is the authority
     * on whether the session is still good.
     */
    (async () => {
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();

      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (storedUser && isMounted) {
        setAccessToken(storedToken);
        setUser(storedUser);
      }

      try {
        const current = await fetchCurrentUser();

        if (!isMounted) return;

        setAccessToken(storedToken);
        setUser(current);
        setStoredSession(storedToken, current);
      } catch {
        // Expired, revoked, or the account was deactivated. Either way there
        // is no usable session, so do not leave a stale one on screen.
        if (!isMounted) return;

        clearStoredSession();
        setAccessToken(null);
        setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<User> => {
      const data = await loginUser(credentials);
      setStoredSession(data.accessToken, data.user);
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data.user;
    },
    []
  );

  // The HTTP layer reports a dead session; it does not navigate. When a
  // request 401s mid-session this clears state and the mounted guard decides
  // where the user goes — so the redirect rule lives in exactly one place.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearStoredSession();
      setAccessToken(null);
      setUser(null);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  /**
   * Google sign-in. Goes through the same state path as password login so a
   * Google session is not a second, subtly different kind of session.
   */
  const loginWithGoogle = useCallback(async (idToken: string): Promise<User> => {
    const data = await loginWithGoogleRequest(idToken);

    setStoredSession(data.accessToken, data.user);
    setAccessToken(data.accessToken);
    setUser(data.user);

    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
