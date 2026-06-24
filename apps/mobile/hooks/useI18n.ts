import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguage, t as translate, supportedLanguages } from '@/lib/i18n';

const LANG_KEY = 'app_language';

export function useI18n() {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored) {
        setLanguage(stored);
        setLang(stored);
      }
      setReady(true);
    });
  }, []);

  const changeLanguage = useCallback(async (code: string) => {
    setLanguage(code);
    setLang(code);
    await AsyncStorage.setItem(LANG_KEY, code);
  }, []);

  const t = useCallback((key: string) => translate(key), [lang]);

  return { t, lang, changeLanguage, ready, supportedLanguages };
}
