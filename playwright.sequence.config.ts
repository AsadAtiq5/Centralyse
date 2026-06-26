import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

/**
 * Sequential test configuration.
 *
 * Playwright normally runs spec files in alphabetical order and a `testMatch`
 * array does NOT control execution order. To run specific specs in an exact
 * sequence, list them in the `SEQUENCE` array below — each file becomes a
 * project that `depends on` the previous one, which guarantees they run one
 * after another, in this order, and stop early if a previous file fails.
 *
 * Run with:
 *   npx playwright test --config=playwright.sequence.config.ts
 */

dotenv.config({ path: path.resolve(__dirname, ".env") });

const isCI = !!process.env.CI;

/**
 * 👇 Add / reorder the spec files here. They run top-to-bottom, in sequence.
 */
const SEQUENCE: string[] = [
  "tests/Secure/login/login-validation.spec.ts",
  "tests/Secure/login/forgot-password.spec.ts",
  "tests/Secure/login/otp-verification.spec.ts",
  "tests/Secure/login/successful-login.spec.ts",
];

// Build a dependency chain: each file's project depends on the previous one.
const sequentialProjects = SEQUENCE.map((file, index) => ({
  name: `step-${String(index + 1).padStart(2, "0")}`,
  testMatch: file,
  use: { ...devices["Desktop Chrome"] },
  dependencies: index === 0 ? [] : [`step-${String(index).padStart(2, "0")}`],
}));

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  /* A single worker so files never overlap. */
  workers: 1,
  timeout: isCI ? 180_000 : 120_000,
  expect: {
    timeout: isCI ? 15_000 : 10_000,
  },
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    [
      "./reporters/markdown-reporter.ts",
      { outputFile: "test-results/test-summary.md" },
    ],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "https://secure.cygovdev.com/",
    actionTimeout: isCI ? 30_000 : 15_000,
    navigationTimeout: isCI ? 60_000 : 30_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: sequentialProjects,
});
