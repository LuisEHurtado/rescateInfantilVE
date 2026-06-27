import api from '../client';

export const photosApi = {
  list: (childId: string) => api.get(`/children/${childId}/photos`).then(r => r.data),
  upload: (childId: string, formData: FormData) =>
    api.post(`/children/${childId}/photos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  setMain: (childId: string, photoId: string) => api.patch(`/children/${childId}/photos/${photoId}/main`).then(r => r.data),
  remove: (childId: string, photoId: string) => api.delete(`/children/${childId}/photos/${photoId}`).then(r => r.data),
};
