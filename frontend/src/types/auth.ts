export type UserRole = "BUSINESS" | "ADMIN" | "LMO" | "GATC";

export interface User {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  businessId?: string;
  active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  logout: () => void;
}
