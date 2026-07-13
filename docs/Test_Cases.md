# BDD Test Cases - FinCommerce

This document provides Cucumber-style BDD features designed to run with `behave` on Python 3.11+. Tests target both desktop web browsers via Selenium WebDriver and mobile applications via Appium.

---

## Feature: User Authentication & Security

### Scenario Outline: Username and Phone Input Validation
    Given the user is on the FinCommerce login page
    When the user enters "<input_value>" in the identity field
    Then the validation engine displays "<expected_status>" error status
    And the submit button is "<button_state>"

    Examples:
      | input_value     | expected_status                 | button_state |
      | test@gmail.com  | Valid Email Format              | enabled      |
      | test@invalid    | Invalid email domain extension  | disabled     |
      | 0812345678      | Valid Thailand Mobile Format    | enabled      |
      | 12345           | Invalid input format            | disabled     |

### Scenario: Password Masking Toggle
    Given the user is on the FinCommerce login page
    And the password field type is "password" (masked)
    When the user clicks the password visibility eye icon
    Then the password field type changes to "text" (unmasked)
    When the user clicks the eye icon again
    Then the password field type reverts to "password"

### Scenario: Leaked Password Auditing during Registration
    Given the user is on the FinCommerce registration page
    When the user inputs "password123" in the password field
    Then the security auditor alerts that "This password has been flagged in previous public breaches"
    And the system disables registration submit button until a secure password is provided

### Scenario: Adaptive Authentication triggers SMS OTP
    Given a user is logging in from an "unrecognized" device IP
    When the user enters valid credentials
    Then the system redirects to the 2-Step Verification screen
    And sends a 6-digit OTP code to the registered mobile number
    When the user enters the correct 6-digit OTP code
    Then the login succeeds and redirects to the dashboard

### Scenario: Revoking Device Sessions
    Given the user is logged into the FinCommerce dashboard
    And navigates to the "Smart Device Console"
    When the user clicks "Revoke Access" next to "Active Session - Safari on macOS"
    Then the session status updates to "Revoked"
    And a background websocket forces immediate logout on that Safari device

---

## Feature: Mobile UI Responsive Layout Verification

### Scenario: Mobile Viewport Rendering Check (Appium/Mobile Safari)
    Given the tester launches the mobile emulator for "iPhone 15 Pro"
    When the tester navigates to the FinCommerce login screen
    Then all elements fit within a 393px width viewport
    And the input cards collapse to single-column stacking
    And the biometric finger-print authentication option is visible on the primary screen
