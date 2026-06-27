import api from '../client';

export const childrenApi = {
  quickRegister: (data: FormData) =>
    api.post('/children/quick-register', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  quickRegisterJson: (data: any) => api.post('/children/quick-register', data).then(r => r.data),
  list: (params?: any) => api.get('/children', { params }).then(r => r.data),
  get: (id: string) => api.get(`/children/${id}`).then(r => r.data),
  updateIdentification: (id: string, data: any) => api.put(`/children/${id}/identification`, data).then(r => r.data),
  updatePhysical: (id: string, data: any) => api.put(`/children/${id}/physical`, data).then(r => r.data),
  updateStatus: (id: string, data: any) => api.patch(`/children/${id}/status`, data).then(r => r.data),
  getTimeline: (id: string) => api.get(`/children/${id}/timeline`).then(r => r.data),
};
