import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import DashboardView from './components/dashboard';
import ClientesView from './components/clientes';
import EstoqueView from './components/estoque';
import AgendamentosView from './components/agendamentos';
import ContainersView from './components/containers';
import FinanceiroView from './components/financeiro';
import RelatoriosView from './components/relatorios';
import AtendimentosView from './components/atendimentos';
import PrecosView from './components/precos';
import RHView from './components/rh';
import Login from './components/login';
import MotoristaApp from './components/motorista-app';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Calendar, 
  Container, 
  DollarSign, 
  FileText,
  Menu,
  X,
  LogOut,
  Headset,
  Tag,
  UserCog,
  Truck,
  Shield,
  Lock
} from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Card, CardContent } from './components/ui/card';
import logo from '../assets/2ac2fb95a59823c3119ddd194998db2f41de4a80.png';

type View = 'dashboard' | 'clientes' | 'estoque' | 'agendamentos' | 'containers' | 'financeiro' | 'relatorios' | 'atendimentos' | 'precos' | 'rh' | 'motorista';

function MainApp() {
  const { user, logout, hasPermission } = useAuth();
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Definir menu baseado no papel do usuário
  const getMenuItems = () => {
    if (!user) return [];

    const allMenuItems = [
      { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard, module: 'clientes' as const },
      { id: 'clientes' as View, label: 'Clientes', icon: Users, module: 'clientes' as const },
      { id: 'estoque' as View, label: 'Estoque', icon: Package, module: 'estoque' as const },
      { id: 'agendamentos' as View, label: 'Agendamentos', icon: Calendar, module: 'agendamentos' as const },
      { id: 'containers' as View, label: 'Containers', icon: Container, module: 'containers' as const },
      { id: 'financeiro' as View, label: 'Financeiro', icon: DollarSign, module: 'financeiro' as const },
      { id: 'relatorios' as View, label: 'Relatórios', icon: FileText, module: 'relatorios' as const },
      { id: 'atendimentos' as View, label: 'Atendimentos', icon: Headset, module: 'atendimentos' as const },
      { id: 'precos' as View, label: 'Preços', icon: Tag, module: 'financeiro' as const },
      { id: 'rh' as View, label: 'RH', icon: UserCog, module: 'rh' as const },
      { id: 'motorista' as View, label: 'Motorista', icon: Truck, module: 'motorista' as const },
    ];

    // Filtrar menu baseado nas permissões
    if (user.role === 'motorista') {
      return [
        { id: 'motorista' as View, label: 'Minhas Entregas', icon: Truck, module: 'motorista' as const },
      ];
    }

    return allMenuItems.filter(item => hasPermission(item.module, 'read'));
  };

  const menuItems = getMenuItems();

  const renderView = () => {
    if (!user) return null;

    // Motorista só pode acessar sua própria view
    if (user.role === 'motorista') {
      return <MotoristaApp />;
    }

    switch (activeView) {
      case 'dashboard': return <DashboardView onNavigate={setActiveView} />;
      case 'clientes': return hasPermission('clientes', 'read') ? <ClientesView /> : <AcessoNegado />;
      case 'estoque': return hasPermission('estoque', 'read') ? <EstoqueView /> : <AcessoNegado />;
      case 'agendamentos': return hasPermission('agendamentos', 'read') ? <AgendamentosView /> : <AcessoNegado />;
      case 'containers': return hasPermission('containers', 'read') ? <ContainersView /> : <AcessoNegado />;
      case 'financeiro': return hasPermission('financeiro', 'read') ? <FinanceiroView /> : <AcessoNegado />;
      case 'relatorios': return hasPermission('relatorios', 'read') ? <RelatoriosView /> : <AcessoNegado />;
      case 'atendimentos': return hasPermission('atendimentos', 'read') ? <AtendimentosView /> : <AcessoNegado />;
      case 'precos': return hasPermission('financeiro', 'read') ? <PrecosView /> : <AcessoNegado />;
      case 'rh': return hasPermission('rh', 'read') ? <RHView /> : <AcessoNegado />;
      case 'motorista': return hasPermission('motorista', 'read') ? <MotoristaApp /> : <AcessoNegado />;
      default: return <DashboardView onNavigate={setActiveView} />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'comercial': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'logistico': return 'bg-green-100 text-green-800 border-green-300';
      case 'motorista': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'comercial': return 'Comercial';
      case 'logistico': return 'Logístico';
      case 'motorista': return 'Motorista';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside 
        className={`bg-[#EBF5FB] text-slate-700 transition-all duration-300 flex flex-col shadow-xl
          fixed lg:relative inset-y-0 left-0 z-50
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Logo Header */}
        <div className="p-6 border-b border-blue-200">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <img src={logo} alt="ITAMOVING" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="font-bold text-lg leading-tight">ITAMOVING</h1>
                  <p className="text-xs text-secondary opacity-90">Mudanças Internacionais</p>
                </div>
              </div>
            ) : (
              <img src={logo} alt="ITAMOVING" className="w-10 h-10 object-contain mx-auto" />
            )}
            {/* Close button for mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-blue-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && user && (
          <div className="p-4 bg-white/50 border-b border-blue-200">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img src={user.avatar} alt={user.nome} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] flex items-center justify-center text-white font-bold">
                  {user.nome.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.nome}</p>
                <Badge className={`text-xs border ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveView(item.id);
                      setMobileMenuOpen(false); // Close mobile menu on navigation
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-accent text-white shadow-lg scale-105' 
                        : 'hover:bg-blue-100 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Toggle & Logout Buttons */}
        <div className="p-4 border-t border-blue-200 space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-accent hover:text-white transition-all duration-200"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {sidebarOpen && <span className="text-sm">Recolher</span>}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-4 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-accent/10 rounded-lg mr-3"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl lg:text-2xl font-semibold text-foreground truncate">
                {menuItems.find(item => item.id === activeView)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs lg:text-sm text-muted-foreground mt-1 hidden sm:block">
                Sistema de Gestão de Mudanças - USA → Brasil
              </p>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-foreground">Bem-vindo, {user?.nome}!</p>
                <Badge className={`text-xs border ${getRoleBadgeColor(user?.role || '')}`}>
                  <Shield className="w-3 h-3 mr-1" />
                  {getRoleLabel(user?.role || '')}
                </Badge>
              </div>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.nome} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full shadow-lg" />
              ) : (
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-white font-bold shadow-lg text-xs lg:text-sm">
                  {user?.nome.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
}

function AcessoNegado() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Acesso Negado</h3>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar este módulo. Entre em contato com o administrador do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return <MainApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}