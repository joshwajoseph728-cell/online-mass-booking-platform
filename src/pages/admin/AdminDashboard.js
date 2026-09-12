// Parish Administrator Dashboard & Analytics Page

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { firestoreService } from '../../services/firestoreService.js';
import { renderMonthlyBookingsBarChart, renderIntentionDistributionDonut } from '../../components/Charts.js';
import { formatCurrency } from '../../utils/formatters.js';

export async function renderAdminDashboard(router) {
  const users = await firestoreService.getCollection('users');
  const bookings = await firestoreService.getCollection('massIntentions');
  const payments = await firestoreService.getCollection('payments');

  const totalMembers = users.length;
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter(b => b.bookingStatus === 'PENDING').length;
  const completedCount = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;

  const totalOfferings = payments
    .filter(p => p.status === 'PAID')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Distribution by intention type
  const distribution = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsMap = {};
  monthNames.forEach(m => { monthsMap[m] = 0; });

  bookings.forEach(b => {
    const t = b.intentionType || 'Departed Soul';
    distribution[t] = (distribution[t] || 0) + 1;

    if (b.massDate) {
      const d = new Date(b.massDate);
      if (!isNaN(d.getTime())) {
        const m = monthNames[d.getMonth()];
        monthsMap[m] = (monthsMap[m] || 0) + 1;
      }
    }
  });

  const now = new Date();
  const last6MonthsData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mName = monthNames[d.getMonth()];
    last6MonthsData.push({ label: mName, count: monthsMap[mName] || 0 });
  }

  const pendingScreenshots = bookings.filter(b => b.paymentStatus === 'PENDING_VERIFICATION' || (b.bookingStatus === 'PENDING' && b.receiptScreenshot));

  const contentHtml = `
    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.65rem; margin-bottom: 0.25rem;">Parish Administration & Analytics</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">
          Real-time metrics for mass intention bookings, offering revenues, and clergy schedules.
        </p>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <a href="/admin/schedules" class="btn btn-primary btn-sm" data-route="/admin/schedules">
          ⏰ Manage Schedules
        </a>
        <a href="/admin/reports" class="btn btn-gold btn-sm" data-route="/admin/reports">
          📑 Export Reports
        </a>
      </div>
    </div>

    <!-- Pending Screenshot Alert Banner -->
    ${pendingScreenshots.length > 0 ? `
      <div style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="font-size: 1.8rem;">📸</div>
          <div>
            <strong style="color: #92400e; font-size: 0.98rem;">${pendingScreenshots.length} Payment Screenshot(s) Awaiting Time & Transaction Verification</strong>
            <p style="color: #b45309; font-size: 0.82rem; margin: 0.15rem 0 0 0;">
              Parishioners submitted UPI receipts. Compare the transaction time with the booking time to verify and forward names to Rev. Father's portal.
            </p>
          </div>
        </div>
        <a href="/admin/bookings" class="btn btn-gold btn-sm" data-route="/admin/bookings" style="font-weight: 700;">
          🔍 Review & Verify (${pendingScreenshots.length})
        </a>
      </div>
    ` : ''}

    <!-- 5 Key Stats Metrics Cards -->
    <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));">
      <div class="stat-card">
        <div class="stat-info">
          <h5>Total Offerings</h5>
          <div class="stat-value" style="color: #15803d;">${formatCurrency(totalOfferings)}</div>
        </div>
        <div class="stat-icon-wrapper">💳</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <h5>Total Bookings</h5>
          <div class="stat-value" style="color: var(--primary-navy);">${totalBookings}</div>
        </div>
        <div class="stat-icon-wrapper">📖</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <h5>Pending Approvals</h5>
          <div class="stat-value" style="color: var(--warning);">${pendingCount}</div>
        </div>
        <div class="stat-icon-wrapper">⏳</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <h5>Completed Masses</h5>
          <div class="stat-value" style="color: var(--success);">${completedCount}</div>
        </div>
        <div class="stat-icon-wrapper">✓</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <h5>Total Parishioners</h5>
          <div class="stat-value">${totalMembers}</div>
        </div>
        <div class="stat-icon-wrapper">👥</div>
      </div>
    </div>

    <!-- Analytics Charts Row -->
    <div style="display: grid; grid-template-columns: 1.3fr 0.9fr; gap: 1.5rem; margin-top: 2rem;">
      
      <!-- Monthly Booking Trends Chart -->
      <div class="card card-elevated" style="padding: 1.75rem;">
        <div class="card-header" style="padding: 0 0 1rem; margin-bottom: 1rem;">
          <h3 style="font-size: 1.15rem; margin: 0;">Monthly Mass Intentions Volume</h3>
          <span style="font-size: 0.8rem; color: var(--gold-accent-hover); font-weight: 700;">Year ${now.getFullYear()}</span>
        </div>
        ${renderMonthlyBookingsBarChart(last6MonthsData)}
      </div>

      <!-- Intention Type Distribution Donut -->
      <div class="card card-elevated" style="padding: 1.75rem;">
        <div class="card-header" style="padding: 0 0 1rem; margin-bottom: 1rem;">
          <h3 style="font-size: 1.15rem; margin: 0;">Intentions by Category</h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Distribution</span>
        </div>
        ${renderIntentionDistributionDonut(distribution)}
      </div>

    </div>

    <!-- Quick Navigation Shortcuts -->
    <div style="margin-top: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem;">
      <a href="/admin/bookings" class="card" data-route="/admin/bookings" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem; text-decoration: none;">
        <div style="font-size: 1.8rem; color: var(--primary-navy);">📖</div>
        <div>
          <h4 style="font-size: 1rem; margin: 0; color: var(--text-primary);">Master Bookings</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Audit and manage all intentions</span>
        </div>
      </a>

      <a href="/admin/schedules" class="card" data-route="/admin/schedules" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem; text-decoration: none;">
        <div style="font-size: 1.8rem; color: var(--primary-navy);">⏰</div>
        <div>
          <h4 style="font-size: 1rem; margin: 0; color: var(--text-primary);">Mass Timetables</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Configure dates, times & celebrants</span>
        </div>
      </a>

      <a href="/admin/priests" class="card" data-route="/admin/priests" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem; text-decoration: none;">
        <div style="font-size: 1.8rem; color: var(--primary-navy);">✝️</div>
        <div>
          <h4 style="font-size: 1rem; margin: 0; color: var(--text-primary);">Priest Directory</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Manage clergy profiles & roles</span>
        </div>
      </a>

      <a href="/admin/payments" class="card" data-route="/admin/payments" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem; text-decoration: none;">
        <div style="font-size: 1.8rem; color: var(--primary-navy);">💳</div>
        <div>
          <h4 style="font-size: 1rem; margin: 0; color: var(--text-primary);">Payment Ledger</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Razorpay transactions audit</span>
        </div>
      </a>
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/admin',
    title: 'Parish Analytics & Admin',
    contentHtml
  });
}

export function attachAdminDashboardEvents(router) {
  attachDashboardEvents(router);
}
