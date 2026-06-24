'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { en, type TranslationKey, type Translations } from './en';
import { localeOverrides, supportedLanguages } from './overrides';

const STORAGE_KEY = 'landing_language';

const LOCALE_MAP: Record<string, string> = {
  en: 'en', 'en-US': 'en', 'en-GB': 'en',
  es: 'es', fr: 'fr', de: 'de', pt: 'pt', 'pt-BR': 'pt',
  zh: 'zh', 'zh-CN': 'zh', 'zh-TW': 'zh-TW', 'zh-Hant': 'zh-TW',
  ja: 'ja', ko: 'ko', ar: 'ar', hi: 'hi', ru: 'ru', it: 'it', nl: 'nl',
  tr: 'tr', pl: 'pl', vi: 'vi', id: 'id', th: 'th', bn: 'bn', uk: 'uk',
  ro: 'ro', sv: 'sv', no: 'no', da: 'da', fi: 'fi', cs: 'cs', el: 'el',
  he: 'he', ms: 'ms', fil: 'fil', ur: 'ur',
};

function build(lang: string): Translations {
  const code = LOCALE_MAP[lang] || (localeOverrides[lang] ? lang : 'en');
  const overrides = localeOverrides[code];
  return overrides ? ({ ...en, ...overrides } as Translations) : { ...en };
}

function detectBrowserLang(): string {
  if (typeof navigator === 'undefined') return 'en';
  const raw = navigator.language || 'en';
  return LOCALE_MAP[raw] || raw.split('-')[0] || 'en';
}

type LocaleContextValue = {
  lang: string;
  t: (key: TranslationKey) => string;
  setLang: (code: string) => void;
  isRtl: boolean;
  ready: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState('en');
  const [ready, setReady] = useState(false);
  const [dict, setDict] = useState<Translations>({ ...en });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const fromUrl = params?.get('lang');
    const initial = fromUrl && (localeOverrides[fromUrl] || fromUrl === 'en')
      ? fromUrl
      : stored && (localeOverrides[stored] || stored === 'en')
        ? stored
        : detectBrowserLang();
    const code = LOCALE_MAP[initial] || (localeOverrides[initial] ? initial : 'en');
    setLangState(code);
    setDict(build(code));
    setReady(true);
  }, []);

  const setLang = useCallback((code: string) => {
    const resolved = LOCALE_MAP[code] || code;
    setLangState(resolved);
    setDict(build(resolved));
    localStorage.setItem(STORAGE_KEY, resolved);
    document.documentElement.lang = resolved;
    const meta = supportedLanguages.find((l) => l.code === resolved);
    document.documentElement.dir = meta?.rtl ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang;
    const meta = supportedLanguages.find((l) => l.code === lang);
    document.documentElement.dir = meta?.rtl ? 'rtl' : 'ltr';
  }, [lang, ready]);

  const value = useMemo(
    () => ({
      lang,
      t: (key: TranslationKey) => dict[key] || en[key] || key,
      setLang,
      isRtl: supportedLanguages.find((l) => l.code === lang)?.rtl === true,
      ready,
    }),
    [lang, dict, setLang, ready],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export { supportedLanguages };
