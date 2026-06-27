import api from '../client';

export const visitsApi = {
  stats: () => api.get('/visits/stats').then(r => r.data),
  recent: (limit = 50) => api.get('/visits/recent', { params: { limit } }).then(r => r.data),
};
