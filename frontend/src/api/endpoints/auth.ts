import api from '../client';

export const authApi = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  createEmergencyToken: (data: { description?: string; expiresAt?: string }) =>
    api.post('/auth/emergency-tokens', data).then(r => r.data),
  listEmergencyTokens: () => api.get('/auth/emergency-tokens').then(r => r.data),
  revokeEmergencyToken: (id: string) => api.delete(`/auth/emergency-tokens/${id}`).then(r => r.data),
};
