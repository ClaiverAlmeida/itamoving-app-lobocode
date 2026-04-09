import { api } from './api.service';
import type { ApiResponse } from '../types';
import type {
  NotificationItem,
  NotificationMutationResult,
  NotificationsListResponse,
} from '../types';

function toMutationResult(res: ApiResponse<unknown>): NotificationMutationResult {
  if (res.success) return { success: true };
  return { success: false, error: res.error ?? 'Erro ao processar' };
}

export const notificationsService = {
  async getList(params?: { page?: number; limit?: number; isRead?: boolean }): Promise<ApiResponse<NotificationsListResponse>> {
    return api.get<NotificationsListResponse>('/notifications', { params: params ?? {} });
  },

  async getUnreadCount(): Promise<ApiResponse<number>> {
    const res = await api.get<number>('/notifications/unread-count');
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
