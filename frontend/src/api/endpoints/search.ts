import api from '../client';

export const searchApi = {
  search: (params: any) => api.get('/search', { params }).then(r => r.data),
};
