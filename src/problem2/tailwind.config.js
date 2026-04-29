/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#142019",
        muted: "#66736b",
        line: "#dce5dd",
        soft: "#f4f8f5",
        accent: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          soft: "#dbeafe"
        }
      },
      boxShadow: {
        swap: "0 18px 48px rgba(20, 32, 25, 0.12)",
        route: "0 18px 40px rgba(20, 32, 25, 0.08)"
      }
    }
  },
  plugins: []
};
