import { Locator, Page, expect } from "@playwright/test";

/**
 * Page Object for the Centraleyes OTP / "Enter Code" screen (/code).
 *
 * The OTP widget is a set of 6 single-digit Angular inputs (#input0..#input5)
 * with auto-advance behaviour.
 *
 * IMPORTANT — verified during exploratory testing:
 *  - Setting input `.value` programmatically does NOT update Angular's form
 *    model, so the submitted code ends up empty.
 *  - Filling each box separately drops/misaligns digits because of auto-advance.
 *  - The reliable approach is to FOCUS the first box and type the whole code as
 *    one keyboard sequence, letting auto-advance distribute the digits.
 */
export class OtpPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly digitInputs: Locator;
  readonly verifyButton: Locator;
  readonly resendButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByText("Enter Code");
    this.digitInputs = page.locator('input[id^="input"]');
    this.verifyButton = page.getByRole("button", { name: "Verify" });
    this.resendButton = page.getByRole("button", {
      name: "Didn't receive a code?",
    });
  }

  /** Wait until the OTP screen is shown. */
  async waitForLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.page).toHaveURL(/\/code/);
  }

  /** Clear every OTP digit box. */
  async clear(): Promise<void> {
    const count = await this.digitInputs.count();
    for (let i = count - 1; i >= 0; i--) {
      const box = this.digitInputs.nth(i);
      await box.click();
      await this.page.keyboard.press("Backspace");
    }
  }

  /**
   * Enter the OTP by focusing the first box and typing the full code as one
   * keyboard sequence so the widget's auto-advance distributes each digit.
   */
  async enterCode(code: string): Promise<void> {
    await this.clear();
    await this.digitInputs.first().click();
    await this.page.keyboard.type(code, { delay: 80 });
    // Sanity check: the boxes should now spell the code.
    await expect(this.joinedValue()).resolves.toBe(code);
  }

  /** Read and concatenate the current value of all OTP boxes. */
  private async joinedValue(): Promise<string> {
    return this.digitInputs.evaluateAll((els) =>
      (els as HTMLInputElement[]).map((el) => el.value).join(""),
    );
  }

  async clickVerify(): Promise<void> {
    await this.verifyButton.click();
  }

  async clickResend(): Promise<void> {
    await this.resendButton.click();
  }

  /** Enter a code and submit it. */
  async submitCode(code: string): Promise<void> {
    await this.enterCode(code);
    await this.clickVerify();
  }

  /**
   * Assert a toast/error message immediately after the triggering action.
   * Bounded wait — toasts auto-dismiss quickly.
   */
  async expectMessage(message: string, timeout = 7_000): Promise<void> {
    await expect(
      this.page.getByText(message, { exact: false }).first(),
    ).toBeVisible({
      timeout,
    });
  }
}
