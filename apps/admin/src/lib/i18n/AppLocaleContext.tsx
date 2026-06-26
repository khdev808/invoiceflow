'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { appEn, type AppTranslationKey } from './app/en';
import { appEs } from './app/es';
import { appFr } from './app/fr';

const STORAGE_KEY = 'app_language';

const MAP: Record<string, Partial<Record<AppTranslationKey, string>>> = {
  en: appEn,
  es: appEs,
  fr: appFr,
};

type AppLocaleContextValue = {
  lang: string;
  setLang: (code: string) => void;
  t: (key: AppTranslationKey) => string;
};

const AppLocaleContext = createContext<AppLocaleContextValue | null>(null);

export function AppLocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const browser = navigator.language?.split('-')[0] || 'en';
    const initial = stored && MAP[stored] ? stored : MAP[browser] ? browser : 'en';
    setLangState(initial);
    document.documentElement.lang = initial;
  }, []);

  const setLang = useCallback((code: string) => {
    const resolved = MAP[code] ? code : 'en';
    setLangState(resolved);
    localStorage.setItem(STORAGE_KEY, resolved);
    document.documentElement.lang = resolved;
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key: AppTranslationKey) => MAP[lang]?.[key] || appEn[key] || key,
    }),
    [lang, setLang],
  );

  return <AppLocaleContext.Provider value={value}>{children}</AppLocaleContext.Provider>;
}

export function useAppLocale() {
  const ctx = useContext(AppLocaleContext);
  if (!ctx) throw new Error('useAppLocale must be used within AppLocaleProvider');
  return ctx;
}

export const appLanguages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
];
