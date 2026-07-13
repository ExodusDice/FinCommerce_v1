# Project Timeline & Resource Management - FinCommerce

## 1. Project Phase Timeline
The project spans **12 weeks** structured across 4 key phases:

```
[Month 1: Phase 1 - Foundation & UI/UX]  -->  [Month 2: Phase 2 - Sync Engine]  -->  [Month 3: Phase 3 - Integrations & QA]
```

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
