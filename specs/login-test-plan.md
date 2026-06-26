# Login Module — Test Plan

## Overview

Test plan for the **Centraleyes** GRC platform login flow, covering required-field
validation, password visibility toggle, invalid credentials, forgot-password flows,
OTP (2FA) screen behaviour, and a full successful login using an OTP retrieved from
Mailinator.

- **Application URL:** `https://secure.cygovdev.com/`
- **Seed file:** `tests/seed.spec.ts`
- **Spec location convention:** `tests/Client/login/<feature>.spec.ts`
- **Page object convention:** `Pages/Client/login.page.ts`, `Pages/Client/otp.page.ts`
- **Shared test data:** `Testdata/Client/client.json`

### Discovered Selectors (from live exploration)

**Login page**

| Element                   | Locator                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| Email field               | `getByRole('textbox', { name: 'Email' })`                            |
| Password field            | `getByRole('textbox', { name: 'Password' })`                         |
| Show/Hide password toggle | `getByRole('button', { name: 'Show password' })` ⇄ `'Hide password'` |
| Remember me               | `getByRole('checkbox', { name: 'Remember me' })`                     |
| Forgot my password        | `getByRole('button', { name: 'Forgot my password' })`                |
| Login                     | `getByRole('button', { name: 'Login' })`                             |

**OTP / Code screen (`/code`)**

| Element          | Locator                                                   |
| ---------------- | --------------------------------------------------------- |
| Heading          | `getByText('Enter Code')`                                 |
| OTP digit inputs | 6 × `getByRole('textbox')` (ordered)                      |
| Verify           | `getByRole('button', { name: 'Verify' })`                 |
| Resend code      | `getByRole('button', { name: "Didn't receive a code?" })` |

### Test Data Requirements

| Key                                | Value                                                 |
| ---------------------------------- | ----------------------------------------------------- |
| Valid email                        | `ef87da46-128e-49ed-90f0-bfbde069ba16@mailinator.com` |
| Valid password                     | `Test1234567@`                                        |
| Invalid email                      | `test@test.com`                                       |
| Invalid password                   | `tesr`                                                |
| Forgot-password unregistered email | `assad@asdasd.com`                                    |
| Incorrect OTP                      | `000000`                                              |
| Mailinator inbox                   | `ef87da46-128e-49ed-90f0-bfbde069ba16`                |

> ⚠️ **Toast handling:** All toast/notification messages auto-dismiss in ~3–5s. Every
> assertion on a toast must be made **immediately after** the triggering action with a
> bounded timeout — never snapshot/analyze first, and never re-wait for a toast that
> has already vanished.

---

## Suite 1: Validation & Credentials — `tests/Client/login/login-validation.spec.ts`

### LOGIN-01 — Required field validation `@smoke @regression`

| #   | Perform                                   | Expect                                                           |
| --- | ----------------------------------------- | ---------------------------------------------------------------- |
| 1   | Navigate to `BASE_URL`                    | Login page loads; Email and Password fields visible              |
| 2   | Click **Login** without entering anything | Validation errors displayed under both Email and Password fields |

### LOGIN-02 — Show/Hide password toggle `@regression`

| #   | Perform                                | Expect                                                                   |
| --- | -------------------------------------- | ------------------------------------------------------------------------ |
| 1   | Navigate to `BASE_URL`                 | Login page loads                                                         |
| 2   | Enter a password in the Password field | Password input has `type=password` (masked) by default                   |
| 3   | Click **Show password**                | Password becomes visible (`type=text`); toggle now reads "Hide password" |
| 4   | Click **Hide password**                | Password becomes hidden again (`type=password`)                          |

### LOGIN-03 — Invalid credentials `@smoke @regression`

| #   | Perform                             | Expect                                                                |
| --- | ----------------------------------- | --------------------------------------------------------------------- |
| 1   | Navigate to `BASE_URL`              | Login page loads                                                      |
| 2   | Enter invalid email `test@test.com` | —                                                                     |
| 3   | Enter invalid password `tesr`       | —                                                                     |
| 4   | Click **Login**                     | Toast appears immediately: `Invalid credentials. Kindly login again!` |

