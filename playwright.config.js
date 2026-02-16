const { defineConfig, devices } = require("@playwright/test");

const baseURL =
  process.env.E2E_BASE_URL || process.env.APP_URL || "http://[::1]:3030";

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  outputDir: "test-results/artifacts",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "test-results/playwright-report" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1365, height: 768 },
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
      },
    },
  ],
});

