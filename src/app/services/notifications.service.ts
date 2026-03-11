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

export const notificationsService = {
  async getList(params?: { page?: number; limit?: number; isRead?: boolean }): Promise<ApiResponse<NotificationsListResponse>> {
    return api.get<NotificationsListResponse>('/notifications', { params: params ?? {}, useCache: false });
  },

  async getUnreadCount(): Promise<ApiResponse<number>> {
    const res = await api.get<number>('/notifications/unread-count', { useCache: false });
    return res;
  },

  async markAsRead(id: string): Promise<ApiResponse<unknown>> {
    return api.patch(`/notifications/${id}/read`, {});
  },

  async markAllAsRead(): Promise<ApiResponse<unknown>> {
    return api.patch('/notifications/read-all', {});
  },
};
