# Performance & Security Test Plan - FinCommerce v1.0

This document outlines the testing strategy, performance targets, stress limits, endurance protocols, and security validation cases for the FinCommerce platform.

---

## 1. Performance Testing Strategy

The goal is to ensure the FastAPI server and database layers maintain high responsiveness and low latencies during peak sales campaigns (e.g. 11.11 shopping festivals in Thailand).

### 1.1 Load Testing (Target: 200 Concurrent Users)
* **Objective**: Measure system behavior under a normal-to-high operational load of 200 active concurrent merchant tenants.
* **Test Scenarios**:
  - **Scenario L-01**: 200 users simultaneously retrieving active session logs via `/api/v1/devices`.
  - **Scenario L-02**: Simulating 200 inbound platform webhooks per second updating product stock levels.
  - **Scenario L-03**: Simulating 200 users simultaneously initiating PromptPay QR payment checkouts (measuring QR rendering latency).
  - **Scenario L-04**: Simulating 200 users concurrently sending help questions to the Support Chatbot (measuring bot reply rendering latency).
* **Acceptance Criteria**:
  - Response time for read endpoints (GET) must be `< 500ms` at 95th percentile (p95).
  - Webhook processing time (POST) must be `< 200ms` at p95.
  - Chatbot query reply generation must resolve in `< 300ms` at p95.
  - CPU utilization on the application container must remain below `70%`.
  - Zero connection timeouts on Postgres and Redis pools.

### 1.2 Stress Testing (Target: 1,000+ Concurrent Users)
* **Objective**: Identify the system's breaking point and verify clean recovery when traffic exceed limits.
* **Test Scenarios**:
  - Ramp up concurrent users from 200 to 1,000 over 10 minutes.
  - Flood the webhook endpoint `/api/v1/auth/login` to simulate a brute force attack.
  - Simulating 1,000 parallel billing checkout submissions (simulating gateway transaction locks).
* **Acceptance Criteria**:
  - The system must fail gracefully: return `HTTP 429 Too Many Requests` or initiate rate-limiting locks without dropping database connections.
  - The Redis task queue must throttle incoming traffic and not crash due to memory depletion.
  - System logs must register warning thresholds correctly.

### 1.3 Endurance Testing (Target: 24-Hour Run)
* **Objective**: Identify memory leaks, database connection exhaustion, or storage overflow issues over an extended period.
* **Test Scenarios**:
  - Maintain a steady state of 50 active users performing continuous stock sync queries and report downloads for 24 hours.
  - Maintain continuous chatbot session creations and payment validation loops for 24 hours.
* **Acceptance Criteria**:
  - Application memory footprint (FastAPI and Celery workers) must remain flat.
  - Active database connection count must not accumulate over time.
  - Temporary files and session caches must be purged regularly from Redis.

---

## 2. Security Testing Cases

| Test Case ID | Target Area | Description / Method | Expected Result | Status |
|:---|:---|:---|:---|:---:|
| **TC-SEC-01** | Account Lockout | Submit 5 incorrect credentials on `/auth/login`. | System freezes account, locks requests for 15 minutes, and triggers CAPTCHA. | Pending |
| **TC-SEC-02** | JWT Token Expiry | Access `/devices` with an expired authorization token. | System rejects request with `HTTP 401 Unauthorized`. | Pending |
| **TC-SEC-03** | CSRF Protection | Attempt to revoke session `/devices/revoke/{id}` without token header. | System blocks request and returns access error. | Pending |
| **TC-SEC-04** | SQL Injection | Input SQL commands (e.g. `' OR 1=1;--`) in login username field. | Request is sanitized and rejected by database ORM without execution. | Pending |
| **TC-SEC-05** | XSS Filtering | Inject script tags (e.g. `<script>alert(1)</script>`) in Full Name registration. | System strips HTML tags and saves input as clean text. | Pending |
| **TC-SEC-06** | Passwords Audit | Submit known leaked password (e.g. `12345678`) on registration. | System rejects input and prompts safety warning message. | Pending |
| **TC-SEC-07** | Payment Spoofing | Send spoofed webhook payment confirmation payload without cryptographic signature. | System flags payload as untrusted, rejects transaction, and logs warning. | Pending |
| **TC-SEC-08** | Profile Bypass | Submit weak/leaked password change request via direct POST to `/api/v1/profile/password`. | Backend ORM rejects update, returns `HTTP 400 Bad Request`, and logs security block. | Pending |

