/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        // primary: "#007bff",
        // secondary: "#6c757d",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      height: {
        "fit-browser": "var(--doc-height)",
      },
      width: {
        "large-desktop": "1440px",
      },
    },
  },
  plugins: [],
};
