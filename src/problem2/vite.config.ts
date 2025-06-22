import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@services": "/src/services",
      "@features": "/src/features",
      "@app": "/src/app",
      "@utils": "/src/utils",
      "@assets": "/src/assets",
      "@types": "/src/types",
      "@config": "/src/config",
      "@context": "/src/context",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: `@import "src/global.scss";`
      },
    },
  },
  server: {
    open: true,
  },
});
