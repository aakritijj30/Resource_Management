/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#312e81',
          800: '#1e1b4b',
          900: '#111827',
        },
        accent: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#14b8a6',
          600: '#0f766e',
          700: '#115e59',
        },
        surface: {
          950: '#f8fafc',
          900: '#f3f7fb',
          800: '#e8eef5',
          700: '#d7e0eb',
          600: '#c4d0de',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 1px 2px rgba(15, 23, 42, 0.06), 0 24px 60px rgba(15, 23, 42, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.45s ease-out',
        'slide-in': 'slideIn 0.45s ease-out',
        'float': 'float 10s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
        'rise': 'rise 0.45s ease-out',
        'drift': 'drift 16s ease-in-out infinite',
        'shimmer': 'shimmer 6s ease-in-out infinite',
        'slow-pan': 'slowPan 18s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -10px, 0)' },
        },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        rise: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(0, -18px, 0) scale(1.03)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.78', transform: 'translateX(0)' },
          '50%': { opacity: '1', transform: 'translateX(8px)' },
        },
        slowPan: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      }
    },
  },
  plugins: [],
}
