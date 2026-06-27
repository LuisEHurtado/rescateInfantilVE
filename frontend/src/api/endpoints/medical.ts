import api from '../client';

export const medicalApi = {
  list: (childId: string) => api.get(`/children/${childId}/medical`).then(r => r.data),
  create: (childId: string, data: any) => api.post(`/children/${childId}/medical`, data).then(r => r.data),
  update: (childId: string, recordId: string, data: any) => api.put(`/children/${childId}/medical/${recordId}`, data).then(r => r.data),
  discharge: (childId: string, recordId: string) => api.patch(`/children/${childId}/medical/${recordId}/discharge`).then(r => r.data),
};
