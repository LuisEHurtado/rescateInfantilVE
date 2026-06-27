import api from '../client';

export const usersApi = {
  list: () => api.get('/users').then(r => r.data),
  create: (data: any) => api.post('/users', data).then(r => r.data),
  get: (id: string) => api.get(`/users/${id}`).then(r => r.data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data).then(r => r.data),
  toggleActive: (id: string) => api.patch(`/users/${id}/toggle-active`).then(r => r.data),
  resetPassword: (id: string, newPassword: string) => api.patch(`/users/${id}/reset-password`, { newPassword }).then(r => r.data),
};
