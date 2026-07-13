// FinCommerce Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const identityInput = document.getElementById('identity');
  const identityError = document.getElementById('identity-error');
  const passwordInput = document.getElementById('password');
  const passwordToggleBtn = document.getElementById('password-toggle');
  const passwordToggleIcon = document.getElementById('password-toggle-icon');
  
  const loginForm = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');
  
  const loginPanel = document.getElementById('login-panel');
  const mfaPanel = document.getElementById('mfa-panel');
  
  const otpInputs = document.querySelectorAll('.otp-input');
  const mfaForm = document.getElementById('mfa-form');
  const mfaTimerText = document.getElementById('mfa-timer');
  const resendOtpBtn = document.getElementById('resend-otp');
  
  const biometricBtn = document.getElementById('biometric-btn');
  
  const captchaContainer = document.getElementById('captcha-sec');
  const captchaCheckbox = document.getElementById('captcha-checkbox');
  
  // Registration page elements (if present)
  const regPassword = document.getElementById('reg-password');
  const regPasswordConfirm = document.getElementById('reg-password-confirm');
  const regForm = document.getElementById('register-form');
  
  let failedAttempts = 0;
  let isCaptchaVerified = false;

  // Active Sessions Mock Data
  let activeSessions = [
    { id: 'sess-1', name: 'Chrome on Windows 11', ip: '182.52.120.44', loc: 'Bangkok, TH', current: true },
    { id: 'sess-2', name: 'Safari on iPhone 15 Pro', ip: '27.55.90.18', loc: 'Chiang Mai, TH', current: false },
    { id: 'sess-3', name: 'TikTok Webview on Android', ip: '101.109.112.5', loc: 'Nonthaburi, TH', current: false }
  ];

  // Render Smart Device Management console
  renderDeviceConsole();

  // Remember Me Cookie Check
  checkRememberMe();

  // 1. Password Visibility Mask/Unmask Toggle
  if (passwordToggleBtn && passwordInput) {
    passwordToggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle display character representation
      if (type === 'text') {
        passwordToggleIcon.textContent = '🔓';
      } else {
        passwordToggleIcon.textContent = '👁️';
      }
    });
  }

  // 2. Real-Time Feedback for Email / Mobile Phone Inputs
  if (identityInput) {
    identityInput.addEventListener('input', () => {
      const value = identityInput.value.trim();
      
      if (!value) {
        identityError.textContent = '';
        identityError.className = 'feedback-msg';
        return;
      }

      // Check if user is typing email
      if (value.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
          identityError.textContent = '✓ Valid Email Format';
          identityError.className = 'feedback-msg success';
        } else {
          identityError.textContent = '✗ Invalid email domain format (e.g. user@gmail.com)';
          identityError.className = 'feedback-msg error';
        }
      } 
      // Check if user is typing phone number (Thailand phone numbers start with 0 and contain 9-10 digits)
      else if (/^\d+$/.test(value)) {
        const thPhoneRegex = /^0(6|8|9)\d{7,8}$/;
        if (thPhoneRegex.test(value)) {
          identityError.textContent = '✓ Valid Thailand Mobile Number';
          identityError.className = 'feedback-msg success';
        } else {
          identityError.textContent = '✗ Must start with 06, 08, or 09 and contain 9-10 digits';
          identityError.className = 'feedback-msg error';
        }
      } 
      // General invalid format
      else {
        identityError.textContent = '✗ Enter a valid email address or Thailand phone number';
        identityError.className = 'feedback-msg error';
      }
    });
  }

  // 3. Brute Force Rate Limiting & Mock CAPTCHA
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const username = identityInput.value.trim();
      const password = passwordInput.value;
      const rememberMe = document.getElementById('remember-me')?.checked;

      // Simulate Captcha Requirement if rate-limited
      if (failedAttempts >= 3 && !isCaptchaVerified) {
        alert('Please complete the security CAPTCHA checkbox to proceed.');
        return;
      }

      // Real-time syntax validation guard before API submit
      if (identityError.classList.contains('error')) {
        alert('Please correct validation errors first.');
        return;
      }

      // Hardcoded Mock login logic:
      // Valid Credentials: user@gmail.com / Admin123! OR 0812345678 / Admin123!
      if ((username === 'user@gmail.com' || username === '0812345678') && password === 'Admin123!') {
        
        // Handle Session Cookie persistence if "Remember Me" checked
        if (rememberMe) {
          localStorage.setItem('fincomm_remembered_user', username);
          document.cookie = "fincomm_session=active_tenant_session; max-age=31536000; path=/"; // 1 Year Cookie
        } else {
          localStorage.removeItem('fincomm_remembered_user');
          document.cookie = "fincomm_session=active_tenant_session; path=/"; // Session Cookie (browser close removes it)
        }

        // Trigger Adaptive/Risk-Based Auth verification (OTP check)
        triggerMFAChallenge();

      } else {
        failedAttempts++;
        alert(`Authentication failed. Attempts: ${failedAttempts}/3`);

        if (failedAttempts >= 3) {
          captchaContainer.classList.add('active');
          loginBtn.disabled = true;
        }
      }
    });
  }

  // CAPTCHA verification simulation
  if (captchaCheckbox) {
    captchaCheckbox.addEventListener('change', () => {
      if (captchaCheckbox.checked) {
        isCaptchaVerified = true;
        loginBtn.disabled = false;
        alert('CAPTCHA Security Verification Succeeded.');
      }
    });
  }

  // 4. Two-Step Verification (OTP digit auto-shifting and submit)
  if (otpInputs && otpInputs.length > 0) {
    otpInputs.forEach((input, index) => {
      input.addEventListener('keyup', (e) => {
        const currentInput = input;
        const nextInput = otpInputs[index + 1];
        const prevInput = otpInputs[index - 1];

        // Numbers only
        if (currentInput.value.length > 1) {
          currentInput.value = currentInput.value.slice(0, 1);
        }

        // Focus next input
        if (nextInput && currentInput.value !== "" && e.key !== "Backspace") {
          nextInput.focus();
        }

        // Backspace handling
        if (e.key === "Backspace" && prevInput) {
          prevInput.focus();
        }

        // Auto-submit OTP once fully filled
        const allFilled = Array.from(otpInputs).every(inp => inp.value !== "");
        if (allFilled) {
          verifyOTPCode();
        }
      });
    });
  }

  // Resend OTP code action
  if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('A new 6-digit OTP code has been sent to your device.');
      startOtpCooldownTimer(60);
    });
  }

  // 5. Biometric Authentication Trigger (Mock WebAuthn)
  if (biometricBtn) {
    biometricBtn.addEventListener('click', () => {
      const isMobile = window.innerWidth <= 600;
      const deviceMsg = isMobile 
        ? "Verifying Fingerprint / Face ID via mobile device security..."
        : "Checking security key / Touch ID reader on your computer...";
      
      biometricBtn.style.boxShadow = '0 0 15px var(--color-secondary)';
      
      setTimeout(() => {
        if (confirm(`${deviceMsg}\nClick OK to simulate successful verification.`)) {
          alert('Biometric Login Succeeded!');
          window.location.reload();
        } else {
          biometricBtn.style.boxShadow = 'none';
        }
      }, 500);
    });
  }

  // Registration Password Strength & Breach Audit Verification
  if (regPassword) {
    regPassword.addEventListener('input', () => {
      const pwd = regPassword.value;
      const strengthIndicator = document.getElementById('pwd-strength-msg');
      const leakedIndicator = document.getElementById('pwd-leak-msg');
      
      // Known leaked passwords list (Mock auditing)
      const popularBreachedPasswords = ['password123', '12345678', 'qwertyuiop', 'admin123', 'love1234'];

      if (!pwd) {
        strengthIndicator.textContent = '';
        leakedIndicator.textContent = '';
        return;
      }

      // Check leaked password auditing
      if (popularBreachedPasswords.includes(pwd.toLowerCase())) {
        leakedIndicator.textContent = '⚠ Warning: This password was found in public breaches. Choose another.';
        leakedIndicator.className = 'feedback-msg warning';
      } else {
        leakedIndicator.textContent = '✓ Secure password integrity (no known breach matches).';
        leakedIndicator.className = 'feedback-msg success';
      }

      // Validate Password Strength regex
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (pwd.length < 8) {
        strengthIndicator.textContent = '✗ Password must be at least 8 characters long';
        strengthIndicator.className = 'feedback-msg error';
      } else if (!strongRegex.test(pwd)) {
        strengthIndicator.textContent = '✗ Include upper/lowercase letter, digit, and special char';
        strengthIndicator.className = 'feedback-msg error';
      } else {
        strengthIndicator.textContent = '✓ Password strength is excellent';
        strengthIndicator.className = 'feedback-msg success';
      }
    });

    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const pwdVal = regPassword.value;
        const confirmVal = regPasswordConfirm.value;

        if (pwdVal !== confirmVal) {
          alert('Passwords do not match.');
          return;
        }

        const pwdLeak = document.getElementById('pwd-leak-msg');
        if (pwdLeak.classList.contains('warning')) {
          alert('For your safety, you cannot register with a leaked password.');
          return;
        }

        alert('Registration complete! Directing you back to sign in.');
        window.location.href = 'index.html';
      });
    }
  }

  // --- Helper Functions ---

  function triggerMFAChallenge() {
    loginPanel.classList.remove('active');
    mfaPanel.classList.add('active');
    
    // Simulate SMS dispatch notification
    const maskedPhone = identityInput.value.includes('@') ? 'email inbox' : 'mobile SMS (+66 XX-XXX-X78)';
    alert(`Risk-based Adaptive Guard triggered. A 6-digit verification code was sent to your ${maskedPhone}. (Code: 8 8 2 0 4 9)`);
    
    startOtpCooldownTimer(60);
    // Focus first OTP field
    otpInputs[0].focus();
  }

  function verifyOTPCode() {
    const enteredCode = Array.from(otpInputs).map(inp => inp.value).join('');
    
    if (enteredCode === '882049') {
      alert('2-Step Verification Completed Successfully!');
      
      // Update session console to add a new active session
      const newSession = {
        id: 'sess-' + (activeSessions.length + 1),
        name: window.innerWidth <= 600 ? 'Mobile Webview (iOS)' : 'Browser session (Desktop)',
        ip: '127.0.0.1',
        loc: 'Bangkok, TH',
        current: true
      };
      
      // Mark other sessions current as false
      activeSessions.forEach(sess => sess.current = false);
      activeSessions.unshift(newSession);
      
      renderDeviceConsole();

      // Reset Form & Show Login panel again (simulates dashboard landing)
      loginForm.reset();
      mfaForm.reset();
      mfaPanel.classList.remove('active');
      loginPanel.classList.add('active');
      
      alert('Dashboard simulated login completed! Scroll down to review the device console.');
    } else {
      alert('Invalid verification code. Please try again.');
      otpInputs.forEach(inp => inp.value = '');
      otpInputs[0].focus();
    }
  }

  function startOtpCooldownTimer(duration) {
    let timer = duration;
    resendOtpBtn.disabled = true;
    
    const interval = setInterval(() => {
      mfaTimerText.textContent = `00:${timer < 10 ? '0' + timer : timer}`;
      timer--;

      if (timer < 0) {
        clearInterval(interval);
        mfaTimerText.textContent = '';
        resendOtpBtn.disabled = false;
      }
    }, 1000);
  }

  function checkRememberMe() {
    const savedUser = localStorage.getItem('fincomm_remembered_user');
    if (savedUser && identityInput) {
      identityInput.value = savedUser;
      document.getElementById('remember-me').checked = true;
      // Trigger validation feedback
      identityInput.dispatchEvent(new Event('input'));
    }
  }

  // Render list of active sessions with revoking logic
  function renderDeviceConsole() {
    const listContainer = document.getElementById('active-device-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    activeSessions.forEach(session => {
      const item = document.createElement('div');
      item.className = 'device-item';
      item.id = session.id;

      const deviceLogo = session.name.toLowerCase().includes('iphone') || session.name.toLowerCase().includes('android') ? '📱' : '💻';

      item.innerHTML = `
        <div class="device-details">
          <div class="device-icon">${deviceLogo}</div>
          <div class="device-info">
            <h4>${session.name} ${session.current ? '<span class="status-badge current">Current Session</span>' : '<span class="status-badge remote">Active Session</span>'}</h4>
            <p>IP Address: ${session.ip} • Location: ${session.loc}</p>
          </div>
        </div>
        ${!session.current ? `<button class="revoke-btn" onclick="revokeSession('${session.id}')">Revoke Access</button>` : ''}
      `;

      listContainer.appendChild(item);
    });
  }

  // Global Scope definition for revocation action
  window.revokeSession = function(sessionId) {
    const element = document.getElementById(sessionId);
    if (!element) return;

    if (confirm('Are you sure you want to terminate this session? The device will be signed out immediately.')) {
      // Animate item exit
      element.style.opacity = '0';
      element.style.transform = 'translateX(50px)';
      
      setTimeout(() => {
        activeSessions = activeSessions.filter(s => s.id !== sessionId);
        renderDeviceConsole();
        alert('Session terminated. WebSocket signal triggered.');
      }, 300);
    }
  };
});
