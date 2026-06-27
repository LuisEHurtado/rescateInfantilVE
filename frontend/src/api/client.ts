import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const hadToken = !!localStorage.getItem('access_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Solo redirigir al login si el usuario tenía sesión activa
      if (hadToken) window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
