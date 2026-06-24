import { create } from 'zustand';
import { authApi, setAuthToken, getAuthToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  businessName?: string;
  businessLogo?: string;
  currency?: string;
  settings?: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; businessName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await authApi.login(email, password);
    await setAuthToken(data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  register: async (registerData) => {
    const { data } = await authApi.register(registerData);
    await setAuthToken(data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  logout: async () => {
    await setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const { data } = await authApi.me();
      set({ user: data, token, isAuthenticated: true, isLoading: false });
    } catch {
      await setAuthToken(null);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
