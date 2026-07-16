# Subscription Tier Test Plan - FinCommerce v1.0

This test plan defines the validation criteria, threshold limit checks, and feature locks for each subscription plan tier: **Free**, **Basic (฿490/month)**, and **Advance (฿990/month)**.

---

## 1. Free Tier Testing (Catalog Limit: 10 SKUs, 1 Connected Shop)

### 1.1 Functional Validation Cases

| Test Case ID | Test Category | Action / Steps | Expected Result | Status |
|:---|:---|:---|:---|:---:|
| **TC-FREE-01** | Shop Count Limit | Attempt to link a second store (e.g., Lazada) under Free Tier. | System blocks authorization and displays "Upgrade to Basic/Advance to link more stores." | Pending |
| **TC-FREE-02** | Master SKU Threshold | Attempt to insert an 11th Master SKU catalog item. | System blocks catalog creation with warning: "10 SKU limit reached. Upgrade to add more." | Pending |
| **TC-FREE-03** | Auto-Sync Check | Force webhook stock changes on connected Shopee shop. | Multi-channel sync does not execute. Central inventory is updated but other channels remain manual. | Pending |

---

## 2. Basic Tier Testing (Catalog Limit: 500 SKUs, 3 Connected Shops)

### 2.1 Functional Validation Cases

| Test Case ID | Test Category | Action / Steps | Expected Result | Status |
|:---|:---|:---|:---|:---:|
| **TC-BASIC-01** | Shop Count Threshold | Link Shopee, Lazada, and TikTok stores. Then attempt to link a 4th store. | System blocks 4th shop and shows: "Basic Tier limit reached. Upgrade to Advance for unlimited stores." | Pending |
| **TC-BASIC-02** | Master SKU Limit | Upload an Excel file containing 501 SKU rows on a clean Basic Tier account. | System parses first 500 items successfully and rejects the 501st row with a limit notice. | Pending |
| **TC-BASIC-03** | Semi-Auto Sync Check | Adjust inventory stock on dashboard. | Stock updates are dispatched to connected Shopee, Lazada, and TikTok shops (Semi-auto sync triggers successfully). | Pending |

---

## 3. Advance Tier Testing (Unlimited SKUs, Unlimited Connected Shops)

### 3.1 Functional Validation Cases

| Test Case ID | Test Category | Action / Steps | Expected Result | Status |
|:---|:---|:---|:---|:---:|
| **TC-ADV-01** | Unlimited Scale Check | Link 5 different shop frontends and create 2,000 Master SKUs. | Catalog rendering, API indexing, and store link nodes show "Active" status without warnings. | Pending |
| **TC-ADV-02** | Autopilot Sync Check | Trigger stock deductions via Shopee webhook. | Redis queues up commands and instantly pushes updates to Lazada and TikTok Shop in real-time (< 2s). | Pending |
| **TC-ADV-03** | Strategic Pricing Check| Slide pricing cost variables inside target pricing simulator. | Real-time margin percentages and suggested retail prices recalculate on keystroke without lag. | Pending |
