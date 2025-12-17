# Multilingual Support Documentation

## 📋 Overview

OCKRIX Platform supports multiple languages with automatic detection and manual selection:

- **English** (en)
- **Spanish** (es)
- **French** (fr)
- **Haitian Creole** (ht)

---

## 🌍 Supported Languages

### English (en)
- Default language
- Full coverage of all features

### Spanish (es)
- Español
- Supports all Spanish variants (ES, MX, AR, etc.)

### French (fr)
- Français
- Supports all French variants (FR, CA, BE, etc.)

### Haitian Creole (ht)
- Kreyòl Ayisyen
- Full translation support

---

## 🔍 Language Detection

### Automatic Detection

The system automatically detects the user's preferred language using:

1. **LocalStorage Preference** (Highest Priority)
   - User's manually selected language
   - Persists across sessions

2. **Browser Language** (Secondary)
   - `navigator.language`
   - Checks exact match first (e.g., `es-MX`)
   - Falls back to language code (e.g., `es`)

3. **Browser Languages Array** (Tertiary)
   - `navigator.languages`
   - Checks all preferred languages
   - Finds first supported language

4. **Default Fallback**
   - English (en) if no match found

### Detection Flow

```
User visits site
  ↓
Check localStorage for stored preference
  ↓ (if not found)
Check navigator.language
  ↓ (if not found)
Check navigator.languages array
  ↓ (if not found)
Use default locale (en)
```

---

## 🎯 Usage

### Using Translations in Components

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { t, locale, setLocale } = useLanguage();
  
  return (
    <div>
      <h1>{t.landing.heroTitle}</h1>
      <p>{t.landing.heroSubtitle}</p>
      <button>{t.common.continue}</button>
    </div>
  );
}
```

### Language Switcher Component

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

---

## 📝 Translation Structure

Translations are organized by category:

```typescript
{
  common: { ... },        // Common UI elements
  nav: { ... },           // Navigation
  landing: { ... },       // Landing page
  recovery: { ... },      // Recovery flow
  voice: { ... },         // Voice input
  ai: { ... },            // AI verification
  errors: { ... },        // Error messages
  security: { ... },      // Security messages
}
```

---

## 🔧 Configuration

### Adding a New Language

1. **Add to config** (`lib/i18n/config.ts`):
```typescript
export type SupportedLocale = 'en' | 'es' | 'fr' | 'ht' | 'de'; // Add 'de'

export const supportedLocales: SupportedLocale[] = ['en', 'es', 'fr', 'ht', 'de'];

export const localeNames: Record<SupportedLocale, string> = {
  // ... existing
  de: 'Deutsch',
};
```

2. **Add translations** (`lib/i18n/translations.ts`):
```typescript
de: {
  common: { ... },
  nav: { ... },
  // ... all translation keys
}
```

3. **Add language mapping** (`lib/i18n/config.ts`):
```typescript
export const languageMap: Record<string, SupportedLocale> = {
  // ... existing
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
};
```

---

## 💾 Persistence

### LocalStorage

The selected language is stored in localStorage:
- Key: `locale`
- Value: Language code (e.g., `'es'`)
- Persists across sessions

### HTML Attributes

The system automatically updates:
- `html lang` attribute (e.g., `lang="es-ES"`)
- `html dir` attribute (LTR/RTL support)

---

## 🎨 Language Switcher UI

The LanguageSwitcher component provides:
- Dropdown menu with all supported languages
- Visual indicator of current language
- Checkmark on selected language
- Keyboard accessible
- Click-outside-to-close

---

## 🌐 RTL Support

Currently all supported languages are LTR (left-to-right). RTL support is configured but not used:

```typescript
export const rtlLocales: SupportedLocale[] = []; // Empty, no RTL languages

// To add RTL support:
export const rtlLocales: SupportedLocale[] = ['ar', 'he'];
```

---

## 🧪 Testing

### Test Language Detection

1. **Test Browser Language**:
   - Change browser language in settings
   - Reload page
   - Verify correct language loads

2. **Test Manual Selection**:
   - Select language from switcher
   - Reload page
   - Verify language persists

3. **Test Fallback**:
   - Set unsupported browser language
   - Verify falls back to English

### Test Translations

1. Switch language using LanguageSwitcher
2. Verify all text updates
3. Check HTML lang attribute updates
4. Test persistence across page reloads

---

## 📊 Translation Coverage

### Fully Translated Sections

- ✅ Common UI elements
- ✅ Navigation
- ✅ Landing page
- ✅ Recovery flow (Step 1)
- ✅ Voice input
- ✅ AI verification
- ✅ Error messages
- ✅ Security messages

### In Progress

- 🔄 Recovery flow (Step 2 & 3)
- 🔄 Account Recovery Hub
- 🔄 Additional error messages

---

## 🔐 Privacy & Security

- Language preference stored locally only
- No language data sent to servers
- Browser language detection is client-side
- No tracking of language preferences

---

## 📚 Best Practices

1. **Always Use Translation Keys**
   - Never hardcode text strings
   - Use `t` from `useLanguage()` hook

2. **Provide Context in Keys**
   - Use descriptive key names
   - Group related translations

3. **Handle Missing Translations**
   - Falls back to English
   - Log warnings in development

4. **Test All Languages**
   - Verify UI doesn't break with longer text
   - Check text overflow
   - Test RTL if applicable

---

## 🚀 Future Enhancements

1. **Dynamic Language Loading**
   - Load translations on demand
   - Reduce initial bundle size

2. **Translation Management**
   - External translation service
   - OTA (Over-the-Air) updates

3. **More Languages**
   - Portuguese
   - German
   - Arabic (with RTL)
   - And more...

4. **Pluralization**
   - Proper plural forms
   - Language-specific rules

5. **Date/Number Formatting**
   - Locale-specific formatting
   - Currency formatting
