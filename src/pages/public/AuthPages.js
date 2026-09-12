// Authentication Pages (Login, Register, Demo Quick Access)

import { renderNavbar, attachNavbarEvents } from '../../components/Navbar.js';
import { renderFooter } from '../../components/Footer.js';
import { authService } from '../../services/authService.js';
import { notificationService } from '../../services/notificationService.js';
import { ROLES } from '../../config/constants.js';

export function renderLoginPage() {
  const html = `
    ${renderNavbar('/login')}

    <section class="section" style="min-height: calc(100vh - var(--header-height) - 250px); display: flex; align-items: center;">
      <div class="container" style="max-width: 520px;">
        <div class="card card-elevated card-gold-border" style="padding: 2.25rem 2rem;">
          
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="width: 52px; height: 52px; border-radius: var(--radius-lg); background: var(--primary-navy); display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; border: 2px solid var(--gold-accent);">
              <span id="portal-icon-display" style="color: #d4af37; font-size: 1.5rem;">👑</span>
            </div>
            <h2 class="church-title" id="portal-title-display" style="font-size: 1.6rem; margin-bottom: 0.25rem;">Parish Portal Access</h2>
            <p id="portal-desc-display" style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Select your portal to log in to your dedicated church dashboard.</p>
          </div>

          <!-- PORTAL SELECTOR TABS -->
          <div class="portal-tab-group" style="display: flex; gap: 0.5rem; background: var(--bg-surface-alt); padding: 0.35rem; border-radius: var(--radius-lg); margin-bottom: 1.75rem; border: 1px solid var(--border-subtle);">
            <button type="button" class="btn-portal-tab active" data-portal="admin" style="flex: 1; padding: 0.6rem 0.4rem; border: none; border-radius: var(--radius-md); font-weight: 700; font-size: 0.8rem; cursor: pointer; background: var(--primary-navy); color: #d4af37; transition: all var(--transition-fast);">
              👑 Admin
            </button>
            <button type="button" class="btn-portal-tab" data-portal="priest" style="flex: 1; padding: 0.6rem 0.4rem; border: none; border-radius: var(--radius-md); font-weight: 700; font-size: 0.8rem; cursor: pointer; background: transparent; color: var(--text-muted); transition: all var(--transition-fast);">
              ✝️ Priest
            </button>
            <button type="button" class="btn-portal-tab" data-portal="member" style="flex: 1; padding: 0.6rem 0.4rem; border: none; border-radius: var(--radius-md); font-weight: 700; font-size: 0.8rem; cursor: pointer; background: transparent; color: var(--text-muted); transition: all var(--transition-fast);">
              👤 Member
            </button>
          </div>

          <form id="login-form">
            <input type="hidden" id="selectedPortal" value="admin" />

            <div class="form-group">
              <label class="form-label" for="loginEmail" id="loginEmailLabel">Administrator Username <span class="required">*</span></label>
              <input type="text" id="loginEmail" class="form-control" placeholder="Enter username (e.g. joshwa)" required autocomplete="username" />
            </div>

            <div class="form-group">
              <label class="form-label" for="loginPassword">
                <span>Password <span class="required">*</span></span>
                <a href="#" id="forgot-password-link" style="font-size: 0.8rem; font-weight: 600; color: var(--primary-navy);">Forgot Password?</a>
              </label>
              <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required autocomplete="current-password" />
            </div>

            <button type="submit" id="btn-login-submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 1.25rem;">
              Sign In to Admin Portal
            </button>
          </form>

          <div id="member-register-note" style="text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: var(--text-muted);">
            New Parishioner? <a href="/register" data-route="/register" style="font-weight: 700; color: var(--primary-navy);">Create Member Account</a>
          </div>

        </div>
      </div>
    </section>

    <!-- Forgot Password Modal -->
    <div id="forgot-password-modal" style="display: none; position: fixed; inset: 0; background: rgba(10, 25, 47, 0.7); z-index: 9999; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
      <div class="card card-elevated card-gold-border" style="width: 100%; max-width: 440px; margin: 1rem; padding: 2rem; background: #fff; position: relative;">
        <button id="btn-close-forgot-modal" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: #fdf6e2; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; border: 1px solid var(--gold-accent);">
            <span style="font-size: 1.25rem;">🔑</span>
          </div>
          <h3 style="font-size: 1.35rem; margin-bottom: 0.25rem; color: var(--primary-navy);">Reset Password</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Please enter your registered parish email address to receive password reset instructions.</p>
        </div>

        <form id="forgot-password-form">
          <div class="form-group">
            <label class="form-label" for="forgotEmailInput">Registered Email Address <span class="required">*</span></label>
            <input type="email" id="forgotEmailInput" class="form-control" placeholder="e.g. member@ourladyofdolours.org" required />
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="button" id="btn-cancel-forgot" class="btn btn-secondary btn-block">Cancel</button>
            <button type="submit" id="btn-submit-forgot" class="btn btn-primary btn-block">Send Reset Link</button>
          </div>
        </form>
      </div>
    </div>

    ${renderFooter()}
  `;

  return html;
}

