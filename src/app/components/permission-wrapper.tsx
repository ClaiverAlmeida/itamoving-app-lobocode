import { ReactNode } from 'react';
import { useAuth, Permission } from '../context/AuthContext';
import { Badge } from './ui/badge';
import { Lock, Eye } from 'lucide-react';

interface PermissionWrapperProps {
  module: keyof Permission;
  action: 'read' | 'write';
  children: ReactNode;
  fallback?: ReactNode;
  showReadOnlyBadge?: boolean;
}

export function PermissionWrapper({ 
  module, 
  action, 
  children, 
  fallback,
  showReadOnlyBadge = false 
}: PermissionWrapperProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(module, action)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  // Se tem permissão de leitura mas não de escrita, mostrar badge
  if (showReadOnlyBadge && hasPermission(module, 'read') && !hasPermission(module, 'write')) {
    return (
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Eye className="w-3 h-3 mr-1" />
            Somente Leitura
          </Badge>
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

export function ReadOnlyIndicator() {
  const { user } = useAuth();
  
  if (!user || user.role !== 'logistico') {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
      <Eye className="w-5 h-5 text-yellow-600" />
      <div>
        <p className="text-sm font-semibold text-yellow-900">Modo Somente Leitura</p>
        <p className="text-xs text-yellow-700">
          Você pode visualizar as informações mas não pode fazer alterações.
        </p>
      </div>
    </div>
  );
}
