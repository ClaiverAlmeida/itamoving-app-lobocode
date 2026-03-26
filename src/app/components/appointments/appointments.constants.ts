import type { Agendamento } from '../../api';
import type { StatusSelectItem } from '../forms';
import { AlertCircle, CheckCircle2, Package, XCircle } from 'lucide-react';

export const AGENDAMENTO_STATUS_ITEMS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COLLECTED', label: 'Coletado' },
  { value: 'CANCELLED', label: 'Cancelado' },
] as const satisfies readonly StatusSelectItem<Agendamento['status']>[];

export type ViewMode = 'calendar' | 'list' | 'timeline';

export const PERIODOS_CARD_PAGE_SIZE = 10;
export const PERIODOS_SELECT_LIMIT = 200;

export const statusConfig = {
  PENDING: {
    label: 'Pendente',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgLight: 'bg-yellow-50',
    icon: AlertCircle,
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
    icon: CheckCircle2,
  },
  COLLECTED: {
    label: 'Coletado',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    icon: Package,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgLight: 'bg-red-50',
    icon: XCircle,
  },
} as const;

export type StatusKey = keyof typeof statusConfig;

export const statusKeyMap: Record<string, StatusKey> = {
  PENDING: 'PENDING',
  PENDENTE: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CONFIRMADO: 'CONFIRMED',
  COLLECTED: 'COLLECTED',
  COLETADO: 'COLLECTED',
  CANCELLED: 'CANCELLED',
  CANCELADO: 'CANCELLED',
};

export const getStatusKey = (status: string): StatusKey =>
  statusKeyMap[(status ?? '').toUpperCase()] ?? 'PENDING';

export const getStatusConfig = (status: string) =>
  statusConfig[getStatusKey(status)];
