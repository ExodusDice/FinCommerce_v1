# Project Timeline & Resource Management - FinCommerce

## 1. Project Phase Timeline
The project spans **12 weeks** structured across 4 key phases:

| Phase | Focus Area | Start Week | End Week | Key Deliverables |
|:---|:---|:---|:---|:---|
| **Phase 1** | Documents, Specs & UI/UX | Week 1 | Week 3 | BRD, FSD, RTM, Tech Specs, Figma mocks, High-Fidelity Responsive HTML/CSS Web prototypes, Mobile Layout Wireframes. |
| **Phase 2** | Backend & Database Design | Week 4 | Week 6 | FastAPI project structure, PostgreSQL schema, Redis Cache Setup, Dockerization, Mock platform APIs (Lazada/Shopee/TikTok). |
| **Phase 3** | Integration & Sync Logic | Week 7 | Week 9 | Master SKU linking engine, inventory auto-deduction flow, centralized commission calculator, bulk printing manager. |
| **Phase 4** | Automated QA & CI/CD | Week 10 | Week 12 | Behave BDD tests run via Selenium & Appium locally and via GitHub Actions workflows. |

---

## 2. Resource Management & Roles

### 2.1 Project Staffing (FTEs)
1. **Product Manager / Tech Lead (1 FTE)**: Manages specs, timeline, API designs, and GitHub workflows.
2. **Senior Python Backend Developer (1 FTE)**: Implements FastAPI logic, background tasks (Celery/Redis), database schemas, and platform Oauth/integrations.
3. **Frontend Developer (1 FTE)**: Builds responsive layouts for desktop (HTML/CSS) and wraps layouts for mobile (hybrid Android/iOS viewport optimizations).
4. **QA Automation Engineer (1 FTE)**: Writes behavior-driven Cucumber/behave test scripts, configures Appium for mobile tests and Selenium WebDriver for desktop browsers.

### 2.2 Responsibility Assignment Matrix (RACI)

| Deliverable | Product Manager | Backend Dev | Frontend Dev | QA Engineer |
|:---|:---:|:---:|:---:|:---:|
| **BRD & FSD** | **A** | C | C | I |
| **UX/UI Prototypes** | C | I | **A** | I |
| **Database Schema** | C | **A** | I | C |
| **API Endpoints** | **A** | **A** | C | C |
| **Sync Engine** | I | **A** | I | C |
| **Behave QA Automation** | I | I | I | **A** |
| **CI/CD Integration** | **A** | C | I | C |

* **R**: Responsible, **A**: Accountable, **C**: Consulted, **I**: Informed.

---

## 3. Today's Milestone Accomplishments (Today's Progress)

Today, we successfully completed the **Foundation and High-Fidelity Interface Prototype (Phase 1)**:

* **Extended Deliverables Suite**:
  1. *Business Spec*: Business Requirements Document (BRD) and Functional Specification Document (FSD).
  2. *Technical Diagrams*: Context & Process Data Flow Diagrams (DFD), Database Entity Relationship Diagram (ERD), Use Case (UC) boundaries, Sequence Diagrams, and REST API Specs (OpenAPI/Swagger).
  3. *Testing Protocols*: Requirements Traceability Matrix (RTM), QA BDD Behave Test Cases, Performance & Security Test Plan (200 users), and OS/Browser Compatibility Test Plan.
  4. *Office Formats*: Utility compiler scripts generated `.docx` (WPS Docs) and `.xlsx` (WPS Sheets) files for all deliverables in the `docs/` directory.
* **Frontend Security & Dashboard Prototype**:
  1. Responsive glassmorphic layout supporting both desktop and mobile viewports.
  2. Live input validation for email and Thailand mobile phone numbers.
  3. Dynamic Password strength meter progress bar and public breach database leak audit checks.
  4. Account recovery system (Email link reset and SMS OTP challenge sequence using code `440192`).
  5. Centered Social OAuth login popups (Google, Facebook, TikTok) returning callbacks to parent window with auto-submit.
  6. Central Dashboard container showing dynamic metrics updates, custom SVG sales charts, low-stock threshold configuration, and printing consoles.
* **Git Repository**: Initialized, staged, and pushed code to `main` branch on GitHub.

---

## 4. Remaining Project Tasks (Next Steps)

The following detailed development tasks are scheduled for execution next:

1. **FastAPI Backend Setup (Phase 2)**:
   - Configure PostgreSQL container migrations using Alembic.
   - Establish Redis connection settings for celery task orchestration.
2. **Platform Open API Integrations (Phase 2-3)**:
   - Store OAuth credentials callback endpoint handles in `main.py`.
   - Implement actual signature hashing algorithms for Lazada Partner API, Shopee API, and TikTok Partner endpoints.
3. **Core Sync Logic (Phase 3)**:
   - Coding Master SKU database mapper hooks.
   - Setup Celery periodic tasks to push stock sync commands to Lazada/TikTok on Shopee webhook triggers.
4. **Fulfillment Print Compiler (Phase 3)**:
   - Integrate PDF conversion libraries (e.g. ReportLab or Weasyprint) to compile label requests into physical print layouts.
5. **QA Test Automation (Phase 4)**:
   - Implement behaving step definitions in `features/steps/web_steps.py`.
   - Setup headless Chrome drivers in GitHub Actions workflow to run automatic builds.
