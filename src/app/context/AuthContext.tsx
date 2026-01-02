import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'admin' | 'comercial' | 'logistico' | 'motorista';

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
}

interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  permissions: Permission;
  hasPermission: (module: keyof Permission, action: 'read' | 'write') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários mock para demonstração
const MOCK_USERS: Array<User & { senha: string }> = [
  {
    id: '1',
    nome: 'Admin Master',
    email: 'admin@itamoving.com',
    senha: 'admin123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
  },
  {
    id: '2',
    nome: 'Carlos Vendas',
    email: 'comercial@itamoving.com',
    senha: 'comercial123',
    role: 'comercial',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos'
  },
  {
    id: '3',
    nome: 'Raquel Logística',
    email: 'raquel@itamoving.com',
    senha: 'raquel123',
    role: 'logistico',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raquel'
  },
  {
    id: '4',
    nome: 'João Motorista',
    email: 'motorista@itamoving.com',
    senha: 'motorista123',
    role: 'motorista',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao'
  }
];

// Definição de permissões por role
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
  },
  comercial: {
    clientes: { read: true, write: true },
    agendamentos: { read: true, write: true },
    estoque: { read: true, write: true },
    containers: { read: true, write: false },
    financeiro: { read: false, write: false }, // SEM ACESSO
    relatorios: { read: false, write: false }, // SEM ACESSO
    atendimentos: { read: true, write: true },
    rh: { read: false, write: false },
    rotas: { read: true, write: false },
    motorista: { read: false, write: false },
  },
  logistico: {
    clientes: { read: false, write: false }, // SEM ACESSO
    agendamentos: { read: true, write: true },
    estoque: { read: true, write: false }, // Apenas visualização
    containers: { read: true, write: true },
    financeiro: { read: false, write: false }, // SEM ACESSO
    relatorios: { read: false, write: false }, // SEM ACESSO
    atendimentos: { read: false, write: false }, // SEM ACESSO
    rh: { read: false, write: false },
    rotas: { read: true, write: true },
    motorista: { read: false, write: false },
  },
  motorista: {
    clientes: { read: false, write: false },
    agendamentos: { read: true, write: false },
    estoque: { read: true, write: false }, // Ver quantidade de caixas
    containers: { read: false, write: false },
    financeiro: { read: false, write: false },
    relatorios: { read: false, write: false },
    atendimentos: { read: false, write: false },
    rh: { read: false, write: false },
    rotas: { read: true, write: false },
    motorista: { read: true, write: true }, // Ordem de serviço e recibos
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('itamoving_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
    );

    if (foundUser) {
      const { senha: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('itamoving_user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('itamoving_user');
  };

  const permissions = user ? ROLE_PERMISSIONS[user.role] : ROLE_PERMISSIONS.motorista;

  const hasPermission = (module: keyof Permission, action: 'read' | 'write'): boolean => {
    if (!user) return false;
    return permissions[module][action];
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