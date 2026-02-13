import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": "/src/components",
      "@api": "/src/api",
      "@types": "/src/types",
      "@common": "/src/common",
      "@atom": "/src/atom",
      "@contexts": "/src/contexts",
    },
  },
});
