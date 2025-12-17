import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // OCKRIX Brand Colors - Dark Modern Theme
        brand: {
          // Primary brand colors
          primary: {
            50: '#e8f4f8',
            100: '#d1e9f1',
            200: '#a3d3e3',
            300: '#75bdd5',
            400: '#47a7c7',
            500: '#2d8fb3', // Main brand color
            600: '#24728f',
            700: '#1b556b',
            800: '#123947',
            900: '#091c24',
            950: '#050e12',
          },
          // Trust-focused accent colors
          accent: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9', // Trust blue
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            950: '#082f49',
          },
          // Success/Trust indicators
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            950: '#052e16',
          },
          // Warning colors
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
          },
          // Error colors
          error: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a',
          },
        },
        // Dark theme base colors
        dark: {
          bg: {
            primary: '#0a0a0f',      // Deep dark background
            secondary: '#141420',    // Slightly lighter for cards
            tertiary: '#1e1e2e',    // Even lighter for elevated elements
            hover: '#242435',        // Hover states
          },
          border: {
            primary: '#2a2a3a',      // Subtle borders
            secondary: '#3a3a4a',    // More visible borders
            accent: '#4a4a5a',       // Accent borders
          },
          text: {
            primary: '#ffffff',      // Primary text
            secondary: '#b4b4c4',    // Secondary text
            tertiary: '#808090',     // Tertiary text
            disabled: '#505060',     // Disabled text
            inverse: '#0a0a0f',      // Text on light backgrounds
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        // Accessible typography scale
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],     // 14px
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0em' }],          // 16px
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.01em' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],   // 30px
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],    // 36px
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],       // 48px
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],    // 60px
      },
      spacing: {
        // Extended spacing scale for better layout control
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        // Dark theme shadows
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.6), 0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(0, 0, 0, 0.5)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.8)',
        // Glow effects for trust-focused UI
        'glow-sm': '0 0 4px rgba(45, 143, 179, 0.3)',
        'glow-md': '0 0 8px rgba(45, 143, 179, 0.4)',
        'glow-lg': '0 0 16px rgba(45, 143, 179, 0.5)',
        'glow-success': '0 0 8px rgba(34, 197, 94, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
