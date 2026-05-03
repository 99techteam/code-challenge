import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@stores": "/src/store",
      "@utils": "/src/utils",
      "@lib": "/src/lib",
    },
  },
});
