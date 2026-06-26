import { test as setup, expect } from "@playwright/test";
import * as fs from "fs";
import { LoginPage } from "../Pages/Secure/login.page";
import { OtpPage } from "../Pages/Secure/otp.page";
import { MailinatorHelper } from "../helper/mailinator";
import { config } from "../utils/config";
import {
  AUTH_DIR,
  STORAGE_STATE_PATH,
  SESSION_STORAGE_PATH,
} from "../utils/authPaths";

/**
 * Authentication setup.
 *
 * Performs a full login (including the real OTP from Mailinator) once, then
 * persists the authenticated state so other flows can reuse it without logging
 * in again:
 *   - cookies + localStorage -> playwright/.auth/user.json   (storageState)
 *   - sessionStorage          -> playwright/.auth/session.json (saved manually,
 *     because Playwright's storageState does not capture sessionStorage)
 */
setup("authenticate", async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  const otpPage = new OtpPage(page);

  await loginPage.goto();
  await loginPage.login(config.validEmail, config.validPassword);
  await otpPage.waitForLoaded();

  const otp = await MailinatorHelper.getOTP(context, config.mailinatorAddress);
  await otpPage.submitCode(otp);

  await expect(page).toHaveURL(/\/clients/, { timeout: 30_000 });

  // Let the dashboard finish loading so client-side storage is fully populated.
  await page.waitForLoadState("networkidle").catch(() => undefined);

  fs.mkdirSync(AUTH_DIR, { recursive: true });

  // Persist cookies + localStorage.
  await context.storageState({ path: STORAGE_STATE_PATH });

  // Persist sessionStorage separately.
  const sessionStorageJson = await page.evaluate(() =>
    JSON.stringify(sessionStorage),
  );
  fs.writeFileSync(SESSION_STORAGE_PATH, sessionStorageJson, "utf-8");

  // Diagnostic: report how many keys were captured in each store.
  const counts = await page.evaluate(() => ({
    sessionStorageKeys: Object.keys(sessionStorage),
    localStorageKeys: Object.keys(localStorage),
  }));
  console.log(
    `[auth.setup] sessionStorage keys (${counts.sessionStorageKeys.length}):`,
    counts.sessionStorageKeys.join(", ") || "(none)",
  );
  console.log(
    `[auth.setup] localStorage keys (${counts.localStorageKeys.length}):`,
    counts.localStorageKeys.join(", ") || "(none)",
  );
});
