import { create } from 'zustand';
import { authApi, favoritesApi } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface Favorite {
  id: string;
  teamName: string;
  teamBadge?: string;
  league: string;
  teamId?: string;
  stadium?: string;
  stadiumCapacity?: string;
  foundedYear?: string;
  teamDescription?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loadFromStorage: () => void;

  fetchFavorites: () => Promise<void>;
  addFavorite: (teamName: string, teamBadge: string, league: string) => Promise<void>;
  removeFavorite: (teamName: string) => Promise<void>;
  getNextMatch: (teamId: string) => Promise<any>;
  getLastMatches: (teamId: string) => Promise<any[]>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  favorites: [],
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });

      // Fetch favorites after login
      get().fetchFavorites();

      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(email, password, name);
      const { user, token } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });

      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrarse';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, favorites: [] });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token });
        get().fetchFavorites();
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  fetchFavorites: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const response = await favoritesApi.getAll(token);
      set({ favorites: response.data });
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  },

  addFavorite: async (teamName, teamBadge, league) => {
    const { token } = get();
    if (!token) return;

    try {
      await favoritesApi.add(token, teamName, teamBadge, league);
      get().fetchFavorites();
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  },

  removeFavorite: async (teamName) => {
    const { token } = get();
    if (!token) return;

    try {
      await favoritesApi.remove(token, teamName);
      get().fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  },

  getNextMatch: async (teamId) => {
    const { token } = get();
    if (!token) return null;

    try {
      const response = await favoritesApi.getNextMatch(token, teamId);
      return response.data;
    } catch (error) {
      console.error('Error fetching next match:', error);
      return null;
    }
  },

  getLastMatches: async (teamId) => {
    const { token } = get();
    if (!token) return [];

    try {
      const response = await favoritesApi.getLastMatches(token, teamId);
      return response.data;
    } catch (error) {
      console.error('Error fetching last matches:', error);
      return [];
    }
  },
}));