/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf9f7',
          100: '#f3f2ef',
          200: '#e6e4e0',
          300: '#d0cec9',
          400: '#a8a6a1',
          500: '#78767a',
          600: '#504e4c',
          700: '#3c3c3c',
          800: '#282828',
          900: '#161616',
        },
        accent: {
          50: '#faf9f7',
          100: '#eeedea',
          200: '#d8d6d2',
          300: '#bcbab5',
          400: '#a09e9a',
          500: '#807e7a',
          600: '#5c5a57',
          700: '#48464a',
          800: '#34343a',
          900: '#202028',
        },
      },
      fontFamily: {
        sans: ['Work Sans', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
      },
    },
  },
  plugins: [],
};
