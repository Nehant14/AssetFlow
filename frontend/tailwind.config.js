/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        // TransitOps operations-console palette — driven by CSS variables so
        // the same utility classes (bg-base-900, text-ink, etc.) automatically
        // repaint for the light theme (see index.css :root / html.light).
        base: {
          950: 'rgb(var(--c-base-950) / <alpha-value>)',
          900: 'rgb(var(--c-base-900) / <alpha-value>)',
          800: 'rgb(var(--c-base-800) / <alpha-value>)',
          700: 'rgb(var(--c-base-700) / <alpha-value>)',
        },
        panel: 'rgb(var(--c-panel) / <alpha-value>)',
        panel2: 'rgb(var(--c-panel2) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        line2: 'rgb(var(--c-line2) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          dim: 'rgb(var(--c-ink-dim) / <alpha-value>)',
          faint: 'rgb(var(--c-ink-faint) / <alpha-value>)',
        },
        accent: {
          DEFAULT: '#3ecf8e',
          hover: '#33b87c',
          soft: 'rgba(62,207,142,0.12)',
        },
        info: { DEFAULT: '#4fb2e8', soft: 'rgba(79,178,232,0.12)' },
        warn: { DEFAULT: '#e8b64f', soft: 'rgba(232,182,79,0.12)' },
        danger: { DEFAULT: '#e8615c', soft: 'rgba(232,97,92,0.12)' },
        violet: { DEFAULT: '#9b8cf2', soft: 'rgba(155,140,242,0.12)' },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
