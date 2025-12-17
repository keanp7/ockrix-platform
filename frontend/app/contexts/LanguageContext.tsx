'use client';

/**
 * Language Context
 * 
 * Provides language/translation functionality throughout the app
 * with auto-detection and persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  SupportedLocale,
  detectBrowserLanguage,
  getDirection,
  formatLocaleForHTML,
  defaultLocale,
} from '../lib/i18n/config';
import { getTranslations, Translations } from '../lib/i18n/translations';

interface LanguageContextType {
  locale: SupportedLocale;
  translations: Translations;
  direction: 'ltr' | 'rtl';
  setLocale: (locale: SupportedLocale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  initialLocale?: SupportedLocale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    // Use provided initial locale, or detect from browser
    return initialLocale || (typeof window !== 'undefined' ? detectBrowserLanguage() : defaultLocale);
  });

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      // Update HTML lang attribute
      document.documentElement.lang = formatLocaleForHTML(newLocale);
      document.documentElement.dir = getDirection(newLocale);
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set initial HTML attributes
      document.documentElement.lang = formatLocaleForHTML(locale);
      document.documentElement.dir = getDirection(locale);
    }
  }, [locale]);

  // Auto-detect on mount if no stored preference
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('locale')) {
      const detected = detectBrowserLanguage();
      if (detected !== locale) {
        setLocale(detected);
      }
    }
  }, []);

  const translations = getTranslations(locale);
  const direction = getDirection(locale);

  const value: LanguageContextType = {
    locale,
    translations,
    direction,
    setLocale,
    t: translations, // Short alias
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use language context
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
