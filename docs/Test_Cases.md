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

---

## Feature: Subscription Billing & Payment Gateway

### Scenario Outline: Plan Upgrades via Payment Gateway Checkout
    Given the user is logged in and navigates to the "Billing & Plans" panel
    When the user clicks "Upgrade to <plan_name>"
    Then the checkout modal opens showing the amount "<price>"
    When the user selects "<payment_method>" tab
    And fills out "<payment_method>" form credentials
    And submits payment
    Then the account tier badge updates to "<plan_name> Tier"
    And the purchased plan button is updated to "Current Plan"

    Examples:
      | plan_name | price     | payment_method     |
      | Basic     | ฿490.00   | Credit Card        |
      | Advance   | ฿990.00   | Thai PromptPay QR  |
      | Basic     | ฿490.00   | Mobile Banking     |
      | Advance   | ฿990.00   | E-Wallet           |

### Scenario: PromptPay QR Timer Expiry
    Given the user opens the checkout gateway with Thai PromptPay QR selected
    Then a realistic mock PromptPay QR renders on the screen
    And an active countdown timer displays "Code expires in: 60s"
    When 60 seconds elapse without payment confirmation
    Then the timer label displays "Code expired"
    And the transaction status changes to "Transaction timed out"

---

## Feature: In-App AI Support Chatbot

### Scenario Outline: Chatbot Conversational Response Routing
    Given the user clicks the floating chat bubble at the bottom-right corner
    Then the chat window overlay expands
    When the user types "<user_question>" in the input box
    And clicks the send button
    Then the chatbot returns a response containing "<expected_keyword>" instructions
    And the message thread scrolls automatically to the bottom

    Examples:
      | user_question          | expected_keyword     |
      | how to batch upload    | Bulk Excel Upload    |
      | how to publish manual  | Manual Product       |
      | how to connect shopee  | Channel Connections  |
      | how to delete sku      | Retracting Products  |
      | pricing plans          | Pricing Plans        |

---

## Feature: Layout Restructuring

### Scenario: Individual and Bulk Upload Separation Validation
    Given the user is on the dashboard
    When the user clicks the "Stock & SKU Mappings" sidebar tab
    Then the "Multi-Channel Publisher" individual form card is visible beside the inventory table
    When the user clicks the "Batch Upload Listing" sidebar tab
    Then the "Bulk Excel CSV Upload" drop zone card is visible
    And the "Multi-Channel Publisher" individual form card is NOT rendered on this page

---

## Feature: Merchant Profile Page & Credentials Security

### Scenario: Saving Personal Profile Details
    Given the user navigates to the "Merchant Profile" panel
    When the user modifies the full name to "Suchart Suksamran"
    And clicks "Save Profile Details"
    Then the system updates the profile records
    And displays a success banner confirming the save

### Scenario: Password Leak Auditing inside Profile Update
    Given the user is on the "Merchant Profile" panel
    When the user inputs "12345678" in the new password field
    Then the live security auditor flags "CRITICAL: Password found in public breaches!"
    And disables the change credentials action until a unique password is provided

