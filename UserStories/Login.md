# Login Module

## Overview

This document describes the login flow, OTP retrieval process using Mailinator, required environment variables, helper method, and all login-related test scenarios.

---

# Prerequisites

Before running the login tests, configure the following environment variables in your `.env` file.

```env
BASE_URL=https://your-environment-url

USER_EMAIL=registered-user@email.com
USER_PASSWORD=your-password

MAILINATOR_ADDRESS=mailinator-inbox-id
```

### Environment Variables

| Variable             | Description                               |
| -------------------- | ----------------------------------------- |
| `BASE_URL`           | Application URL                           |
| `USER_EMAIL`         | Registered user email                     |
| `USER_PASSWORD`      | Registered user password                  |
| `MAILINATOR_ADDRESS` | Mailinator inbox ID used for fetching OTP |

---

# OTP Retrieval using Mailinator

The application sends a One-Time Password (OTP) to the registered email address after successful authentication.

The automated tests use **Mailinator** to retrieve this OTP.

## OTP Retrieval Flow

1. Login using the registered email and password.
2. Once the OTP has been sent, open **Mailinator** in a new browser tab.
3. Enter the Mailinator inbox ID configured in the `.env` file.
4. Open the latest email with the subject **Centraleyes Platform**.
5. Read the six-digit OTP.
6. Return the OTP to the login test.
7. Enter the OTP on the verification screen.

---

# Mailinator Helper

Add the following helper method to your helper/utilities file.

```javascript
static async getOTPFromMailinator(context, mailinatorEmail) {
  const inboxPage = await context.newPage();

  try {
    console.log(`Navigating to Mailinator for inbox: ${mailinatorEmail}...`);
    await inboxPage.goto("https://www.mailinator.com/");
    await inboxPage.waitForLoadState("domcontentloaded");

    const inboxInput = inboxPage.getByRole("textbox", {
      name: "Enter public inbox",
    });

    await inboxInput.click();
    await inboxInput.fill(mailinatorEmail);

    await inboxPage.getByRole("button", { name: "GO" }).click();

    console.log("Clicked GO, waiting for inbox to update...");
    await inboxPage.waitForTimeout(70000);

    const messageCell = inboxPage.getByRole("cell", {
      name: "Centraleyes Platform",
      exact: true,
    });

    await messageCell.first().waitFor({
      state: "visible",
      timeout: 120000,
    });

    await messageCell.first().click();

    let otp = "";

    try {
      const htmlFrame = inboxPage.frame({
        name: "html_msg_body",
      });

      if (htmlFrame) {
        otp =
          (await htmlFrame
            .locator("text=/\\d{6}/")
            .first()
            .textContent({ timeout: 3000 }))?.trim() ?? "";
      }
    } catch (e) {
      console.log("Iframe unavailable. Falling back to plain text.");
    }

    if (!otp) {
      otp =
        (await inboxPage
          .locator("text=/\\d{6}/")
          .first()
          .textContent({ timeout: 10000 }))?.trim() ?? "";
    }

    if (!otp) {
      throw new Error("OTP not found in Mailinator email");
    }

    console.log("OTP Extracted:", otp);

    return otp;
  } finally {
    await inboxPage.close();
  }
}
```

---

# Login Test Scenarios

## LOGIN-01

### Summary

Verify the required field validation.

### Steps

1. Navigate to the application.
2. Verify Email and Password fields are visible.
3. Click **Login**.

### Expected Result

Validation errors should be displayed under both Email and Password fields.

---

## LOGIN-02

### Summary

Verify the user can show and hide the password.

### Steps

1. Navigate to the application.
2. Enter a password.
3. Click the Show Password icon.
4. Click the Hide Password icon.

### Expected Result

- Password is hidden by default.
- Password becomes visible when clicking Show.
- Password becomes hidden again when clicking Hide.

---

## LOGIN-03

### Summary

Verify invalid login credentials display an error.

### Steps

1. Navigate to the application.
2. Enter an invalid email.
3. Enter an invalid password.
4. Click Login.

### Expected Result

Toast message:

```
Invalid credentials. Kindly login again!
```

---

## LOGIN-04

### Summary

Verify Forgot Password with an empty email.

### Steps

1. Navigate to the application.
2. Click **Forgot My Password**.

### Expected Result

Toast message:

```
Please fill email address
```

---

## LOGIN-05

### Summary

Verify Forgot Password with an invalid email.

### Steps

1. Navigate to the application.
2. Enter:

```
assad@asdasd.com
```

3. Click **Forgot My Password**.

### Expected Result

Toast message:

```
No registered/verified email found. Contact administrator to reset your password
```

---

## LOGIN-06

### Summary

Verify successful navigation to the OTP screen.

### Steps

1. Navigate to the application.
2. Enter a valid email.
3. Enter a valid password.
4. Click Login.

### Expected Result

Toast message:

```
Authorized
Code was sent to your phone / email
```

User is redirected to:

```
/code
```

---

## LOGIN-07

### Summary

Verify empty OTP validation.

### Steps

1. Login using valid credentials.
2. Navigate to the OTP screen.
3. Click **Verify** without entering the OTP.

### Expected Result

Error message:

```
Missing digit
```

---

## LOGIN-08

### Summary

Verify invalid OTP validation.

### Steps

1. Login using valid credentials.
2. Enter:

```
000000
```

3. Click Verify.

### Expected Result

Error messages:

```
Something wrong with your permissions. Please contact support.
```

and

```
The code is incorrect
```

---

## LOGIN-09

### Summary

Verify Resend Code functionality.

### Steps

1. Login using valid credentials.
2. Navigate to the OTP screen.
3. Click **Didn't receive a code?**

### Expected Result

Toast message:

```
Code was sent to your phone
```

---

## LOGIN-10

### Summary

Verify successful login.

### Steps

1. Navigate to the application.
2. Enter valid credentials.
3. Click Login.
4. Retrieve the OTP from Mailinator using the helper method.
5. Enter the OTP.
6. Click Verify.

### Expected Result

User is redirected to:

```
/clients
```

---

# Notes

- Ignore the rest of the functionalities which are not mentioned in the test cases
