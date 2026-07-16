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
2. Under **Bulk Excel CSV Upload**, configure the **Sync Excel Rows To** platform checkboxes (Shopee TH, Lazada TH, TikTok TH). This determines which connected stores the batch products will be created on.
3. Click the upload area or drag-and-drop your completed Excel template spreadsheet (`.xlsx`, `.xls`, or `.csv` format) in the dashed file block.
4. The system will parse the rows, validate column schema constraints, create the Master SKUs, and push corresponding listings to selected channels.

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

---

## 4. Managing Central Catalog (Create, Edit, Delete)
For fine-grained inventory control, navigate to the **Stock & SKU Mappings** tab on the sidebar.

### 4.1 Create (Add Master SKU)
1. Click the **➕ Add Product** button above the inventory table.
2. Fill in the Master SKU, Name, Stock, and base price.
3. Check target platforms under **Sync Platforms** (Shopee, Lazada, TikTok).
4. Click **Create Product**. The system adds the master record and registers linked listing endpoints.

### 4.2 Edit (Update Master SKU)
1. Click the **✏️ Edit** button in the actions column of the target product row.
2. Modify name, central stock quantity, or base retail price.
3. Select which platforms should receive the updates by checking/unchecking the **Push updates to** options.
4. Click **Save Product** to execute platform sync tasks.

### 4.3 Delete (Retract Master SKU)
1. Click the **🗑️ Del** button in the actions column of the target product row.
2. A deletion confirmation dialog will display.
3. Check the platforms from which you wish to retract listings under **Also Delete Listing Listings On Platform Shops**.
4. Click **Confirm Delete SKU**. The system removes the central catalog item and issues listing retraction calls to the selected platforms.

---

## 5. Managing Merchant Profile & Postpaid Billing
Navigate to the **Merchant Profile** tab on the sidebar to adjust security parameters, postpaid subscription plans, and workspace limits.

### 5.1 Editing Profile Identity
1. Under **Personal Information**, you can modify:
   * **First Name** and **Last Name** (managed in split inputs for accounting and compliance).
   * **Email Address** (primary login credential).
   * **Mobile Phone** (destination for OTP challenge notifications).
   * **Company Name** (business name for invoice receipts).
2. Click **Save Profile Details** to update configuration stores.

### 5.2 Subscription Configuration (Postpay Model)
FinCommerce subscriptions operate under a **Postpay** billing model. Merchants are invoiced at the end of each monthly cycle based on the active plan tier and linked shop nodes count.
* **Tiers & Payment Method Selection**: You can change your active tier dropdown (Free, Basic, Advance) or select a Payment Method (Credit Card, PromptPay QR Autopay, E-Wallet) and click **Save Billing Info**.

### 5.3 Cancelling Subscription
To stop future postpaid billing cycles:
1. Under **Subscription & Billing**, click the **Cancel Subscription** button.
2. Confirm the action in the validation alert box.
3. The system immediately downgrades your account to the **Free Tier**, resets the payment method to **None**, and restricts your catalog to 1 linked store and 10 SKUs. Outstanding usage charges for the current cycle will be invoiced at the end of the month.

### 5.4 Deleting Merchant Account (Conditional Block)
To permanently remove your tenant workspace and delete your account:
1. Ensure your subscription has been **cancelled** (the account must be on the **Free Tier**).
2. Click **Delete Merchant Account** under **Account Deletion**.
3. **If you have a paid subscription (Basic/Advance)**: The system blocks deletion with a warning. You must cancel the active plan first.
4. **If on the Free Tier**: The system prompts for security password verification. Once confirmed, your workspace is deleted, cookies cleared, and you are redirected to the login page.


