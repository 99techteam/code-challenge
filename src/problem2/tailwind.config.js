import tailwindAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FCD535',
        background: '#1E2329',
        'background-secondary': '#2B3139',
        'text-primary': '#EAECEF',
        'text-secondary': '#929AA5',
        success: '#0ECB81',
        danger: '#F6465D',
        warning: '#F0B90B',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    tailwindAnimate
  ],
}
