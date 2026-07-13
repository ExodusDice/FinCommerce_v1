# Compatibility Test Plan - FinCommerce v1.0

This document outlines the testing parameters and compatibility matrices to verify correct styling, layout rendering, and functional behaviors of FinCommerce across operating systems and web browsers.

---

## 1. Compatibility Matrices

### 1.1 Supported Web Browsers
* **Desktop**: Google Chrome (Latest), Apple Safari (Latest), Microsoft Edge (Latest), Mozilla Firefox (Latest).
* **Mobile**: iOS Mobile Safari, Android Google Chrome, native hybrid WebViews (Lazada/Shopee/TikTok inner in-app browsers).

### 1.2 Supported Operating Systems
* **Desktop**: Windows 10, Windows 11, macOS (Latest version only).
* **Mobile**: iOS (Version 18 and 19), Android (Latest versions).

---

## 2. Compatibility Test Cases

### 2.1 Browser Compatibility Test Cases (Web Rendering & Engine Actions)

| ID | Test Category | Action / Steps | Expected Result | Status |
|:---|:---|:---|:---|:---:|
| **TC-COMP-01** | Flexbox & Grid Rendering | Render dashboard layout in Chrome, Safari, Firefox, and Edge. | Navigation sidebar and content grids align correctly without wrapping issues. | Pending |
| **TC-COMP-02** | Glassmorphic Backdrop CSS | Check blur effect (`backdrop-filter`) on Safari and Chrome. | Glassmorphic overlays blur backgrounds correctly (using `-webkit-backdrop-filter` fallback on iOS/macOS). | Pending |
| **TC-COMP-03** | Social OAuth popup messaging | Click Google login on Chrome (Windows) and Mobile Safari (iOS). | Popups open, register event listeners, and post messages back to parent window correctly. | Pending |
| **TC-COMP-04** | Cookie Session Expiries | Check session cookie write and read in private/incognito modes. | HTTP-Only session cookies persist when "Remember Me" is toggled, and expire on session close. | Pending |
| **TC-COMP-05** | Biometric WebAuthn prompt | Click "Sign In with Biometrics" on browsers support. | WebAuthn credentials selection prompt displays natively. | Pending |

### 2.2 OS Compatibility Test Cases (Platform Touch & viewport limits)

| ID | Operating System | Action / Steps | Expected Result | Status |
|:---|:---|:---|:---|:---:|
| **TC-OS-01** | Windows 10 / 11 | Navigate dashboard using Chrome & Edge on Windows. | Page renders without horizontal scrollbars, input boxes align, fonts import correctly. | Pending |
| **TC-OS-02** | macOS (Latest) | Navigate dashboard using Safari on macOS. | Backdrop filters render smoothly, trackpad gestures function without layout jitter. | Pending |
| **TC-OS-03** | iOS (v18-19) | Load register page on iPhone 15 Pro emulator. | Form elements stack vertically, touch targets (buttons) are >= 44px, screen doesn't zoom on input focus. | Pending |
| **TC-OS-04** | Android | Load register page on Samsung Galaxy S23. | Soft keyboard does not break the layout or push the card action button off-screen. | Pending |
| **TC-OS-05** | Hybrid WebViews | Connect TikTok platform link in TikTok in-app browser. | Secure redirects function and transfer OAuth tokens without session loss. | Pending |
