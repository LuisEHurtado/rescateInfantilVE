import api from '../client';

export const notificationsApi = {
  list: (unread?: boolean) => api.get('/notifications', { params: unread ? { unread: 'true' } : {} }).then(r => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then(r => r.data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then(r => r.data),
};
