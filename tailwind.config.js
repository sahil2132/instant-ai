/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#00E0E0',
        blue: { DEFAULT: '#2F7CF5' },
        ink: '#0D0D0D',
        border: '#D9D9D9',
        'ai-bg': '#f8f9fb',
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'pulse-live': 'pulseLive 2.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseLive: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(34,197,94,0.45)' },
          '50%': { opacity: '0.75', boxShadow: '0 0 0 5px rgba(34,197,94,0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
