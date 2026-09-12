// Client-side SPA Router with Route Guards & Transition Animations

import { authService } from './services/authService.js';
import { ROLES } from './config/constants.js';

// Public Pages
import { renderHomePage, attachHomePageEvents } from './pages/public/HomePage.js';
import { renderAboutPage, attachAboutPageEvents } from './pages/public/AboutPage.js';
import { renderMassBookingPage, attachMassBookingEvents } from './pages/public/MassBookingPage.js';
import { renderMassSchedulePage, attachMassScheduleEvents } from './pages/public/MassSchedulePage.js';
import { renderGalleryPage, attachGalleryEvents } from './pages/public/GalleryPage.js';
import { renderOfferingsPage, attachOfferingsEvents } from './pages/public/OfferingsPage.js';
import { renderContactPage, attachContactEvents } from './pages/public/ContactPage.js';
import { renderLoginPage, attachLoginEvents, renderRegisterPage, attachRegisterEvents } from './pages/public/AuthPages.js';

// Member Pages
import { renderMemberDashboard, attachMemberDashboardEvents } from './pages/member/MemberDashboard.js';
import { renderMyBookingsPage, attachMyBookingsEvents } from './pages/member/MyBookings.js';
import { renderMemberReceiptsPage, attachMemberReceiptsEvents } from './pages/member/MemberReceipts.js';
import { renderMemberNotificationsPage, attachMemberNotificationsEvents } from './pages/member/MemberNotifications.js';
import { renderMemberProfilePage, attachMemberProfileEvents } from './pages/member/MemberProfile.js';

// Priest Pages
import { renderPriestDashboard, attachPriestDashboardEvents } from './pages/priest/PriestDashboard.js';
import { renderTodayPrayerListPage, attachTodayPrayerListEvents } from './pages/priest/TodayPrayerList.js';
import { renderPriestIntentionsPage, attachPriestIntentionsEvents } from './pages/priest/PriestIntentions.js';
import { renderPriestCalendarPage, attachPriestCalendarEvents } from './pages/priest/PriestCalendar.js';
import { renderPriestProfilePage, attachPriestProfileEvents } from './pages/priest/PriestProfile.js';

// Admin Pages
import { renderAdminDashboard, attachAdminDashboardEvents } from './pages/admin/AdminDashboard.js';
import { renderManageUsersPage, attachManageUsersEvents } from './pages/admin/ManageUsers.js';
import { renderManagePriestsPage, attachManagePriestsEvents } from './pages/admin/ManagePriests.js';
import { renderManageSchedulesPage, attachManageSchedulesEvents } from './pages/admin/ManageSchedules.js';
import { renderManageBookingsPage, attachManageBookingsEvents } from './pages/admin/ManageBookings.js';
import { renderManagePaymentsPage, attachManagePaymentsEvents } from './pages/admin/ManagePayments.js';
import { renderReportsPage, attachReportsEvents } from './pages/admin/ReportsPage.js';
import { renderSettingsPage, attachSettingsEvents } from './pages/admin/SettingsPage.js';

class Router {
  constructor() {
    this.routes = {};
    this.currentPath = '/';
    this.initRoutes();
  }

