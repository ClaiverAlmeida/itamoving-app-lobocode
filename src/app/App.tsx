import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { BrowserRouter, useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import Login from './components/login';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { Permission } from './context/AuthContext';
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
  Lock,
  Bell,
  BellRing,
  Trash,
  Eye,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { Badge } from './components/ui/badge';
import { Card, CardContent } from './components/ui/card';

import { Button } from './components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './components/ui/popover';
import { useNotifications } from './hooks/useNotifications';
import { notificationsService } from './api';
const DashboardView = lazy(() => import('./components/dashboard'));
const ClientesView = lazy(() => import('./components/clients'));
const EstoqueView = lazy(() => import('./components/stock'));
const AgendamentosView = lazy(() => import('./components/appointments'));
const ContainersView = lazy(() => import('./components/containers'));
const FinanceiroView = lazy(() => import('./components/financial'));
const RelatoriosView = lazy(() => import('./components/reports'));
const AtendimentosView = lazy(() => import('./components/services'));
const PrecosView = lazy(() => import('./components/prices'));
const RHView = lazy(() => import('./components/hr'));
const MotoristaApp = lazy(() => import('./components/driver-service-order/driver-app'));
const ConfiguracoesView = lazy(() => import('./components/configurations'));
const OrdemDeServicoView = lazy(() => import('./components/service-order'));

const logo = new URL('../assets/itamoving-logo.png', import.meta.url).href;
const STORAGE_KEY = 'itamoving_last_route';

type View =
  | 'dashboard'
  | 'clientes'
  | 'estoque'
  | 'agendamentos'
  | 'containers'
  | 'financeiro'
  | 'relatorios'
  | 'atendimentos'
  | 'precos'
  | 'rh'
  | 'motorista'
  | 'ordem-de-servico'
  | 'configuracoes';

type PermissionModule = keyof Permission;

const VIEW_PERMISSION_DEPENDENCY: Partial<Record<View, PermissionModule>> = {
  clientes: 'clientes',
  precos: 'financeiro',
  estoque: 'estoque',
  agendamentos: 'agendamentos',
  containers: 'containers',
  financeiro: 'financeiro',
  relatorios: 'relatorios',
  atendimentos: 'atendimentos',
  rh: 'rh',
  motorista: 'motorista',
  'ordem-de-servico': 'ordem-de-servico',
  configuracoes: 'configuracoes',
};

/** Rotas em português (URL) -> view interno */
const PATH_TO_VIEW: Record<string, View> = {
  dashboard: 'dashboard',
  clientes: 'clientes',
  precos: 'precos',
  estoque: 'estoque',
  agendamentos: 'agendamentos',
  containers: 'containers',
  financeiro: 'financeiro',
  relatorios: 'relatorios',
  atendimentos: 'atendimentos',
  rh: 'rh',
  motorista: 'motorista',
  'ordem-de-servico': 'ordem-de-servico',
  configuracoes: 'configuracoes',
};

const VIEW_TO_PATH: Record<View, string> = {
  dashboard: 'dashboard',
  clientes: 'clientes',
  precos: 'precos',
  estoque: 'estoque',
  agendamentos: 'agendamentos',
  containers: 'containers',
  financeiro: 'financeiro',
  relatorios: 'relatorios',
  atendimentos: 'atendimentos',
  rh: 'rh',
  motorista: 'motorista',
  'ordem-de-servico': 'ordem-de-servico',
  configuracoes: 'configuracoes',
};

function pathToView(pathname: string): View {
  const segment = pathname.replace(/^\//, '').toLowerCase() || 'dashboard';
  return PATH_TO_VIEW[segment] ?? 'dashboard';
}

function MainApp() {
  const viewFallback = (
    <div className="flex items-center justify-center min-h-[30vh] text-muted-foreground">
      Carregando modulo...
    </div>
  );

  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeView = pathToView(location.pathname);
  const { notifications, unreadCount, loading, refreshNotifications } = useNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [removingNotificationId, setRemovingNotificationId] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileNotificationsAlignOffset, setMobileNotificationsAlignOffset] = useState(0);
  const notificationsTriggerRef = useRef<HTMLButtonElement | null>(null);

  const canAccessView = (view: View, action: 'read' | 'write' = 'read') => {
    const module = VIEW_PERMISSION_DEPENDENCY[view];
    if (!module) return true;
    return hasPermission(module, action);
  };

  // Restaurar última rota ao abrir na raiz (só quando path é / ou vazio)
  useEffect(() => {
    const path = location.pathname || '/';
    if (path === '/') {
      try {
        const last = localStorage.getItem(STORAGE_KEY);
        const target = last && last.startsWith('/') && last.length > 1 ? last : '/dashboard';
        navigate(target, { replace: true });
      } catch (_) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [location.pathname]);

  // Persistir rota atual no localStorage (em inglês)
  useEffect(() => {
    const view = pathToView(location.pathname);
    const path = VIEW_TO_PATH[view];
    if (location.pathname !== '/' && location.pathname !== '') {
      try {
        localStorage.setItem(STORAGE_KEY, `/${path}`);
      } catch (_) { }
    }
  }, [location.pathname]);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth < 640);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!notificationsOpen || !isMobileViewport || !notificationsTriggerRef.current) {
      setMobileNotificationsAlignOffset(0);
      return;
    }

    const rect = notificationsTriggerRef.current.getBoundingClientRect();
    const triggerCenterX = rect.left + rect.width / 2;
    const viewportCenterX = window.innerWidth / 2;
    setMobileNotificationsAlignOffset(viewportCenterX - triggerCenterX);
  }, [notificationsOpen, isMobileViewport]);

  const setActiveView = (view: View) => {
    navigate(`/${VIEW_TO_PATH[view]}`);
    setMobileMenuOpen(false);
  };

  // Definir menu baseado no papel do usuário
  const getMenuItems = () => {
    if (!user) return [];

    const allMenuItems = [
      { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'clientes' as View, label: 'Clientes', icon: Users },
      { id: 'precos' as View, label: 'Precificação', icon: Tag },
      { id: 'estoque' as View, label: 'Estoque', icon: Package },
      { id: 'agendamentos' as View, label: 'Agendamentos', icon: Calendar },
      { id: 'containers' as View, label: 'Containers', icon: Container },
      { id: 'financeiro' as View, label: 'Financeiro', icon: DollarSign },
      { id: 'relatorios' as View, label: 'Relatórios', icon: FileText },
      { id: 'atendimentos' as View, label: 'Atendimentos', icon: Headset },
      { id: 'rh' as View, label: 'RH', icon: UserCog },
      { id: 'motorista' as View, label: 'Motorista', icon: Truck },
      { id: 'ordem-de-servico' as View, label: 'Ordem de Serviço', icon: ClipboardList },
      { id: 'configuracoes' as View, label: 'Configurações', icon: Settings },
    ];

    // Filtrar menu baseado nas permissões
    if (user.role === 'motorista') {
      return [
        { id: 'motorista' as View, label: 'Minhas Entregas', icon: Truck },
        { id: 'ordem-de-servico' as View, label: 'Ordem de Serviço', icon: ClipboardList },
      ];
    }

    return allMenuItems.filter(item => canAccessView(item.id, 'read'));
  };

  const menuItems = getMenuItems();

  const renderView = () => {
    if (!user) return null;

    // Motorista pode acessar Minhas Entregas e Ordem de Serviço
    if (user.role === 'motorista') {
      if (activeView === 'ordem-de-servico') {
        return (
          <Suspense fallback={viewFallback}>
            <OrdemDeServicoView />
          </Suspense>
        );
      }
      return (
        <Suspense fallback={viewFallback}>
          <MotoristaApp />
        </Suspense>
      );
    }

    switch (activeView) {
      case 'dashboard': return <Suspense fallback={viewFallback}><DashboardView onNavigate={setActiveView} /></Suspense>;
      case 'clientes': return canAccessView('clientes', 'read') ? <Suspense fallback={viewFallback}><ClientesView /></Suspense> : <AcessoNegado />;
      case 'precos': return canAccessView('precos', 'read') ? <Suspense fallback={viewFallback}><PrecosView /></Suspense> : <AcessoNegado />;
      case 'estoque': return canAccessView('estoque', 'read') ? <Suspense fallback={viewFallback}><EstoqueView /></Suspense> : <AcessoNegado />;
      case 'agendamentos': return canAccessView('agendamentos', 'read') ? <Suspense fallback={viewFallback}><AgendamentosView /></Suspense> : <AcessoNegado />;
      case 'containers': return canAccessView('containers', 'read') ? <Suspense fallback={viewFallback}><ContainersView /></Suspense> : <AcessoNegado />;
      case 'financeiro': return canAccessView('financeiro', 'read') ? <Suspense fallback={viewFallback}><FinanceiroView /></Suspense> : <AcessoNegado />;
      case 'relatorios': return canAccessView('relatorios', 'read') ? <Suspense fallback={viewFallback}><RelatoriosView /></Suspense> : <AcessoNegado />;
      case 'atendimentos': return canAccessView('atendimentos', 'read') ? <Suspense fallback={viewFallback}><AtendimentosView /></Suspense> : <AcessoNegado />;
      case 'rh': return canAccessView('rh', 'read') ? <Suspense fallback={viewFallback}><RHView /></Suspense> : <AcessoNegado />;
      case 'motorista': return canAccessView('motorista', 'read') ? <Suspense fallback={viewFallback}><MotoristaApp /></Suspense> : <AcessoNegado />;
      case 'ordem-de-servico': return canAccessView('ordem-de-servico', 'read') ? <Suspense fallback={viewFallback}><OrdemDeServicoView /></Suspense> : <AcessoNegado />;
      case 'configuracoes': return canAccessView('configuracoes', 'read') ? <Suspense fallback={viewFallback}><ConfiguracoesView /></Suspense> : <AcessoNegado />;
      default: return <Suspense fallback={viewFallback}><DashboardView onNavigate={setActiveView} /></Suspense>;
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
              className="lg:hidden p-2 hover:bg-blue-100 rounded-lg cursor-pointer"
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
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${isActive
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
            className="hidden lg:flex w-full items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-accent hover:text-white transition-all duration-200 cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {sidebarOpen && <span className="text-sm">Recolher</span>}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 cursor-pointer"
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
              className="lg:hidden p-2 hover:bg-accent/10 rounded-lg mr-3 cursor-pointer"
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

              {/* Notificações */}
              <Popover open={notificationsOpen} onOpenChange={(open) => {
                setNotificationsOpen(open);
                if (open) refreshNotifications();
              }}>
                <PopoverTrigger asChild>
                  <Button ref={notificationsTriggerRef} variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5 stroke-2 fill-none outline-none" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[calc(100vw-1rem)] max-w-sm sm:w-96 p-0"
                  align={isMobileViewport ? 'center' : 'end'}
                  alignOffset={isMobileViewport ? mobileNotificationsAlignOffset : 0}
                  sideOffset={8}
                  collisionPadding={8}
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-muted-foreground" />
                      Notificações
                    </h3>
                    <Button variant="ghost" className="relative text-xs w-fit hover:bg-transparent hover:text-foreground" onClick={async () => {
                      const result = await notificationsService.markAllAsRead();
                      if (result.success) refreshNotifications();
                      else toast.error(result.error);
                    }}>Marcar todas como lidas</Button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center py-8"
                        >
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="text-sm text-muted-foreground"
                          >
                            Carregando...
                          </motion.div>
                        </motion.div>
                      ) : notifications.length === 0 ? (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-col items-center justify-center py-12 px-4 text-center"
                        >
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <Bell className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-foreground">Nenhuma notificação</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Você será avisado quando houver novidades.
                          </p>
                        </motion.div>
                      ) : (
                        <motion.ul
                          key="list"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="divide-y divide-border"
                        >
                          <AnimatePresence mode="popLayout">
                            {(removingNotificationId ? notifications.filter((n) => n.id !== removingNotificationId) : notifications).map((n, index) => (
                              <motion.li
                                key={n.id}
                                layout
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -8, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.25, delay: index * 0.03 }}
                                className={`${!n.isRead ? 'cursor-pointer pointer-events-auto' : 'cursor-auto pointer-events-none'} px-4 py-3 text-left transition-colors duration-200 hover:bg-muted/50 ${!n.isRead ? 'bg-muted/30' : 'bg-transparent'}`}
                                onClick={async (e) => {
                                  if ((e.target as HTMLElement).closest('button')) return;
                                  const result = await notificationsService.markAsRead(n.isRead, n.id);
                                  if (result.success) refreshNotifications();
                                  else toast.error(result.error);
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant={!n.isRead ? 'destructive' : 'default'} className="text-xs cursor-auto transition-colors duration-200">{!n.isRead ? 'Nova' : 'Lida'}</Badge>
                                </div>
                                <div className="flex justify-end items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative top-0 bg-transparent hover:bg-transparent border-none p-0 m-0 cursor-pointer"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const id = n.id;
                                      setRemovingNotificationId(id);
                                      setTimeout(async () => {
                                        const res = await notificationsService.delete(id);
                                        if (res.success) await refreshNotifications();
                                        else toast.error(res.error ?? 'Erro ao excluir');
                                        setRemovingNotificationId(null);
                                      }, 220);
                                    }}
                                  >
                                    <Trash className="w-4 h-4 text-red-500" />
                                  </Button>
                                </div>
                                <p className="text-sm font-medium text-foreground">{n.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {n.createdAt ? new Date(n.createdAt).toLocaleString('pt-BR') : ''}
                                </p>
                              </motion.li>
                            ))}
                          </AnimatePresence>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Configurações */}
              {user!.role.includes('admin') && (
                <div>
                  <Button variant="ghost" size="icon" className="relative" onClick={() => setActiveView('configuracoes')}>
                    <Settings className="w-5 h-5 stroke-2 fill-none outline-none" />
                  </Button>
                </div>
              )}

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

export function AcessoNegado() {
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

function LoginPage() {
  const { user } = useAuth();
  if (user) {
    try {
      const last = localStorage.getItem(STORAGE_KEY);
      const target = last && last.startsWith('/') && last.length > 1 ? last : '/dashboard';
      return <Navigate to={target} replace />;
    } catch (_) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return <Login />;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<RequireAuth><MainApp /></RequireAuth>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}