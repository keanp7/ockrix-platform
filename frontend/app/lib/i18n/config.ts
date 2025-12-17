/**
 * i18n Configuration
 * 
 * Supported languages and configuration
 */

export type SupportedLocale = 'en' | 'es' | 'fr' | 'ht';

export const supportedLocales: SupportedLocale[] = ['en', 'es', 'fr', 'ht'];

export const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ht: 'Kreyòl Ayisyen',
};

export const localeNativeNames: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ht: 'Kreyòl Ayisyen',
};

export const rtlLocales: SupportedLocale[] = []; // No RTL languages currently supported

export const defaultLocale: SupportedLocale = 'en';

/**
 * Map browser language codes to supported locales
 */
export const languageMap: Record<string, SupportedLocale> = {
  // English variants
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-CA': 'en',
  'en-AU': 'en',
  
  // Spanish variants
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  'es-CO': 'es',
  'es-CL': 'es',
  'es-PE': 'es',
  'es-VE': 'es',
  
  // French variants
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  'fr-CH': 'fr',
  
  // Haitian Creole
  'ht': 'ht',
  'ht-HT': 'ht',
};

/**
 * Detect user's preferred language from browser
 */
export function detectBrowserLanguage(): SupportedLocale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // Check localStorage first (user preference)
  const stored = localStorage.getItem('locale');
  if (stored && supportedLocales.includes(stored as SupportedLocale)) {
    return stored as SupportedLocale;
  }

  // Check browser language
  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (browserLang) {
    // Try exact match first
    if (languageMap[browserLang]) {
      return languageMap[browserLang];
    }
    
    // Try language code only (e.g., 'es' from 'es-MX')
    const langCode = browserLang.split('-')[0];
    if (languageMap[langCode]) {
      return languageMap[langCode];
    }
  }

  // Check browser languages array
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      if (languageMap[lang]) {
        return languageMap[lang];
      }
      const langCode = lang.split('-')[0];
      if (languageMap[langCode]) {
        return languageMap[langCode];
      }
    }
  }

  return defaultLocale;
}

/**
 * Get direction for locale
 */
export function getDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

/**
 * Format locale code for HTML lang attribute
 */
export function formatLocaleForHTML(locale: SupportedLocale): string {
  const map: Record<SupportedLocale, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    ht: 'ht-HT',
  };
  return map[locale] || 'en-US';
}

/**
 * Check if locale is RTL
 */
export function isRTL(locale: SupportedLocale): boolean {
  return rtlLocales.includes(locale);
}
