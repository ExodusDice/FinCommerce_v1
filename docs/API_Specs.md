# API Specifications - FinCommerce v1.0

This document defines the REST API endpoints, request schemas, response codes, and payload formats for FinCommerce.

* **Base URL**: `http://localhost:8000/api/v1`
* **Default Content-Type**: `application/json`

---

## 1. Endpoint: `/auth/register` (POST)
Creates a new merchant account, validating email/phone uniqueness and auditing password strength and leaks.

### Request Body Schema
| Field Name | Type | Required | Constraints | Description |
|:---|:---:|:---:|:---|:---|
| **full_name** | String | Yes | Max 120 chars | Merchant user's name. |
| **email** | String | Yes | Valid email format | Primary email identifier. |
| **phone** | String | Yes | Thai format (`06`, `08`, `09`) | Mobile contact number. |
| **password** | String | Yes | Min 8 characters, complex | Account login credential. |

### Request Payload Example
```json
{
  "full_name": "Somchai Prasert",
  "email": "somchai@gmail.com",
  "phone": "0812345678",
  "password": "SecurePassword123!"
}
```

### Responses
* **HTTP 201 Created**: Account initialized successfully.
  ```json
  {
    "message": "User registered successfully."
  }
  ```
* **HTTP 400 Bad Request**: Form validation failed or leaked password flagged.
  ```json
  {
    "detail": "Password chosen was found in previous public breaches. Please choose a secure password."
  }
  ```

---

## 2. Endpoint: `/auth/login` (POST)
Validates merchant credentials and determines if adaptive security checks (MFA) are triggered.

### Request Body Schema
| Field Name | Type | Required | Constraints | Description |
|:---|:---:|:---:|:---|:---|
| **username** | String | Yes | Email or phone number | Sign-in identifier. |
| **password** | String | Yes | - | Password credential. |
| **remember_me** | Boolean | No | Default `false` | Permanent session cookies toggle. |

### Responses
* **HTTP 200 OK (MFA Triggered)**: Credentials correct, but geo-jump or unrecognized IP requires OTP challenge.
  ```json
  {
    "status": "MFA_REQUIRED",
    "mfa_token": "mfa_challenge_uuid_here",
    "message": "Credential matched. Dynamic Adaptive Verification triggered."
  }
  ```
* **HTTP 401 Unauthorized**: Invalid credentials entered.
  ```json
  {
    "detail": "Invalid credentials."
  }
  ```
* **HTTP 403 Forbidden**: Account locked out after 3 failed login attempts. CAPTCHA required.
  ```json
  {
    "detail": "Account locked. Complete security CAPTCHA verification to unlock."
  }
  ```

---

## 3. Endpoint: `/auth/mfa/verify` (POST)
Validates the 6-digit SMS OTP code dispatched to the merchant's mobile device.

### Request Body Schema
| Field Name | Type | Required | Constraints | Description |
|:---|:---:|:---:|:---|:---|
| **mfa_token** | String | Yes | Valid UUID | Challenge identifier from login response. |
| **otp_code** | String | Yes | 6 numeric digits | Code received via SMS (e.g. `882049`). |

### Responses
* **HTTP 200 OK**: Code verified. Session established.
  ```json
  {
    "status": "SUCCESS",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1dWlkLWhlcmUifQ.sig"
  }
  ```
* **HTTP 400 Bad Request**: Invalid or expired OTP code entered.
  ```json
  {
    "detail": "Invalid verification code."
  }
  ```

---

## 4. Endpoint: `/devices` (GET)
Returns all active browser and device sessions for the authenticated user.

### Request Headers
* **Authorization**: `Bearer <JWT_Token>`

### Responses
* **HTTP 200 OK**: Returns active session lists.
  ```json
  [
    {
      "session_id": "sess-1",
      "device_name": "Chrome on Windows 11",
      "ip_address": "182.52.120.44",
      "location": "Bangkok, Thailand",
      "last_active": "2026-07-13T20:00:00Z"
    },
    {
      "session_id": "sess-2",
      "device_name": "Safari on iPhone 15 Pro",
      "ip_address": "27.55.90.18",
      "location": "Chiang Mai, Thailand",
      "last_active": "2026-07-13T19:45:00Z"
    }
  ]
  ```

---

## 5. Endpoint: `/devices/revoke/{session_id}` (POST)
Removes session authentication, forcing immediate logout on that target device.

### Request Headers
* **Authorization**: `Bearer <JWT_Token>`

### Path Parameters
* **session_id**: String UUID representing the session to terminate.

### Responses
* **HTTP 200 OK**: Session successfully terminated.
  ```json
  {
    "message": "Session sess-2 successfully revoked."
  }
  ```
* **HTTP 404 Not Found**: Session ID does not exist or does not belong to the user.
  ```json
  {
    "detail": "Session ID not found."
  }
  ```
