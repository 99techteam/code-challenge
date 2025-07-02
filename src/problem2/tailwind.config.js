/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'dark-main': '#13141D',
        'dark-card': '#1C1C28',
        'dark-btn': '#2A2C3D',
        'dark-btn-hover': '#3B3D4E',
        'primary': '#4975F1',
        'primary-hover': '#3f66d1',
        'bg-base': '#DEE3FA',
      },
    },
  },
  plugins: [],
};
