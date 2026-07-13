// FinCommerce Frontend Logic - Unified Client Script

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // SECTION 1: AUTHENTICATION & REGISTRATION
  // ==========================================
  
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

  // Password Visibility Toggle
  if (passwordToggleBtn && passwordInput) {
    passwordToggleBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      passwordToggleIcon.textContent = type === 'text' ? '🔓' : '👁️';
    });
  }

  // Real-Time Login Input Feedback
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

  // Login Submission
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

      if (socialSessionActive) {
        establishSuccessfulLogin(username, rememberMe);
        return;
      }

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

  // 2-Step Verification inputs auto-shifting
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

  // Biometric Sign In
  if (biometricBtn) {
    biometricBtn.addEventListener('click', () => {
      biometricBtn.style.boxShadow = '0 0 15px var(--color-secondary)';
      setTimeout(() => {
        if (confirm("Verify your identity using Face ID / Touch ID / Device Passcode.")) {
          alert('Biometric Login Succeeded!');
          window.location.href = 'dashboard.html';
        } else {
          biometricBtn.style.boxShadow = 'none';
        }
      }, 300);
    });
  }

  // Registration Validations
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

      if (leakedList.includes(val.toLowerCase())) {
        leakMsg.textContent = '⚠ Warning: This password was found in public breaches. Choose another.';
        leakMsg.className = 'feedback-msg warning';
      } else {
        leakMsg.textContent = '✓ Secure password integrity (no known breach matches).';
        leakMsg.className = 'feedback-msg success';
      }

      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[a-z]/.test(val)) score++;
      if (/\d/.test(val)) score++;
      if (/[@$!%*?&]/.test(val)) score++;

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

  // Social Logins
  const socialButtons = document.querySelectorAll('.social-btn[data-provider]');
  socialButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('data-provider');
      const width = 450;
      const height = 600;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);
      
      window.open(
        `oauth_mock.html?provider=${provider}`,
        'OAuth_Consent_Screen',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );
    });
  });

  // Message receiver hook
  window.addEventListener('message', (event) => {
    if (event.data && event.data.status === 'SUCCESS') {
      const { provider, name, email } = event.data;
      
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
      
      if (identityInput) {
        identityInput.value = email;
        identityInput.dispatchEvent(new Event('input'));
      }
      if (passwordInput) {
        passwordInput.value = '••••••••••••••••';
      }
      
      socialSessionActive = true;
      alert(`Authenticated successfully via ${provider.toUpperCase()}! Logging you in...`);
      
      setTimeout(() => {
        if (loginForm) {
          loginForm.dispatchEvent(new Event('submit'));
        }
      }, 600);
    }
  });

  // Account Recovery Modal
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

  window.addEventListener('click', (e) => {
    if (e.target === recoveryModal) {
      recoveryModal.classList.remove('active');
    }
  });

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

  const emailRecoveryForm = document.getElementById('email-recovery-form');
  if (emailRecoveryForm) {
    emailRecoveryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const recEmail = document.getElementById('recovery-email-input').value;
      alert(`Recovery link successfully compiled.\nDispatched to: ${recEmail}\nPlease check your inbox.`);
      recoveryModal.classList.remove('active');
    });
  }

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


  // ==========================================
  // SECTION 2: SaaS DASHBOARD INTERACTIONS
  // ==========================================

  // Sidebar Panel Toggles
  const sidebarItems = document.querySelectorAll('.sidebar-menu .menu-item');
  const panels = document.querySelectorAll('.dashboard-panel');
  const panelTitle = document.getElementById('active-panel-title');

  if (sidebarItems.length > 0) {
    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        // Toggle active menu item
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Toggle active dashboard panel
        const targetId = item.getAttribute('data-target');
        panels.forEach(panel => {
          panel.classList.remove('active');
          if (panel.id === targetId) {
            panel.classList.add('active');
          }
        });

        // Update panel title header
        const btnText = item.querySelector('button').textContent;
        panelTitle.textContent = btnText.substring(2); // strip emoji
      });
    });
  }

  // Dashboard Filters & Mock Data Simulation
  const filterShopee = document.getElementById('filter-shopee');
  const filterLazada = document.getElementById('filter-lazada');
  const filterTiktok = document.getElementById('filter-tiktok');
  const rangeButtons = document.querySelectorAll('.toggle-buttons .toggle-btn');
  
  const valGMV = document.getElementById('val-gmv');
  const valCommission = document.getElementById('val-commission');
  const valPayout = document.getElementById('val-payout');

  function updateDashboardMetricsSim() {
    if (!valGMV) return;

    let baseGMV = 245800.00;
    
    // Scale based on selected time range
    const activeRange = document.querySelector('.toggle-buttons .toggle-btn.active')?.getAttribute('data-time') || 'monthly';
    if (activeRange === 'daily') baseGMV /= 30.0;
    if (activeRange === 'weekly') baseGMV /= 4.0;
    if (activeRange === 'yearly') baseGMV *= 12.0;

    // Deduct/adjust based on platform exclusions
    let mult = 1.0;
    if (filterShopee && !filterShopee.checked) mult -= 0.35;
    if (filterLazada && !filterLazada.checked) mult -= 0.40;
    if (filterTiktok && !filterTiktok.checked) mult -= 0.25;

    const currentGMV = baseGMV * mult;
    const currentComm = currentGMV * 0.075; // average 7.5% platform commission
    const currentPayout = currentGMV - currentComm;

    valGMV.textContent = '฿' + currentGMV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    valCommission.textContent = '฿' + currentComm.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    valPayout.textContent = '฿' + currentPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  if (filterShopee) filterShopee.addEventListener('change', updateDashboardMetricsSim);
  if (filterLazada) filterLazada.addEventListener('change', updateDashboardMetricsSim);
  if (filterTiktok) filterTiktok.addEventListener('change', updateDashboardMetricsSim);

  if (rangeButtons.length > 0) {
    rangeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        rangeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateDashboardMetricsSim();
      });
    });
  }

  // Bulk print simulation (AWB, Invoice, Picklist)
  const btnBulkPrint = document.getElementById('btn-bulk-print');
  const printConsole = document.getElementById('print-log-box');

  if (btnBulkPrint && printConsole) {
    btnBulkPrint.addEventListener('click', () => {
      printConsole.innerHTML = '';
      btnBulkPrint.disabled = true;

      const logLines = [
        "[INFO] Initiating multi-channel document compiler...",
        "[INFO] Connecting Shopee Open API (sh_th_99011) - Fetching 8 orders...",
        "[INFO] Connecting Lazada Open Platform (lz_th_00284) - Fetching 6 orders...",
        "[INFO] Connecting TikTok Shop API (tt_th_88102) - Fetching 4 orders...",
        "[INFO] Found 18 total pending transactions. Pulling AWB payloads...",
        "[PROCESS] Packing Air Waybills for Flash Express, J&T and Kerry...",
        "[PROCESS] Compiling localized Invoices & Warehouse Picklists...",
        "[PDF] Generating consolidated printable PDF document...",
        "[SUCCESS] Compiled package complete! 18 AWBs, 18 Picklists, 18 Invoices written.",
        "[SYSTEM] File transfer completed to default local printer port. Done."
      ];

      let delay = 0;
      logLines.forEach(line => {
        setTimeout(() => {
          const item = document.createElement('div');
          item.textContent = line;
          printConsole.appendChild(item);
          printConsole.scrollTop = printConsole.scrollHeight;
          
          if (line.includes('[SYSTEM]')) {
            btnBulkPrint.disabled = false;
          }
        }, delay);
        delay += 600;
      });
    });
  }

  // Low Inventory Configuration Alerts Modal
  const btnTriggerAlert = document.getElementById('btn-trigger-alert-modal');
  const alertModal = document.getElementById('alert-modal');
  const alertClose = document.getElementById('alert-modal-close');
  const alertForm = document.getElementById('alert-setup-form');

  if (btnTriggerAlert && alertModal) {
    btnTriggerAlert.addEventListener('click', () => {
      alertModal.classList.add('active');
    });
  }

  if (alertClose) {
    alertClose.addEventListener('click', () => {
      alertModal.classList.remove('active');
    });
  }

  if (alertForm) {
    alertForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const thresholdVal = document.getElementById('alert-threshold-input').value;
      alert(`Stock warnings activated! Alerts will trigger when any Master SKU dips below ${thresholdVal} items.`);
      alertModal.classList.remove('active');
    });
  }

  // Batch listing form publish
  const batchForm = document.getElementById('batch-upload-form');
  if (batchForm) {
    batchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Product created locally!\nSynchronizing and publishing listing to Shopee, Lazada, and TikTok Shop Thailand...');
      batchForm.reset();
    });
  }

  // Strategic pricing calculator calculations
  const sliderCost = document.getElementById('slider-cost');
  const sliderComm = document.getElementById('slider-comm');
  const sliderShipping = document.getElementById('slider-shipping');
  
  const labelCost = document.getElementById('label-cost-val');
  const labelComm = document.getElementById('label-comm-val');
  const labelShipping = document.getElementById('label-shipping-val');
  
  const suggestPriceEl = document.getElementById('calc-suggested-price');
  const profitPctEl = document.getElementById('calc-profit-pct');

  function calculateTargetPricing() {
    if (!sliderCost) return;

    const baseCost = parseFloat(sliderCost.value);
    const commRate = parseFloat(sliderComm.value) / 100;
    const shippingCost = parseFloat(sliderShipping.value);

    // Update labels text
    labelCost.textContent = '฿' + baseCost.toFixed(2);
    labelComm.textContent = sliderComm.value + '%';
    labelShipping.textContent = '฿' + shippingCost.toFixed(2);

    // Calculation formula: Target Price = (Base Cost + Shipping) / (1 - Commission - Target Margin)
    // Assume a solid default target margin of 35%
    const targetMargin = 0.35;
    const suggestedPrice = (baseCost + shippingCost) / (1 - commRate - targetMargin);

    // Calculate margins percentage
    const profitAmount = suggestedPrice - baseCost - (suggestedPrice * commRate) - shippingCost;
    const profitPct = (profitAmount / suggestedPrice) * 100;

    suggestPriceEl.textContent = '฿' + Math.max(suggestedPrice, 0).toFixed(2);
    profitPctEl.textContent = Math.max(profitPct, 0).toFixed(1) + '%';
  }

  if (sliderCost) {
    sliderCost.addEventListener('input', calculateTargetPricing);
    sliderComm.addEventListener('input', calculateTargetPricing);
    sliderShipping.addEventListener('input', calculateTargetPricing);
    
    // Initial run
    calculateTargetPricing();
  }


  // --- Helper Functions ---

  function resetRecoverySteps() {
    if (smsStepRequest) smsStepRequest.style.display = 'block';
    if (smsStepVerify) smsStepVerify.style.display = 'none';
    if (smsStepReset) smsStepReset.style.display = 'none';
    
    const ef = document.getElementById('email-recovery-form');
    if (ef) ef.reset();
    const rf = document.getElementById('sms-recovery-request-form');
    if (rf) rf.reset();
    const vf = document.getElementById('sms-recovery-verify-form');
    if (vf) vf.reset();
    const sf = document.getElementById('sms-recovery-reset-form');
    if (sf) sf.reset();
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

  function verifyOTPCode() {
    const enteredCode = Array.from(otpInputs).map(inp => inp.value).join('');
    if (enteredCode === '882049') {
      alert('2-Step Verification Completed Successfully!');
      window.location.href = 'dashboard.html';
    } else {
      alert('Invalid verification code. Please try again.');
      otpInputs.forEach(inp => inp.value = '');
      otpInputs[0].focus();
    }
  }

  function startOtpCooldownTimer(duration) {
    if (!mfaTimerText) return;
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
