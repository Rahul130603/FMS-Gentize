import apiClient from './client';

const BASE = '/technical-queries/notifications';

export const notificationApi = {
  list: (limit = 20) => apiClient.get(BASE, { params: { limit } }).then((r) => r.data),
  unreadCount: () => apiClient.get(`${BASE}/unread-count`).then((r) => r.data),
  markRead: (id) => apiClient.patch(`${BASE}/${id}/read`).then((r) => r.data),
  markAllRead: () => apiClient.post(`${BASE}/read-all`).then((r) => r.data),
};
