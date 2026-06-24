import { useEffect, useState, useCallback } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setLanguage as applyLanguage,
  t as translate,
  supportedLanguages,
  getLanguage,
  isRtl,
  type TranslationKey,
} from '@/lib/i18n';

const LANG_KEY = 'app_language';

export function useI18n() {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      const code = stored || 'en';
      applyLanguage(code);
      setLang(code);
      if (I18nManager.isRTL !== isRtl(code)) {
        I18nManager.allowRTL(isRtl(code));
        I18nManager.forceRTL(isRtl(code));
      }
      setReady(true);
    });
  }, []);

  const changeLanguage = useCallback(async (code: string) => {
    applyLanguage(code);
    setLang(code);
    await AsyncStorage.setItem(LANG_KEY, code);
    const rtl = isRtl(code);
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(key, params),
    [lang],
  );

  return {
    t,
    lang,
    locale: getLanguage(),
    changeLanguage,
    ready,
    supportedLanguages,
    isRtl: isRtl(lang),
  };
}

/** Apply language from user profile on login */
export async function syncLanguageFromUser(userLang?: string) {
  if (!userLang) return;
  applyLanguage(userLang);
  await AsyncStorage.setItem(LANG_KEY, userLang);
}
