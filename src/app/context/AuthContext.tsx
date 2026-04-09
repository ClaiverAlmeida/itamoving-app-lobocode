import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService, connectSocket, disconnectSocket, pushService } from '../api';
import type { AuthUser, UserRole } from '../api';

export type { UserRole };

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Permission {
  clientes: { read: boolean; write: boolean };
  agendamentos: { read: boolean; write: boolean };
  estoque: { read: boolean; write: boolean };
  containers: { read: boolean; write: boolean };
  financeiro: { read: boolean; write: boolean };
  relatorios: { read: boolean; write: boolean };
  atendimentos: { read: boolean; write: boolean };
  rh: { read: boolean; write: boolean };
  rotas: { read: boolean; write: boolean };
  motorista: { read: boolean; write: boolean };
  configuracoes: { read: boolean; write: boolean };
  'ordem-de-servico': { read: boolean; write: boolean };
}

interface AuthContextType {
  user: User | null;
  /** `rememberMe`: grava em localStorage (persistente). Se false, sessão só em sessionStorage (fecha ao encerrar a aba). O backend valida o JWT em toda requisição. */
  login: (email: string, senha: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  permissions: Permission;
  hasPermission: (module: keyof Permission, action: 'read' | 'write') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    clientes: { read: true, write: true },
    agendamentos: { read: true, write: true },
    estoque: { read: true, write: true },
    containers: { read: true, write: true },
    financeiro: { read: true, write: true },
    relatorios: { read: true, write: true },
    atendimentos: { read: true, write: true },
    rh: { read: true, write: true },
    rotas: { read: true, write: true },
    motorista: { read: true, write: true },
    'ordem-de-servico': { read: true, write: true },
    configuracoes: { read: true, write: true },
  },
  comercial: {
    clientes: { read: true, write: true },
    agendamentos: { read: true, write: true },
    estoque: { read: true, write: true },
    containers: { read: true, write: false },
    financeiro: { read: true, write: false },
    relatorios: { read: true, write: false },
    atendimentos: { read: true, write: true },
    rh: { read: false, write: false },
    rotas: { read: true, write: false },
    motorista: { read: false, write: false },
    'ordem-de-servico': { read: false, write: false },
    configuracoes: { read: false, write: false },
  },
  logistico: {
    agendamentos: { read: true, write: true },
    containers: { read: true, write: true },
    rotas: { read: true, write: true },
    estoque: { read: true, write: false },
    'ordem-de-servico': { read: true, write: true },
    clientes: { read: false, write: false },
    financeiro: { read: false, write: false },
    relatorios: { read: false, write: false },
    atendimentos: { read: false, write: false },
    rh: { read: false, write: false },
    motorista: { read: false, write: false },
    configuracoes: { read: false, write: false },
  },
  motorista: {
    motorista: { read: true, write: true },
    'ordem-de-servico': { read: true, write: true },
    estoque: { read: true, write: false },
    agendamentos: { read: true, write: false },
    rotas: { read: true, write: false },
    clientes: { read: false, write: false },
    containers: { read: false, write: false },
    financeiro: { read: false, write: false },
    relatorios: { read: false, write: false },
    atendimentos: { read: false, write: false },
    rh: { read: true, write: false },
    configuracoes: { read: false, write: false },
  },
};

function authUserToUser(a: AuthUser | null): User | null {
  if (!a) return null;
  return {
    id: a.id,
    nome: a.nome ?? '',
    email: a.email ?? '',
    role: a.role,
    avatar: a.avatar,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState(() => authService.getAuthState());
  const user = authUserToUser(authState.user);

  useEffect(() => {
    const unsubscribe = authService.addAuthListener((state) => {
      setAuthState(state);
    });
    return unsubscribe;
  }, []);

  /** Role e permissões alinhadas ao banco: GET /auth/me após JWT válido (ignora JSON adulterado no storage). */
  useEffect(() => {
    if (!authState.isAuthenticated) return;
    void authService.syncUserFromServer();
  }, [authState.isAuthenticated]);

  // WebSocket: sempre conecta quando logado (notificações em tempo real).
  // Depende de user?.id para não re-executar a cada render.
  useEffect(() => {
    if (!user?.id) {
      disconnectSocket();
      return;
    }
    connectSocket();

    if (!pushService.isSupported()) return;
    if (pushService.getPermission() === 'granted') {
      void pushService.registerAndSubscribe();
      return;
    }
    if (pushService.getPermission() === 'denied') return;

    void (async () => {
      const permission = await pushService.requestPermission();
      if (permission === 'granted') void pushService.registerAndSubscribe();
    })();
  }, [user?.id]);

  const login = async (email: string, senha: string, rememberMe = true): Promise<boolean> => {
    const result = await authService.login(email, senha, rememberMe);
    return result.success;
  };

  const logout = () => {
    void authService.logout();
  };

  const permissions = user
    ? (ROLE_PERMISSIONS[user.role] ?? ROLE_PERMISSIONS.comercial)
    : ROLE_PERMISSIONS.motorista;

  const hasPermission = (module: keyof Permission, action: 'read' | 'write'): boolean => {
    if (!user) return false;
    const mod = permissions[module];
    if (!mod) return false;
    return Boolean(mod[action]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, permissions, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
