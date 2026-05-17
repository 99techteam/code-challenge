import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          card: "rgba(255, 255, 255, 0.04)",
          input: "rgba(255, 255, 255, 0.03)",
          "input-focus": "rgba(255, 255, 255, 0.06)",
        },
        border: {
          card: "rgba(255, 255, 255, 0.08)",
        },
        ink: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
          muted: "#64748b",
        },
        accent: {
          start: "#6366f1",
          mid: "#a855f7",
          end: "#ec4899",
        },
        success: "#10b981",
        error: "#f87171",
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "accent-gradient":
          "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
        "page-radial":
          "radial-gradient(ellipse at top left, #1a0b2e 0%, #0a0b1e 60%)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.9" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
