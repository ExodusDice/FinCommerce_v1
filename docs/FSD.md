# Functional Specification Document (FSD) - FinCommerce v1.0

## 1. Authentication & Session Security (Phase 1 Focus)

### 1.1 User Login
* **Inputs**: Username (email or phone number) and Password.
* **Real-time Feedback**: 
  * If the input contains `@`, validate standard RFC 5322 email syntax (e.g. error on missing domain or `.com`).
  * If the input contains only digits, validate Thailand phone number formats (`06`, `08`, `09` prefix, 9-10 digits).
* **Password Visibility**: Unmask button (eye icon) toggling password visibility.
* **Remember Me**: Persistent session via a secure HTTP-Only cookie with a long expiry, persisting until explicitly signed out or cookie cleared.

### 1.2 User Registration
* **Inputs**: Full Name, Email, Mobile Phone, Password, Confirm Password.
* **Validation**:
  * **Email**: Uniqueness check, format validation.
  * **Phone**: Uniqueness check, regex validation.
  * **Password Strength**: Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.
  * **Leaked Password Check**: Live backend lookup against known password breaches (simulated locally via a lookup list / API mock).

### 1.3 Two-Step Verification (MFA)
* **Triggers**: Always-on for first login, or dynamically triggered by risk engine (IP geography change, new browser).
* **Mechanism**: 6-digit numeric OTP sent via SMS or simulated mobile push notification.
* **Cooldown**: 60-second resend limit to prevent resource exhaustion.

### 1.4 Biometric Authentication
* **Platform Support**: iOS (Face ID / Touch ID) via native Appium wrappers; Web browsers via WebAuthn API.
* **Flow**: Web login prompts "Login with Biometrics" as a secondary option once the primary login has succeeded once.

### 1.5 Smart Device Management
* **Console View**: An account security panel listing all active logged-in sessions.
* **Attributes Displayed**: Device Type (e.g., iPhone 15 Pro, Windows Desktop), Location (e.g., Bangkok, Chiang Mai), IP Address, Last Active Timestamp.
* **Revocation**: Clicking "Revoke Access" terminates the session ID on Redis, forcing immediate logout on that device.

---

## 2. Core Functional Modules

### 2.1 Cross-Platform Seller Authorization
* **Integrations**: Lazada Thailand Open API, Shopee Open Platform, TikTok Shop Partner Platform.
* **Auth Flow**: OAuth 2.0 authorization code grant. The merchant clicks "Connect Store", is redirected to the platform's authorization screen, approves permissions, and redirects back to FinCommerce with token tokens stored securely in the database.

### 2.2 Inventory & Price Sync Engine
* **Master SKU Registry**: Maps platform-specific SKUs (e.g. Lazada SKU `LZ-123`, Shopee SKU `SH-456`) to a single Master SKU `FIN-123`.
* **Sync Rules**:
  * **Automated stock deduction**: When an order is placed on Shopee, the engine deducts stock locally and pushes updates to Lazada and TikTok within 5 seconds.
  * **Returns handling**: When a return is scanned, stock is auto-restored to all channels.
  * **Central price edit**: Changing the master price updates all channels with configurable rules (e.g., markup/markdown rules per platform).

### 2.3 Fulfillment & Printing Console
* **Action**: Single-button trigger to process orders from all channels.
* **Outputs**: PDF compilation containing Air Waybills (AWB), Picklists, and Invoices grouped by platform or courier.

### 2.4 Centralized Financials & Analytics
* **Dashboard**: Displays Gross Merchandise Value (GMV), net payouts (deducting Lazada commissions, Shopee service fees, etc.).
* **Calendar Sync**: Highlights platform payday schedules and estimated payouts.
* **Reports**: Filterable by Daily, Weekly, Monthly, Annual options, with checkboxes to include or exclude Shopee, Lazada, and TikTok.

---

## 3. Risk-Based and Adaptive Security (Silent Backend Protection)
* **Adaptive Risk Engine**: Monitors geographical coordinates of login requests. A geographic jump (e.g., logging in from Bangkok, then Chiang Mai 10 minutes later) will force a lock and trigger SMS 2FA.
* **Rate Limiting**: Block IP/account access after 3 failed login attempts. Triggers a CAPTCHA.
