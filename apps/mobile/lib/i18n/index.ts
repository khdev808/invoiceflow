import { en, type TranslationKey, type Translations } from './en';
import { localeOverrides, supportedLanguages } from './overrides';

const LOCALE_MAP: Record<string, string> = {
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  'pt-BR': 'pt',
  zh: 'zh',
  'zh-CN': 'zh',
  'zh-Hans': 'zh',
  'zh-TW': 'zh-TW',
  'zh-Hant': 'zh-TW',
  ja: 'ja',
  ko: 'ko',
  ar: 'ar',
  hi: 'hi',
  ru: 'ru',
  it: 'it',
  nl: 'nl',
  tr: 'tr',
  pl: 'pl',
  vi: 'vi',
  id: 'id',
  th: 'th',
  bn: 'bn',
  uk: 'uk',
  ro: 'ro',
  sv: 'sv',
  no: 'no',
  da: 'da',
  fi: 'fi',
  cs: 'cs',
  el: 'el',
  he: 'he',
  ms: 'ms',
  fil: 'fil',
  ur: 'ur',
};

function build(lang: string): Translations {
  const code = LOCALE_MAP[lang] || (localeOverrides[lang] ? lang : 'en');
  const overrides = localeOverrides[code];
  if (!overrides) return { ...en };
  return { ...en, ...overrides } as Translations;
}

const cache: Record<string, Translations> = { en: { ...en } };

let currentLang = 'en';
let currentTranslations: Translations = { ...en };

export function setLanguage(lang: string) {
  const code = LOCALE_MAP[lang] || lang;
  if (!cache[code]) cache[code] = build(code);
  currentLang = cache[code] ? code : 'en';
  currentTranslations = cache[currentLang] || cache.en;
}

export function getLanguage() {
  return currentLang;
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  let str = currentTranslations[key] || en[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return str;
}

export function isRtl(lang = currentLang) {
  const meta = supportedLanguages.find((l) => l.code === lang);
  return meta?.rtl === true;
}

export { en, supportedLanguages, type TranslationKey, type Translations };
