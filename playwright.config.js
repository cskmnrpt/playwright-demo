import { defineConfig } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  retries: 0,
  workers: 8,
  fullyParallel: true,
  use: {
    baseURL: "https://gameday-gear.lovable.app",
    screenshot: "on",
    video: "on",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "smoke", testMatch: /smoke\.spec\.js/ },
    { name: "core-regression", testMatch: /core-regression\.spec\.js/ },
    { name: "full-regression", testMatch: /full-regression\.spec\.js/ },
    { name: "examples", testMatch: /tests\/examples\/.*\.spec\.js$/ },
  ],
  reporter: [
    ["list"],
    [
      "playwright-qase-reporter",
      {
        mode: "testops",
        debug: false,
        environment: "prod",
        testops: {
          api: {
            token: process.env.QASE_TESTOPS_API_TOKEN || process.env.QASE_API_TOKEN,
          },
          project: "DEMOEXEC",
          uploadAttachments: true,
          showPublicReportLink: true,
          run: {
            complete: true,
          },
        },
        framework: {
          markAsFlaky: true,
          browser: {
            addAsParameter: false,
            parameterName: "Browser",
          },
        },
      },
    ],
  ],

  /*
  projects: [
    {
      name: "Chromium",
      use: {
        browserName: "chromium",
        headless: false,
        viewport: { width: 1280, height: 720 },
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        video: "on-first-retry",
        screenshot: "only-on-failure",
        geolocation: { longitude: 12.4924, latitude: 41.8902 },
        locale: "en-US",
      },
    },
    {
      name: "Firefox",
      use: {
        browserName: "firefox",
        headless: true,
        viewport: { width: 1024, height: 768 },
        video: "on",
        screenshot: "on",
        storageState: "state.json",
      },
    },
    {
      name: "Webkit",
      use: {
        browserName: "webkit",
        headless: false,
        viewport: { width: 1280, height: 720 },
        video: "on-first-retry",
        geolocation: { longitude: -73.935242, latitude: 40.73061 },
        locale: "fr-FR",
        bypassCSP: true,
      },
    },
  ],
  use: {
    screenshot: "only-on-failure", // options: 'on', 'off', 'only-on-failure'
    video: "on", // options: 'on', 'off', 'on-first-retry'
    viewport: { width: 1280, height: 720 },
  },
  */
  outputDir: "test-results/",
});
