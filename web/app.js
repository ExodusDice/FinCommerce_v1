// FinCommerce Frontend Logic - Phase 2 Extended

document.addEventListener('DOMContentLoaded', () => {
  // --- Common Elements ---
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
  
  let failedAttempts = 0;
  let isCaptchaVerified = false;
  let socialSessionActive = false;

  // Active Sessions Mock Data
  let activeSessions = [
    { id: 'sess-1', name: 'Chrome on Windows 11', ip: '182.52.120.44', loc: 'Bangkok, TH', current: true },
    { id: 'sess-2', name: 'Safari on iPhone 15 Pro', ip: '27.55.90.18', loc: 'Chiang Mai, TH', current: false },
    { id: 'sess-3', name: 'TikTok Webview on Android', ip: '101.109.112.5', loc: 'Nonthaburi, TH', current: false }
  ];

  renderDeviceConsole();
  checkRememberMe();

  // --- 1. Password Visibility Toggle ---
  if (passwordToggleBtn && passwordInput) {
    passwordToggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      passwordToggleIcon.textContent = type === 'text' ? '🔓' : '👁️';
    });
  }

  // --- 2. Real-Time Login Credentials Input Feedback ---
  if (identityInput) {
    identityInput.addEventListener('input', () => {
      const value = identityInput.value.trim();
      if (!value) {
        identityError.textContent = '';
        identityError.className = 'feedback-msg';
        return;
      }

      if (value.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(value)) {
          identityError.textContent = '✓ Valid Email Format';
          identityError.className = 'feedback-msg success';
        } else {
          identityError.textContent = '✗ Invalid email domain format (e.g. user@gmail.com)';
          identityError.className = 'feedback-msg error';
        }
      } else if (/^\d+$/.test(value)) {
        const thPhoneRegex = /^0(6|8|9)\d{7,8}$/;
        if (thPhoneRegex.test(value)) {
          identityError.textContent = '✓ Valid Thailand Mobile Number';
          identityError.className = 'feedback-msg success';
        } else {
          identityError.textContent = '✗ Must start with 06, 08, or 09 and contain 9-10 digits';
          identityError.className = 'feedback-msg error';
        }
      } else {
        identityError.textContent = '✗ Enter a valid email address or Thailand phone number';
        identityError.className = 'feedback-msg error';
      }
    });
  }

  // --- 3. Login Submission & Brute Force Lockout ---
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (failedAttempts >= 3 && !isCaptchaVerified) {
        alert('Please complete the security CAPTCHA check.');
        return;
      }

      if (identityError.classList.contains('error')) {
        alert('Please correct validation errors first.');
        return;
      }

      const username = identityInput.value.trim();
      const password = passwordInput.value;
      const rememberMe = document.getElementById('remember-me')?.checked;

      // Social OAuth login shortcut (requires no password verification)
      if (socialSessionActive) {
        establishSuccessfulLogin(username, rememberMe);
        return;
      }

      // Standard verification mock
      if ((username === 'user@gmail.com' || username === '0812345678') && password === 'Admin123!') {
        establishSuccessfulLogin(username, rememberMe);
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

  if (captchaCheckbox) {
    captchaCheckbox.addEventListener('change', () => {
      if (captchaCheckbox.checked) {
        isCaptchaVerified = true;
        loginBtn.disabled = false;
        alert('CAPTCHA verified.');
      }
    });
  }

  // --- 4. Two-Step Verification Handler ---
  if (otpInputs && otpInputs.length > 0) {
    otpInputs.forEach((input, index) => {
      input.addEventListener('keyup', (e) => {
        const currentInput = input;
        const nextInput = otpInputs[index + 1];
        const prevInput = otpInputs[index - 1];

        if (currentInput.value.length > 1) {
          currentInput.value = currentInput.value.slice(0, 1);
        }
        if (nextInput && currentInput.value !== "" && e.key !== "Backspace") {
          nextInput.focus();
        }
        if (e.key === "Backspace" && prevInput) {
          prevInput.focus();
        }

        const allFilled = Array.from(otpInputs).every(inp => inp.value !== "");
        if (allFilled) {
          verifyOTPCode();
        }
      });
    });
  }

  if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('A new 6-digit OTP code has been sent to your device.');
      startOtpCooldownTimer(60);
    });
  }

  // --- 5. Biometric Sign In Trigger (Mock WebAuthn) ---
  if (biometricBtn) {
    biometricBtn.addEventListener('click', () => {
      biometricBtn.style.boxShadow = '0 0 15px var(--color-secondary)';
      setTimeout(() => {
        if (confirm("Verify your identity using Face ID / Touch ID / Device Passcode.")) {
          alert('Biometric Login Succeeded!');
          window.location.reload();
        } else {
          biometricBtn.style.boxShadow = 'none';
        }
      }, 300);
    });
  }

  // --- 6. Account Registration Form Logic ---
  const regForm = document.getElementById('register-form');
  const regEmail = document.getElementById('reg-email');
  const regEmailError = document.getElementById('reg-email-error');
  const regPhone = document.getElementById('reg-phone');
  const regPhoneError = document.getElementById('reg-phone-error');
  const regPassword = document.getElementById('reg-password');
  const regPasswordConfirm = document.getElementById('reg-password-confirm');
  const regPasswordConfirmError = document.getElementById('pwd-confirm-error');

  if (regEmail) {
    regEmail.addEventListener('input', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(regEmail.value.trim())) {
        regEmailError.textContent = '✓ Valid Email Format';
        regEmailError.className = 'feedback-msg success';
      } else {
        regEmailError.textContent = '✗ Enter a valid email address';
        regEmailError.className = 'feedback-msg error';
      }
    });
  }

  if (regPhone) {
    regPhone.addEventListener('input', () => {
      const thPhoneRegex = /^0(6|8|9)\d{7,8}$/;
      if (thPhoneRegex.test(regPhone.value.trim())) {
        regPhoneError.textContent = '✓ Valid Thailand Mobile Number';
        regPhoneError.className = 'feedback-msg success';
      } else {
        regPhoneError.textContent = '✗ Must start with 06, 08, or 09 (9-10 digits)';
        regPhoneError.className = 'feedback-msg error';
      }
    });
  }

  if (regPassword) {
    regPassword.addEventListener('input', () => {
      const val = regPassword.value;
      const strengthContainer = document.getElementById('reg-pwd-strength-container');
      const strengthBar = document.getElementById('reg-pwd-strength-bar');
      const strengthMsg = document.getElementById('pwd-strength-msg');
      const leakMsg = document.getElementById('pwd-leak-msg');
      
      const leakedList = ['password123', '12345678', 'qwertyuiop', 'admin123', 'love1234'];
      
      if (!val) {
        strengthContainer.classList.remove('active');
        strengthMsg.textContent = '';
        leakMsg.textContent = '';
        return;
      }
      
      strengthContainer.classList.add('active');

      // Leaked Password Audit
      if (leakedList.includes(val.toLowerCase())) {
        leakMsg.textContent = '⚠ Warning: This password was found in public breaches. Choose another.';
        leakMsg.className = 'feedback-msg warning';
      } else {
        leakMsg.textContent = '✓ Secure password integrity (no known breach matches).';
        leakMsg.className = 'feedback-msg success';
      }

      // Strength evaluation rules
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[a-z]/.test(val)) score++;
      if (/\d/.test(val)) score++;
      if (/[@$!%*?&]/.test(val)) score++;

      // Update color and width
      if (score <= 2) {
        strengthBar.style.width = '33%';
        strengthBar.style.backgroundColor = 'var(--color-error)';
        strengthMsg.textContent = 'Password Strength: Weak';
        strengthMsg.className = 'feedback-msg error';
      } else if (score <= 4) {
        strengthBar.style.width = '66%';
        strengthBar.style.backgroundColor = 'var(--color-warning)';
        strengthMsg.textContent = 'Password Strength: Medium';
        strengthMsg.className = 'feedback-msg warning';
      } else {
        strengthBar.style.width = '100%';
        strengthBar.style.backgroundColor = 'var(--color-success)';
        strengthMsg.textContent = 'Password Strength: Strong';
        strengthMsg.className = 'feedback-msg success';
      }
    });
  }

  if (regPasswordConfirm) {
    regPasswordConfirm.addEventListener('input', () => {
      if (regPassword.value === regPasswordConfirm.value) {
        regPasswordConfirmError.textContent = '✓ Passwords match';
        regPasswordConfirmError.className = 'feedback-msg success';
      } else {
        regPasswordConfirmError.textContent = '✗ Passwords do not match';
        regPasswordConfirmError.className = 'feedback-msg error';
      }
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (regEmailError.classList.contains('error') || regPhoneError.classList.contains('error') || regPasswordConfirmError.classList.contains('error')) {
        alert('Please resolve form errors first.');
        return;
      }
      
      const leakMsg = document.getElementById('pwd-leak-msg');
      if (leakMsg && leakMsg.classList.contains('warning')) {
        alert('You cannot register using a leaked password.');
        return;
      }

      alert('Account registered successfully! Directing you back to login page.');
      window.location.href = 'index.html';
    });
  }

  // --- 7. Social Logins Popups & Callbacks ---
  const socialButtons = document.querySelectorAll('.social-btn[data-provider]');
  
  socialButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('data-provider');
      const width = 450;
      const height = 600;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);
      
      // Open centered popup window
      window.open(
        `oauth_mock.html?provider=${provider}`,
        'OAuth_Consent_Screen',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );
    });
  });

  // Message receiver hook for cross-window authorization
  window.addEventListener('message', (event) => {
    // Basic verification guard
    if (event.data && event.data.status === 'SUCCESS') {
      const { provider, name, email } = event.data;
      
      // Check if we are on the registration page
      const fullnameInput = document.getElementById('fullname');
      if (fullnameInput) {
        fullnameInput.value = name;
        if (regEmail) {
          regEmail.value = email;
          regEmail.dispatchEvent(new Event('input'));
        }
        alert(`Successfully imported registration profile from ${provider.toUpperCase()}.\nPlease fill in your mobile phone and password to complete registration.`);
        return;
      }

      // Display OAuth connection badge on Login page
      const profileBadge = document.getElementById('social-profile-badge');
      if (profileBadge) {
        profileBadge.innerHTML = `
          <div class="profile-badge">
            <div class="profile-badge-avatar">${name.charAt(0)}</div>
            <div class="profile-badge-info">
              <h4>Connected via ${provider.toUpperCase()}</h4>
              <p>${name} (${email})</p>
            </div>
          </div>
        `;
        profileBadge.style.display = 'block';
      }
      
      // Autofill fields for login
      if (identityInput) {
        identityInput.value = email;
        identityInput.dispatchEvent(new Event('input'));
      }
      if (passwordInput) {
        passwordInput.value = '••••••••••••••••'; // visual mask indicator
      }
      
      socialSessionActive = true;
      alert(`Authenticated successfully via ${provider.toUpperCase()}! Logging you in...`);
      
      // Auto-submit login form after a short delay
      setTimeout(() => {
        if (loginForm) {
          loginForm.dispatchEvent(new Event('submit'));
        }
      }, 600);
    }
  });

  // --- 8. Account Recovery Modal Center (Forgot Pass/User) ---
  const recoveryTrigger = document.getElementById('btn-forgot-trigger');
  const recoveryModal = document.getElementById('recovery-modal');
  const recoveryClose = document.getElementById('recovery-modal-close');
  
  const tabEmail = document.getElementById('tab-btn-email');
  const tabSms = document.getElementById('tab-btn-sms');
  const panelEmail = document.getElementById('panel-email-recovery');
  const panelSms = document.getElementById('panel-sms-recovery');

  if (recoveryTrigger && recoveryModal) {
    recoveryTrigger.addEventListener('click', () => {
      recoveryModal.classList.add('active');
      resetRecoverySteps();
    });
  }

  if (recoveryClose) {
    recoveryClose.addEventListener('click', () => {
      recoveryModal.classList.remove('active');
    });
  }

  // Handle outside click close modal
  window.addEventListener('click', (e) => {
    if (e.target === recoveryModal) {
      recoveryModal.classList.remove('active');
    }
  });

  // Tab selections
  if (tabEmail && tabSms) {
    tabEmail.addEventListener('click', () => {
      tabEmail.classList.add('active');
      tabSms.classList.remove('active');
      panelEmail.classList.add('active');
      panelSms.classList.remove('active');
    });

    tabSms.addEventListener('click', () => {
      tabSms.classList.add('active');
      tabEmail.classList.remove('active');
      panelSms.classList.add('active');
      panelEmail.classList.remove('active');
    });
  }

  // Recovery Actions
  const emailRecoveryForm = document.getElementById('email-recovery-form');
  if (emailRecoveryForm) {
    emailRecoveryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const recEmail = document.getElementById('recovery-email-input').value;
      alert(`Recovery link successfully compiled.\nDispatched to: ${recEmail}\nPlease check your inbox.`);
      recoveryModal.classList.remove('active');
    });
  }

  // SMS Step 1: Request OTP
  const smsReqForm = document.getElementById('sms-recovery-request-form');
  const smsStepRequest = document.getElementById('sms-step-request');
  const smsStepVerify = document.getElementById('sms-step-verify');
  const smsStepReset = document.getElementById('sms-step-reset');

  if (smsReqForm) {
    smsReqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const phoneVal = document.getElementById('recovery-phone-input').value;
      
      const thPhoneRegex = /^0(6|8|9)\d{7,8}$/;
      if (!thPhoneRegex.test(phoneVal.trim())) {
        alert('Invalid mobile format. Please use a valid Thai number.');
        return;
      }

      alert(`SMS verification code dispatched.\nDestination: ${phoneVal}\n(Code: 4 4 0 1 9 2)`);
      smsStepRequest.style.display = 'none';
      smsStepVerify.style.display = 'block';
    });
  }

  // SMS Step 2: Verify Code
  const smsVerifyForm = document.getElementById('sms-recovery-verify-form');
  if (smsVerifyForm) {
    smsVerifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const codeVal = document.getElementById('recovery-otp-code').value;
      
      if (codeVal === '440192') {
        alert('Code confirmed successfully.');
        smsStepVerify.style.display = 'none';
        smsStepReset.style.display = 'block';
      } else {
        alert('Invalid recovery code. Please try again.');
      }
    });
  }

  // SMS Step 3: Reset password
  const smsResetForm = document.getElementById('sms-recovery-reset-form');
  const recNewPassword = document.getElementById('recovery-new-password');
  
  if (recNewPassword) {
    recNewPassword.addEventListener('input', () => {
      const val = recNewPassword.value;
      const recStrength = document.getElementById('rec-pwd-strength-msg');
      const recLeak = document.getElementById('rec-pwd-leak-msg');
      
      if (!val) {
        recStrength.textContent = '';
        recLeak.textContent = '';
        return;
      }
      
      if (['password123', 'admin123', '12345678'].includes(val.toLowerCase())) {
        recLeak.textContent = '⚠ Warning: Leaked password flagged.';
        recLeak.className = 'feedback-msg warning';
      } else {
        recLeak.textContent = '✓ Secure password integrity';
        recLeak.className = 'feedback-msg success';
      }

      if (val.length < 8) {
        recStrength.textContent = '✗ Password must be at least 8 characters';
        recStrength.className = 'feedback-msg error';
      } else {
        recStrength.textContent = '✓ Secure strength';
        recStrength.className = 'feedback-msg success';
      }
    });
  }

  if (smsResetForm) {
    smsResetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const leakMsg = document.getElementById('rec-pwd-leak-msg');
      const strengthMsg = document.getElementById('rec-pwd-strength-msg');
      
      if (leakMsg.classList.contains('warning') || strengthMsg.classList.contains('error')) {
        alert('Please supply a secure, non-breached password.');
        return;
      }
      
      alert('Password updated successfully. Please sign in with your new credentials.');
      recoveryModal.classList.remove('active');
    });
  }

  // --- Helper Functions ---

  function resetRecoverySteps() {
    smsStepRequest.style.display = 'block';
    smsStepVerify.style.display = 'none';
    smsStepReset.style.display = 'none';
    document.getElementById('email-recovery-form').reset();
    document.getElementById('sms-recovery-request-form').reset();
    document.getElementById('sms-recovery-verify-form').reset();
    document.getElementById('sms-recovery-reset-form').reset();
  }

  function establishSuccessfulLogin(username, rememberMe) {
    if (rememberMe) {
      localStorage.setItem('fincomm_remembered_user', username);
      document.cookie = "fincomm_session=active_tenant_session; max-age=31536000; path=/";
    } else {
      localStorage.removeItem('fincomm_remembered_user');
      document.cookie = "fincomm_session=active_tenant_session; path=/";
    }
    triggerMFAChallenge();
  }

  function triggerMFAChallenge() {
    loginPanel.classList.remove('active');
    mfaPanel.classList.add('active');
    
    const maskedPhone = identityInput.value.includes('@') ? 'email inbox' : 'mobile SMS (+66 XX-XXX-X78)';
    alert(`Risk-based Adaptive Guard triggered. A 6-digit verification code was sent to your ${maskedPhone}. (Code: 8 8 2 0 4 9)`);
    
    startOtpCooldownTimer(60);
    otpInputs[0].focus();
  }

  function verifyOTPCode() {
    const enteredCode = Array.from(otpInputs).map(inp => inp.value).join('');
    if (enteredCode === '882049') {
      alert('2-Step Verification Completed Successfully!');
      
      const newSession = {
        id: 'sess-' + (activeSessions.length + 1),
        name: window.innerWidth <= 600 ? 'Mobile Webview (iOS)' : 'Browser session (Desktop)',
        ip: '127.0.0.1',
        loc: 'Bangkok, TH',
        current: true
      };
      
      activeSessions.forEach(sess => sess.current = false);
      activeSessions.unshift(newSession);
      renderDeviceConsole();

      // Reset
      loginForm.reset();
      mfaForm.reset();
      mfaPanel.classList.remove('active');
      loginPanel.classList.add('active');
      
      const profileBadge = document.getElementById('social-profile-badge');
      if (profileBadge) profileBadge.style.display = 'none';
      socialSessionActive = false;

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
      const rememberCheckbox = document.getElementById('remember-me');
      if (rememberCheckbox) rememberCheckbox.checked = true;
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

  window.revokeSession = function(sessionId) {
    const element = document.getElementById(sessionId);
    if (!element) return;

    if (confirm('Are you sure you want to terminate this session? The device will be signed out immediately.')) {
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
