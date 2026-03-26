import { api } from './api.service';
import { getUserFromToken } from './jwt';
import type { AuthState, AuthUser, JwtPayload, UserRole } from '../types';

const TOKEN_KEY = 'auth_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'itamoving_user';

/** Mapeia role do backend (JWT) para o role do front (telas/permissões). */
function mapBackendRoleToFront(backendRole: string | undefined): UserRole {
  if (!backendRole) return 'comercial';
  const r = backendRole.toUpperCase();
  if (r === 'SYSTEM_ADMIN' || r === 'ADMIN') return 'admin';
  if (r === 'GUARD' || r === 'DOORMAN' || r === 'DRIVER') return 'motorista';
  if (r === 'LOGISTICS' || r === 'LOGISTICO') return 'logistico';
  return 'comercial';
}

function payloadToUser(payload: JwtPayload): AuthUser {
  return {
    id: payload.sub ?? '',
    nome: payload.name ?? payload.email ?? 'Usuário',
    email: payload.email ?? '',
    role: mapBackendRoleToFront(payload.role),
  };
}

export class AuthService {
  private authState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const storedUser = localStorage.getItem(USER_KEY);
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedRefresh = localStorage.getItem(REFRESH_KEY);
      if (storedUser && storedToken) {
        this.authState = {
          ...this.authState,
          user: JSON.parse(storedUser) as AuthUser,
          accessToken: storedToken,
          refreshToken: storedRefresh,
          isAuthenticated: true,
        };
        this.notifyListeners();
      }
    } catch {
      this.clearAuth();
    }
  }

  addAuthListener(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l(this.authState));
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  async login(login: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.setLoading(true);
    this.setError(null);
    try {
      const result = await api.post<{
        access_token: string;
        refresh_token: string;
        expires_in?: number;
        token_type?: string;
      }>('/auth/login', { login, password });

      if (!result.success || !result.data) {
        this.setError(result.error ?? 'Erro ao fazer login');
        return { success: false, error: result.error };
      }

      const payload = getUserFromToken(result.data.access_token);
      if (!payload?.sub) {
        this.setError('Resposta de login inválida');
        return { success: false, error: 'Resposta inválida' };
      }

      const user = payloadToUser(payload);
      this.setAuthData({
        user,
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token ?? null,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Erro ao fazer login';
      this.setError(msg);
      return { success: false, error: msg };
    } finally {
      this.setLoading(false);
    }
  }

  async logout(): Promise<void> {
    this.setLoading(true);
    try {
      const refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;
      if (refreshToken) {
        try {
          await api.post('/auth/logout', { refreshToken });
        } catch {
          // ignora erro no logout do servidor
        }
      }
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.refreshToken) {
      return { success: false, error: 'Refresh token não disponível' };
    }
    try {
      const result = await api.post<{ access_token: string; refresh_token: string }>('/auth/refresh', {
        refreshToken: this.authState.refreshToken,
      });
      if (result.success && result.data) {
        const payload = getUserFromToken(result.data.access_token);
        const user = payload ? payloadToUser(payload) : this.authState.user;
        this.setAuthData({
          ...this.authState,
          user: user ?? this.authState.user,
          accessToken: result.data.access_token,
          refreshToken: result.data.refresh_token,
        });
        return { success: true };
      }
      this.clearAuth();
      return { success: false, error: result.error };
    } catch {
      this.clearAuth();
      return { success: false, error: 'Erro ao renovar sessão' };
    }
  }

  private setLoading(loading: boolean): void {
    this.authState = { ...this.authState, isLoading: loading };
    this.notifyListeners();
  }

  private setError(error: string | null): void {
    this.authState = { ...this.authState, error };
    this.notifyListeners();
  }

  private setAuthData(data: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...data };
    if (typeof localStorage !== 'undefined') {
      if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
      if (data.refreshToken) localStorage.setItem(REFRESH_KEY, data.refreshToken);
    }
    this.notifyListeners();
  }

  private clearAuth(): void {
    this.authState = {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
    this.notifyListeners();
  }
}

export const authService = new AuthService();
