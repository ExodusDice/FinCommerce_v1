# Use Case Diagram (UC_Diagram) - FinCommerce v1.0

This document defines the system boundaries, actors, use cases, and relationship maps for FinCommerce.

---

## 1. Actor Directory

| Actor Name | Type | Description |
|:---|:---|:---|
| **E-Commerce Trader** | Primary Human | The seller/merchant who logs in to centralize and sync Shopee, Lazada, and TikTok shop operations. |
| **Security Risk Auditor** | System Process | Monitors geolocations, IP subnets, and brute-force failed sign-in attempts. |
| **Social IDP Providers** | External System | Third-party OAuth identity managers (Google Accounts, Facebook, TikTok). |
| **Platform Open APIs** | External System | E-commerce channel APIs pushing webhooks and receiving inventory updates. |

---

## 2. Use Case Diagram

```mermaid
left_to_right_direction

actor Trader as "E-Commerce Trader"
actor Auditor as "Security Risk Auditor"
actor IDP as "Social IDP Providers"
actor Channels as "Platform Open APIs"

rectangle FinCommerce_Boundary {
    usecase UC1 as "UC-1: Register New Account"
    usecase UC2 as "UC-2: Authenticate (MFA / Biometric)"
    usecase UC3 as "UC-3: Remote Revoke Session"
    usecase UC4 as "UC-4: Authorize Platform OAuth"
    usecase UC5 as "UC-5: Central Stock Adjustment"
    usecase UC6 as "UC-6: Bulk Document Printing"
}

%% Primary Actor relations
Trader --> UC1
Trader --> UC2
Trader --> UC3
Trader --> UC4
Trader --> UC5
Trader --> UC6

%% Secondary Actor relations
UC1 <--> IDP : "pre-fill profile"
UC2 <--> IDP : "verify identity"
UC2 <-- Auditor : "evaluates geolocations"
UC4 <--> Channels : "store access tokens"
UC5 <--> Channels : "sync inventory / pricing"
UC6 <--> Channels : "fetch shipping labels"
```

---

## 3. Core Use Case Specifications

### UC-1: Register New Account
* **Primary Actor**: E-Commerce Trader
* **Pre-conditions**: Trader is on the Registration page and has a valid Thai mobile number.
* **Basic Flow**:
  1. Trader enters Full Name, Email, Phone, and Password.
  2. System checks inputs against syntax rules.
  3. System audits password against breach database.
  4. System saves record, creates User, and redirects to Sign In.
* **Post-conditions**: User account is successfully activated in `USERS` store.

### UC-2: Authenticate via Credentials or Social OAuth
* **Primary Actor**: E-Commerce Trader
* **Secondary Actor**: Social IDP Providers / Security Risk Auditor
* **Pre-conditions**: User has registered.
* **Basic Flow**:
  1. Trader enters username/password, or clicks Google/Facebook/TikTok login.
  2. If Social OAuth clicked:
     - Center popup OAuth screen opens.
     - Trader clicks profile, posting token data to FinCommerce.
  3. System compares credentials or social token.
  4. Auditor evaluates device IP and location records:
     - If safe: establishes Session, bypasses MFA.
     - If unrecognized/jump detected: triggers SMS OTP challenge.
* **Post-conditions**: Active session is saved in `SESSIONS` database; User is granted access to the console.

### UC-3: Remote Revoke Session
* **Primary Actor**: E-Commerce Trader
* **Pre-conditions**: Trader is logged in and viewing the active sessions console.
* **Basic Flow**:
  1. System queries and renders all active sessions from `SESSIONS` database.
  2. Trader reviews active sessions, locating a remote device.
  3. Trader clicks "Revoke Access" next to the session.
  4. System prompts confirmation dialog.
  5. System sets `is_revoked = TRUE` in database, invalidates cache, and dispatches websocket sign-out alert.
* **Post-conditions**: Target device is instantly signed out and redirected to login screen.