---

## Suite 2: Forgot Password — `tests/Client/login/forgot-password.spec.ts`

### LOGIN-04 — Forgot Password with empty email `@regression`

| #   | Perform                                       | Expect                                                 |
| --- | --------------------------------------------- | ------------------------------------------------------ |
| 1   | Navigate to `BASE_URL`                        | Login page loads                                       |
| 2   | Click **Forgot my password** with empty email | Toast appears immediately: `Please fill email address` |

### LOGIN-05 — Forgot Password with unregistered email `@regression`

| #   | Perform                        | Expect                                                                                                        |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| 1   | Navigate to `BASE_URL`         | Login page loads                                                                                              |
| 2   | Enter email `assad@asdasd.com` | —                                                                                                             |
| 3   | Click **Forgot my password**   | Toast appears immediately: `No registered/verified email found. Contact administrator to reset your password` |

---

## Suite 3: OTP / Two-Factor — `tests/Client/login/otp-verification.spec.ts`

### LOGIN-06 — Navigate to OTP screen `@smoke @regression`

| #   | Perform                              | Expect                                                                                                                                 |
| --- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Navigate to `BASE_URL`               | Login page loads                                                                                                                       |
| 2   | Enter valid email and valid password | —                                                                                                                                      |
| 3   | Click **Login**                      | Toast appears immediately: `Authorized` / `Code was sent to your phone / email`; URL redirects to `/code`; "Enter Code" screen visible |

### LOGIN-07 — Empty OTP validation `@regression`

| #   | Perform                                                    | Expect                         |
| --- | ---------------------------------------------------------- | ------------------------------ |
| 1   | Log in with valid credentials and reach the `/code` screen | OTP screen visible             |
| 2   | Click **Verify** without entering an OTP                   | Error message: `Missing digit` |

### LOGIN-08 — Invalid OTP validation `@regression`

| #   | Perform                                                    | Expect                                                                                                       |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | Log in with valid credentials and reach the `/code` screen | OTP screen visible                                                                                           |
| 2   | Enter OTP `000000`                                         | —                                                                                                            |
| 3   | Click **Verify**                                           | Error messages: `Something wrong with your permissions. Please contact support.` and `The code is incorrect` |

### LOGIN-09 — Resend code `@regression`

| #   | Perform                                                    | Expect                                                   |
| --- | ---------------------------------------------------------- | -------------------------------------------------------- |
| 1   | Log in with valid credentials and reach the `/code` screen | OTP screen visible                                       |
| 2   | Click **Didn't receive a code?**                           | Toast appears immediately: `Code was sent to your phone` |

---

## Suite 4: End-to-End Login — `tests/Client/login/successful-login.spec.ts`

### LOGIN-10 — Successful login with real OTP `@smoke @regression`

| #   | Perform                                                                                | Expect                                                |
| --- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | Navigate to `BASE_URL`                                                                 | Login page loads                                      |
| 2   | Enter valid email and valid password                                                   | —                                                     |
| 3   | Click **Login**                                                                        | Redirect to `/code`; "Enter Code" screen visible      |
| 4   | Retrieve the OTP from Mailinator (`getOTPFromMailinator` helper, inbox `ef87da46-...`) | Six-digit OTP obtained (delivery may take up to ~70s) |
| 5   | Enter the OTP across the 6 digit inputs                                                | —                                                     |
| 6   | Click **Verify**                                                                       | URL redirects to `/clients`; user is logged in        |

**Notes:**

- LOGIN-10 needs an extended timeout for Mailinator delivery (helper waits ~70s + up to 120s for the email).
- Persist any reusable values (e.g. the successful OTP/session if applicable) to `Testdata/Client/client.json`.

---

## CI / GitHub Actions Notes

- Prefer web-first assertions and auto-waiting; avoid fixed `waitForTimeout` except for
  Mailinator delivery in LOGIN-10.
- Increase action/navigation/test timeouts on CI via `process.env.CI` checks.
- Run OTP tests serially (`workers: 1` for that suite) since they share the same account.
- Capture trace, screenshots, and video on failure.
