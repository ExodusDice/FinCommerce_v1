# Requirements Traceability Matrix (RTM) - FinCommerce

This matrix maps Business Requirements (BRD) to Functional Specification Document (FSD) sections and QA Test Cases (TC) to ensure full traceability and test coverage.

| Business Req ID | Business Requirement Description | FSD Section ID | Functional Spec Summary | Test Case ID | Test Case Summary | Status |
|:---|:---|:---|:---|:---|:---|:---:|
| **BR-01** | Secure email/phone user login | FSD 1.1 | Input validation, error states, and unmasking password | **TC-LOG-01** | Login validation & password visibility | Pending |
| **BR-02** | Secure account registration | FSD 1.2 | Email & phone signup verification, password strength | **TC-REG-01** | Standard user registration validation | Pending |
| **BR-03** | Leaked password check on signup | FSD 1.2 | Cross-reference password input with breach records | **TC-REG-02** | Registration with leaked password error | Pending |
| **BR-04** | Two-Step Verification (MFA) | FSD 1.3 | SMS OTP verification and cooldown check | **TC-MFA-01** | SMS OTP verification path | Pending |
| **BR-05** | Biometric Authentication | FSD 1.4 | WebAuthn and Keychain fingerprint/FaceID mocks | **TC-BIO-01** | Biometric login verification | Pending |
| **BR-06** | Smart Device Session Management | FSD 1.5 | Active session table with remote revoke controls | **TC-DEV-01** | Device console review and revoke session | Pending |
| **BR-07** | Platform API Integrations | FSD 2.1 | Shopee, Lazada, TikTok Shop Oauth & token storage | **TC-INT-01** | OAuth token store check | Pending |
| **BR-08** | Real-time Inventory Sync Engine | FSD 2.2 | Stock updates and multi-platform distribution | **TC-INV-01** | Automatic stock sync on order | Pending |
| **BR-09** | Central Price Edit Engine | FSD 2.2 | Single-input price updates per platform rules | **TC-PRC-01** | Centralized pricing changes | Pending |
| **BR-10** | Bulk Document printing | FSD 2.3 | Instant AWB, Invoice, and Picklist PDF compilations | **TC-PRN-01** | AWB / invoice PDF compilation test | Pending |
| **BR-11** | Centralized Financial Analytics | FSD 2.4 | Gross revenue, commission deductions, and net reports | **TC-REP-01** | Monthly financial calculations | Pending |
| **BR-12** | Strategic Pricing Calculator | FSD 2.4 | Feasibility math for products based on competitor stats | **TC-CAL-01** | Competitor price markup calculation | Pending |
| **BR-13** | Multi-Device Form Factor Support | FSD 1.1, 1.2 | CSS responsive design targeting Mobile and Desktop OS | **TC-MOB-01** | Mobile responsiveness rendering check | Pending |
