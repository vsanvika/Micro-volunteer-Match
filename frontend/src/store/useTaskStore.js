import { create } from 'zustand';
import api from '../services/api';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  recommendations: [],
  categories: [],
  selectedTimeMinutes: 15,
  loading: false,
  filters: {
    search: '',
    category: 'All',
    maxDuration: '',
    locationMode: 'all',
    difficulty: 'All',
    sort: 'bestMatch',
  },

  setFilter: (key, value) => {
    set(state => ({
      filters: { ...state.filters, [key]: value },
    }));
    get().fetchTasks();
  },

  setSelectedTimeMinutes: (mins) => {
    set({ selectedTimeMinutes: mins });
    get().fetchTimeBasedTasks(mins);
  },

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const { search, category, maxDuration, locationMode, difficulty, sort } = get().filters;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All') params.append('category', category);
      if (maxDuration) params.append('maxDuration', maxDuration);
      if (locationMode && locationMode !== 'all') params.append('locationMode', locationMode);
      if (difficulty && difficulty !== 'All') params.append('difficulty', difficulty);
      if (sort) params.append('sort', sort);

      const res = await api.get(`/tasks?${params.toString()}`);
      set({ tasks: res.data.tasks, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  fetchRecommendations: async () => {
    try {
      const res = await api.get('/recommendations');
      set({ recommendations: res.data.recommendations });
    } catch (err) {
      // Fallback
    }
  },

  fetchTimeBasedTasks: async (mins) => {
    set({ loading: true });
    try {
      const res = await api.get(`/matches/time-filter?minutes=${mins}`);
      set({ tasks: res.data.matches, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const res = await api.get('/tasks/categories');
      set({ categories: res.data.categories });
    } catch (err) {}
  },
}));
