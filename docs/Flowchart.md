# Flowcharts - FinCommerce Security & Recovery Pipelines

This document provides flowcharts mapping critical user entrypoints, security checks, and password recovery states in FinCommerce.

---

## 1. User Sign In & Rate Limiting Flowchart

Details authentication gates, failure counting, and CAPTCHA lockout thresholds:

```mermaid
flowchart TD
    Start([1. User Opens Sign In Page]) --> Input[Enter Username & Password]
    Input --> CheckAttempts{Failed Attempts >= 3?}
    
    CheckAttempts -- Yes --> Captcha[Prompt CAPTCHA Challenge]
    Captcha --> VerifyCaptcha{Is CAPTCHA Checked?}
    VerifyCaptcha -- No --> Captcha
    VerifyCaptcha -- Yes --> ValidateCreds
    
    CheckAttempts -- No --> ValidateCreds
    
    ValidateCreds{Are Credentials Correct?}
    
    ValidateCreds -- No --> IncrementFail[Increment Fail Counter]
    IncrementFail --> CheckAttempts
    
    ValidateCreds -- Yes --> RiskCheck[Run Adaptive Risk Engine]
    RiskCheck --> End([Proceed to Login Flow])
```

---

## 2. Adaptive Risk-Based Authentication Flowchart

Maps silent geolocation checks and SMS OTP secondary verification challenges:

```mermaid
flowchart TD
    Start([Initialize Session Handshake]) --> CheckIP{Is Login IP / Device recognized?}
    
    CheckIP -- Yes --> GeoCheck{Is there a geographic jump in last 1 hour?}
    CheckIP -- No --> TriggerMFA[Trigger 2-Step Verification]
    
    GeoCheck -- Yes --> TriggerMFA
    GeoCheck -- No --> GrantAccess([Grant Access & Load Dashboard])
    
    TriggerMFA --> SendOTP[Dispatch 6-Digit OTP via SMS]
    SendOTP --> InputOTP[Enter OTP code]
    
    InputOTP --> VerifyOTP{Is OTP correct?}
    VerifyOTP -- Yes --> GrantAccess
    VerifyOTP -- No --> VerifyOTP
```

---

## 3. Self-Service Account Recovery Flowchart

Outlines SMS verification and Email-based recovery flows:

```mermaid
flowchart TD
    Start([User Clicks Forgot Password]) --> SelectMode{Select Recovery Mode}
    
    SelectMode -- Email Link --> InputEmail[Enter Email Address]
    InputEmail --> DispatchLink[Send single-use token URL via Email]
    DispatchLink --> CheckMailbox[Click Reset Link in Mailbox]
    CheckMailbox --> NewPasswordPanel
    
    SelectMode -- SMS OTP --> InputPhone[Enter Thai Mobile Number]
    InputPhone --> ValidatePhone{Is Phone Valid Format?}
    ValidatePhone -- No --> InputPhone
    ValidatePhone -- Yes --> SendOTP[Dispatch SMS OTP code 440192]
    SendOTP --> InputOTP[Enter Code]
    InputOTP --> CheckOTP{Is Code Correct?}
    CheckOTP -- No --> InputOTP
    CheckOTP -- Yes --> NewPasswordPanel
    
    NewPasswordPanel[Display New Password Form] --> InputNewPwd[Enter New Password]
    InputNewPwd --> StrengthCheck{Is password strong & non-leaked?}
    StrengthCheck -- No --> InputNewPwd
    StrengthCheck -- Yes --> SavePassword[Update Database & Terminate old sessions]
    SavePassword --> End([Redirect to Sign In Page])
```

---

## 4. Account Registration Input Validation Flowchart

Maps real-time regex formats and credentials leak checking:

```mermaid
flowchart TD
    Start([Trader Opens Registration Page]) --> Input[Enter Full Name, Email, Phone, Password]
    
    Input --> ValidateFormat{Are Email & Phone formats valid?}
    ValidateFormat -- No --> ShowFormatError[Display Error Message]
    ShowFormatError --> Input
    
    ValidateFormat -- Yes --> Auditing{Auditing Password Input}
    Auditing --> CheckStrength{Is Password Strong?}
    CheckStrength -- No --> ShowStrengthError[Show weak meter indicator]
    ShowStrengthError --> Input
    
    CheckStrength -- Yes --> CheckBreach{Is Password in known public leaks?}
    CheckBreach -- Yes --> ShowLeakWarning[Show Leaked Password Alert]
    ShowLeakWarning --> Input
    
    CheckBreach -- No --> Submit[Enable Create Account Submit Button]
    Submit --> Success([Create User & Redirect to Login])
```
