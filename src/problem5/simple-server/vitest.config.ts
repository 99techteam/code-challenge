import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    include: ["./src/**/*.{test,spec}.ts"],
  },
});
