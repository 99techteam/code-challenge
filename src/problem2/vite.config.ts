import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root,
  /** Relative asset URLs so `dist` works from any path (file://, subfolder on a server). */
  base: "./",
  publicDir: false,
  build: {
    outDir: path.resolve(root, "../../dist/problem2-with-react"),
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    open: true,
  },
});
