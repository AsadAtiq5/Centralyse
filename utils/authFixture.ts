import { test as base, expect } from "@playwright/test";
import * as fs from "fs";
import { SESSION_STORAGE_PATH } from "./authPaths";

/**
 * Test fixture for authenticated flows.
 *
 * Use this `test` (instead of the one from '@playwright/test') in any spec that
 * should start already logged in. Combine it with the `authenticated` project
 * in playwright.config.ts, which provides the cookies + localStorage via
 * `storageState`. This fixture additionally restores the saved `sessionStorage`
 * (which `storageState` does not cover) by injecting it before each page loads.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    if (fs.existsSync(SESSION_STORAGE_PATH)) {
      const sessionStorageJson = fs.readFileSync(SESSION_STORAGE_PATH, "utf-8");
      await context.addInitScript((json: string) => {
        const entries = JSON.parse(json) as Record<string, string>;
        for (const [key, value] of Object.entries(entries)) {
          window.sessionStorage.setItem(key, value);
        }
      }, sessionStorageJson);
    }
    await use(context);
  },
});

export { expect };
