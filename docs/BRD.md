# Business Requirements Document (BRD) - FinCommerce v1.0

## 1. Document Overview
This document outlines the business requirements for **FinCommerce**, a Software-as-a-Service (SaaS) platform designed for e-commerce traders in Thailand. FinCommerce aggregates store management, product synchronization, pricing strategy, inventory reconciliation, and consolidated reporting across major regional platforms: **Lazada Thailand, Shopee Thailand, and TikTok Shop Thailand**.

---

## 2. Problem Statement & Pain Points
Thai e-commerce merchants suffer from excessive operational friction due to fragmented seller centers. FinCommerce directly addresses the following 11 critical pain points:

| ID | Pain Point | Business Solution |
|:---|:---|:---|
| **PP-01** | Difficult to manage multiple platforms | **Unified Dashboard**: Single interface to manage products, orders, and messages. |
| **PP-02** | Inventory updates are not synchronized | **Real-Time Sync Engine**: Auto-pushes inventory changes across platforms. |
| **PP-03** | Price edits are not synchronized | **Centralized Pricing Rules**: Edit once, push to all platforms instantly. |
| **PP-04** | Product uploads are slow & repetitive | **Batch Upload Engine**: Upload products to Lazada, Shopee, and TikTok at once. |
| **PP-05** | Double-selling / overselling | **Auto Inventory Deduction**: Deduct items across all platforms on sale. |
| **PP-06** | Returned products do not restore stock | **Return Inventory Reconciler**: Re-stock inventory across platforms when items return. |
| **PP-07** | Lacks centralized monthly reporting | **Centralized Analytics**: Unified sales, commissions, and payout reports. |
| **PP-08** | No centralized product tracking | **Central Product Registry**: Map platform listings to a Single Keeper SKU (Master SKU). |
| **PP-09** | Missing critical stock and store alerts | **Intelligent Alert System**: Low stock, payout delays, and rate-limiting alerts. |
| **PP-10** | Slow fulfillment (printing AWB, invoices, picklists) | **Bulk Print Manager**: Generate and print AWB, invoices, and picklists in one go. |
| **PP-11** | No competitive pricing calculator | **Strategic Calculator**: Model fees, commissions, and competitor price ranges. |

---

## 3. Target Audience & Market Context
* **Primary Target**: Small-to-Medium Enterprises (SMEs) and individual merchants selling on Shopee, Lazada, and TikTok in Thailand.
* **Geographical Scope**: Thailand (TH).
* **Key Context**: The target region relies heavily on mobile devices. Registration must prioritize mobile phone verification (OTP) alongside standard email sign-ups to ensure high conversion rates.

---

## 4. Scope of the System
* **In-Scope for Phase 1**:
  * Secure tenant authentication and authorization.
  * Real-time sync engine for Inventory and Price.
  * Cross-platform listing and batch upload framework.
  * Order execution panel (AWB, Picklist, Invoice printing).
  * Centralized reporting showing profit margins, commissions, and payout schedules.
  * Strategic pricing calculator.
* **Out-of-Scope**:
  * Logistics carrier integrations (handled directly via platform-assigned courier).
  * Direct warehouse management system (WMS) beyond simple SKU counting.

---

## 5. Security & Compliance
* **Data Encryption**: Data in transit (TLS 1.3) and at rest (AES-256).
* **Multi-Factor Authentication (MFA)**: SMS-based or app-based notifications for sensitive actions (e.g. bulk price adjustments or updating bank details).
* **Adaptive Authentication**: Trigger OTP verification if the user logs in from unusual locations (geographic jumps) or different IP subnets.
* **Device Management**: Users must be able to view, manage, and revoke active sessions on secondary devices.

---

## 6. Project Success Metrics (KPIs)
* **Onboarding Success**: Reduce seller setup time for 3 stores from 4 hours to under 15 minutes.
* **Overselling Reduction**: Reduce overselling incidents to < 0.1%.
* **Fulfillment Speed**: Shorten document printing and packing prep time by 70%.
