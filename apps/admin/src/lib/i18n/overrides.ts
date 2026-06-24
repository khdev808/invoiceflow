import type { Translations } from './en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { pt } from './locales/pt';
import { zh } from './locales/zh';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { ar } from './locales/ar';
import { hi } from './locales/hi';
import { ru } from './locales/ru';
import { it } from './locales/it';
import { nl } from './locales/nl';
import { tr } from './locales/tr';
import { pl } from './locales/pl';
import { vi } from './locales/vi';
import { id } from './locales/id';
import { th } from './locales/th';
import { bn } from './locales/bn';
import { uk } from './locales/uk';
import { ro } from './locales/ro';
import { sv } from './locales/sv';
import { no } from './locales/no';
import { da } from './locales/da';
import { fi } from './locales/fi';
import { cs } from './locales/cs';
import { el } from './locales/el';
import { he } from './locales/he';
import { ms } from './locales/ms';
import { fil } from './locales/fil';
import { ur } from './locales/ur';
import { zhTW } from './locales/zh-TW';

export const supportedLanguages: { code: string; name: string; nativeName: string; rtl?: boolean }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', rtl: true },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
];

export const localeOverrides: Record<string, Partial<Translations>> = {
  es, fr, de, pt, zh, ja, ko, ar, hi, ru, it, nl, tr, pl, vi, id, th, bn, uk, ro, sv, no, da, fi, cs, el, he, ms, fil, ur, 'zh-TW': zhTW,
};
