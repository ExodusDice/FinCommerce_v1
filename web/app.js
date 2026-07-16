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

  // ==========================================
  // SECTION 3: INVENTORY MOCK DATA & CRUD OPERATIONS
  // ==========================================
  
  let inventoryItems = [
    { sku: 'FIN-T-RED', name: 'Premium T-Shirt (Red)', stock: 142, price: 299, competitors: 14, shopee: true, lazada: true, tiktok: true },
    { sku: 'FIN-T-BLU', name: 'Premium T-Shirt (Blue)', stock: 85, price: 299, competitors: 9, shopee: true, lazada: true, tiktok: false },
    { sku: 'FIN-K-BLU', name: 'Stainless Tumbler (Blue)', stock: 12, price: 450, competitors: 22, shopee: false, lazada: true, tiktok: false }
  ];

  const tableBody = document.getElementById('inventory-table-body');
  const searchInput = document.getElementById('inventory-search');

  // Modals for CRUD
  const addModal = document.getElementById('add-product-modal');
  const editModal = document.getElementById('edit-product-modal');
  const deleteModal = document.getElementById('delete-product-modal');

  const btnAddProduct = document.getElementById('btn-add-product');

  // Close triggers
  document.getElementById('add-product-close')?.addEventListener('click', () => addModal.classList.remove('active'));
  document.getElementById('edit-product-close')?.addEventListener('click', () => editModal.classList.remove('active'));
  document.getElementById('delete-product-close')?.addEventListener('click', () => deleteModal.classList.remove('active'));

  // Open Add modal
  if (btnAddProduct) {
    btnAddProduct.addEventListener('click', () => {
      document.getElementById('add-product-form').reset();
      addModal.classList.add('active');
    });
  }

  // Render Inventory Table
  function renderInventoryTable(itemsToRender = inventoryItems) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (itemsToRender.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--color-text-muted);">No products found matching criteria.</td></tr>`;
      return;
    }

    itemsToRender.forEach(item => {
      const tr = document.createElement('tr');
      
      // Build Linked Channels Badges
      let badges = '';
      if (item.shopee) badges += `<span class="table-mapping-box">Shopee (${item.stock})</span>`;
      if (item.lazada) badges += `<span class="table-mapping-box">Lazada (${item.stock})</span>`;
      if (item.tiktok) badges += `<span class="table-mapping-box">TikTok (${item.stock})</span>`;
      if (!item.shopee && !item.lazada && !item.tiktok) {
        badges = `<span class="table-mapping-box" style="background: rgba(239, 68, 68, 0.1); color: var(--color-error); border-color: rgba(239,68,68,0.2);">Unmapped</span>`;
      }

      tr.innerHTML = `
        <td style="font-weight:600; color: var(--color-text-main);">${item.sku}</td>
        <td>${item.name}</td>
        <td>${item.stock} items</td>
        <td>${badges}</td>
        <td>฿${item.price.toFixed(2)}</td>
        <td style="color: var(--color-secondary);">${item.competitors} Shops</td>
        <td style="text-align: center;">
          <button class="btn btn-secondary btn-edit-row" data-sku="${item.sku}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; width: auto; display: inline-block; margin-right: 0.25rem; margin-top:0;">✏️ Edit</button>
          <button class="btn btn-secondary btn-delete-row" data-sku="${item.sku}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; width: auto; display: inline-block; background: var(--color-error); color: #fff; border-color: var(--color-error); margin-top:0;">🗑️ Del</button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach Row CRUD Triggers
    document.querySelectorAll('.btn-edit-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const sku = btn.getAttribute('data-sku');
        const item = inventoryItems.find(i => i.sku === sku);
        if (item) {
          document.getElementById('edit-sku').value = item.sku;
          document.getElementById('edit-name').value = item.name;
          document.getElementById('edit-stock').value = item.stock;
          document.getElementById('edit-price').value = item.price;
          
          document.getElementById('edit-sync-shopee').checked = item.shopee;
          document.getElementById('edit-sync-lazada').checked = item.lazada;
          document.getElementById('edit-sync-tiktok').checked = item.tiktok;

          editModal.classList.add('active');
        }
      });
    });

    document.querySelectorAll('.btn-delete-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const sku = btn.getAttribute('data-sku');
        const item = inventoryItems.find(i => i.sku === sku);
        if (item) {
          document.getElementById('delete-sku').value = item.sku;
          document.getElementById('delete-warning-text').textContent = `Are you sure you want to delete the product "${item.name}" (SKU: ${item.sku})? This action will remove the record centrally.`;
          
          document.getElementById('delete-sync-shopee').checked = item.shopee;
          document.getElementById('delete-sync-lazada').checked = item.lazada;
          document.getElementById('delete-sync-tiktok').checked = item.tiktok;

          deleteModal.classList.add('active');
        }
      });
    });
  }

  // Initial table render
  renderInventoryTable();

  // Search Filter
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const filtered = inventoryItems.filter(item => 
        item.sku.toLowerCase().includes(q) || 
        item.name.toLowerCase().includes(q)
      );
      renderInventoryTable(filtered);
    });
  }

  // Create Product Form Submit
  const addForm = document.getElementById('add-product-form');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sku = document.getElementById('add-sku').value.trim().toUpperCase();
      const name = document.getElementById('add-name').value.trim();
      const stock = parseInt(document.getElementById('add-stock').value);
      const price = parseFloat(document.getElementById('add-price').value);

      const shopee = document.getElementById('add-sync-shopee').checked;
      const lazada = document.getElementById('add-sync-lazada').checked;
      const tiktok = document.getElementById('add-sync-tiktok').checked;

      // Duplicate Check
      if (inventoryItems.some(i => i.sku === sku)) {
        alert('Error: SKU already exists in inventory.');
        return;
      }

      const newItem = { sku, name, stock, price, competitors: 0, shopee, lazada, tiktok };
      inventoryItems.unshift(newItem); // Add to beginning of catalog list
      renderInventoryTable();

      let channels = [];
      if (shopee) channels.push("Shopee TH");
      if (lazada) channels.push("Lazada TH");
      if (tiktok) channels.push("TikTok TH");

      alert(`Success: Created Master SKU "${name}" [${sku}].\nSynchronized listing creation to: ${channels.join(', ') || 'No platforms (Saved Locally)'}`);
      addModal.classList.remove('active');
    });
  }

  // Edit Product Form Submit
  const editForm = document.getElementById('edit-product-form');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sku = document.getElementById('edit-sku').value;
      const name = document.getElementById('edit-name').value.trim();
      const stock = parseInt(document.getElementById('edit-stock').value);
      const price = parseFloat(document.getElementById('edit-price').value);

      const shopee = document.getElementById('edit-sync-shopee').checked;
      const lazada = document.getElementById('edit-sync-lazada').checked;
      const tiktok = document.getElementById('edit-sync-tiktok').checked;

      const idx = inventoryItems.findIndex(i => i.sku === sku);
      if (idx !== -1) {
        inventoryItems[idx].name = name;
        inventoryItems[idx].stock = stock;
        inventoryItems[idx].price = price;
        inventoryItems[idx].shopee = shopee;
        inventoryItems[idx].lazada = lazada;
        inventoryItems[idx].tiktok = tiktok;
        
        renderInventoryTable();

        let channels = [];
        if (shopee) channels.push("Shopee TH");
        if (lazada) channels.push("Lazada TH");
        if (tiktok) channels.push("TikTok TH");

        alert(`Success: Updated SKU ${sku}.\nSync requests dispatched to: ${channels.join(', ') || 'None'}`);
        editModal.classList.remove('active');
      }
    });
  }

  // Delete Product Form Submit
  const deleteForm = document.getElementById('delete-product-form');
  if (deleteForm) {
    deleteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const sku = document.getElementById('delete-sku').value;

      const shopee = document.getElementById('delete-sync-shopee').checked;
      const lazada = document.getElementById('delete-sync-lazada').checked;
      const tiktok = document.getElementById('delete-sync-tiktok').checked;

      inventoryItems = inventoryItems.filter(i => i.sku !== sku);
      renderInventoryTable();

      let channels = [];
      if (shopee) channels.push("Shopee TH");
      if (lazada) channels.push("Lazada TH");
      if (tiktok) channels.push("TikTok TH");

      alert(`Success: Removed central SKU ${sku}.\nListing deletion API calls executed on: ${channels.join(', ') || 'None'}`);
      deleteModal.classList.remove('active');
    });
  }

  // Single Listing Publisher Form Submit (Automatic redirect to Inventory screen)
  const batchUploadForm = document.getElementById('batch-upload-form');
  if (batchUploadForm) {
    batchUploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = document.getElementById('single-pub-title').value.trim();
      const price = parseFloat(document.getElementById('single-pub-price').value);
      const stock = parseInt(document.getElementById('single-pub-stock').value);
      
      const shopee = document.getElementById('pub-shopee').checked;
      const lazada = document.getElementById('pub-lazada').checked;
      const tiktok = document.getElementById('pub-tiktok').checked;

      const mockSKU = `FIN-PUB-${Math.floor(100 + Math.random() * 900)}`;

      const newItem = { sku: mockSKU, name: title, stock, price, competitors: 0, shopee, lazada, tiktok };
      inventoryItems.unshift(newItem);
      renderInventoryTable();

      let platforms = [];
      if (shopee) platforms.push("Shopee TH");
      if (lazada) platforms.push("Lazada TH");
      if (tiktok) platforms.push("TikTok TH");

      alert(`Success: Single Listing published successfully!\nCreated SKU: ${mockSKU}.\nSynchronized live listings to: ${platforms.join(', ') || 'None'}.\nRedirecting you to the Inventory Catalog page.`);
      batchUploadForm.reset();

      // Auto-transition UI tab to Inventory Mapping panel
      const tabItem = document.querySelector('.sidebar-menu [data-target="panel-inventory"]');
      if (tabItem) {
        tabItem.click();
      }
    });
  }

  // Excel Template drag-drop upload simulator (Automatic redirect to Inventory screen)
  const excelFileInput = document.getElementById('excel-file-input');
  const excelDropZone = document.getElementById('excel-drop-zone');
  const excelDropText = document.getElementById('excel-drop-text');

  if (excelFileInput && excelDropZone) {
    excelFileInput.addEventListener('change', handleExcelUploadSimulation);
    
    excelDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      excelDropZone.style.borderColor = 'var(--color-primary)';
      excelDropZone.style.background = 'rgba(79, 70, 229, 0.05)';
    });

    excelDropZone.addEventListener('dragleave', () => {
      excelDropZone.style.borderColor = 'var(--glass-border)';
      excelDropZone.style.background = 'rgba(255,255,255,0.01)';
    });

    excelDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      excelDropZone.style.borderColor = 'var(--glass-border)';
      excelDropZone.style.background = 'rgba(255,255,255,0.01)';
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        excelFileInput.files = files;
        handleExcelUploadSimulation();
      }
    });
  }

  function handleExcelUploadSimulation() {
    if (!excelDropText) return;
    
    const file = excelFileInput.files[0];
    if (!file) return;

    excelDropText.innerHTML = `<strong>Uploading:</strong> ${file.name}<br><span style="font-size:0.7rem; color:var(--color-primary);">Executing batch synchronization jobs...</span>`;

    setTimeout(() => {
      const shopee = document.getElementById('batch-shopee').checked;
      const lazada = document.getElementById('batch-lazada').checked;
      const tiktok = document.getElementById('batch-tiktok').checked;

      // Inject mock spreadsheet row parses
      const row1 = { sku: 'EXCEL-TSHIRT', name: 'Excel-Parsed Cotton T-Shirt', stock: 320, price: 180, competitors: 3, shopee, lazada, tiktok };
      const row2 = { sku: 'EXCEL-HOODIE', name: 'Excel-Parsed Cozy Hoodie', stock: 75, price: 690, competitors: 7, shopee, lazada, tiktok };

      inventoryItems.unshift(row1, row2);
      renderInventoryTable();

      let platforms = [];
      if (shopee) platforms.push("Shopee TH");
      if (lazada) platforms.push("Lazada TH");
      if (tiktok) platforms.push("TikTok TH");

      alert(`Success: Parsed 2 inventory records from spreadsheet template!\nBatch jobs successfully registered on: ${platforms.join(', ') || 'No platforms (Saved Locally)'}.\nRedirecting you to the Inventory Catalog page.`);
      excelDropText.textContent = "Click to choose Excel spreadsheet";
      excelFileInput.value = '';

      // Auto-transition UI tab to Inventory Mapping panel
      const tabItem = document.querySelector('.sidebar-menu [data-target="panel-inventory"]');
      if (tabItem) {
        tabItem.click();
      }
    }, 1500);
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

  function triggerMFAChallenge() {
    if (loginPanel && mfaPanel) {
      loginPanel.classList.remove('active');
      mfaPanel.classList.add('active');
      startOtpCooldownTimer(60);
      alert('Security Verification Challenge required. Enter 6-digit OTP code.');
    }
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
    const profileListContainer = document.getElementById('active-device-list-profile');
    
    // Render for login page
    if (listContainer) {
      listContainer.innerHTML = '';
      populateContainer(listContainer, 'login');
    }
    
    // Render for profile page
    if (profileListContainer) {
      profileListContainer.innerHTML = '';
      populateContainer(profileListContainer, 'profile');
    }

    function populateContainer(container, prefix) {
      activeSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'device-item';
        item.id = `${prefix}-${session.id}`;

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

        container.appendChild(item);
      });
    }
  }

  // Trigger initial device render
  renderDeviceConsole();

  window.downloadSampleTemplate = function() {
    const headers = "master_sku,product_name,cost_price,selling_price,stock_level,shopee_sku,lazada_sku,tiktok_sku\n" +
                    "FIN-TSHIRT-RED,Premium Cotton Red T-Shirt,120.00,250.00,100,SH-RED-T,LZ-RED-T,TT-RED-T\n" +
                    "FIN-HOODIE-BLK,Classic Warm Black Hoodie,350.00,790.00,50,SH-BLK-H,LZ-BLK-H,TT-BLK-H";
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'fincommerce_batch_template.csv');
    a.click();
  };

  window.revokeSession = function(sessionId) {
    const loginElement = document.getElementById(`login-${sessionId}`);
    const profileElement = document.getElementById(`profile-${sessionId}`);

    if (confirm('Are you sure you want to terminate this session? The device will be signed out immediately.')) {
      if (loginElement) {
        loginElement.style.opacity = '0';
        loginElement.style.transform = 'translateX(50px)';
      }
      if (profileElement) {
        profileElement.style.opacity = '0';
        profileElement.style.transform = 'translateX(50px)';
      }
      
      setTimeout(() => {
        activeSessions = activeSessions.filter(s => s.id !== sessionId);
        renderDeviceConsole();
        alert('Session terminated. WebSocket signal triggered.');
      }, 300);
    }
  };


  // ==========================================
  // SECTION 4: BILLING & CHECKOUT SIMULATOR
  // ==========================================

  const checkoutModal = document.getElementById('checkout-modal');
  const btnCloseCheckout = document.getElementById('checkout-modal-close');
  
  const btnUpgradeBasic = document.getElementById('billing-upgrade-basic');
  const btnUpgradeAdvance = document.getElementById('billing-upgrade-advance');

  const checkoutTitle = document.getElementById('checkout-title');
  const checkoutSubtitle = document.getElementById('checkout-subtitle');

  let selectedCheckoutPlan = '';
  let selectedCheckoutPrice = 0;
  let promptPayTimerInterval = null;

  if (btnUpgradeBasic) {
    btnUpgradeBasic.addEventListener('click', () => openCheckout('Basic', 490));
  }
  if (btnUpgradeAdvance) {
    btnUpgradeAdvance.addEventListener('click', () => openCheckout('Advance', 990));
  }
  if (btnCloseCheckout) {
    btnCloseCheckout.addEventListener('click', closeCheckout);
  }

  function openCheckout(planName, price) {
    selectedCheckoutPlan = planName;
    selectedCheckoutPrice = price;

    if (checkoutTitle && checkoutSubtitle) {
      checkoutTitle.textContent = `Upgrade to ${planName} Plan`;
      checkoutSubtitle.textContent = `Total Due: ฿${price.toFixed(2)} / month`;
    }

    checkoutModal.classList.add('active');
    startPromptPayTimer();
  }

  function closeCheckout() {
    checkoutModal.classList.remove('active');
    if (promptPayTimerInterval) {
      clearInterval(promptPayTimerInterval);
    }
  }

  // Payment method tab switching
  const payTabs = {
    qr: { tab: document.getElementById('pay-tab-qr'), panel: document.getElementById('pay-panel-qr') },
    card: { tab: document.getElementById('pay-tab-card'), panel: document.getElementById('pay-panel-card') },
    bank: { tab: document.getElementById('pay-tab-bank'), panel: document.getElementById('pay-panel-bank') },
    wallet: { tab: document.getElementById('pay-tab-wallet'), panel: document.getElementById('pay-panel-wallet') }
  };

  Object.keys(payTabs).forEach(key => {
    const current = payTabs[key];
    if (current.tab) {
      current.tab.addEventListener('click', () => {
        // Remove active state
        Object.keys(payTabs).forEach(k => {
          payTabs[k].tab?.classList.remove('active');
          payTabs[k].panel?.classList.remove('active');
        });
        // Set current active
        current.tab.classList.add('active');
        current.panel.classList.add('active');
      });
    }
  });

  // PromptPay Countdown Timer and simulation
  function startPromptPayTimer() {
    const timerLabel = document.getElementById('qr-timer-label');
    const statusLabel = document.getElementById('qr-status-label');
    if (!timerLabel || !statusLabel) return;

    let countdown = 60;
    timerLabel.textContent = `Code expires in: ${countdown}s`;
    statusLabel.textContent = `⏳ Listening for transaction notification webhook...`;

    if (promptPayTimerInterval) clearInterval(promptPayTimerInterval);

    promptPayTimerInterval = setInterval(() => {
      countdown--;
      timerLabel.textContent = `Code expires in: ${countdown}s`;

      // Mock dynamic webhook push at 55 seconds remaining (5 seconds in)
      if (countdown === 55) {
        clearInterval(promptPayTimerInterval);
        statusLabel.textContent = `✅ Payment verified via bank API callback!`;
        setTimeout(() => {
          executePlanUpgrade(selectedCheckoutPlan);
        }, 1200);
      }

      if (countdown <= 0) {
        clearInterval(promptPayTimerInterval);
        timerLabel.textContent = `Code expired`;
        statusLabel.textContent = `❌ Transaction timed out. Please try again.`;
      }
    }, 1000);
  }

  function executePlanUpgrade(planName) {
    alert(`Success: Payment Confirmed!\nYour account workspace has been upgraded to the ${planName} Plan.`);
    
    // Update Top Navigation account tier badge
    const badge = document.querySelector('.user-profile-badge');
    if (badge) {
      badge.textContent = `${planName} Tier`;
    }

    // Update Profile Plan details selectors
    const planSelect = document.getElementById('profile-plan-select');
    const paymentSelect = document.getElementById('profile-payment-select');
    if (planSelect) planSelect.value = planName;
    if (paymentSelect) {
      const activeTabId = document.querySelector('#checkout-modal .tab-btn.active')?.id;
      if (activeTabId === 'pay-tab-qr') paymentSelect.value = 'PromptPay';
      else if (activeTabId === 'pay-tab-card') paymentSelect.value = 'Credit Card';
      else if (activeTabId === 'pay-tab-wallet') paymentSelect.value = 'TrueMoney';
      else paymentSelect.value = 'Credit Card';
    }

    // Disable upgrade buttons that were purchased
    const freeBtn = document.getElementById('billing-free-btn');
    const basicBtn = document.getElementById('billing-upgrade-basic');
    const advBtn = document.getElementById('billing-upgrade-advance');

    if (planName === 'Basic') {
      if (basicBtn) {
        basicBtn.disabled = true;
        basicBtn.textContent = 'Current Plan';
      }
      if (advBtn) {
        advBtn.disabled = false;
        advBtn.textContent = 'Upgrade to Advance';
      }
    } else if (planName === 'Advance') {
      if (basicBtn) {
        basicBtn.disabled = true;
        basicBtn.textContent = 'Basic Tier Active';
      }
      if (advBtn) {
        advBtn.disabled = true;
        advBtn.textContent = 'Current Plan';
      }
    }

    closeCheckout();
  }

  // Credit Card Form Submit Simulation
  const cardForm = document.getElementById('card-payment-form');
  if (cardForm) {
    cardForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Authorizing credit card transaction with 2C2P payment gateway...');
      setTimeout(() => {
        executePlanUpgrade(selectedCheckoutPlan);
      }, 1500);
    });
  }

  // Mobile Banking Redirect Simulator
  window.processMockBankRedirect = function(bankName) {
    alert(`Redirection Hook Dispatched: Opening mobile banking interface for ${bankName}...`);
    setTimeout(() => {
      executePlanUpgrade(selectedCheckoutPlan);
    }, 1500);
  };

  // E-Wallet Submit Simulation
  const walletForm = document.getElementById('wallet-payment-form');
  if (walletForm) {
    walletForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const provider = document.getElementById('wallet-provider-select').value;
      alert(`OTP Push Challenge sent to wallet app (${provider}). Approve the payment prompt on your phone.`);
      setTimeout(() => {
        executePlanUpgrade(selectedCheckoutPlan);
      }, 1500);
    });
  }


  // ==========================================
  // SECTION 5: PROFILE & SECURITY CONTROLLER
  // ==========================================

  const profileInfoForm = document.getElementById('profile-info-form');
  if (profileInfoForm) {
    profileInfoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const first = document.getElementById('profile-first-name').value.trim();
      const last = document.getElementById('profile-last-name').value.trim();
      const email = document.getElementById('profile-email').value.trim();
      const phone = document.getElementById('profile-phone').value.trim();
      const company = document.getElementById('profile-company').value.trim();

      alert(`Success: Saved Profile Info!\nName: ${first} ${last}\nEmail: ${email}\nPhone: ${phone}\nCompany: ${company}`);
    });
  }

  // Save Billing Info Option
  const btnSaveBilling = document.getElementById('btn-save-billing');
  if (btnSaveBilling) {
    btnSaveBilling.addEventListener('click', () => {
      const planVal = document.getElementById('profile-plan-select').value;
      const paymentVal = document.getElementById('profile-payment-select').value;

      // Validate payment choice matching active plans
      if (planVal !== 'Free' && paymentVal === 'None') {
        alert('Warning: Please select a valid payment method for your paid postpaid subscription plan.');
        return;
      }

      // Sync Top-nav account badge
      const badge = document.querySelector('.user-profile-badge');
      if (badge) {
        badge.textContent = `${planVal} Tier`;
      }

      alert(`Success: Subscription plan saved!\nBilling Tier: ${planVal} Plan\nPayment Method: ${paymentVal}\nBilling Model: Postpay (Monthly Cycles)`);
    });
  }

  // Cancel Subscription Option
  const btnCancelSub = document.getElementById('btn-cancel-sub');
  if (btnCancelSub) {
    btnCancelSub.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel your paid subscription? You will be downgraded to the Free Tier immediately.')) {
        document.getElementById('profile-plan-select').value = 'Free';
        document.getElementById('profile-payment-select').value = 'None';
        
        // Sync badge
        const badge = document.querySelector('.user-profile-badge');
        if (badge) {
          badge.textContent = `Free Tier`;
        }

        alert('Success: Postpaid subscription cancelled.\nYour merchant workspace has reverted to the Free Tier. Outstanding fees for the active usage cycle will be calculated and invoiced.');
      }
    });
  }

  // Delete Account Option (Conditional)
  const btnDeleteAccountProfile = document.getElementById('btn-delete-account');
  if (btnDeleteAccountProfile) {
    btnDeleteAccountProfile.addEventListener('click', () => {
      const currentPlan = document.getElementById('profile-plan-select').value;

      if (currentPlan !== 'Free') {
        alert('Error: Account deletion blocked.\nYou cannot delete your account while you have an active paid subscription. Please cancel your postpaid subscription first.');
        return;
      }

      if (confirm('Warning: Are you sure you want to permanently delete your FinCommerce merchant account? All warehouse data and mapping records will be purged immediately.')) {
        const passwordPrompt = prompt('Please enter your password to confirm identity and complete account deletion:');
        if (passwordPrompt) {
          alert('Success: Merchant workspace successfully deleted. Redirecting you back to login portal.');
          localStorage.clear();
          // Redirect to login page
          window.location.href = 'index.html';
        }
      }
    });
  }

  // Live password auditor inside profile
  const profileNewPass = document.getElementById('profile-new-pass');
  const profileConfirmPass = document.getElementById('profile-confirm-pass');
  const profileStrengthMsg = document.getElementById('profile-pass-strength-msg');
  const profileBars = [
    document.getElementById('prof-bar-1'),
    document.getElementById('prof-bar-2'),
    document.getElementById('prof-bar-3')
  ];

  if (profileNewPass) {
    profileNewPass.addEventListener('input', () => {
      const pass = profileNewPass.value;
      let score = 0;

      if (pass.length >= 8) score++;
      if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
      if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

      // Auditing against leaked passwords list
      const leakedList = ["password123", "12345678", "qwertyuiop", "admin123", "love1234"];
      const isLeaked = leakedList.includes(pass.toLowerCase());

      profileBars.forEach(bar => { if (bar) bar.style.backgroundColor = '#e2e8f0'; });

      if (pass.length === 0) {
        profileStrengthMsg.textContent = 'Strength: Empty';
        profileStrengthMsg.style.color = 'var(--color-text-muted)';
      } else if (isLeaked) {
        profileStrengthMsg.textContent = '⚠️ CRITICAL: Password found in public breaches!';
        profileStrengthMsg.style.color = 'var(--color-error)';
        if (profileBars[0]) profileBars[0].style.backgroundColor = 'var(--color-error)';
      } else if (score === 1) {
        profileStrengthMsg.textContent = 'Weak';
        profileStrengthMsg.style.color = 'var(--color-error)';
        if (profileBars[0]) profileBars[0].style.backgroundColor = 'var(--color-error)';
      } else if (score === 2) {
        profileStrengthMsg.textContent = 'Fair';
        profileStrengthMsg.style.color = 'var(--color-warning)';
        if (profileBars[0]) profileBars[0].style.backgroundColor = 'var(--color-warning)';
        if (profileBars[1]) profileBars[1].style.backgroundColor = 'var(--color-warning)';
      } else if (score === 3) {
        profileStrengthMsg.textContent = 'Strong';
        profileStrengthMsg.style.color = 'var(--color-success)';
        profileBars.forEach(bar => { if (bar) bar.style.backgroundColor = 'var(--color-success)'; });
      }
    });
  }

  const profilePasswordForm = document.getElementById('profile-password-form');
  if (profilePasswordForm) {
    profilePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nPass = profileNewPass.value;
      const cPass = profileConfirmPass.value;

      const leakedList = ["password123", "12345678", "qwertyuiop", "admin123", "love1234"];
      if (leakedList.includes(nPass.toLowerCase())) {
        alert('Security Block: Password has been leaked in public breaches. Choose a secure alternative.');
        return;
      }

      if (nPass !== cPass) {
        alert('Error: Confirm password does not match.');
        return;
      }

      alert('Success: Credentials updated successfully! WebSocket tokens regenerated.');
      profilePasswordForm.reset();
      profileStrengthMsg.textContent = 'Strength: Empty';
      profileStrengthMsg.style.color = 'var(--color-text-muted)';
      profileBars.forEach(bar => { if (bar) bar.style.backgroundColor = '#e2e8f0'; });
    });
  }


  // ==========================================
  // SECTION 6: IN-APP AI HELP CHATBOT
  // ==========================================

  const chatbotBubble = document.getElementById('chatbot-bubble');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotForm = document.getElementById('chatbot-input-form');
  const chatbotInput = document.getElementById('chatbot-text-input');
  const chatbotMessages = document.getElementById('chatbot-messages');

  if (chatbotBubble && chatbotWindow) {
    chatbotBubble.addEventListener('click', () => {
      const isVisible = chatbotWindow.style.display === 'flex';
      chatbotWindow.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible && chatbotMessages) {
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
      }
    });
  }

  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      chatbotWindow.style.display = 'none';
    });
  }

  if (chatbotForm) {
    chatbotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = chatbotInput.value.trim();
      if (!q) return;

      // Append User message
      appendChatMessage(q, 'user');
      chatbotInput.value = '';

      // Generate bot response
      setTimeout(() => {
        const botResponse = generateBotAnswer(q);
        appendChatMessage(botResponse, 'bot');
      }, 500);
    });
  }

  function appendChatMessage(text, sender) {
    if (!chatbotMessages) return;

    const div = document.createElement('div');
    if (sender === 'user') {
      div.style.background = 'var(--color-primary)';
      div.style.color = '#ffffff';
      div.style.padding = '0.6rem 0.8rem';
      div.style.borderRadius = '12px 12px 0 12px';
      div.style.maxWidth = '85%';
      div.style.alignSelf = 'flex-end';
      div.style.lineHeight = '1.3';
    } else {
      div.style.background = '#e2e8f0';
      div.style.color = 'var(--color-text-main)';
      div.style.padding = '0.6rem 0.8rem';
      div.style.borderRadius = '12px 12px 12px 0';
      div.style.maxWidth = '85%';
      div.style.alignSelf = 'flex-start';
      div.style.lineHeight = '1.3';
    }

    div.innerHTML = text;
    chatbotMessages.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function generateBotAnswer(query) {
    const text = query.toLowerCase();

    if (text.includes('batch') || text.includes('excel') || text.includes('bulk') || text.includes('csv') || text.includes('template')) {
      return `<strong>Bulk Excel Upload Guide:</strong><br>
              1. Go to the <strong>Batch Upload Listing</strong> tab.<br>
              2. Download the empty template using the <strong>Download Template (.csv)</strong> button.<br>
              3. Populate your rows (headers: <code>master_sku</code>, <code>product_name</code>, <code>stock_level</code>, <code>selling_price</code>).<br>
              4. Configure your sync shops check boxes, then drop the sheet in the upload block.`;
    }

    if (text.includes('manual') || text.includes('upload') || text.includes('create') || text.includes('publish') || text.includes('single')) {
      return `<strong>Manual Product Publishing:</strong><br>
              1. Go to the <strong>Stock & SKU Mappings</strong> tab.<br>
              2. Locate the <strong>Multi-Channel Publisher</strong> form card on the right side.<br>
              3. Enter title, stock count, and price.<br>
              4. Select platforms (Shopee, Lazada, TikTok Shop) and click <strong>Publish</strong>.`;
    }

    if (text.includes('connect') || text.includes('shopee') || text.includes('lazada') || text.includes('tiktok') || text.includes('oauth')) {
      return `<strong>Connecting Platform Stores:</strong><br>
              1. Navigate to the <strong>Channel Connections</strong> tab.<br>
              2. Click <strong>Re-auth Store</strong> beside Shopee, Lazada, or TikTok Shop.<br>
              3. Follow the secure OAuth gateway to log in and authorize sync scopes.`;
    }

    if (text.includes('delete') || text.includes('retract') || text.includes('remove')) {
      return `<strong>Retracting Products:</strong><br>
              1. Go to <strong>Stock & SKU Mappings</strong>.<br>
              2. Click the 🗑️ <strong>Del</strong> button next to the SKU row.<br>
              3. Check the shop checkboxes if you wish to automatically retract listings from connected shops, and confirm.`;
    }

    if (text.includes('plan') || text.includes('price') || text.includes('billing') || text.includes('subscription')) {
      return `<strong>Pricing Plans & Billing:</strong><br>
              We offer three tiers:
              <br>• <strong>Free</strong>: 1 shop, 10 SKUs
              <br>• <strong>Basic (฿490/mo)</strong>: 3 shops, 500 SKUs
              <br>• <strong>Advance (฿990/mo)</strong>: Unlimited shops, unlimited SKUs.
              <br>Go to the <strong>Billing & Plans</strong> tab to select and pay.`;
    }

    return `I'm not sure I understand. I can help you with:<br>
            • <em>"how to batch upload"</em><br>
            • <em>"how to publish manually"</em><br>
            • <em>"how to connect stores"</em><br>
            • <em>"pricing plans"</em>`;
  }

  // ==========================================
  // SECTION 7: PAYMENT/PAYOUT TRACKING LEDGER
  // ==========================================

  let payoutLedgerItems = [
    { orderId: 'ORD-2026-9901', platform: 'Shopee', payoutDate: '2026-07-18', gross: 550.00, fees: 38.50, status: 'Settled' },
    { orderId: 'ORD-2026-9902', platform: 'Lazada', payoutDate: '2026-07-20', gross: 1200.00, fees: 96.00, status: 'Pending' },
    { orderId: 'ORD-2026-9903', platform: 'TikTok', payoutDate: '2026-07-21', gross: 450.00, fees: 22.50, status: 'Pending' },
    { orderId: 'ORD-2026-9904', platform: 'Shopee', payoutDate: '2026-07-22', gross: 890.00, fees: 62.30, status: 'Pending' },
    { orderId: 'ORD-2026-9905', platform: 'Lazada', payoutDate: '2026-07-15', gross: 1500.00, fees: 120.00, status: 'Settled' },
    { orderId: 'ORD-2026-9906', platform: 'TikTok', payoutDate: '2026-07-23', gross: 690.00, fees: 34.50, status: 'On Hold' },
    { orderId: 'ORD-2026-9907', platform: 'Shopee', payoutDate: '2026-07-24', gross: 310.00, fees: 21.70, status: 'Pending' }
  ];

  const ledgerTableBody = document.getElementById('ledger-table-body');
  const ledgerSearch = document.getElementById('ledger-search');
  const ledgerStatusFilter = document.getElementById('ledger-status-filter');
  
  const ledgerFilterShopee = document.getElementById('ledger-filter-shopee');
  const ledgerFilterLazada = document.getElementById('ledger-filter-lazada');
  const ledgerFilterTiktok = document.getElementById('ledger-filter-tiktok');
  
  const ledgerPendingAmount = document.getElementById('ledger-pending-amount');

  function renderPayoutLedger(items = payoutLedgerItems) {
    if (!ledgerTableBody) return;
    ledgerTableBody.innerHTML = '';

    if (items.length === 0) {
      ledgerTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--color-text-muted);">No transaction payouts match criteria.</td></tr>`;
      return;
    }

    items.forEach(item => {
      const net = item.gross - item.fees;
      const tr = document.createElement('tr');

      let statusBadge = '';
      if (item.status === 'Settled') {
        statusBadge = `<span class="status-badge" style="background: rgba(16, 185, 129, 0.1); color: var(--color-success); border-color: rgba(16, 185, 129, 0.2); font-weight:600; font-size:0.7rem; padding:0.2rem 0.4rem; border-radius:6px;">Settled</span>`;
      } else if (item.status === 'Pending') {
        statusBadge = `<span class="status-badge" style="background: rgba(245, 158, 11, 0.1); color: var(--color-warning); border-color: rgba(245, 158, 11, 0.2); font-weight:600; font-size:0.7rem; padding:0.2rem 0.4rem; border-radius:6px;">Pending</span>`;
      } else {
        statusBadge = `<span class="status-badge" style="background: rgba(239, 68, 68, 0.1); color: var(--color-error); border-color: rgba(239, 68, 68, 0.2); font-weight:600; font-size:0.7rem; padding:0.2rem 0.4rem; border-radius:6px;">On Hold</span>`;
      }

      tr.innerHTML = `
        <td style="font-weight:600; color:var(--color-text-main);">${item.orderId}</td>
        <td style="font-weight:500;">${item.platform} TH</td>
        <td>${item.payoutDate}</td>
        <td>฿${item.gross.toFixed(2)}</td>
        <td style="color:var(--color-error);">-฿${item.fees.toFixed(2)}</td>
        <td style="font-weight:600; color:var(--color-success);">฿${net.toFixed(2)}</td>
        <td style="text-align: center;">${statusBadge}</td>
      `;

      ledgerTableBody.appendChild(tr);
    });

    // Re-aggregate pending payouts sum based on filtered rows
    let pendingSum = 0;
    items.forEach(item => {
      if (item.status === 'Pending') {
        pendingSum += (item.gross - item.fees);
      }
    });
    if (ledgerPendingAmount) {
      ledgerPendingAmount.textContent = '฿' + pendingSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  }

  function filterLedger() {
    const query = ledgerSearch ? ledgerSearch.value.trim().toLowerCase() : '';
    const statusVal = ledgerStatusFilter ? ledgerStatusFilter.value : 'ALL';
    
    const showShopee = ledgerFilterShopee ? ledgerFilterShopee.checked : true;
    const showLazada = ledgerFilterLazada ? ledgerFilterLazada.checked : true;
    const showTiktok = ledgerFilterTiktok ? ledgerFilterTiktok.checked : true;

    const filtered = payoutLedgerItems.filter(item => {
      const matchQuery = item.orderId.toLowerCase().includes(query);
      const matchStatus = (statusVal === 'ALL' || item.status === statusVal);
      
      let matchPlatform = false;
      if (item.platform === 'Shopee' && showShopee) matchPlatform = true;
      if (item.platform === 'Lazada' && showLazada) matchPlatform = true;
      if (item.platform === 'TikTok' && showTiktok) matchPlatform = true;

      return matchQuery && matchStatus && matchPlatform;
    });

    renderPayoutLedger(filtered);
  }

  if (ledgerSearch) ledgerSearch.addEventListener('input', filterLedger);
  if (ledgerStatusFilter) ledgerStatusFilter.addEventListener('change', filterLedger);
  if (ledgerFilterShopee) ledgerFilterShopee.addEventListener('change', filterLedger);
  if (ledgerFilterLazada) ledgerFilterLazada.addEventListener('change', filterLedger);
  if (ledgerFilterTiktok) ledgerFilterTiktok.addEventListener('change', filterLedger);

  // Initial ledger rendering
  renderPayoutLedger();


  // ==========================================
  // SECTION 8: DAILY SHIPPING & RETURNS LEDGER
  // ==========================================

  // Outbound Mock Data
  let shippingItems = [
    { 
      orderId: 'ORD-2026-9901', platform: 'Shopee', carrier: 'Flash Express', trackingCode: 'TH-FL-8890281', 
      lastCheckpoint: 'Delivered - Signed by customer', status: 'Delivered',
      milestones: [
        { time: '2026-07-16 14:30', detail: 'Delivered successfully. Receiver: Suchart S.' },
        { time: '2026-07-16 09:15', detail: 'Out for delivery with Flash rider Somchai P.' },
        { time: '2026-07-15 21:00', detail: 'Arrived at Bangkok Lak Si Sorting Hub.' },
        { time: '2026-07-14 18:00', detail: 'Package picked up from merchant warehouse.' }
      ]
    },
    { 
      orderId: 'ORD-2026-9902', platform: 'Lazada', carrier: 'J&T Express', trackingCode: 'JT-TH-0028941', 
      lastCheckpoint: 'Out for Delivery - On courier route', status: 'Out for Delivery',
      milestones: [
        { time: '2026-07-16 08:30', detail: 'Out for delivery with J&T rider.' },
        { time: '2026-07-15 23:45', detail: 'Arrived at distribution station Nonthaburi.' },
        { time: '2026-07-15 13:00', detail: 'Parcel picked up by courier.' }
      ]
    },
    { 
      orderId: 'ORD-2026-9903', platform: 'TikTok', carrier: 'Kerry Logistics', trackingCode: 'KER-TH-8890182', 
      lastCheckpoint: 'In Transit - Arrived at Central Hub', status: 'In Transit',
      milestones: [
        { time: '2026-07-16 11:20', detail: 'Arrived at Central Sorting Hub (Bangkok).' },
        { time: '2026-07-15 17:30', detail: 'Dispatched from origin warehouse.' },
        { time: '2026-07-15 11:00', detail: 'Courier pickup scheduled.' }
      ]
    },
    { 
      orderId: 'ORD-2026-9904', platform: 'Shopee', carrier: 'Ninja Van', trackingCode: 'NJV-TH-7789012', 
      lastCheckpoint: 'Pending Pickup - Manifest created', status: 'Pending Pickup',
      milestones: [
        { time: '2026-07-16 09:00', detail: 'Shipment manifest registered. Pending pickup handover.' }
      ]
    },
    { 
      orderId: 'ORD-2026-9905', platform: 'Lazada', carrier: 'Flash Express', trackingCode: 'TH-FL-1102983', 
      lastCheckpoint: 'Delivered - Left at receptionist', status: 'Delivered',
      milestones: [
        { time: '2026-07-16 12:15', detail: 'Delivered successfully. Left at lobby frontdesk.' },
        { time: '2026-07-15 08:00', detail: 'Out for delivery.' },
        { time: '2026-07-14 20:00', detail: 'Arrived at hub.' }
      ]
    },
    { 
      orderId: 'ORD-2026-9906', platform: 'TikTok', carrier: 'J&T Express', trackingCode: 'JT-TH-9902810', 
      lastCheckpoint: 'Failed - Delivery exception: Closed business', status: 'Failed / Returned',
      milestones: [
        { time: '2026-07-16 15:40', detail: 'Delivery failed: Business closed. Will re-attempt.' }
      ]
    }
  ];

  // Inbound Customer Returns Mock Data
  let returnsLedgerItems = [
    { 
      orderId: 'ORD-2026-9902', platform: 'Lazada', item: 'Premium Cotton Red T-Shirt x1', sku: 'FIN-TSHIRT-RED', 
      reason: 'Wrong size selected', carrierCode: 'J&T (RET-JT-902)', status: 'In Transit' 
    },
    { 
      orderId: 'ORD-2026-9906', platform: 'TikTok', item: 'Classic Warm Black Hoodie x1', sku: 'FIN-HOODIE-BLK', 
      reason: 'Defective zipper', carrierCode: 'Flash (RET-FL-104)', status: 'Awaiting Inspection' 
    },
    { 
      orderId: 'ORD-2026-9907', platform: 'Shopee', item: 'Premium Cotton Red T-Shirt x1', sku: 'FIN-TSHIRT-RED', 
      reason: 'Damaged package', carrierCode: 'Kerry (RET-KE-552)', status: 'Awaiting Inspection' 
    }
  ];

  // Selectors
  const shipSubtabOutbound = document.getElementById('ship-subtab-outbound');
  const shipSubtabReturns = document.getElementById('ship-subtab-returns');
  const shipViewOutbound = document.getElementById('ship-view-outbound');
  const shipViewReturns = document.getElementById('ship-view-returns');

  const shipTableBody = document.getElementById('ship-table-body');
  const returnsTableBody = document.getElementById('returns-table-body');

  const shipSearch = document.getElementById('ship-search');
  const shipCarrierFilter = document.getElementById('ship-carrier-filter');
  const shipFilterShopee = document.getElementById('ship-filter-shopee');
  const shipFilterLazada = document.getElementById('ship-filter-lazada');
  const shipFilterTiktok = document.getElementById('ship-filter-tiktok');

  // Subtab switching
  if (shipSubtabOutbound && shipSubtabReturns) {
    shipSubtabOutbound.addEventListener('click', () => {
      shipSubtabOutbound.classList.add('active');
      shipSubtabReturns.classList.remove('active');
      shipViewOutbound.classList.add('active');
      shipViewReturns.classList.remove('active');
    });

    shipSubtabReturns.addEventListener('click', () => {
      shipSubtabReturns.classList.add('active');
      shipSubtabOutbound.classList.remove('active');
      shipViewReturns.classList.add('active');
      shipViewOutbound.classList.remove('active');
    });
  }

  // Renders Outbound shipping grid
  function renderShippingProgress(items = shippingItems) {
    if (!shipTableBody) return;
    shipTableBody.innerHTML = '';

    if (items.length === 0) {
      shipTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--color-text-muted);">No outbound shipments match criteria.</td></tr>`;
      return;
    }

    items.forEach(item => {
      const tr = document.createElement('tr');
      let badgeStyle = "background: rgba(245, 158, 11, 0.1); color: var(--color-warning);";
      if (item.status === 'Delivered') badgeStyle = "background: rgba(16, 185, 129, 0.1); color: var(--color-success);";
      else if (item.status === 'Failed / Returned') badgeStyle = "background: rgba(239, 68, 68, 0.1); color: var(--color-error);";
      else if (item.status === 'Out for Delivery') badgeStyle = "background: rgba(139, 92, 246, 0.1); color: #8b5cf6;";
      else if (item.status === 'Pending Pickup') badgeStyle = "background: rgba(59, 130, 246, 0.1); color: #3b82f6;";

      tr.innerHTML = `
        <td style="font-weight:600; color:var(--color-text-main);">${item.orderId}</td>
        <td>${item.platform} TH</td>
        <td>${item.carrier}</td>
        <td style="font-family:monospace; font-weight:500;">${item.trackingCode}</td>
        <td style="font-size:0.7rem; color:var(--color-text-muted);">${item.lastCheckpoint}</td>
        <td style="text-align:center;"><span class="status-badge" style="${badgeStyle} border-radius:6px; padding:0.2rem 0.4rem; font-weight:600; font-size:0.65rem;">${item.status}</span></td>
        <td style="text-align:center;"><button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.65rem; margin:0;" onclick="trackParcel('${item.orderId}')">Track</button></td>
      `;
      shipTableBody.appendChild(tr);
    });

    // Recalculate metrics
    let transit = 0;
    let out = 0;
    let deliv = 0;
    items.forEach(item => {
      if (item.status === 'In Transit' || item.status === 'Pending Pickup') transit++;
      if (item.status === 'Out for Delivery') out++;
      if (item.status === 'Delivered') deliv++;
    });

    document.getElementById('ship-transit-count').textContent = transit;
    document.getElementById('ship-outfordelivery-count').textContent = out;
    document.getElementById('ship-delivered-count').textContent = deliv;
  }

  // Renders Inbound returns grid
  function renderReturnsLedger() {
    if (!returnsTableBody) return;
    returnsTableBody.innerHTML = '';

    if (returnsLedgerItems.length === 0) {
      returnsTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--color-text-muted);">No customer return records.</td></tr>`;
      return;
    }

    returnsLedgerItems.forEach(item => {
      const tr = document.createElement('tr');
      let statusStyle = "background: rgba(245, 158, 11, 0.1); color: var(--color-warning);";
      if (item.status === 'Refund Processed') statusStyle = "background: rgba(16, 185, 129, 0.1); color: var(--color-success);";
      else if (item.status === 'Rejected') statusStyle = "background: rgba(239, 68, 68, 0.1); color: var(--color-error);";

      let actionButton = '';
      if (item.status === 'Awaiting Inspection') {
        actionButton = `<button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.65rem; margin:0; background:var(--color-secondary); border-color:var(--color-secondary);" onclick="openReturnInspection('${item.orderId}')">Inspect & Process</button>`;
      } else {
        actionButton = `<span style="font-size:0.65rem; color:var(--color-text-muted);">Audit Complete</span>`;
      }

      tr.innerHTML = `
        <td style="font-weight:600; color:var(--color-text-main);">${item.orderId}</td>
        <td>${item.platform} TH</td>
        <td style="font-weight:500;">${item.item}</td>
        <td style="font-size:0.7rem; color:var(--color-error);">${item.reason}</td>
        <td style="font-family:monospace; font-size:0.7rem;">${item.carrierCode}</td>
        <td><span class="status-badge" style="${statusStyle} border-radius:6px; padding:0.2rem 0.4rem; font-weight:600; font-size:0.65rem;">${item.status}</span></td>
        <td style="text-align:center;">${actionButton}</td>
      `;
      returnsTableBody.appendChild(tr);
    });

    // Update returns metrics
    let pendInspect = 0;
    let returnsTransit = 0;
    let refunded = 0;
    returnsLedgerItems.forEach(item => {
      if (item.status === 'Awaiting Inspection') pendInspect++;
      if (item.status === 'In Transit') returnsTransit++;
      if (item.status === 'Refund Processed') refunded++;
    });

    document.getElementById('returns-pending-count').textContent = pendInspect;
    document.getElementById('returns-transit-count').textContent = returnsTransit;
    document.getElementById('returns-refunded-count').textContent = refunded;
  }

  // Opens timeline parcel tracking modal
  window.trackParcel = function(orderId) {
    const item = shippingItems.find(s => s.orderId === orderId);
    if (!item) return;

    document.getElementById('track-modal-code').textContent = item.trackingCode;
    document.getElementById('track-modal-carrier').textContent = item.carrier;
    
    const badgeContainer = document.getElementById('track-modal-status-badge');
    let statusText = item.status;
    let badgeStyle = "background: rgba(245, 158, 11, 0.1); color: var(--color-warning);";
    if (item.status === 'Delivered') badgeStyle = "background: rgba(16, 185, 129, 0.1); color: var(--color-success);";
    else if (item.status === 'Failed / Returned') badgeStyle = "background: rgba(239, 68, 68, 0.1); color: var(--color-error);";
    else if (item.status === 'Out for Delivery') badgeStyle = "background: rgba(139, 92, 246, 0.1); color: #8b5cf6;";
    else if (item.status === 'Pending Pickup') badgeStyle = "background: rgba(59, 130, 246, 0.1); color: #3b82f6;";

    badgeContainer.innerHTML = `<span class="status-badge" style="${badgeStyle} font-weight: 600; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 8px;">${statusText}</span>`;

    const timelineContainer = document.getElementById('track-modal-timeline');
    timelineContainer.innerHTML = '';

    item.milestones.forEach((m, idx) => {
      const step = document.createElement('div');
      step.style.position = 'relative';
      step.style.marginBottom = '0.5rem';

      const dotColor = idx === 0 ? 'var(--color-primary)' : '#cbd5e1';
      const dot = `<span style="position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: ${dotColor}; border: 2px solid #fff;"></span>`;

      step.innerHTML = `
        ${dot}
        <div style="font-size:0.65rem; color:var(--color-text-muted); font-weight:600;">${m.time}</div>
        <div style="font-size:0.75rem; color:var(--color-text-main); font-weight:${idx === 0 ? '600' : '400'}; margin-top:0.15rem;">${m.detail}</div>
      `;
      timelineContainer.appendChild(step);
    });

    document.getElementById('shipping-track-modal').classList.add('active');
  };

  // Close timeline modal
  const shipTrackClose = document.getElementById('shipping-track-close');
  if (shipTrackClose) {
    shipTrackClose.addEventListener('click', () => {
      document.getElementById('shipping-track-modal').classList.remove('active');
    });
  }

  // Opens return quality inspection modal
  let activeInspectOrderId = '';
  window.openReturnInspection = function(orderId) {
    const item = returnsLedgerItems.find(r => r.orderId === orderId);
    if (!item) return;

    activeInspectOrderId = orderId;
    document.getElementById('inspect-modal-order').textContent = item.orderId;
    document.getElementById('inspect-modal-item').textContent = item.item;
    document.getElementById('inspect-modal-reason').textContent = item.reason;

    // Reset checklist boxes
    document.getElementById('chk-inspect-packaging').checked = false;
    document.getElementById('chk-inspect-sku').checked = false;
    document.getElementById('chk-inspect-wear').checked = false;

    document.getElementById('return-inspect-modal').classList.add('active');
  };

  // Close inspection modal
  const returnInspectClose = document.getElementById('return-inspect-close');
  if (returnInspectClose) {
    returnInspectClose.addEventListener('click', () => {
      document.getElementById('return-inspect-modal').classList.remove('active');
    });
  }

  // Verification Form Submit (Approve & Restock)
  const returnVerificationForm = document.getElementById('return-verification-form');
  if (returnVerificationForm) {
    returnVerificationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const item = returnsLedgerItems.find(r => r.orderId === activeInspectOrderId);
      if (!item) return;

      // Update return ledger status
      item.status = 'Refund Processed';

      // restock inventory items dynamically
      const targetSku = item.sku;
      const invItem = inventoryItems.find(i => i.sku === targetSku);
      if (invItem) {
        invItem.stock = invItem.stock + 1;
        renderInventoryTable();
        alert(`Verification Passed!\nRefund of order has been processed to customer.\n1 unit of "${invItem.name}" restocked to inventory successfully (New stock: ${invItem.stock}).`);
      } else {
        alert('Verification Passed! Refund of order processed.');
      }

      document.getElementById('return-inspect-modal').classList.remove('active');
      renderReturnsLedger();
    });
  }

  // Reject Claim button click
  const btnRejectReturn = document.getElementById('btn-reject-return');
  if (btnRejectReturn) {
    btnRejectReturn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reject this return claim? Customer will be notified of packaging dispute.')) {
        const item = returnsLedgerItems.find(r => r.orderId === activeInspectOrderId);
        if (item) {
          item.status = 'Rejected';
        }
        document.getElementById('return-inspect-modal').classList.remove('active');
        renderReturnsLedger();
        alert('Claim Rejected. Return package flagged for dispute resolution.');
      }
    });
  }

  // Outbound filter logic
  function filterShipping() {
    const query = shipSearch ? shipSearch.value.trim().toLowerCase() : '';
    const carrierVal = shipCarrierFilter ? shipCarrierFilter.value : 'ALL';
    const showShopee = shipFilterShopee ? shipFilterShopee.checked : true;
    const showLazada = shipFilterLazada ? shipFilterLazada.checked : true;
    const showTiktok = shipFilterTiktok ? shipFilterTiktok.checked : true;

    const filtered = shippingItems.filter(item => {
      const matchQuery = item.orderId.toLowerCase().includes(query) || item.trackingCode.toLowerCase().includes(query);
      const matchCarrier = (carrierVal === 'ALL' || item.carrier === carrierVal);
      
      let matchPlatform = false;
      if (item.platform === 'Shopee' && showShopee) matchPlatform = true;
      if (item.platform === 'Lazada' && showLazada) matchPlatform = true;
      if (item.platform === 'TikTok' && showTiktok) matchPlatform = true;

      return matchQuery && matchCarrier && matchPlatform;
    });

    renderShippingProgress(filtered);
  }

  if (shipSearch) shipSearch.addEventListener('input', filterShipping);
  if (shipCarrierFilter) shipCarrierFilter.addEventListener('change', filterShipping);
  if (shipFilterShopee) shipFilterShopee.addEventListener('change', filterShipping);
  if (shipFilterLazada) shipFilterLazada.addEventListener('change', filterShipping);
  if (shipFilterTiktok) shipFilterTiktok.addEventListener('change', filterShipping);

  // Initial renders
  renderShippingProgress();
  renderReturnsLedger();


  // ==========================================
  // SECTION 9: ORDER MANAGEMENT PORTAL
  // ==========================================

  let ordersList = [
    { orderId: 'ORD-2026-9901', customerName: 'Somchai Prasert', platform: 'Shopee', orderDate: '2026-07-16 10:15', amount: 550.00, paymentMethod: 'PromptPay', status: 'New Order', selected: false },
    { orderId: 'ORD-2026-9902', customerName: 'Anchalee S.', platform: 'Lazada', orderDate: '2026-07-16 11:30', amount: 1200.00, paymentMethod: 'Credit Card', status: 'New Order', selected: false },
    { orderId: 'ORD-2026-9903', customerName: 'Suchart Suksamran', platform: 'TikTok', orderDate: '2026-07-16 12:45', amount: 450.00, paymentMethod: 'TrueMoney', status: 'New Order', selected: false },
    { orderId: 'ORD-2026-9904', customerName: 'Phaisarn P.', platform: 'Shopee', orderDate: '2026-07-15 14:00', amount: 890.00, paymentMethod: 'PromptPay', status: 'Ready to Ship', selected: false },
    { orderId: 'ORD-2026-9905', customerName: 'Nipon K.', platform: 'Lazada', orderDate: '2026-07-15 16:30', amount: 1500.00, paymentMethod: 'Credit Card', status: 'Shipped', selected: false },
    { orderId: 'ORD-2026-9906', customerName: 'Vichai L.', platform: 'TikTok', orderDate: '2026-07-15 17:15', amount: 690.00, paymentMethod: 'PromptPay', status: 'Cancelled', selected: false }
  ];

  const platformCancelReasons = {
    'Shopee': [
      { code: 'OUT_OF_STOCK', text: 'Out of Stock (สินค้าหมด)' },
      { code: 'CUSTOMER_REQUEST', text: 'Customer Request (ลูกค้าขอยกเลิก)' },
      { code: 'DELIVERY_LIMITATION', text: 'Delivery Area Restriction (พื้นที่จัดส่งไม่รองรับ)' }
    ],
    'Lazada': [
      { code: 'OUT_OF_STOCK', text: 'Out of Stock (สินค้าหมด)' },
      { code: 'SOURCING_DELAY', text: 'Sourcing Delay (จัดส่งล่าช้า)' },
      { code: 'PRICING_ERROR', text: 'Pricing Error (ราคาผิดพลาด)' }
    ],
    'TikTok': [
      { code: 'OUT_OF_STOCK', text: 'Out of Stock (สินค้าหมด)' },
      { code: 'COURIER_FAILURE', text: 'Courier Pick-up Failure (ขนส่งไม่เข้ารับ)' },
      { code: 'ADDRESS_ERROR', text: 'Customer Address Error (ที่อยู่ลูกค้าไม่ถูกต้อง)' }
    ]
  };

  const ordersTableBody = document.getElementById('orders-table-body');
  const orderSearch = document.getElementById('order-search');
  const orderStatusFilter = document.getElementById('order-status-filter');
  const ordersSelectAll = document.getElementById('orders-select-all');

  const orderPrintConsole = document.getElementById('order-print-console');
  const orderPrintLogLines = document.getElementById('order-print-log-lines');
  const closePrintConsole = document.getElementById('close-print-console');

  const btnAcceptSelected = document.getElementById('btn-accept-selected');
  const btnPrintAwb = document.getElementById('btn-print-awb');
  const btnPrintInvoice = document.getElementById('btn-print-invoice');
  const btnPrintPicklist = document.getElementById('btn-print-picklist');

  const cancelOrderModal = document.getElementById('cancel-order-modal');
  const cancelOrderClose = document.getElementById('cancel-order-close');
  const btnCancelModalClose = document.getElementById('btn-cancel-modal-close');
  const cancelOrderReasonForm = document.getElementById('cancel-order-reason-form');
  const cancelReasonSelect = document.getElementById('cancel-reason-select');

  let activeCancelOrderId = '';

  function renderOrdersTable(items = ordersList) {
    if (!ordersTableBody) return;
    ordersTableBody.innerHTML = '';

    if (items.length === 0) {
      ordersTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:1.5rem; color:var(--color-text-muted);">No orders found matching criteria.</td></tr>`;
      return;
    }

    items.forEach(item => {
      const tr = document.createElement('tr');
      
      let statusStyle = "background: rgba(59, 130, 246, 0.1); color: #3b82f6;";
      if (item.status === 'Ready to Ship') statusStyle = "background: rgba(245, 158, 11, 0.1); color: var(--color-warning);";
      else if (item.status === 'Shipped') statusStyle = "background: rgba(16, 185, 129, 0.1); color: var(--color-success);";
      else if (item.status === 'Cancelled') statusStyle = "background: rgba(239, 68, 68, 0.1); color: var(--color-error);";

      let actionButtons = '';
      if (item.status === 'New Order') {
        actionButtons = `
          <button class="btn btn-primary" style="padding:0.2rem 0.4rem; font-size:0.65rem; margin:0;" onclick="acceptOrder('${item.orderId}')">Accept</button>
          <button class="btn" style="padding:0.2rem 0.4rem; font-size:0.65rem; margin:0; background:var(--color-error); color:#fff; border:none;" onclick="cancelOrder('${item.orderId}')">Cancel</button>
        `;
      } else if (item.status === 'Ready to Ship') {
        actionButtons = `
          <button class="btn" style="padding:0.2rem 0.4rem; font-size:0.65rem; margin:0; background:var(--color-error); color:#fff; border:none;" onclick="cancelOrder('${item.orderId}')">Cancel</button>
        `;
      } else {
        actionButtons = `<span style="font-size:0.65rem; color:var(--color-text-muted);">Processed</span>`;
      }

      tr.innerHTML = `
        <td style="text-align:center;"><input type="checkbox" class="order-select-checkbox" data-id="${item.orderId}" ${item.selected ? 'checked' : ''}></td>
        <td style="font-weight:600; color:var(--color-text-main);">${item.orderId}</td>
        <td>${item.customerName}</td>
        <td>${item.platform} TH</td>
        <td>${item.orderDate}</td>
        <td>฿${item.amount.toFixed(2)}</td>
        <td>${item.paymentMethod}</td>
        <td><span class="status-badge" style="${statusStyle} border-radius:6px; padding:0.2rem 0.4rem; font-weight:600; font-size:0.65rem;">${item.status}</span></td>
        <td style="text-align:center; display:flex; gap:0.25rem; justify-content:center;">${actionButtons}</td>
      `;

      // Bind checkbox event inside loop
      const chk = tr.querySelector('.order-select-checkbox');
      if (chk) {
        chk.addEventListener('change', () => {
          item.selected = chk.checked;
        });
      }

      ordersTableBody.appendChild(tr);
    });
  }

  // Accept single order (syncs API)
  window.acceptOrder = function(orderId) {
    const order = ordersList.find(o => o.orderId === orderId);
    if (!order) return;

    let apiPath = '';
    let payload = {};
    if (order.platform === 'Shopee') {
      apiPath = 'POST /api/v1/shopee/orders/accept';
      payload = { order_id: orderId, action: 'CONFIRM_SHIPPED' };
    } else if (order.platform === 'Lazada') {
      apiPath = 'POST /api/v1/lazada/orders/pack';
      payload = { order_id: orderId, packaging_type: 'BOX_MEDIUM', carrier: 'LEL Express' };
    } else {
      apiPath = 'POST /api/v1/tiktok/orders/rts';
      payload = { order_id: orderId, handover_method: 'PICKUP' };
    }

    // Sync API log mockup
    alert(`[API Sync - ${order.platform} Open API]\nPath: ${apiPath}\nPayload: ${JSON.stringify(payload)}\n\nOrder accepted successfully and synced to platform!`);
    
    order.status = 'Ready to Ship';
    filterOrders();
  };

  // Accept multiple selected orders
  if (btnAcceptSelected) {
    btnAcceptSelected.addEventListener('click', () => {
      const selected = ordersList.filter(o => o.selected && o.status === 'New Order');
      if (selected.length === 0) {
        alert('Please select one or more "New Order" items using checkboxes.');
        return;
      }

      let shopeeIds = selected.filter(o => o.platform === 'Shopee').map(o => o.orderId);
      let lazadaIds = selected.filter(o => o.platform === 'Lazada').map(o => o.orderId);
      let tiktokIds = selected.filter(o => o.platform === 'TikTok').map(o => o.orderId);

      let logMessage = "Platform API Bulk Sync Complete:\n";
      if (shopeeIds.length > 0) logMessage += `• Shopee API: POST /api/v1/shopee/orders/bulk-accept (${shopeeIds.length} orders synced)\n`;
      if (lazadaIds.length > 0) logMessage += `• Lazada API: POST /api/v1/lazada/orders/bulk-pack (${lazadaIds.length} orders synced)\n`;
      if (tiktokIds.length > 0) logMessage += `• TikTok API: POST /api/v1/tiktok/orders/bulk-rts (${tiktokIds.length} orders synced)\n`;

      selected.forEach(o => {
        o.status = 'Ready to Ship';
        o.selected = false;
      });

      if (ordersSelectAll) ordersSelectAll.checked = false;
      alert(logMessage);
      filterOrders();
    });
  }

  // Cancel order popup triggers
  window.cancelOrder = function(orderId) {
    const order = ordersList.find(o => o.orderId === orderId);
    if (!order) return;

    activeCancelOrderId = orderId;
    document.getElementById('cancel-modal-order-id').textContent = orderId;
    document.getElementById('cancel-modal-platform').textContent = order.platform;

    // Populate dropdown with platform specific reasons
    cancelReasonSelect.innerHTML = '';
    const reasons = platformCancelReasons[order.platform];
    reasons.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.code;
      opt.textContent = r.text;
      cancelReasonSelect.appendChild(opt);
    });

    cancelOrderModal.classList.add('active');
  };

  // Close cancellation modal
  if (cancelOrderClose) cancelOrderClose.addEventListener('click', closeCancelModal);
  if (btnCancelModalClose) btnCancelModalClose.addEventListener('click', closeCancelModal);

  function closeCancelModal() {
    if (cancelOrderModal) cancelOrderModal.classList.remove('active');
  }

  // Cancel form submit (syncs API reason)
  if (cancelOrderReasonForm) {
    cancelOrderReasonForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const order = ordersList.find(o => o.orderId === activeCancelOrderId);
      if (!order) return;

      const code = cancelReasonSelect.value;
      const text = cancelReasonSelect.options[cancelReasonSelect.selectedIndex].text;

      let apiPath = `POST /api/v1/${order.platform.toLowerCase()}/orders/cancel`;
      let payload = { order_id: order.orderId, cancellation_reason_code: code, reason_text: text };

      alert(`[API Sync - ${order.platform} Open API]\nPath: ${apiPath}\nPayload: ${JSON.stringify(payload)}\n\nCancellation dispatched and synced to platform shop!`);

      order.status = 'Cancelled';
      order.selected = false;
      closeCancelModal();
      filterOrders();
    });
  }

  // Bulk Print AWB, Invoice, Picklist simulator
  function printDocuments(docType) {
    const selected = ordersList.filter(o => o.selected);
    if (selected.length === 0) {
      alert(`Please select one or more order rows to compile and print ${docType} documents.`);
      return;
    }

    if (orderPrintConsole && orderPrintLogLines) {
      orderPrintLogLines.innerHTML = '';
      orderPrintConsole.style.display = 'block';

      let delay = 0;
      let logs = [
        `[SYSTEM] Connecting platform API document endpoints for ${selected.length} orders...`
      ];

      selected.forEach(o => {
        logs.push(`[API FETCH] GET /api/v1/${o.platform.toLowerCase()}/documents/${docType.toLowerCase()}?order_id=${o.orderId}`);
        logs.push(`[RENDER] Generating PDF page for ${o.orderId} (${o.customerName} - ${o.platform} TH)`);
      });

      logs.push(`[PRINTER] Compiling thermal spooler queue files...`);
      logs.push(`[SUCCESS] Spooled ${selected.length} pages to thermal docket printer. Print job complete.`);

      logs.forEach(line => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.textContent = line;
          if (line.includes('[API FETCH]')) div.style.color = '#38bdf8';
          else if (line.includes('[SUCCESS]')) div.style.color = '#10b981';
          else if (line.includes('[PRINTER]')) div.style.color = '#f59e0b';
          
          orderPrintLogLines.appendChild(div);
          orderPrintLogLines.scrollTop = orderPrintLogLines.scrollHeight;
        }, delay);
        delay += 400;
      });
    }
  }

  if (btnPrintAwb) btnPrintAwb.addEventListener('click', () => printDocuments('AWB'));
  if (btnPrintInvoice) btnPrintInvoice.addEventListener('click', () => printDocuments('Invoice'));
  if (btnPrintPicklist) btnPrintPicklist.addEventListener('click', () => printDocuments('Picklist'));

  if (closePrintConsole) {
    closePrintConsole.addEventListener('click', () => {
      orderPrintConsole.style.display = 'none';
    });
  }

  // Filter orders
  function filterOrders() {
    const query = orderSearch ? orderSearch.value.trim().toLowerCase() : '';
    const statusVal = orderStatusFilter ? orderStatusFilter.value : 'ALL';

    const filtered = ordersList.filter(o => {
      const matchQuery = o.orderId.toLowerCase().includes(query) || o.customerName.toLowerCase().includes(query);
      const matchStatus = (statusVal === 'ALL' || o.status === statusVal);
      return matchQuery && matchStatus;
    });

    renderOrdersTable(filtered);
  }

  if (orderSearch) orderSearch.addEventListener('input', filterOrders);
  if (orderStatusFilter) orderStatusFilter.addEventListener('change', filterOrders);

  if (ordersSelectAll) {
    ordersSelectAll.addEventListener('change', () => {
      const isChecked = ordersSelectAll.checked;
      const statusVal = orderStatusFilter ? orderStatusFilter.value : 'ALL';

      ordersList.forEach(o => {
        const matchStatus = (statusVal === 'ALL' || o.status === statusVal);
        if (matchStatus) o.selected = isChecked;
      });

      renderOrdersTable(ordersList.filter(o => {
        const matchStatus = (statusVal === 'ALL' || o.status === statusVal);
        return matchStatus;
      }));
    });
  }

  // Profile nested sub-tabs toggling
  const profileSubtabPersonal = document.getElementById('profile-subtab-personal');
  const profileSubtabPlans = document.getElementById('profile-subtab-plans');
  const profileViewPersonal = document.getElementById('profile-view-personal');
  const profileViewPlans = document.getElementById('profile-view-plans');

  if (profileSubtabPersonal && profileSubtabPlans && profileViewPersonal && profileViewPlans) {
    profileSubtabPersonal.addEventListener('click', () => {
      profileSubtabPersonal.classList.add('active');
      profileSubtabPlans.classList.remove('active');
      profileViewPersonal.classList.add('active');
      profileViewPlans.classList.remove('active');
    });

    profileSubtabPlans.addEventListener('click', () => {
      profileSubtabPlans.classList.add('active');
      profileSubtabPersonal.classList.remove('active');
      profileViewPlans.classList.add('active');
      profileViewPersonal.classList.remove('active');
    });
  }

  // Initial orders render
  renderOrdersTable();
});
