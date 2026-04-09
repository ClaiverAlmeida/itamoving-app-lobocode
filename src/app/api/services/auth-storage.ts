/**
 * Persistência de sessão: tokens válidos são sempre verificados pelo backend (JWT em cada request / refresh).
 * - persistent: localStorage (mantém após fechar o navegador)
 * - session: sessionStorage (encerra ao fechar a aba/janela)
 */

export const TOKEN_KEY = "auth_token";
export const REFRESH_KEY = "refresh_token";
export const USER_KEY = "itamoving_user";
export const AUTH_MODE_KEY = "itamoving_auth_mode";

export type AuthPersistenceMode = "persistent" | "session";

export function getAuthMode(): AuthPersistenceMode | null {
  if (typeof localStorage === "undefined") return null;
  const v = localStorage.getItem(AUTH_MODE_KEY);
  if (v === "persistent" || v === "session") return v;
  return null;
}

export function setAuthMode(mode: AuthPersistenceMode): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(AUTH_MODE_KEY, mode);
}

export function clearAuthMode(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(AUTH_MODE_KEY);
}

/** Remove tokens e usuário de ambos os storages e o modo. */
export function clearAllAuthKeys(): void {
  if (typeof localStorage === "undefined") return;
  for (const k of [TOKEN_KEY, REFRESH_KEY, USER_KEY]) {
    try {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
  clearAuthMode();
}

/** Onde gravar tokens conforme o modo atual (default persistent se legado). */
export function getTokenStorage(): Storage {
  return getAuthMode() === "session" ? sessionStorage : localStorage;
}

export function getAccessToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  const mode = getAuthMode();
  if (mode === "session") {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  if (mode === "persistent") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  const mode = getAuthMode();
  if (mode === "session") {
    return sessionStorage.getItem(REFRESH_KEY);
  }
  if (mode === "persistent") {
    return localStorage.getItem(REFRESH_KEY);
  }
  return localStorage.getItem(REFRESH_KEY) ?? sessionStorage.getItem(REFRESH_KEY);
}

/**
 * Nova sessão após login: limpa tudo e grava no storage escolhido.
 */
export function writeAuthSession(
  userJson: string,
  access: string,
  refresh: string | null,
  persist: boolean,
): void {
  clearAllAuthKeys();
  setAuthMode(persist ? "persistent" : "session");
  const store = persist ? localStorage : sessionStorage;
  store.setItem(USER_KEY, userJson);
  store.setItem(TOKEN_KEY, access);
  if (refresh) store.setItem(REFRESH_KEY, refresh);
}

/** Atualiza apenas access/refresh no storage ativo (ex.: refresh axios). */
export function updateTokensFromRefresh(access: string, refresh: string): void {
  const mode = getAuthMode();
  if (!mode) return;
  const store = mode === "session" ? sessionStorage : localStorage;
  store.setItem(TOKEN_KEY, access);
  store.setItem(REFRESH_KEY, refresh);
}

/** Migração: havia token em localStorage sem modo (versões antigas). */
export function migrateLegacyAuthIfNeeded(): void {
  if (typeof localStorage === "undefined") return;
  if (getAuthMode()) return;
  if (localStorage.getItem(TOKEN_KEY)) {
    setAuthMode("persistent");
  }
}
