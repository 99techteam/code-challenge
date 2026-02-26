import { defineConfig, devices } from "@playwright/test";

const CI = typeof process !== "undefined" && !!process.env["CI"];

export default defineConfig({
  testDir: "./src/tests/e2e",
  fullyParallel: true,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !CI,
  },
});