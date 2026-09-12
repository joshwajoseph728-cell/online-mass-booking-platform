// Role-based Dashboard Layout Shell (Sidebar + Topbar + Content Container)

import { authService } from '../services/authService.js';
import { ROLES, CHURCH_DETAILS } from '../config/constants.js';
import { notificationService } from '../services/notificationService.js';

export async function renderDashboardLayout({ activeRoute, title, contentHtml }) {
  const user = authService.getCurrentUser();
  const role = user?.role || ROLES.MEMBER;
  const isDark = document.body.classList.contains('theme-dark');

  // Fetch unread notifications
  const userNotifs = await notificationService.getUserNotifications(user?.id);
  const unreadCount = userNotifs.filter(n => !n.read).length;

  // Fetch settings for custom logo
  let customLogo = '/assets/church-logo.jpg';
  try {
    const rawSettings = localStorage.getItem('oldd_parish_settings');
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (parsed.logoUrl) customLogo = parsed.logoUrl;
    }
  } catch (e) {
    // fallback
  }

  // Determine active portal mode based on route
  let portalMode = role;
  if (activeRoute.startsWith('/admin')) portalMode = ROLES.ADMIN;
  else if (activeRoute.startsWith('/priest')) portalMode = ROLES.PRIEST;
  else if (activeRoute.startsWith('/member')) portalMode = ROLES.MEMBER;

  // Define navigation based on active portalMode
  let navItems = [];

  if (portalMode === ROLES.MEMBER) {
    navItems = [
      { path: '/member', label: 'Dashboard Overview', icon: '📊' },
      { path: '/mass-booking', label: 'Book Mass Intention', icon: '➕' },
      { path: '/member/bookings', label: 'My Bookings', icon: '📜' },
      { path: '/member/receipts', label: 'Mass Receipts (PDF)', icon: '🧾' },
      { path: '/gallery', label: 'Parish Gallery', icon: '📸' },
      { path: '/member/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount > 0 ? unreadCount : null },
      { path: '/member/profile', label: 'Profile Settings', icon: '👤' }
    ];
  } else if (portalMode === ROLES.PRIEST) {
    navItems = [
      { path: '/priest', label: 'Priest Overview', icon: '⛪' },
      { path: '/priest/today-prayers', label: "Today's Altar Prayer List", icon: '📖', highlight: true },
      { path: '/priest/intentions', label: 'Prayer Offerings & Intentions', icon: '📋' },
      { path: '/priest/schedules', label: 'Mass Schedules & Celebrants', icon: '⏰' },
      { path: '/priest/priests', label: 'Clergy Directory', icon: '✝️' },
      { path: '/priest/calendar', label: 'Liturgical Calendar', icon: '📅' },
      { path: '/gallery', label: 'Parish Gallery (Add Photos)', icon: '📸' },
      { path: '/priest/notifications', label: 'Notifications', icon: '🔔', badge: unreadCount > 0 ? unreadCount : null },
      { path: '/priest/profile', label: 'Priest Settings', icon: '👤' }
    ];
  } else if (portalMode === ROLES.ADMIN) {
    navItems = [
      { path: '/admin', label: 'Parish Analytics', icon: '📈' },
      { path: '/admin/bookings', label: 'Master Bookings', icon: '📖' },
      { path: '/admin/schedules', label: 'Mass Schedules', icon: '⏰' },
      { path: '/gallery', label: 'Parish Gallery (Add Photos)', icon: '📸' },
      { path: '/admin/priests', label: 'Priest Directory', icon: '✝️' },
      { path: '/admin/users', label: 'User Directory', icon: '👥' },
      { path: '/admin/payments', label: 'Payments Ledger', icon: '💳' },
      { path: '/admin/reports', label: 'Reports & Export', icon: '📑' },
      { path: '/admin/settings', label: 'Parish Settings', icon: '⚙️' }
    ];
  }

  const roleLabels = {
    member: 'Parish Member',
    priest: 'Parish Priest / Clergy Portal',
    admin: 'Parish Administrator Portal'
  };

  return `
    <div class="dashboard-layout">
      <!-- Sidebar -->
      <aside id="dashboard-sidebar" class="dashboard-sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon" style="overflow: hidden; display: flex; align-items: center; justify-content: center;">
            ${customLogo ? `
              <img src="${customLogo}" alt="Church Logo" style="width: 26px; height: 26px; object-fit: contain; border-radius: var(--radius-sm);" />
            ` : `
              <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
                <path d="M50 5 L88 20 C88 58 72 85 50 95 C28 85 12 20 Z" fill="#d4af37"/>
                <rect x="45" y="28" width="10" height="46" rx="2" fill="#1e3a8a"/>
                <rect x="28" y="42" width="44" height="10" rx="2" fill="#1e3a8a"/>
              </svg>
            `}
          </div>
          <div class="sidebar-brand-info">
            <h4 style="margin: 0; font-size: 0.95rem;">OUR LADY OF DOLOURS</h4>
            <span class="sidebar-role-pill">${roleLabels[portalMode] || portalMode}</span>
          </div>
        </div>



        <ul class="sidebar-nav">
          ${navItems.map(item => `
            <li>
              <a href="${item.path}" class="sidebar-nav-item ${activeRoute === item.path ? 'active' : ''} ${item.highlight ? 'card-gold-border' : ''}" data-route="${item.path}">
                <span class="sidebar-icon">${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge ? `<span class="badge badge-pending" style="margin-left: auto; font-size: 0.7rem; padding: 0.15rem 0.45rem;">${item.badge}</span>` : ''}
              </a>
            </li>
          `).join('')}

          <li style="margin-top: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
            <a href="/" class="sidebar-nav-item" data-route="/">
              <span class="sidebar-icon">🌐</span>
              <span>Public Website</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <!-- Quick Portal Switch for Authorized Staff -->
          ${(role === ROLES.ADMIN || role === ROLES.PRIEST) ? `
            <div style="margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle);">
              <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.4rem; text-transform: uppercase;">Switch Portal:</div>
              <div style="display: flex; gap: 0.35rem;">
                <a href="/admin" class="btn btn-sm ${portalMode === ROLES.ADMIN ? 'btn-primary' : 'btn-outline'}" data-route="/admin" style="flex: 1; padding: 0.3rem 0.2rem; font-size: 0.75rem; text-align: center;">👑 Admin</a>
                <a href="/priest" class="btn btn-sm ${portalMode === ROLES.PRIEST ? 'btn-primary' : 'btn-outline'}" data-route="/priest" style="flex: 1; padding: 0.3rem 0.2rem; font-size: 0.75rem; text-align: center;">✝️ Priest</a>
              </div>
            </div>
          ` : ''}

          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
              <div class="user-avatar" style="width: 28px; height: 28px; font-size: 0.75rem;">
                ${user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
              <div style="font-size: 0.8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">
                ${user?.fullName || 'Parishioner'}
              </div>
            </div>
            <button id="sidebar-logout-btn" class="btn btn-secondary btn-sm" title="Sign Out" style="padding: 0.3rem 0.5rem;">
              🚪
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Section -->
      <div class="dashboard-main">
        <!-- Topbar -->
        <header class="dashboard-topbar">
          <div class="topbar-left">
            <button id="dashboard-sidebar-toggle" class="mobile-menu-btn" style="display: none; margin-right: 0.5rem;">
              ☰
            </button>
            <h1 class="topbar-title">${title}</h1>
          </div>

          <div class="topbar-right">
            <!-- Portal Switcher Button in Header -->
            ${portalMode === ROLES.ADMIN ? `
              <a href="/priest" class="btn btn-gold btn-sm" data-route="/priest" style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.75rem;" title="Switch to Priest Portal">
                <span>✝️</span> <span>Priest Portal</span>
              </a>
            ` : portalMode === ROLES.PRIEST ? `
              <a href="/admin" class="btn btn-primary btn-sm" data-route="/admin" style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; font-weight: 700; padding: 0.35rem 0.75rem;" title="Switch to Admin Portal">
                <span>👑</span> <span>Admin Portal</span>
              </a>
            ` : ''}

            <!-- Theme Toggle -->
            <button id="dash-theme-toggle" class="theme-toggle-btn" title="Toggle Light/Dark Theme">
              ${isDark ? '☀️' : '🌙'}
            </button>

            <!-- Notification Bell -->
            <a href="${portalMode === ROLES.PRIEST ? '/priest/notifications' : portalMode === ROLES.ADMIN ? '/admin/bookings' : '/member/notifications'}" class="theme-toggle-btn" style="position: relative;" data-route="${portalMode === ROLES.PRIEST ? '/priest/notifications' : portalMode === ROLES.ADMIN ? '/admin/bookings' : '/member/notifications'}">
              🔔
              ${unreadCount > 0 ? `
                <span style="position: absolute; top: -4px; right: -4px; background: #b91c1c; color: white; border-radius: 9999px; font-size: 0.65rem; font-weight: 800; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;">
                  ${unreadCount}
                </span>
              ` : ''}
            </a>

            <!-- User Badge -->
            <div class="user-profile-badge">
              <div class="user-avatar">
                ${user?.fullName ? user.fullName.charAt(0) : 'U'}
              </div>
              <span class="user-name-text">${user?.fullName || 'User'}</span>
            </div>
          </div>
        </header>

        <!-- Dynamic Content Body -->
        <main class="dashboard-content">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;
}

export function attachDashboardEvents(router) {
  // Theme Toggle
  const themeBtn = document.getElementById('dash-theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('theme-dark');
      document.body.classList.toggle('theme-light', !isDark);
      localStorage.setItem('oldd_theme', isDark ? 'dark' : 'light');
      themeBtn.innerHTML = isDark ? '☀️' : '🌙';
    });
  }

  // Logout Button
  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await authService.logout();
      router.navigate('/');
    });
  }



  // Mobile sidebar toggle
  const sideToggle = document.getElementById('dashboard-sidebar-toggle');
  const sidebar = document.getElementById('dashboard-sidebar');
  if (sideToggle && sidebar) {
    if (window.innerWidth <= 900) sideToggle.style.display = 'block';
    sideToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }
}
