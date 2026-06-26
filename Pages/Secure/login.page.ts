import { Locator, Page, expect } from "@playwright/test";

/**
 * Page Object for the Centraleyes Login screen.
 *
 * Holds all locators and reusable actions for the login form,
 * the show/hide password toggle and the forgot-password flow.
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly showPasswordButton: Locator;
  readonly hidePasswordButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordButton: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.showPasswordButton = page.getByRole("button", {
      name: "Show password",
    });
    this.hidePasswordButton = page.getByRole("button", {
      name: "Hide password",
    });
    this.rememberMeCheckbox = page.getByRole("checkbox", {
      name: "Remember me",
    });
    this.forgotPasswordButton = page.getByRole("button", {
      name: "Forgot my password",
    });
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  /** Navigate to the login page. */
  async goto(): Promise<void> {
    await this.page.goto("/login");
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /** Fill credentials and submit. */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  /** The native `type` attribute of the password input ("password" or "text"). */
  async passwordFieldType(): Promise<string | null> {
    return this.passwordInput.getAttribute("type");
  }

  async toggleShowPassword(): Promise<void> {
    await this.showPasswordButton.click();
  }

  async toggleHidePassword(): Promise<void> {
    await this.hidePasswordButton.click();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordButton.click();
  }

  /**
   * Assert a toast/notification message immediately after the action that
   * triggers it. Toasts auto-dismiss in ~3-5s, so this uses a bounded wait
   * and must be called right after the triggering action.
   */
  async expectToast(message: string, timeout = 7_000): Promise<void> {
    await expect(
      this.page.getByText(message, { exact: false }).first(),
    ).toBeVisible({
      timeout,
    });
  }
}
