/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3b82f6',
        'primary-dark': '#1e40af',
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 2s linear infinite',
        'bounce-subtle': 'bounce 1s infinite',
      },
      keyframes: {
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      backgroundImage: {
        'currency-bg': "url('/Rectangle 1.png')",
      }
    },
  },
  plugins: [],
} 