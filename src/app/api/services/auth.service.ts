import { api } from "./api.service";
import { getUserFromToken } from "./jwt";
import type { AuthState, AuthUser, JwtPayload, UserRole } from "../types";
import {
  clearAllAuthKeys,
  getAccessToken,
  getAuthMode,
  getRefreshToken,
  migrateLegacyAuthIfNeeded,
  writeAuthSession,
  updateTokensFromRefresh,
  USER_KEY,
  TOKEN_KEY,
  REFRESH_KEY,
  getTokenStorage,
} from "./auth-storage";

/** Mapeia role do backend (JWT) para o role do front (telas/permissões). */
function mapBackendRoleToFront(backendRole: string | undefined): UserRole {
  if (!backendRole) return "comercial";
  const r = backendRole.toUpperCase();
  if (r === "SYSTEM_ADMIN" || r === "ADMIN") return "admin";
  if (r === "DRIVER" || r === "MOTORISTA") return "motorista";
  if (r === "LOGISTICS" || r === "LOGISTICO" || r === "LOGISTICA") return "logistico";
  return "comercial";
}

function payloadToUser(payload: JwtPayload): AuthUser {
  return {
    id: payload.sub ?? "",
    nome: payload.name ?? payload.email ?? "Usuário",
    email: payload.email ?? "",
    role: mapBackendRoleToFront(payload.role),
  };
}

/** Role e nome autoritativos vindos do GET /auth/me (banco após JWT válido). */
function meResponseToUser(d: { id: string; email: string; name: string; role: string }): AuthUser {
  return {
    id: d.id,
    nome: d.name,
    email: d.email,
    role: mapBackendRoleToFront(d.role),
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
      if (typeof localStorage === "undefined") return;
      migrateLegacyAuthIfNeeded();

      const mode = getAuthMode();
      if (mode === "session" && !sessionStorage.getItem(TOKEN_KEY)) {
        clearAllAuthKeys();
        return;
      }
      if (mode === "persistent" && !localStorage.getItem(TOKEN_KEY)) {
        clearAllAuthKeys();
        return;
      }

      const store = mode === "session" ? sessionStorage : localStorage;
      const storedToken = store.getItem(TOKEN_KEY);
      const storedRefresh = store.getItem(REFRESH_KEY);
      if (!storedToken) {
        return;
      }
      /** Nunca confiar em `itamoving_user` gravado sozinho: role pode ser adulterada. Só o JWT (assinado) ou o /auth/me definem o perfil. */
      const payload = getUserFromToken(storedToken);
      if (!payload?.sub) {
        clearAllAuthKeys();
        return;
      }
      const user = payloadToUser(payload);
      this.authState = {
        ...this.authState,
        user,
        accessToken: storedToken,
        refreshToken: storedRefresh,
        isAuthenticated: true,
      };
      store.setItem(USER_KEY, JSON.stringify(user));
      this.notifyListeners();
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

  /**
   * Sincroniza role e dados com o banco (GET /auth/me).
   * O backend valida o JWT e devolve o usuário atual; corrige adulteração de localStorage.
   */
  async syncUserFromServer(): Promise<boolean> {
    const token = getAccessToken();
    if (!token) return false;
    try {
      const result = await api.get<{
        id: string;
        email: string;
        name: string;
        role: string;
      }>("/auth/me", { useCache: false });
      if (!result.success || !result.data) {
        return false;
      }
      const user = meResponseToUser(result.data);
      this.authState = {
        ...this.authState,
        user,
        isAuthenticated: true,
      };
      if (getAuthMode()) {
        const store = getTokenStorage();
        store.setItem(USER_KEY, JSON.stringify(this.authState.user));
      }
      this.notifyListeners();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Chamado após refresh via interceptor HTTP: mantém React em sync com storage.
   * O backend valida o novo access token em cada requisição.
   */
  applyRefreshedTokens(access: string, refresh: string): void {
    const payload = getUserFromToken(access);
    if (!payload?.sub) {
      this.clearSessionLocal();
      return;
    }
    const user = payloadToUser(payload);
    this.authState = {
      ...this.authState,
      accessToken: access,
      refreshToken: refresh,
      user,
      isAuthenticated: true,
    };
    const store = getTokenStorage();
    store.setItem(USER_KEY, JSON.stringify(user));
    updateTokensFromRefresh(access, refresh);
    this.notifyListeners();
  }

  /** Limpa sessão local sem chamar API (ex.: falha no refresh). */
  clearSessionLocal(): void {
    this.authState = {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
    clearAllAuthKeys();
    this.notifyListeners();
  }

  async login(
    login: string,
    password: string,
    rememberMe: boolean = true,
  ): Promise<{ success: boolean; error?: string }> {
    this.setLoading(true);
    this.setError(null);
    try {
      const result = await api.post<{
        access_token: string;
        refresh_token: string;
        expires_in?: number;
        token_type?: string;
      }>("/auth/login", { login, password });

      if (!result.success || !result.data) {
        this.setError(result.error ?? "Erro ao fazer login");
        return { success: false, error: result.error };
      }

      const payload = getUserFromToken(result.data.access_token);
      if (!payload?.sub) {
        this.setError("Resposta de login inválida");
        return { success: false, error: "Resposta inválida" };
      }

      const user = payloadToUser(payload);
      const refresh = result.data.refresh_token ?? null;
      this.authState = {
        ...this.authState,
        user,
        accessToken: result.data.access_token,
        refreshToken: refresh,
        isAuthenticated: true,
      };
      writeAuthSession(
        JSON.stringify(user),
        result.data.access_token,
        refresh,
        rememberMe,
      );
      this.notifyListeners();
      return { success: true };
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao fazer login";
      this.setError(msg);
      return { success: false, error: msg };
    } finally {
      this.setLoading(false);
    }
  }

  async logout(): Promise<void> {
    this.setLoading(true);
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          await api.post("/auth/logout", { refreshToken });
        } catch {
          // ignora erro no logout do servidor
        }
      }
    } finally {
      this.clearAuth();
    }
  }

  async refreshToken(): Promise<{ success: boolean; error?: string }> {
    const rt = this.authState.refreshToken ?? getRefreshToken();
    if (!rt) {
      return { success: false, error: "Refresh token não disponível" };
    }
    try {
      const result = await api.post<{ access_token: string; refresh_token: string }>("/auth/refresh", {
        refreshToken: rt,
      });
      if (result.success && result.data) {
        const payload = getUserFromToken(result.data.access_token);
        if (!payload?.sub) {
          this.clearAuth();
          return { success: false, error: "Token inválido" };
        }
        const user = payloadToUser(payload);
        this.authState = {
          ...this.authState,
          user,
          accessToken: result.data.access_token,
          refreshToken: result.data.refresh_token,
        };
        updateTokensFromRefresh(result.data.access_token, result.data.refresh_token);
        const store = getTokenStorage();
        store.setItem(USER_KEY, JSON.stringify(user));
        this.notifyListeners();
        return { success: true };
      }
      this.clearAuth();
      return { success: false, error: result.error };
    } catch {
      this.clearAuth();
      return { success: false, error: "Erro ao renovar sessão" };
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

  private clearAuth(): void {
    this.authState = {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
    clearAllAuthKeys();
    this.notifyListeners();
  }
}

export const authService = new AuthService();
