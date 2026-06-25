import { create } from 'zustand';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setLanguage as applyLanguage,
  isRtl,
  supportedLanguages,
} from '@/lib/i18n';

const LANG_KEY = 'app_language';

function applyRtl(code: string) {
  const rtl = isRtl(code);
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  }
}

interface I18nState {
  lang: string;
  ready: boolean;
  init: () => Promise<void>;
  changeLanguage: (code: string) => Promise<void>;
  syncFromUser: (userLang?: string) => Promise<void>;
}

export const useI18nStore = create<I18nState>((set) => ({
  lang: 'en',
  ready: false,

  init: async () => {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    const code = stored || 'en';
    applyLanguage(code);
    applyRtl(code);
    set({ lang: code, ready: true });
  },

  changeLanguage: async (code: string) => {
    applyLanguage(code);
    applyRtl(code);
    set({ lang: code });
    await AsyncStorage.setItem(LANG_KEY, code);
  },

  syncFromUser: async (userLang?: string) => {
    if (!userLang) return;
    applyLanguage(userLang);
    applyRtl(userLang);
    set({ lang: userLang });
    await AsyncStorage.setItem(LANG_KEY, userLang);
  },
}));

export { supportedLanguages };
