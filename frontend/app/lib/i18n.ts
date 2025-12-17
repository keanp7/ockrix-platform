/**
 * Internationalization (i18n) Support
 * Global-ready layout with language support
 */

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar' | 'hi';

export const supportedLocales: SupportedLocale[] = [
  'en', // English
  'es', // Spanish
  'fr', // French
  'de', // German
  'zh', // Chinese
  'ja', // Japanese
  'ar', // Arabic (RTL)
  'hi', // Hindi
];

export const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية',
  hi: 'हिन्दी',
};

export const rtlLocales: SupportedLocale[] = ['ar', 'he', 'ur'];

/**
 * Check if locale is RTL
 */
export function isRTL(locale: SupportedLocale): boolean {
  return rtlLocales.includes(locale);
}

/**
 * Get default locale
 */
export function getDefaultLocale(): SupportedLocale {
  return 'en';
}

/**
 * Format locale code for HTML lang attribute
 */
export function formatLocaleForHTML(locale: SupportedLocale): string {
  const map: Record<SupportedLocale, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ar: 'ar-SA',
    hi: 'hi-IN',
  };
  return map[locale] || 'en-US';
}

/**
 * Get direction for locale
 */
export function getDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}
