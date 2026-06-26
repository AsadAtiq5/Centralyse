import { test } from "@playwright/test";
import { LoginPage } from "../../../Pages/Secure/login.page";
import { config } from "../../../utils/config";

/**
 * Suite 2: Forgot Password
 * Covers LOGIN-04, LOGIN-05.
 */
test.describe("Login - Forgot Password", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("LOGIN-04: shows error when forgot-password is used with an empty email @regression", async () => {
    await loginPage.clickForgotPassword();
    await loginPage.expectToast("Please fill email address");
  });

  test("LOGIN-05: shows error when forgot-password is used with an unregistered email @regression", async () => {
    await loginPage.fillEmail(config.forgotPasswordUnregisteredEmail);
    await loginPage.clickForgotPassword();
    await loginPage.expectToast(
      "No registered/verified email found. Contact administrator to reset your password",
    );
  });
});
