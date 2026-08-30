"use client";

import { useEffect, useState, useCallback, ReactNode } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { User, LoginCredentials } from "@/types/auth";
import {
  loginUser,
  getStoredToken,
  getStoredUser,
  setStoredSession,
  clearStoredSession,
} from "@/services/auth/auth.service";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(() => {
      if (!isMounted) return;
      try {
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setUser(storedUser);
        }
      } catch {
        clearStoredSession();
      } finally {
        setIsLoading(false);
      }
    });

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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
