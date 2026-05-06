/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 24px -4px rgba(15, 23, 42, 0.12), 0 12px 48px -12px rgba(15, 23, 42, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.65)",
        glow: "0 0 42px -8px rgba(99, 102, 241, 0.55), 0 0 86px -24px rgba(34, 211, 238, 0.35)",
        "panel-inset": "inset 0 1px 1px rgba(15, 23, 42, 0.06)",
        dropdown: "0 18px 42px -14px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)",
      },
      animation: {
        float: "float 5s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
