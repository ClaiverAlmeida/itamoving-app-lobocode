import { api, type ApiResponse } from './api.service';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsListResponse {
  notifications: NotificationItem[];
  total: number;
}

/** Resultado tipado para ações de marcar como lida (validação no serviço). */
export type NotificationMutationResult =
  | { success: true }
  | { success: false; error: string };

function toMutationResult(res: ApiResponse<unknown>): NotificationMutationResult {
  if (res.success) return { success: true };
  return { success: false, error: res.error ?? 'Erro ao processar' };
}

export const notificationsService = {
  async getList(params?: { page?: number; limit?: number; isRead?: boolean }): Promise<ApiResponse<NotificationsListResponse>> {
    return api.get<NotificationsListResponse>('/notifications', { params: params ?? {}, useCache: false });
  },

  async getUnreadCount(): Promise<ApiResponse<number>> {
    const res = await api.get<number>('/notifications/unread-count', { useCache: false });
    return res;
  },

  async markAsRead(isRead: boolean, id: string): Promise<NotificationMutationResult> {
    if (isRead) return { success: true };
    const res = await api.put(`/notifications/${id}/read`);
    return toMutationResult(res);
  },

  async markAllAsRead(): Promise<NotificationMutationResult> {
    const res = await api.put('/notifications/read-all');
    return toMutationResult(res);
  },

  async delete(id: string): Promise<ApiResponse<unknown>> {
    return api.delete(`/notifications/${id}`);
  },
};
