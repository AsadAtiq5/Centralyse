import { test, expect } from "../../../utils/authFixture";

/**
 * Example authenticated flow.
 *
 * Runs under the "authenticated" project (see playwright.config.ts), which:
 *   - loads cookies + localStorage from playwright/.auth/user.json (storageState)
 *   - restores sessionStorage via the authFixture
 *
 * No login steps are required — the session from the `setup` project is reused.
 */
test("reuses the saved session and lands on /clients without logging in @smoke", async ({
  page,
}) => {
  await page.goto("/clients");

  // Should NOT be bounced back to the login/code screens.
  await expect(page).toHaveURL(/\/clients/);
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page).not.toHaveURL(/\/code/);
});
