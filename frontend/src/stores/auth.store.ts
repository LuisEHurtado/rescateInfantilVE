import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isRescuer: () => boolean;
  isHospital: () => boolean;
  canWrite: () => boolean;
}

const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('access_token');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('access_token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    set({ user: null, token: null });
  },
  isAdmin: () => get().user?.role === 'ADMIN',
  isRescuer: () => get().user?.role === 'RESCUER',
  isHospital: () => get().user?.role === 'HOSPITAL',
  canWrite: () => ['ADMIN', 'RESCUER', 'HOSPITAL'].includes(get().user?.role || ''),
}));
