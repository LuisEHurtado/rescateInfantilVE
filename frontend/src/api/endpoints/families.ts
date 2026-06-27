import api from '../client';

export const familiesApi = {
  list: (childId: string) => api.get(`/children/${childId}/families`).then(r => r.data),
  create: (childId: string, data: any) => api.post(`/children/${childId}/families`, data).then(r => r.data),
  update: (childId: string, memberId: string, data: any) => api.put(`/children/${childId}/families/${memberId}`, data).then(r => r.data),
  verify: (childId: string, memberId: string, data: any) => api.patch(`/children/${childId}/families/${memberId}/verify`, data).then(r => r.data),
};
