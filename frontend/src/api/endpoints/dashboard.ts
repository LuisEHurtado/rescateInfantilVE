import api from '../client';

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then(r => r.data),
  byHospital: () => api.get('/dashboard/by-hospital').then(r => r.data),
  byState: () => api.get('/dashboard/by-state').then(r => r.data),
  recentChildren: () => api.get('/dashboard/recent-children').then(r => r.data),
  recentTransfers: () => api.get('/dashboard/recent-transfers').then(r => r.data),
};
