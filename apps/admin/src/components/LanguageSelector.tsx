'use client';

import { useLocale, supportedLanguages } from '@/lib/i18n/LocaleContext';

export function LanguageSelector() {
  const { lang, setLang, t } = useLocale();

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="lang-select">{t('language')}</label>
      <select
        id="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        aria-label={t('language')}
      >
        {supportedLanguages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeName}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
        ▾
      </span>
    </div>
  );
}
