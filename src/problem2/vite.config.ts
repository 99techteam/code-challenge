import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [
    // Tailwind before React — matches https://tailwindcss.com/docs/installation/using-vite
    tailwindcss(
      command === "build"
        ? {}
        : {
            // Avoid Lightning CSS in dev; it can tie CSS rebuilds to full page reloads
            optimize: false,
          },
    ),
    react({ jsxRuntime: "automatic" }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    devSourcemap: true,
  },
  server: {
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === "true",
    },
    proxy: {
      "/prices.json": {
        target: "https://interview.switcheo.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
}));
