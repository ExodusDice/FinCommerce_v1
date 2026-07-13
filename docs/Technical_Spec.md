# Technical Specification Design - FinCommerce

This document provides the system architecture, database structure, data flow mappings, and technical integration specifications for FinCommerce.

---

## 1. System Architecture Diagram

```mermaid
graph TD
    %% Clients
    DesktopUI["Desktop Web Browser (Chrome/Safari/Edge)"]
    MobileUI["Mobile App View (iOS / Android Hybrid Webview)"]
    
    %% API Gateway / App Server
    subgraph AppServer [Application Host Environment]
        FastAPI["FastAPI API Server (Python 3.11+)"]
        Worker["Celery Background Sync Worker"]
    end
    
    %% Database and Cache
    Postgres[(PostgreSQL Main Database)]
    Redis[(Redis Cache & Queue)]
    
    %% External API Services
    subgraph ExternalPlatforms [E-Commerce Channel APIs]
        LazadaAPI["Lazada Open API (Thailand)"]
        ShopeeAPI["Shopee Partner API (Thailand)"]
        TikTokAPI["TikTok Shop Open API (Thailand)"]
    end

    %% Flows
    DesktopUI -->|HTTPS / WSS| FastAPI
    MobileUI -->|HTTPS / WSS| FastAPI
    FastAPI -->|Write/Read Sessions & Queue| Redis
    FastAPI -->|Query/Update Records| Postgres
    Worker -->|Fetch Jobs| Redis
    Worker -->|Sync Inventory & Prices| ExternalPlatforms
    Worker -->|Update Sync Status| Postgres
```

---

## 2. Use Case Diagram

```mermaid
left_to_right_direction
actor Trader as "Merchant / Trader"

rectangle FinCommerce {
    usecase UC_Login as "Authenticate (Email/Phone + OTP/Biometric)"
    usecase UC_Register as "Register Account (with Breach Check)"
    usecase UC_Device as "Manage Connected Devices"
    usecase UC_Auth as "Connect Platforms (Lazada/Shopee/TikTok)"
    usecase UC_Sync as "Sync Inventory and Price"
    usecase UC_Print as "Print AWB/Invoice (Bulk)"
    usecase UC_Calc as "Calculate Competition Pricing"
}

Trader --> UC_Register
Trader --> UC_Login
Trader --> UC_Device
Trader --> UC_Auth
Trader --> UC_Sync
Trader --> UC_Print
Trader --> UC_Calc
```

---

## 3. Data Flow Diagram (DFD Level 1)

```mermaid
graph LR
    User([E-Commerce Trader])
    
    %% Processes
    P1[1.0 User Auth & Device Check]
    P2[2.0 Channel Authorization]
    P3[3.0 Multi-Channel Inventory Sync]
    P4[4.0 Centralized Report Compiler]
    
    %% Data Stores
    D1[(Users & Sessions DB)]
    D2[(Channel Tokens DB)]
    D3[(Master SKU Store)]
    
    %% External Entities
    ExtAPI([Lazada/Shopee/TikTok Open APIs])
    
    %% Interactions
    User -->|Login Credentials| P1
    P1 -->|Query User| D1
    P1 -->|Session Token| User
    
    User -->|Platform OAuth Code| P2
    P2 -->|Save Access Tokens| D2
    P2 -->|Exchange Code| ExtAPI
    
    ExtAPI -->|Incoming Order Alert| P3
    P3 -->|Read tokens| D2
    P3 -->|Update stock levels| D3
    P3 -->|Push inventory sync| ExtAPI
    
    User -->|Request report| P4
    P4 -->|Read transactions| D3
    P4 -->|Read platform fees| D2
    P4 -->|Render charts| User
```

---

## 4. Database Schema Design (SQL DDL Representation)

### `users`
* `id` (UUID, Primary Key)
* `full_name` (VARCHAR)
* `email` (VARCHAR, Unique)
* `phone` (VARCHAR, Unique)
* `password_hash` (VARCHAR)
* `created_at` (TIMESTAMP)

### `sessions`
* `id` (UUID, Primary Key)
* `user_id` (UUID, Foreign Key references `users.id`)
* `device_name` (VARCHAR)  -- e.g. "iPhone 15 Pro (Safari)"
* `ip_address` (VARCHAR)
* `location` (VARCHAR)     -- e.g. "Bangkok, Thailand"
* `last_active` (TIMESTAMP)
* `is_revoked` (BOOLEAN)

### `channel_accounts`
* `id` (UUID, Primary Key)
* `user_id` (UUID, Foreign Key references `users.id`)
* `platform` (VARCHAR)     -- "LAZADA", "SHOPEE", "TIKTOK"
* `shop_id` (VARCHAR)
* `shop_name` (VARCHAR)
* `access_token` (TEXT)
* `refresh_token` (TEXT)
* `expires_at` (TIMESTAMP)

### `master_products`
* `id` (UUID, Primary Key)
* `user_id` (UUID, Foreign Key references `users.id`)
* `master_sku` (VARCHAR, Unique)
* `product_name` (VARCHAR)
* `cost_price` (DECIMAL)
* `avg_selling_price` (DECIMAL)
* `stock_level` (INTEGER)

### `platform_sku_mapping`
* `id` (UUID, Primary Key)
* `master_product_id` (UUID, Foreign Key references `master_products.id`)
* `channel_account_id` (UUID, Foreign Key references `channel_accounts.id`)
* `platform_sku` (VARCHAR)
* `platform_price` (DECIMAL)
* `last_sync_at` (TIMESTAMP)

---

## 5. Flowchart: Security Login & Adaptive Verification

```mermaid
flowchart TD
    Start([User opens Login Screen]) --> Input[Enter Username & Password]
    Input --> Validate{Is Username & Password correct?}
    Validate -- No --> LockCheck{Failed attempts >= 3?}
    LockCheck -- Yes --> Lock[Freeze Account & trigger CAPTCHA]
    LockCheck -- No --> Input
    
    Validate -- Yes --> DeviceCheck{Is device/IP recognized?}
    DeviceCheck -- Yes --> LoggedIn([Access Granted, Establish Session])
    
    DeviceCheck -- No --> SendOTP[Send SMS OTP / Phone Notification]
    SendOTP --> VerifyOTP{Is 6-Digit OTP Correct?}
    VerifyOTP -- Yes --> LoggedIn
    VerifyOTP -- No --> VerifyOTP
```
