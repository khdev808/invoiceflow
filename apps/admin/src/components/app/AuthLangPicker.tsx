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
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
        aria-label={t('language')}
      >
        {appLanguages.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}
