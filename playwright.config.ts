import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { STORAGE_STATE_PATH } from "./utils/authPaths";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, ".env") });

const isCI = !!process.env.CI;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: isCI ? 1 : undefined,
  /* Per-test timeout. OTP retrieval via Mailinator can be slow, more so on CI. */
  timeout: isCI ? 180_000 : 120_000,
  expect: {
    /* Bounded assertion timeout; generous on CI for slower runners. */
    timeout: isCI ? 15_000 : 10_000,
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.BASE_URL ?? "https://secure.cygovdev.com/",

    /* Slower action/navigation budgets to absorb CI variability. */
    actionTimeout: isCI ? 30_000 : 15_000,
    navigationTimeout: isCI ? 60_000 : 30_000,

    /* Capture artifacts to debug CI failures. */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    /* Logs in once and saves storageState + sessionStorage. */
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },

    /* Login-flow and other unauthenticated tests (start with a clean session). */
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/auth\.setup\.ts/, /.*\.auth\.spec\.ts/],
    },

    /* Authenticated flows: reuse the saved login so no re-login is needed.
       Name spec files "<feature>.auth.spec.ts" and import `test` from
       utils/authFixture.ts to also restore sessionStorage. */
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_STATE_PATH,
      },
      testMatch: /.*\.auth\.spec\.ts/,
      dependencies: ["setup"],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
