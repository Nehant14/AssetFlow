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
        // TransitOps dark operations-console palette
        base: {
          950: '#0a0c0d',
          900: '#0d1011',
          800: '#131718',
          700: '#181d1f',
        },
        panel: '#141819',
        panel2: '#191f21',
        line: '#262d2f',
        line2: '#333c3f',
        ink: {
          DEFAULT: '#e6ebec',
          dim: '#9aa7aa',
          faint: '#66787c',
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
