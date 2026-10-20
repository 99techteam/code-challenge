/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#232d3f',
          850: '#141c2b',
          950: '#0b0f19',
        }
      }
    },
  },
  plugins: [],
}

