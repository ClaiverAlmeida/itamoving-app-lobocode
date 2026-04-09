import type { UserRole } from "../../types/auth";

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface JwtPayload {
  sub?: string;
  name?: string;
  email?: string;
  role?: string;
  userPermissions?: string[];
  permissions?: unknown[];
  iat?: number;
  exp?: number;
}
