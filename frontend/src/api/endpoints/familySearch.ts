import api from '../client';

export const familySearchApi = {
  create: (data: any) => api.post('/family-search', data).then(r => r.data),
  list: (status?: string) => api.get('/family-search', { params: status ? { status } : {} }).then(r => r.data),
  stats: () => api.get('/family-search/stats').then(r => r.data),
  findOne: (id: string) => api.get(`/family-search/${id}`).then(r => r.data),
  updateStatus: (id: string, data: any) => api.patch(`/family-search/${id}/status`, data).then(r => r.data),
};
