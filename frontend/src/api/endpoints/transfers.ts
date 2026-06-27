import api from '../client';

export const transfersApi = {
  list: (childId: string) => api.get(`/children/${childId}/transfers`).then(r => r.data),
  create: (childId: string, data: any) => api.post(`/children/${childId}/transfers`, data).then(r => r.data),
  getLocation: (childId: string) => api.get(`/children/${childId}/location`).then(r => r.data),
  updateLocation: (childId: string, data: any) => api.put(`/children/${childId}/location`, data).then(r => r.data),
};
