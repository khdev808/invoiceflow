import { getLanguage } from '@/lib/i18n';

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-BR',
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  ja: 'ja-JP',
  ko: 'ko-KR',
  ar: 'ar-SA',
  hi: 'hi-IN',
  ru: 'ru-RU',
  it: 'it-IT',
  nl: 'nl-NL',
  tr: 'tr-TR',
  pl: 'pl-PL',
  vi: 'vi-VN',
  id: 'id-ID',
  th: 'th-TH',
  bn: 'bn-BD',
  uk: 'uk-UA',
  ro: 'ro-RO',
  sv: 'sv-SE',
  no: 'nb-NO',
  da: 'da-DK',
  fi: 'fi-FI',
  cs: 'cs-CZ',
  el: 'el-GR',
  he: 'he-IL',
  ms: 'ms-MY',
  fil: 'fil-PH',
  ur: 'ur-PK',
};

function intlLocale(lang?: string) {
  const code = lang || getLanguage();
  return LOCALE_MAP[code] || code || 'en-US';
}

export function formatCurrency(amount: number, currency = 'USD', lang?: string) {
  return new Intl.NumberFormat(intlLocale(lang), { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string | Date, lang?: string) {
  return new Date(date).toLocaleDateString(intlLocale(lang), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date: string | Date, lang?: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const locale = intlLocale(lang);
  if (mins < 1) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'minute');
  if (mins < 60) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-mins, 'minute');
  const hours = Math.floor(mins / 60);
  if (hours < 24) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  if (days < 7) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-days, 'day');
  return formatDate(date, lang);
}
