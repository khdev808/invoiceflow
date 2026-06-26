'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  authApi,
  clearAppToken,
  saveAppToken,
  TOKEN_KEY,
  type User,
  AppApiError,
} from '@/lib/appApi';
import { AnalyticsEvents, identifyUser, resetAnalytics, trackEvent } from '@/lib/analytics';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; businessName?: string; captchaToken?: string; referralCode?: string }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await authApi.me();
      setUser(profile);
      identifyUser(profile.id, { email: profile.email, plan: profile.plan });
    } catch {
      clearAppToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string, captchaToken?: string) => {
      const { user: u, token } = await authApi.login(email, password, captchaToken);
      if (u.role === 'ADMIN') {
        throw new AppApiError('Admin accounts cannot sign in to the user app.', 403);
      }
      saveAppToken(token);
      setUser(u);
      identifyUser(u.id, { email: u.email, plan: u.plan });
      trackEvent(AnalyticsEvents.USER_LOGGED_IN);
      router.push('/app');
    },
    [router],
  );

  const register = useCallback(
    async (data: { email: string; password: string; name: string; businessName?: string; captchaToken?: string }) => {
      const { user: u, token } = await authApi.register(data);
      if (u.role === 'ADMIN') {
        throw new AppApiError('Registration failed.', 403);
      }
      saveAppToken(token);
      setUser(u);
      identifyUser(u.id, { email: u.email, plan: u.plan });
      trackEvent(AnalyticsEvents.USER_REGISTERED);
      router.push('/app');
    },
    [router],
  );

  const logout = useCallback(() => {
    clearAppToken();
    resetAnalytics();
    setUser(null);
    router.push('/app/login');
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
