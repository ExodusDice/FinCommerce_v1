# Data Flow Diagram (DFD) - FinCommerce v1.0

This document outlines the Data Flow Diagram (DFD) for the FinCommerce multi-channel e-commerce integration SaaS.

---

## 1. DFD Level 0 (Context Diagram)

The Context Diagram defines the system boundary and interfaces with external actors:

```mermaid
graph LR
    User([E-Commerce Trader])
    FinCommerce[[FinCommerce SaaS System]]
    ExtAPI([Lazada / Shopee / TikTok APIs])
    
    %% Flows
    User -->|Login Credentials, Pricing edits, Print requests| FinCommerce
    FinCommerce -->|AWB/Invoice PDFs, Central Reports, Sync status| User
    
    FinCommerce -->|OAuth codes, Inventory updates, Price syncs| ExtAPI
    ExtAPI -->|Access tokens, Order details, Return statuses| FinCommerce
```

### DFD Level 0 Data Flow Descriptions

| Flow Name | Source | Destination | Description |
|:---|:---|:---|:---|
| **Credentials & Request** | E-Commerce Trader | FinCommerce | Merchant credentials, search parameters, print triggers, manual inventory adjustments. |
| **Merchant Output** | FinCommerce | E-Commerce Trader | Dynamic dashboards, compiled AWB/Invoice PDFs, sales reports. |
| **API Synchronizations** | FinCommerce | Channel APIs | Outbound API requests pushing master stock levels, promotional price updates, and listings. |
| **Channel Status Alerts** | Channel APIs | FinCommerce | Inbound webhook events notifying the system of new sales, cancellations, returns, and payout data. |

---

## 2. DFD Level 1 (Process Decomposition Diagram)

The Level 1 DFD decomposes the system into core sub-processes, tracking data movements into persistent database stores:

```mermaid
graph TD
    %% Entities
    Trader([E-Commerce Trader])
    Channels([Lazada/Shopee/TikTok APIs])
    
    %% Processes
    P1[1.0 User Auth & Device Check]
    P2[2.0 Channel Authorization]
    P3[3.0 Multi-Channel Inventory Sync]
    P4[4.0 Centralized Pricing Controller]
    P5[5.0 Order Fulfillment & Printer]
    P6[6.0 Financials & Payout Compiler]
    
    %% Data Stores
    D1[(D1: User Credentials & Sessions)]
    D2[(D2: Channel Access Tokens)]
    D3[(D3: Master Product Inventory)]
    D4[(D4: Orders & Ledgers)]

    %% Connections
    Trader -->|Sign In / Reg / Revoke| P1
    P1 <-->|Query / Write Session| D1
    P1 -->|Session Token| Trader
    
    Trader -->|Channel Auth Code| P2
    P2 -->|Exchange Code for Tokens| Channels
    Channels -->|Access & Refresh Tokens| P2
    P2 -->|Save Tokens| D2
    
    Channels -->|Sales & Returns webhook| P3
    P3 -->|Read tokens| D2
    P3 <-->|Deduct / Restore Stock| D3
    P3 -->|Push Synced Stock| Channels
    
    Trader -->|Adjust Pricing Rules| P4
    P4 -->|Read product ID| D3
    P4 -->|Read store tokens| D2
    P4 -->|Push updated prices| Channels
    
    Trader -->|Print AWB / Invoice| P5
    P5 -->|Fetch Order Data| D4
    P5 -->|Query Courier APIs| Channels
    P5 -->|Compile PDFs| Trader
    
    Channels -->|Payout schedules & Settlement reports| P6
    P6 -->|Query transactions| D4
    P6 -->|Compile Ledgers| Trader
```

### DFD Level 1 Process Catalog

#### Process 1.0: User Account Authentication & Security Check
* **Inputs**: Credentials (Email/Phone + Password), SMS OTP code, Biometric tokens, session revocation request.
* **Outputs**: Auth session cookie, security warnings, device console lists.
* **Target Store**: `D1: User Credentials & Sessions`

#### Process 2.0: Multi-Channel Platform Authorization (OAuth)
* **Inputs**: Temporary OAuth code from Shopee/Lazada/TikTok redirects.
* **Outputs**: Secure OAuth tokens.
* **Target Store**: `D2: Channel Access Tokens`

#### Process 3.0: Centralized Inventory Synchronization
* **Inputs**: Webhook order alerts, return approvals.
* **Outputs**: Pushed stock level updates across other platforms.
* **Target Store**: `D3: Master Product Inventory`

#### Process 4.0: Centralized Pricing Controller
* **Inputs**: Price change triggers, campaign rules, competitor calculations.
* **Outputs**: Pushed prices.
* **Target Store**: `D3: Master Product Inventory`

#### Process 5.0: Order Fulfillment & Printer
* **Inputs**: Multi-channel printing trigger.
* **Outputs**: Combined AWB, Picklist, Invoice PDF document.
* **Target Store**: `D4: Orders & Ledgers`

#### Process 6.0: Financials & Payout Compiler
* **Inputs**: Channel settlements, commissions.
* **Outputs**: Centralized monthly/weekly payout ledger charts.
* **Target Store**: `D4: Orders & Ledgers`
