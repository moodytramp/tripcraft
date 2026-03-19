import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import de from '../locales/de.json';
import ar from '../locales/ar.json';

export const RTL_LANGUAGES = ['ar'] as const;

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'ar'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isRTL(language: string): boolean {
  return RTL_LANGUAGES.includes(language as (typeof RTL_LANGUAGES)[number]);
}

export const resources = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
  ar: { translation: ar },
} as const;

export function initI18n(language: SupportedLanguage = 'en') {
  return i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export { i18n };
export { useTranslation } from 'react-i18next';