export function attachLoginEvents(router) {
  attachNavbarEvents(router);

  // Tab switching logic
  const portalTabs = document.querySelectorAll('.btn-portal-tab');
  const portalInput = document.getElementById('selectedPortal');
  const iconDisplay = document.getElementById('portal-icon-display');
  const titleDisplay = document.getElementById('portal-title-display');
  const descDisplay = document.getElementById('portal-desc-display');
  const emailLabel = document.getElementById('loginEmailLabel');
  const emailInput = document.getElementById('loginEmail');
  const submitBtn = document.getElementById('btn-login-submit');

  const setPortal = (portal) => {
    portalTabs.forEach(t => {
      const isActive = t.dataset.portal === portal;
      t.style.background = isActive ? 'var(--primary-navy)' : 'transparent';
      t.style.color = isActive ? '#d4af37' : 'var(--text-muted)';
      t.classList.toggle('active', isActive);
    });

    portalInput.value = portal;

    if (portal === 'admin') {
      iconDisplay.textContent = '👑';
      titleDisplay.textContent = 'Parish Administrator Portal';
      descDisplay.textContent = 'Sign in to access analytics, schedules, offerings, and user directory.';
      emailLabel.innerHTML = 'Administrator Username <span class="required">*</span>';
      emailInput.placeholder = 'Enter admin username (e.g. joshwa)';
      submitBtn.textContent = 'Sign In to Admin Portal';
    } else if (portal === 'priest') {
      iconDisplay.textContent = '✝️';
      titleDisplay.textContent = 'Parish Priest & Clergy Portal';
      descDisplay.textContent = 'Sign in to access today’s prayer list, mass intentions name list & altar sheet.';
      emailLabel.innerHTML = 'Priest Username or Email <span class="required">*</span>';
      emailInput.placeholder = 'Enter priest username (e.g. priest)';
      submitBtn.textContent = 'Sign In to Priest Portal';
    } else {
      iconDisplay.textContent = '👤';
      titleDisplay.textContent = 'Parishioner Member Portal';
      descDisplay.textContent = 'Sign in to book mass intentions, track petitions & download receipts.';
      emailLabel.innerHTML = 'Email or Username <span class="required">*</span>';
      emailInput.placeholder = 'Enter registered email address';
      submitBtn.textContent = 'Sign In to Member Portal';
    }
  };

  portalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setPortal(tab.dataset.portal);
    });
  });

  // Check URL query param for default portal e.g. /login?portal=priest
  const urlParams = new URLSearchParams(window.location.search);
  const portalParam = urlParams.get('portal');
  if (portalParam && ['admin', 'priest', 'member'].includes(portalParam)) {
    setPortal(portalParam);
  }

  // Standard Login Form
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const pass = document.getElementById('loginPassword').value;
      const btn = document.getElementById('btn-login-submit');
      const targetPortal = portalInput.value;

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Authenticating...';

      try {
        const res = await authService.login(email, pass);
        notificationService.success(`Welcome back, ${res.user.fullName}!`);
        const userRole = res.user.role;
        if (userRole === ROLES.PRIEST) router.navigate('/priest');
        else if (userRole === ROLES.ADMIN) router.navigate('/admin');
        else router.navigate('/member');
      } catch (err) {
        notificationService.error(err.message || 'Login failed.');
        btn.disabled = false;
        btn.innerHTML = targetPortal === 'admin' ? 'Sign In to Admin Portal' : targetPortal === 'priest' ? 'Sign In to Priest Portal' : 'Sign In to Member Portal';
      }
    });
  }

  // Forgot password modal controls
  const forgotModal = document.getElementById('forgot-password-modal');
  const forgotLink = document.getElementById('forgot-password-link');
  const closeForgotBtn = document.getElementById('btn-close-forgot-modal');
  const cancelForgotBtn = document.getElementById('btn-cancel-forgot');
  const forgotForm = document.getElementById('forgot-password-form');

  if (forgotLink && forgotModal) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotModal.style.display = 'flex';
      document.getElementById('forgotEmailInput')?.focus();
    });

    const hideModal = () => {
      forgotModal.style.display = 'none';
    };

    closeForgotBtn?.addEventListener('click', hideModal);
    cancelForgotBtn?.addEventListener('click', hideModal);

    forgotForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('forgotEmailInput');
      const email = emailInput?.value.trim();
      const submitBtn = document.getElementById('btn-submit-forgot');

      if (!email) {
        notificationService.warning('Please enter your registered email address.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Sending...';

      try {
        const res = await authService.sendPasswordReset(email);
        notificationService.success(res.message);
        hideModal();
        emailInput.value = '';
      } catch (err) {
        notificationService.error(err.message || 'Failed to send reset email.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Reset Link';
      }
    });
  }
}

