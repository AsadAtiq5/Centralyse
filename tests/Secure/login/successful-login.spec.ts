import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../Pages/Secure/login.page";
import { OtpPage } from "../../../Pages/Secure/otp.page";
import { MailinatorHelper } from "../../../helper/mailinator";
import { config, saveClientData } from "../../../utils/config";

/**
 * Suite 4: End-to-end successful login
 * Covers LOGIN-10.
 */
test.describe("Login - Successful Login", () => {
  test("LOGIN-10: logs in with a real OTP and lands on /clients @smoke @regression", async ({
    page,
    context,
  }) => {
    const loginPage = new LoginPage(page);
    const otpPage = new OtpPage(page);

    // 1-3. Valid login -> OTP screen.
    await loginPage.goto();
    await loginPage.login(config.validEmail, config.validPassword);
    await otpPage.waitForLoaded();

    // 4. Retrieve the OTP from Mailinator (opens its own tab).
    const otp = await MailinatorHelper.getOTP(
      context,
      config.mailinatorAddress,
    );

    // 5-6. Enter the OTP and verify.
    await otpPage.submitCode(otp);

    // Expected: redirect to /clients.
    await expect(page).toHaveURL(/\/clients/, { timeout: 30_000 });

    // Persist reusable data for dependent specs.
    saveClientData("lastSuccessfulLogin", {
      email: config.validEmail,
      landingUrl: page.url(),
      at: new Date().toISOString(),
    });
  });
});
