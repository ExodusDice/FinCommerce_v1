# Changelog

All notable changes to the **FinCommerce** project will be documented in this file.

---

## [1.2.0] - 2026-07-16

### Added
- **Interactive Inventory CRUD**: Implemented fully interactive Create, Edit, and Delete actions inside the **Stock & SKU Mappings** catalog table.
- **Dynamic Catalog Rendering**: Migrated the inventory view to dynamically populate from a script state array, handling real-time additions and removals.
- **Dynamic Search Filtering**: Connected the catalog search input to filter items by SKU or product name dynamically.
- **Platform Sync Checkboxes**: Integrated Shopee, Lazada, and TikTok target sync checkboxes into the single Create/Edit/Delete modals and the Bulk Excel Upload panel.
- **Excel Drop Upload Handling**: Added excel drop zone handlers that simulate parsing row columns (`master_sku`, `stock_level`, etc.) and redirect merchants back to the inventory list.
- **WPS Office User Manual Update**: Extended `User_Manual.md` and `User_Manual.docx` to document single CRUD actions, batch templates, and column type maps.
- **Dashboard In-App User Guide**: Integrated the Batch Upload User Guide card with column structure descriptions and a dynamic template download button directly into the Batch Upload Listing dashboard panel.
- **Merchant Profile & Postpaid Billing Settings**: Implemented split first/last name inputs, postpaid plan selection, active payment method selectors, subscription cancellation hooks, and conditional deletion rules (blocks account deletion unless active plan is Free).
- **Payment/Payout Tracking Ledger**: Added a dedicated Payment Tracking sidebar tab listing expected payouts, platform fees deductions, and net settlements with live platform exclusions and status filtering.
- **Order Management Dashboard Tab**: Added a tab to accept orders, cancel transactions with mandatory platform-specific follow-up reasons, and spooled thermal printing logs for AWBs, invoices, and picklists, all simulated via dynamic platform API mock parameters.

---

## [1.1.0] - 2026-07-13

### Added
- **Easy-Going Light Mode Theme**: Redesigned all frontend UI panels (Login, Register, Recoveries, OAuth consents, and Dashboard) using a clean slate-50/white styling system to reduce eye strain.
- **23-Inch Monitor Optimizations**: Adjusted padding, container gaps, and locked the layout container height to a fixed `calc(100vh - 110px)` (max-height `780px`) to prevent scrollbar rendering.
- **Technical Deliverables Suite**: Created stand-alone specifications for Context/Process DFDs, ERD models, Use Case limits, Sequential OAuth signals, and REST API Swagger Specs.
- **QA Integration Plans**: Formulated the BDD Feature files, Performance/Security load testing cases (200 concurrent users), and OS/Browser compatibility checks.
- **WPS Office Compilers**: Setup automated python compilation scripts (`generate_word_docs.py`, `generate_excel_docs.py`) converting markdown to WPS Office `.docx` and `.xlsx` files.

### Changed
- Moved inline diagrams and spec sections out of BRD/FSD into individual Word documents to maintain distinct professional WPS Office files.

---

## [1.0.0] - 2026-07-10

### Added
- Initial project structure scaffolding (Dockerfile, docker-compose, requirements).
- Core BRD, FSD, Project Timeline, and Requirements Traceability Matrix (RTM) outlines.
- High-fidelity authentication portals (`index.html`, `register.html`, `oauth_mock.html`).
- Simulated 2-Step verification OTP challenges and self-service SMS/email recovery modals.
