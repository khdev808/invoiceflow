import { useCallback } from 'react';
import {
  t as translate,
  getLanguage,
  isRtl,
  type TranslationKey,
} from '@/lib/i18n';
import { useI18nStore, supportedLanguages } from '@/stores/i18n';

export function useI18n() {
  const lang = useI18nStore((s) => s.lang);
  const ready = useI18nStore((s) => s.ready);
  const changeLanguage = useI18nStore((s) => s.changeLanguage);

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
  await useI18nStore.getState().syncFromUser(userLang);
}
