// Public Parish Navigation Component

import { authService } from '../services/authService.js';
import { ROLES } from '../config/constants.js';
import { i18n } from '../services/i18n.js';

export function renderNavbar(activePath = '/') {
  const user = authService.getCurrentUser();
  const isDark = document.body.classList.contains('theme-dark');
  const currentLang = i18n.getLanguage();

  let currentLogo = '/assets/church-logo.jpg';
  try {
    const rawSettings = localStorage.getItem('oldd_parish_settings');
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (parsed.logoUrl) currentLogo = parsed.logoUrl;
    }
  } catch (e) {
    // fallback
  }

  const links = [
    { path: '/', label: i18n.t('nav.home') },
    { path: '/about', label: i18n.t('nav.about') },
    { path: '/mass-schedule', label: i18n.t('nav.massSchedule') },
    { path: '/mass-booking', label: i18n.t('nav.massBooking') },
    { path: '/gallery', label: i18n.t('nav.gallery') },
    { path: '/offerings', label: i18n.t('nav.offerings') },
    { path: '/contact', label: i18n.t('nav.contact') }
  ];

  let dashboardUrl = '/member';
  let dashboardLabel = i18n.t('nav.memberPortal');
  if (user?.role === ROLES.PRIEST) {
    dashboardUrl = '/priest';
    dashboardLabel = i18n.t('nav.priestPortal');
  } else if (user?.role === ROLES.ADMIN) {
    dashboardUrl = '/admin';
    dashboardLabel = i18n.t('nav.adminPortal');
  }

  const langNames = {
    en: 'English',
    ta: 'தமிழ்',
    ml: 'മലയാളം'
  };

  const navHtml = `
    <header class="site-header">
      <div class="container site-nav">
        <!-- Brand Logo & Church Name -->
        <a href="/" class="brand-logo-link" data-route="/">
          <div class="brand-icon-wrapper" style="overflow: hidden; display: flex; align-items: center; justify-content: center;">
            ${currentLogo ? `
              <img src="${currentLogo}" alt="Church Logo" style="width: 32px; height: 32px; object-fit: contain; border-radius: var(--radius-sm);" />
            ` : `
              <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
                <path d="M50 5 L88 20 C88 58 72 85 50 95 C28 85 12 20 Z" fill="#d4af37"/>
                <rect x="45" y="28" width="10" height="46" rx="2" fill="#1e3a8a"/>
                <rect x="28" y="42" width="44" height="10" rx="2" fill="#1e3a8a"/>
              </svg>
            `}
          </div>
          <div class="brand-text-block">
            <span class="brand-title">${i18n.t('brand.title')}</span>
            <span class="brand-subtitle">${i18n.t('brand.subtitle')} &bull; ${i18n.t('brand.location')}</span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <ul class="nav-links-desktop">
          ${links.map(l => `
            <li>
              <a href="${l.path}" class="nav-link ${activePath === l.path ? 'active' : ''}" data-route="${l.path}">
                ${l.label}
              </a>
            </li>
          `).join('')}
        </ul>

        <!-- Right Side Actions: Language Selector, Theme Switch & Auth Portal -->
        <div class="nav-actions-desktop" style="display: flex; align-items: center; gap: 0.5rem;">
          
          <!-- LANGUAGES BUTTON & DROPDOWN -->
          <div class="lang-dropdown-wrapper" style="position: relative;">
            <button id="btn-language-toggle" class="btn btn-sm btn-secondary" style="display: flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.65rem; font-weight: 700; border-color: var(--gold-accent);" title="Select Language">
              <span>🌐</span>
              <span id="current-lang-label">${langNames[currentLang] || 'English'}</span>
              <span style="font-size: 0.65rem;">▼</span>
            </button>
            <div id="language-dropdown-menu" style="display: none; position: absolute; right: 0; top: 115%; background: #ffffff; border: 1px solid var(--border-medium); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 9999; min-width: 155px; overflow: hidden;">
              <button type="button" class="lang-select-opt" data-lang="en" style="width: 100%; text-align: left; padding: 0.6rem 0.9rem; background: ${currentLang === 'en' ? '#fdf6e2' : 'transparent'}; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: ${currentLang === 'en' ? '700' : '500'}; color: #1e3a8a;">
                <span>🇬🇧</span> English ${currentLang === 'en' ? '✓' : ''}
              </button>
              <button type="button" class="lang-select-opt" data-lang="ta" style="width: 100%; text-align: left; padding: 0.6rem 0.9rem; background: ${currentLang === 'ta' ? '#fdf6e2' : 'transparent'}; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: ${currentLang === 'ta' ? '700' : '500'}; color: #1e3a8a; border-top: 1px solid var(--border-subtle);">
                <span>🇮🇳</span> தமிழ் (Tamil) ${currentLang === 'ta' ? '✓' : ''}
              </button>
              <button type="button" class="lang-select-opt" data-lang="ml" style="width: 100%; text-align: left; padding: 0.6rem 0.9rem; background: ${currentLang === 'ml' ? '#fdf6e2' : 'transparent'}; border: none; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: ${currentLang === 'ml' ? '700' : '500'}; color: #1e3a8a; border-top: 1px solid var(--border-subtle);">
                <span>🇮🇳</span> മലയാളം (Malayalam) ${currentLang === 'ml' ? '✓' : ''}
              </button>
            </div>
          </div>

          <!-- PORTALS DROPDOWN -->
          <div class="portals-dropdown-wrapper" style="position: relative;">
            <button id="btn-portals-toggle" class="btn btn-sm btn-outline" style="display: flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.65rem; font-weight: 700;" title="Select Portal">
              <span>🚪</span>
              <span>Portals</span>
              <span style="font-size: 0.65rem;">▼</span>
            </button>
            <div id="portals-dropdown-menu" style="display: none; position: absolute; right: 0; top: 115%; background: #ffffff; border: 1px solid var(--border-medium); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 9999; min-width: 190px; overflow: hidden;">
              <a href="/login?portal=admin" class="portal-link-opt" data-route="/login?portal=admin" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 0.9rem; font-size: 0.85rem; font-weight: 600; color: #1e3a8a; text-decoration: none; border-bottom: 1px solid var(--border-subtle);">
                <span>👑</span> Admin Portal
              </a>
              <a href="/login?portal=priest" class="portal-link-opt" data-route="/login?portal=priest" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 0.9rem; font-size: 0.85rem; font-weight: 600; color: #1e3a8a; text-decoration: none; border-bottom: 1px solid var(--border-subtle);">
                <span>✝️</span> Priest Portal
              </a>
              <a href="/login?portal=member" class="portal-link-opt" data-route="/login?portal=member" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.65rem 0.9rem; font-size: 0.85rem; font-weight: 600; color: #1e3a8a; text-decoration: none;">
                <span>👤</span> Member Portal
              </a>
            </div>
          </div>

          <button id="nav-theme-toggle" class="theme-toggle-btn" title="Toggle Light/Dark Theme" aria-label="Toggle Theme">
            ${isDark ? '☀️' : '🌙'}
          </button>

          ${user ? `
            <a href="${dashboardUrl}" class="btn btn-gold btn-sm" data-route="${dashboardUrl}">
              <span>⛪ ${dashboardLabel}</span>
            </a>
          ` : `
            <a href="/mass-booking" class="btn btn-gold btn-sm" data-route="/mass-booking">
              <span>${i18n.t('nav.bookMass')}</span>
            </a>
            <a href="/login" class="btn btn-outline btn-sm" data-route="/login">
              <span>${i18n.t('nav.signIn')}</span>
            </a>
          `}

          <button id="mobile-menu-trigger" class="mobile-menu-btn" aria-label="Open Menu">
            ☰
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-nav-drawer" class="mobile-nav-drawer">
        <!-- Mobile Language Selector Strip -->
        <div style="padding: 0.5rem 0 1rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 0.5rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">🌐 SELECT LANGUAGE / மொழி:</div>
          <div style="display: flex; gap: 0.35rem;">
            <button type="button" class="btn btn-sm ${currentLang === 'en' ? 'btn-primary' : 'btn-secondary'} lang-select-opt" data-lang="en" style="flex: 1; padding: 0.3rem;">English</button>
            <button type="button" class="btn btn-sm ${currentLang === 'ta' ? 'btn-primary' : 'btn-secondary'} lang-select-opt" data-lang="ta" style="flex: 1; padding: 0.3rem;">தமிழ்</button>
            <button type="button" class="btn btn-sm ${currentLang === 'ml' ? 'btn-primary' : 'btn-secondary'} lang-select-opt" data-lang="ml" style="flex: 1; padding: 0.3rem;">മലയാളം</button>
          </div>
        </div>

        <!-- Mobile Portals Strip -->
        <div style="padding: 0.5rem 0 1rem; border-bottom: 1px solid var(--border-subtle); margin-bottom: 0.5rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">🚪 SELECT PORTAL:</div>
          <div style="display: flex; gap: 0.35rem;">
            <a href="/login?portal=admin" class="btn btn-sm btn-outline" data-route="/login?portal=admin" style="flex: 1; padding: 0.35rem 0.2rem; font-size: 0.75rem; text-align: center;">👑 Admin</a>
            <a href="/login?portal=priest" class="btn btn-sm btn-outline" data-route="/login?portal=priest" style="flex: 1; padding: 0.35rem 0.2rem; font-size: 0.75rem; text-align: center;">✝️ Priest</a>
            <a href="/login?portal=member" class="btn btn-sm btn-outline" data-route="/login?portal=member" style="flex: 1; padding: 0.35rem 0.2rem; font-size: 0.75rem; text-align: center;">👤 Member</a>
          </div>
        </div>

        ${links.map(l => `
          <a href="${l.path}" class="nav-link ${activePath === l.path ? 'active' : ''}" data-route="${l.path}" style="font-size: 1.1rem; padding: 0.5rem 0;">
            ${l.label}
          </a>
        `).join('')}
        <hr style="border: none; border-top: 1px solid var(--border-subtle); margin: 0.5rem 0;">
        ${user ? `
          <a href="${dashboardUrl}" class="btn btn-gold btn-block" data-route="${dashboardUrl}">
            ⛪ ${dashboardLabel}
          </a>
        ` : `
          <a href="/mass-booking" class="btn btn-gold btn-block" data-route="/mass-booking">
            ${i18n.t('nav.bookMass')}
          </a>
          <a href="/login" class="btn btn-outline btn-block" data-route="/login">
            ${i18n.t('nav.signIn')}
          </a>
        `}
      </div>
    </header>
  `;

  return navHtml;
}