export function renderRegisterPage() {
  const html = `
    ${renderNavbar('/register')}

    <section class="section" style="min-height: calc(100vh - var(--header-height) - 250px); display: flex; align-items: center;">
      <div class="container" style="max-width: 520px;">
        <div class="card card-elevated card-gold-border" style="padding: 2.5rem 2rem;">
          
          <div style="text-align: center; margin-bottom: 2rem;">
            <h2 class="church-title" style="font-size: 1.65rem; margin-bottom: 0.25rem;">Parish Member Registration</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Join the online community of Our Lady of Dolours Parish.</p>
          </div>

          <form id="register-form">
            <div class="form-group">
              <label class="form-label" for="regName">Full Name / Family Name <span class="required">*</span></label>
              <input type="text" id="regName" class="form-control" placeholder="Joseph & Maria Fernandez" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="regPhone">Phone Number <span class="required">*</span></label>
              <input type="tel" id="regPhone" class="form-control" placeholder="+91 98470 12345" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="regEmail">Email Address <span class="required">*</span></label>
              <input type="email" id="regEmail" class="form-control" placeholder="joseph@example.com" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="regPassword">Password <span class="required">*</span></label>
              <input type="password" id="regPassword" class="form-control" placeholder="Create a secure password" minlength="6" required />
            </div>

            <button type="submit" id="btn-reg-submit" class="btn btn-gold btn-block btn-lg" style="margin-top: 1.25rem; box-shadow: var(--shadow-gold);">
              Complete Member Registration
            </button>
          </form>

          <div style="text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: var(--text-muted);">
            Already have an account? <a href="/login" data-route="/login" style="font-weight: 700; color: var(--primary-navy);">Sign In here</a>
          </div>

        </div>
      </div>
    </section>

    ${renderFooter()}
  `;

  return html;
}

export function attachRegisterEvents(router) {
  attachNavbarEvents();

  const form = document.getElementById('register-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regName').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const btn = document.getElementById('btn-reg-submit');

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Creating Account...';

      try {
        await authService.register({ fullName, phone, email, password, role: ROLES.MEMBER });
        notificationService.success(`Welcome to Our Lady of Dolours, ${fullName}!`);
        router.navigate('/member');
      } catch (err) {
        notificationService.error(err.message || 'Registration failed.');
        btn.disabled = false;
        btn.innerHTML = 'Complete Member Registration';
      }
    });
  }
}
