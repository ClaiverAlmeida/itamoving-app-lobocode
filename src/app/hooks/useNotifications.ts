import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { connectSocket, getSocket, onceConnected } from '../services/socket.service';
import {
  notificationsService,
  type NotificationItem,
} from '../services/notifications.service';

/** Payload enviado pelo backend no evento new_notification (WebSocket) */
export interface NewNotificationPayload {
  id: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsService.getList({ limit: 50 }),
        notificationsService.getUnreadCount(),
      ]);
      if (listRes.success && listRes.data) {
        setNotifications(listRes.data.notifications ?? []);
      }
      if (countRes.success && countRes.data !== undefined) {
        const raw = countRes.data as { count?: number } | number;
        const count =
          typeof raw === 'object' && raw !== null && 'count' in raw
            ? Number(raw.count)
            : Number(raw);
        setUnreadCount(Number.isNaN(count) ? 0 : count);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Inscrever em eventos do socket quando o usuário estiver logado.
  // onceConnected garante refresh quando o socket conecta (evita id null → valor sem atualizar contador).
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const socket = connectSocket() ?? getSocket();
    if (!socket) return;

    const onNewNotification = (payload: NewNotificationPayload) => {
      const createdAt =
        typeof payload.createdAt === 'string'
          ? payload.createdAt
          : (payload.createdAt as Date)?.toISOString?.() ?? new Date().toISOString();
      setNotifications((prev) => [
        { ...payload, createdAt } as NotificationItem,
        ...prev,
      ]);
      setUnreadCount((c) => c + 1);
      toast.info(payload.title ?? 'Notificação', { description: payload.message });
    };

    const onUnreadCountUpdated = (payload: { unreadCount?: number }) => {
      const n = payload?.unreadCount;
      setUnreadCount(typeof n === 'number' && !Number.isNaN(n) ? n : 0);
    };

    socket.on('new_notification', onNewNotification);
    socket.on('unread_count_updated', onUnreadCountUpdated);

    const unsubscribe = onceConnected(refreshNotifications);

    return () => {
      socket.off('new_notification', onNewNotification);
      socket.off('unread_count_updated', onUnreadCountUpdated);
      unsubscribe();
    };
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
  };
}