export function attachNavbarEvents(router) {
  // Language Dropdown Toggle
  const langToggleBtn = document.getElementById('btn-language-toggle');
  const langMenu = document.getElementById('language-dropdown-menu');

  if (langToggleBtn && langMenu) {
    langToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langMenu.style.display = langMenu.style.display === 'none' ? 'block' : 'none';
      if (portalsMenu) portalsMenu.style.display = 'none';
    });
  }

  // Portals Dropdown Toggle
  const portalsToggleBtn = document.getElementById('btn-portals-toggle');
  const portalsMenu = document.getElementById('portals-dropdown-menu');

  if (portalsToggleBtn && portalsMenu) {
    portalsToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      portalsMenu.style.display = portalsMenu.style.display === 'none' ? 'block' : 'none';
      if (langMenu) langMenu.style.display = 'none';
    });
  }

  document.addEventListener('click', (e) => {
    if (langToggleBtn && langMenu && !langToggleBtn.contains(e.target) && !langMenu.contains(e.target)) {
      langMenu.style.display = 'none';
    }
    if (portalsToggleBtn && portalsMenu && !portalsToggleBtn.contains(e.target) && !portalsMenu.contains(e.target)) {
      portalsMenu.style.display = 'none';
    }
  });

  // Language Option Click
  document.querySelectorAll('.lang-select-opt').forEach(opt => {
    opt.addEventListener('click', (e) => {
      const selectedLang = e.currentTarget.dataset.lang;
      if (selectedLang) {
        i18n.setLanguage(selectedLang);
        if (router && typeof router.handleRoute === 'function') {
          router.handleRoute();
        } else {
          window.location.reload();
        }
      }
    });
  });

  const themeBtn = document.getElementById('nav-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('theme-dark');
      document.body.classList.toggle('theme-light', !isDark);
      localStorage.setItem('oldd_theme', isDark ? 'dark' : 'light');
      themeBtn.innerHTML = isDark ? '☀️' : '🌙';
    });
  }

  const mobileTrigger = document.getElementById('mobile-menu-trigger');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  if (mobileTrigger && mobileDrawer) {
    mobileTrigger.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      mobileTrigger.innerHTML = mobileDrawer.classList.contains('open') ? '✕' : '☰';
    });
  }
}
