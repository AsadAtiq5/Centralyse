import { BrowserContext, Page } from "@playwright/test";

/**
 * Mailinator helper utilities for retrieving the login OTP.
 *
 * The application emails a 6-digit OTP (subject: "Centraleyes Platform")
 * to the configured Mailinator public inbox after a valid login.
 */
export class MailinatorHelper {
  /**
   * Open the Mailinator public inbox, wait for the latest Centraleyes email
   * and return the 6-digit OTP it contains.
   *
   * Runs in its own page/tab so the OTP screen in the main tab is preserved.
   *
   * @param context  Active browser context (a new page is opened and closed).
   * @param inbox     Mailinator public inbox id (without the @mailinator.com).
   */
  static async getOTP(context: BrowserContext, inbox: string): Promise<string> {
    const inboxPage: Page = await context.newPage();
    try {
      await inboxPage.goto("https://www.mailinator.com/", {
        waitUntil: "domcontentloaded",
      });

      const inboxInput = inboxPage.getByRole("textbox", {
        name: "Enter public inbox",
      });
      await inboxInput.click();
      await inboxInput.fill(inbox);
      await inboxPage.getByRole("button", { name: "GO" }).click();

      // Wait for the latest Centraleyes email to arrive (delivery can be slow).
      const messageCell = inboxPage
        .getByRole("cell", { name: "Centraleyes Platform", exact: true })
        .first();
      await messageCell.waitFor({ state: "visible", timeout: 120_000 });
      await messageCell.click();

      const otp = await MailinatorHelper.extractOtp(inboxPage);
      if (!otp) {
        throw new Error("OTP not found in the Centraleyes email.");
      }
      return otp;
    } finally {
      await inboxPage.close();
    }
  }

  /**
   * Extract the first 6-digit sequence from the opened email body.
   *
   * The email renders inside an iframe (`html_msg_body`) that loads slightly
   * after the message is opened, so this polls both the iframe and the outer
   * document until a code appears or the timeout elapses.
   */
  private static async extractOtp(
    inboxPage: Page,
    timeoutMs = 30_000,
  ): Promise<string> {
    const otpRegex = /\b\d{6}\b/;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      // 1. Try the email body iframe.
      const frame = inboxPage.frame({ name: "html_msg_body" });
      if (frame) {
        try {
          const text = await frame
            .locator("body")
            .innerText({ timeout: 2_000 });
          const match = text?.match(otpRegex);
          if (match) {
            return match[0];
          }
        } catch {
          // iframe not ready yet — keep polling.
        }
      }

      // 2. Fallback: search the outer document text.
      try {
        const fallbackText = await inboxPage
          .locator("body")
          .innerText({ timeout: 2_000 });
        const fallbackMatch = fallbackText?.match(otpRegex);
        if (fallbackMatch) {
          return fallbackMatch[0];
        }
      } catch {
        // ignore and retry
      }

      await inboxPage.waitForTimeout(1_000);
    }

    return "";
  }
}
