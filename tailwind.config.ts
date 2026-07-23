import type { Config } from 'tailwindcss';

/**
 * Semantic colours are defined as space-separated RGB channels in
 * `src/styles/globals.css` (e.g. `--color-surface: 255 255 255;`) so that
 * Tailwind's `<alpha-value>` opacity modifiers keep working
 * (`bg-surface/70`, `text-muted/50`, ...).
 *
 * Components must consume these semantic tokens rather than hard-coded colours.
 */
function token(name: string) {
  return `rgb(var(${name}) / <alpha-value>)`;
}

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: token('--color-background'),
        surface: token('--color-surface'),
        elevated: token('--color-elevated'),
        text: token('--color-text'),
        muted: token('--color-muted'),
        border: token('--color-border'),
        primary: {
          DEFAULT: token('--color-primary'),
          foreground: token('--color-primary-foreground'),
          soft: token('--color-primary-soft'),
        },
        destructive: {
          DEFAULT: token('--color-destructive'),
          foreground: token('--color-destructive-foreground'),
        },
        success: token('--color-success'),
        focus: token('--color-focus'),
      },
      borderRadius: {
        sheet: '1.5rem',
        card: '1.25rem',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        sheet: 'var(--shadow-sheet)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      maxWidth: {
        app: '30rem',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        nav: '4.25rem',
      },
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
        spring: 'cubic-bezier(0.34, 1.3, 0.5, 1)',
      },
      keyframes: {
        'sheet-in': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        'row-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'sheet-in': 'sheet-in 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        pop: 'pulse 0.26s ease-out',
        'row-in': 'row-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
