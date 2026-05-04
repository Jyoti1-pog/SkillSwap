import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      isInitializing: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('token', token);
          initSocket(token);
        } else {
          localStorage.removeItem('token');
          disconnectSocket();
        }
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(credentials);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false, isInitializing: false });
          localStorage.setItem('token', data.token);
          initSocket(data.token);
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      signup: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.signup(userData);
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false, isInitializing: false });
          localStorage.setItem('token', data.token);
          initSocket(data.token);
          return data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        disconnectSocket();
      },

      fetchMe: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isInitializing: false });
          return;
        }
        try {
          set({ isLoading: true });
          const { data } = await authApi.getMe();
          set({ user: data.user, isAuthenticated: true, isLoading: false, isInitializing: false });
          initSocket(token);
        } catch {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, isInitializing: false });
          localStorage.removeItem('token');
        }
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useAuthStore;
