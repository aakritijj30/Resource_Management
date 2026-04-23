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
          50:  '#fcf8f9',
          100: '#faeff1',
          200: '#f3dbe0',
          300: '#e9bec8',
          400: '#db97a8',
          500: '#c06c84',
          600: '#a35067',
          700: '#8a3f55',
          800: '#733748',
          900: '#623341',
          950: '#341720',
        },
        accent: {
          50:  '#fbf9fa',
          100: '#f5f0f3',
          200: '#ebe1e5',
          300: '#ddcbd2',
          400: '#c7adb6',
          500: '#ab8a96',
          600: '#926f7a',
          700: '#7a5a64',
          800: '#664d55',
          900: '#564249',
        },
        surface: {
          950: '#3a2725',
          900: '#5c403d',
          800: '#7a5550',
          700: '#956b64',
          600: '#b08279',
          500: '#c59d94',
          400: '#dabab3',
          300: '#ebd3cd',
          200: '#f5e6e2',
          100: '#fcf2ef',
          50 : '#fff9f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 4px 14px 0 rgba(192, 108, 132, 0.39)',
        soft: '0 8px 30px rgba(0, 0, 0, 0.04)',
        card: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)',
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
