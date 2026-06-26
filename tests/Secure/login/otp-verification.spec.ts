import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../Pages/Secure/login.page";
import { OtpPage } from "../../../Pages/Secure/otp.page";
import { config } from "../../../utils/config";

/**
 * Suite 3: OTP / Two-Factor verification
 * Covers LOGIN-06, LOGIN-07, LOGIN-08, LOGIN-09.
 *
 * These tests share the same account and each performs a fresh valid login to
 * obtain a new code, so they run serially to avoid 2FA race conditions.
 */
test.describe("Login - OTP Verification", () => {
  test.describe.configure({ mode: "serial" });

  let loginPage: LoginPage;
  let otpPage: OtpPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    otpPage = new OtpPage(page);
    await loginPage.goto();
  });

  test("LOGIN-06: valid login redirects to the OTP screen @smoke @regression", async ({
    page,
  }) => {
    await loginPage.login(config.validEmail, config.validPassword);

    // The stable outcome is the redirect to /code and the OTP screen.
    // (The "Code was sent..." toast is transient and races with the redirect.)
    await expect(page).toHaveURL(/\/code/);
    await otpPage.waitForLoaded();
  });

  test('LOGIN-07: shows "Missing digit" when verifying an empty OTP @regression', async () => {
    await loginPage.login(config.validEmail, config.validPassword);
    await otpPage.waitForLoaded();

    await otpPage.clickVerify();
    await otpPage.expectMessage("Missing digit");
  });

  test("LOGIN-08: shows error for an incorrect OTP @regression", async () => {
    await loginPage.login(config.validEmail, config.validPassword);
    await otpPage.waitForLoaded();

    await otpPage.submitCode(config.incorrectOtp);
    await otpPage.expectMessage("The code is incorrect");
  });

  test("LOGIN-09: resends the code @regression", async () => {
    await loginPage.login(config.validEmail, config.validPassword);
    await otpPage.waitForLoaded();

    await otpPage.clickResend();
    await otpPage.expectMessage("Code was sent to your phone");
  });
});
