# Merchant User Manual - FinCommerce v1.0

This manual guides e-commerce merchants on navigating the FinCommerce SaaS portal, publishing listings, and executing bulk catalog uploads using Excel templates.

---

## 1. Store Connections (Initial Setup)
Before publishing products, you must link your regional seller center accounts:
1. Navigate to the **Channel Connections** tab on the sidebar.
2. Click **Re-auth Store** next to Shopee Thailand, Lazada Thailand, or TikTok Shop Thailand.
3. You will be redirected to the respective platform's secure OAuth consent gateway.
4. Input your seller credentials, approve the requested scopes, and submit.
5. Upon redirection back to FinCommerce, your sync status dot will change from offline to green (Online).

---

## 2. How to Upload a Product (Single Listing)
To publish a product to your connected shops manually:
1. Navigate to the **Batch Upload Listing** tab on the sidebar.
2. Complete the **Multi-Channel Listing Publisher** form fields:
   * **Product Title**: The centralized product title.
   * **Master Price**: The core pricing in Thai Baht (THB).
   * **Warehouse Stock**: The actual physical inventory quantity.
3. Under **Target Channels**, check the boxes for Shopee TH, Lazada TH, and TikTok TH to select where the listing should be created.
4. Click **Publish to Selected Platforms**. FinCommerce will establish mapping keys and push the product across channels simultaneously in under 5 seconds.

---

## 3. How to Batch Upload Listings (Excel Template)
To publish hundreds of products at once, use our standardized Excel template.

### 3.1 Bulk Upload Steps
1. Navigate to the **Batch Upload Listing** tab on the sidebar.
2. Click the upload area under **Bulk Excel CSV Upload** to open your file manager.
3. Select your completed Excel template spreadsheet (`.xlsx` or `.csv` format) and upload.
4. The system will parse the rows, validate column schema constraints, create the Master SKUs, and push corresponding listings to Shopee, Lazada, and TikTok Shop.

### 3.2 Excel Upload Template Data Schema
To ensure successful uploads, your spreadsheet must contain the following header columns:

| Column Header | Data Type | Required | Sample Value | Description |
|:---|:---:|:---:|:---|:---|
| **master_sku** | String | Yes | `FIN-T-RED` | Unique identifier used to sync inventory centrally. |
| **product_name** | String | Yes | `Premium T-Shirt (Red)` | Product display title. |
| **cost_price** | Decimal | Yes | `150.00` | Cost of goods sold. |
| **selling_price**| Decimal | Yes | `299.00` | Suggested retail price. |
| **stock_level** | Integer | Yes | `142` | Actual physical stock count in the warehouse. |
| **shopee_sku** | String | No | `SH-T-RED` | Shopee product listing SKU maps (maps Shopee stock). |
| **lazada_sku** | String | No | `LZ-T-RED` | Lazada product listing SKU maps (maps Lazada stock). |
| **tiktok_sku** | String | No | `TT-T-RED` | TikTok product listing SKU maps (maps TikTok stock). |