  initRoutes() {
    // Public
    this.addRoute('/', renderHomePage, attachHomePageEvents);
    this.addRoute('/about', renderAboutPage, attachAboutPageEvents);
    this.addRoute('/mass-booking', renderMassBookingPage, attachMassBookingEvents);
    this.addRoute('/mass-schedule', renderMassSchedulePage, attachMassScheduleEvents);
    this.addRoute('/gallery', renderGalleryPage, attachGalleryEvents);
    this.addRoute('/offerings', renderOfferingsPage, attachOfferingsEvents);
    this.addRoute('/contact', renderContactPage, attachContactEvents);
    this.addRoute('/login', renderLoginPage, attachLoginEvents);
    this.addRoute('/register', renderRegisterPage, attachRegisterEvents);

    // Member
    this.addRoute('/member', renderMemberDashboard, attachMemberDashboardEvents, [ROLES.MEMBER, ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/member/bookings', renderMyBookingsPage, attachMyBookingsEvents, [ROLES.MEMBER, ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/member/receipts', renderMemberReceiptsPage, attachMemberReceiptsEvents, [ROLES.MEMBER, ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/member/notifications', renderMemberNotificationsPage, attachMemberNotificationsEvents, [ROLES.MEMBER, ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/member/profile', renderMemberProfilePage, attachMemberProfileEvents, [ROLES.MEMBER, ROLES.PRIEST, ROLES.ADMIN]);

    // Priest
    this.addRoute('/priest', renderPriestDashboard, attachPriestDashboardEvents, [ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/priest/today-prayers', renderTodayPrayerListPage, attachTodayPrayerListEvents, [ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/priest/intentions', renderPriestIntentionsPage, attachPriestIntentionsEvents, [ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/priest/schedules', renderManageSchedulesPage, attachManageSchedulesEvents, [ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/priest/priests', renderManagePriestsPage, attachManagePriestsEvents, [ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/priest/calendar', renderPriestCalendarPage, attachPriestCalendarEvents, [ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/priest/notifications', renderMemberNotificationsPage, attachMemberNotificationsEvents, [ROLES.PRIEST, ROLES.ADMIN]);
    this.addRoute('/priest/profile', renderPriestProfilePage, attachPriestProfileEvents, [ROLES.PRIEST, ROLES.ADMIN]);

    // Admin
    this.addRoute('/admin', renderAdminDashboard, attachAdminDashboardEvents, [ROLES.ADMIN]);
    this.addRoute('/admin/users', renderManageUsersPage, attachManageUsersEvents, [ROLES.ADMIN]);
    this.addRoute('/admin/priests', renderManagePriestsPage, attachManagePriestsEvents, [ROLES.ADMIN, ROLES.PRIEST]);
    this.addRoute('/admin/schedules', renderManageSchedulesPage, attachManageSchedulesEvents, [ROLES.ADMIN]);
    this.addRoute('/admin/bookings', renderManageBookingsPage, attachManageBookingsEvents, [ROLES.ADMIN]);
    this.addRoute('/admin/payments', renderManagePaymentsPage, attachManagePaymentsEvents, [ROLES.ADMIN]);
    this.addRoute('/admin/reports', renderReportsPage, attachReportsEvents, [ROLES.ADMIN]);
    this.addRoute('/admin/settings', renderSettingsPage, attachSettingsEvents, [ROLES.ADMIN]);
  }

  addRoute(path, renderFn, attachEventsFn, allowedRoles = null) {
    this.routes[path] = { renderFn, attachEventsFn, allowedRoles };
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  async handleRoute() {
    const rawPath = window.location.pathname || '/';
    const path = rawPath.endsWith('/') && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;
    this.currentPath = path;

    const route = this.routes[path] || this.routes['/'];
    const user = authService.getCurrentUser();

    // Route Guard Check
    if (route.allowedRoles) {
      if (!user) {
        this.navigate('/login');
        return;
      } else if (!route.allowedRoles.includes(user.role)) {
        if (user.role === ROLES.ADMIN) this.navigate('/admin');
        else if (user.role === ROLES.PRIEST) this.navigate('/priest');
        else this.navigate('/member');
        return;
      }
    }

    const appEl = document.getElementById('app');
    const progressBar = document.getElementById('page-progress');

    if (progressBar) {
      progressBar.classList.add('active');
    }

    try {
      const html = await route.renderFn(this);
      appEl.innerHTML = html;
      appEl.classList.add('animate-fade-in');
      setTimeout(() => appEl.classList.remove('animate-fade-in'), 300);

      if (route.attachEventsFn) {
        route.attachEventsFn(this);
      }

      this.interceptLinks();
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      console.error('Route rendering error:', err);
      appEl.innerHTML = `
        <div class="container" style="padding: 5rem 0; text-align: center;">
          <h2 style="color: var(--danger);">Unable to load page</h2>
          <p>${err.message}</p>
          <a href="/" class="btn btn-primary" data-route="/">Return Home</a>
        </div>
      `;
      this.interceptLinks();
    } finally {
      if (progressBar) {
        progressBar.classList.remove('active');
        progressBar.classList.add('done');
        setTimeout(() => progressBar.classList.remove('done'), 200);
      }
    }
  }

  interceptLinks() {
    document.querySelectorAll('a[data-route]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-route') || link.getAttribute('href');
        if (target) {
          this.navigate(target);
        }
      });
    });
  }

  init() {
    window.addEventListener('popstate', () => this.handleRoute());
    document.addEventListener('DOMContentLoaded', () => this.handleRoute());
    this.handleRoute();
  }
}

export const router = new Router();
