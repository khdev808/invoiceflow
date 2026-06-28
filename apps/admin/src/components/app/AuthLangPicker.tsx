'use client';

import { useAppLocale, appLanguages } from '@/lib/i18n/AppLocaleContext';

export function AuthLangPicker() {
  const { lang, setLang, t } = useAppLocale();
  return (
    <div className="mb-4 flex justify-end">
      <label className="sr-only">{t('language')}</label>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="if-input w-auto px-2 py-1 text-xs"
        aria-label={t('language')}
      >
        {appLanguages.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}
