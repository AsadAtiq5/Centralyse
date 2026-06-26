import { test, expect } from "@playwright/test";
import { LoginPage } from "../../../Pages/Secure/login.page";
import { config } from "../../../utils/config";

/**
 * Suite 1: Login validation & credentials
 * Covers LOGIN-01, LOGIN-02, LOGIN-03.
 */
test.describe("Login - Validation & Credentials", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("LOGIN-01: shows required-field validation for empty email and password @smoke @regression", async () => {
    await loginPage.clickLogin();

    // Validation errors should appear under both fields.
    await expect(loginPage.emailInput).toHaveAttribute("aria-invalid", "true");
    await expect(loginPage.passwordInput).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await loginPage.expectToast("Email is required");
    await loginPage.expectToast("Password is required");
  });

  test("LOGIN-02: toggles password visibility @regression", async () => {
    await loginPage.fillPassword("SomePassword123");

    // Hidden by default.
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");

    // Show -> visible.
    await loginPage.toggleShowPassword();
    await expect(loginPage.passwordInput).toHaveAttribute("type", "text");

    // Hide -> masked again.
    await loginPage.toggleHidePassword();
    await expect(loginPage.passwordInput).toHaveAttribute("type", "password");
  });

  test("LOGIN-03: shows error for invalid credentials @smoke @regression", async () => {
    await loginPage.fillEmail(config.invalidEmail);
    await loginPage.fillPassword(config.invalidPassword);
    await loginPage.clickLogin();

    // Assert the toast immediately after clicking Login.
    await loginPage.expectToast("Invalid credentials. Kindly login again!");
  });
});
