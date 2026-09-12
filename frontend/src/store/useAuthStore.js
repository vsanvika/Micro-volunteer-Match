import { create } from 'zustand';
import api from '../services/api';
import { initSocketClient, disconnectSocket } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('mv_user')) || null,
  token: localStorage.getItem('mv_token') || null,
  isAuthenticated: !!localStorage.getItem('mv_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      localStorage.setItem('mv_token', token);
      localStorage.setItem('mv_user', JSON.stringify(user));

      initSocketClient(user._id);

      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      const { token, user } = res.data;

      localStorage.setItem('mv_token', token);
      localStorage.setItem('mv_user', JSON.stringify(user));

      initSocketClient(user._id);

      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('mv_token');
    localStorage.removeItem('mv_user');
    disconnectSocket();
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchCurrentUser: async () => {
    if (!get().token) return;
    try {
      const res = await api.get('/auth/me');
      const user = res.data.user;
      localStorage.setItem('mv_user', JSON.stringify(user));
      initSocketClient(user._id);
      set({ user, isAuthenticated: true });
    } catch (err) {
      get().logout();
    }
  },

  updateProfile: async (data) => {
    set({ loading: true });
    try {
      const res = await api.put('/users/profile', data);
      const updatedUser = res.data.user;
      localStorage.setItem('mv_user', JSON.stringify(updatedUser));
      set({ user: updatedUser, loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed';
      set({ loading: false });
      return { success: false, error: message };
    }
  },
}));
