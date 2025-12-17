# OCKRIX Branding Guide

## 🎨 Design System Overview

OCKRIX uses a dark, modern theme focused on trust and security, with accessible typography and global-ready layout support.

---

## 🌈 Color Palette

### Brand Colors

**Primary Brand Color**
- `brand-primary-500`: `#2d8fb3` - Main brand color (trust blue)
- Used for: Primary actions, links, accents
- Darker shades: `brand-primary-600` through `brand-primary-950`
- Lighter shades: `brand-primary-400` through `brand-primary-50`

**Accent Color**
- `brand-accent-500`: `#0ea5e9` - Trust-focused accent
- Used for: Hover states, secondary actions

**Status Colors**
- Success: `brand-success-500` (`#22c55e`) - Trust indicators, success states
- Warning: `brand-warning-500` (`#f59e0b`) - Warnings, cautions
- Error: `brand-error-500` (`#ef4444`) - Errors, destructive actions

### Dark Theme Base Colors

**Backgrounds**
- Primary: `#0a0a0f` - Main page background
- Secondary: `#141420` - Card backgrounds
- Tertiary: `#1e1e2e` - Elevated elements
- Hover: `#242435` - Interactive hover states

**Text Colors**
- Primary: `#ffffff` - Main text (WCAG AAA: 7:1 contrast)
- Secondary: `#b4b4c4` - Secondary text (WCAG AA: 4.5:1 contrast)
- Tertiary: `#808090` - Tertiary text (WCAG AA: 4.5:1 contrast)
- Disabled: `#505060` - Disabled text

**Borders**
- Primary: `#2a2a3a` - Subtle borders
- Secondary: `#3a3a4a` - More visible borders
- Accent: `#4a4a5a` - Accent borders

---

## 📝 Typography

### Font Family

- **Primary**: Inter (sans-serif) - Accessible, readable, modern
- **Monospace**: JetBrains Mono - For code/technical content

### Font Scale (Accessible)

All font sizes include line-height and letter-spacing optimized for readability:

- `xs`: 0.75rem (12px) - Line height: 1.5
- `sm`: 0.875rem (14px) - Line height: 1.5
- `base`: 1rem (16px) - Line height: 1.6
- `lg`: 1.125rem (18px) - Line height: 1.6
- `xl`: 1.25rem (20px) - Line height: 1.5
- `2xl`: 1.5rem (24px) - Line height: 1.4
- `3xl`: 1.875rem (30px) - Line height: 1.3
- `4xl`: 2.25rem (36px) - Line height: 1.2
- `5xl`: 3rem (48px) - Line height: 1.1
- `6xl`: 3.75rem (60px) - Line height: 1.1

### Headings

- **H1**: 3rem (48px), line-height: 1.1, letter-spacing: -0.03em
- **H2**: 2.25rem (36px), line-height: 1.2
- **H3**: 1.875rem (30px), line-height: 1.3
- **H4**: 1.5rem (24px), line-height: 1.4
- **H5**: 1.25rem (20px), line-height: 1.5
- **H6**: 1.125rem (18px), line-height: 1.5

---

## 🎯 Trust-Focused UI Elements

### Trust Indicators

Use `TrustIndicator` component to display security and trust status:

```tsx
<TrustIndicator variant="success" message="Secure & Trusted Platform" />
```

Variants:
- `default` - Primary brand color
- `success` - Trust/success indicators
- `warning` - Warnings
- `error` - Errors

### Glow Effects

Subtle glow effects on interactive elements:

- `shadow-glow-sm` - Small glow
- `shadow-glow-md` - Medium glow
- `shadow-glow-lg` - Large glow
- `shadow-glow-success` - Success state glow

---

## 🌍 Global-Ready Layout

### Internationalization Support

Supported locales:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Arabic (ar) - RTL support
- Hindi (hi)

### RTL Support

Automatic RTL support for Arabic and other RTL languages:

```tsx
<html lang="ar" dir="rtl">
```

The layout automatically adjusts for RTL languages.

---

## ♿ Accessibility Features

### WCAG Compliance

- **Text Contrast**: All text meets WCAG AA standards (4.5:1) or AAA (7:1)
- **Focus States**: Clear, visible focus indicators
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Semantic HTML and ARIA labels
- **Reduced Motion**: Respects `prefers-reduced-motion`

### Focus Styles

```css
:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### Screen Reader Support

Use `.sr-only` class for screen reader only content:

```tsx
<span className="sr-only">Loading...</span>
```

---

## 🧩 Reusable Components

### Button

```tsx
<Button variant="primary" size="lg" fullWidth>
  Get Started
</Button>
```

Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`
Sizes: `sm`, `md`, `lg`

### Card

```tsx
<Card hover glow>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

Props:
- `hover` - Enable hover effects
- `glow` - Add glow shadow effect

### TrustIndicator

```tsx
<TrustIndicator variant="success" message="Secure Platform" />
```

---

## 🎨 Usage Examples

### Dark Theme Backgrounds

```tsx
// Primary background
<div className="bg-dark-bg-primary">

// Card background
<div className="bg-dark-bg-secondary">

// Elevated element
<div className="bg-dark-bg-tertiary">
```

### Text Colors

```tsx
// Primary text
<p className="text-dark-text-primary">

// Secondary text
<p className="text-dark-text-secondary">

// Tertiary text
<p className="text-dark-text-tertiary">
```

### Brand Colors

```tsx
// Primary brand color
<button className="bg-brand-primary-500 text-white">

// Accent color
<a className="text-brand-accent-500">

// Success state
<div className="text-brand-success-500">
```

---

## 📐 Spacing & Layout

### Spacing Scale

- Uses Tailwind's default spacing scale
- Extended with: `18`, `88`, `128` for specific needs
- Unit: `0.25rem` (4px base)

### Border Radius

- `sm`: 0.25rem (4px)
- `md`: 0.5rem (8px) - Default
- `lg`: 0.75rem (12px)
- `xl`: 1rem (16px)
- `2xl`: 1.5rem (24px)
- `full`: 9999px (pill shape)

---

## 🔄 Animations & Transitions

### Transition Durations

- Fast: 150ms
- Base: 200ms (default)
- Slow: 300ms

### Animations

- `fade-in` - Fade in effect
- `slide-up` - Slide up from bottom
- `slide-down` - Slide down from top
- `pulse-slow` - Slow pulse animation

---

## 🎯 Best Practices

1. **Always use brand colors** - Don't use arbitrary colors
2. **Maintain contrast** - Ensure text is readable on backgrounds
3. **Use trust indicators** - Display security status clearly
4. **Respect reduced motion** - Animations respect user preferences
5. **Test RTL layouts** - Verify layouts work in RTL languages
6. **Keyboard accessible** - All interactive elements keyboard accessible
7. **Screen reader friendly** - Use semantic HTML and ARIA labels

---

## 📚 Additional Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inter Font](https://rsms.me/inter/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
