import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { authService } from '../../services/authService.js';
import { bookingService } from '../../services/bookingService.js';
import { pdfService } from '../../services/pdfService.js';
import { notificationService } from '../../services/notificationService.js';
import { getTodayDateString, formatDate } from '../../utils/dateUtils.js';
import { formatCurrency } from '../../utils/formatters.js';
import { renderOfflineBookingModalHtml, attachOfflineBookingModalEvents } from '../../components/OfflineBookingModal.js';

export async function renderPriestDashboard(router) {
  const user = authService.getCurrentUser();
  const allBookings = await bookingService.getAllBookings();
  const todayStr = getTodayDateString();
  const modalHtml = await renderOfflineBookingModalHtml();

  const todayIntentions = allBookings.filter(b => b.massDate === todayStr && b.bookingStatus === 'APPROVED');
  const pendingRequests = allBookings.filter(b => b.bookingStatus === 'PENDING');
  const upcomingCount = allBookings.filter(b => b.massDate > todayStr && b.bookingStatus === 'APPROVED').length;
  const completedCount = allBookings.filter(b => b.bookingStatus === 'COMPLETED').length;

  const contentHtml = `
    <!-- Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.65rem; margin-bottom: 0.25rem;">Pax Christi, ${user?.fullName || 'Rev. Father'}</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">
          Clergy Portal &bull; Today's Date: <strong>${formatDate(todayStr)}</strong>
        </p>
      </div>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button id="btn-open-offline-booking-modal" class="btn btn-gold btn-sm btn-open-offline-booking-modal">
          ➕ Register Cash Intention
        </button>
        <a href="/priest/schedules" class="btn btn-outline btn-sm" data-route="/priest/schedules">
          ⏰ Schedules
        </a>
        <a href="/priest/today-prayers" class="btn btn-primary btn-sm" data-route="/priest/today-prayers">
          📖 Altar List (${todayIntentions.length})
        </a>
      </div>
    </div>

    <!-- 4 Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <h5>Today's Intentions</h5>
          <div class="stat-value" style="color: var(--primary-navy);">${todayIntentions.length}</div>
        </div>
        <div class="stat-icon-wrapper">📖</div>
      </div>

      <a href="/priest/intentions" class="stat-card" data-route="/priest/intentions" style="text-decoration: none; color: inherit; cursor: pointer;">
        <div class="stat-info">
          <h5>Pending Requests</h5>
          <div class="stat-value" style="color: var(--warning);">${pendingRequests.length}</div>
          <span style="font-size: 0.72rem; color: #b45309;">📸 Needs Verification &rarr;</span>
        </div>
        <div class="stat-icon-wrapper" style="background: #fef3c7; color: #d97706;">📸</div>
      </a>

      <div class="stat-card">
        <div class="stat-info">
          <h5>Upcoming Masses</h5>
          <div class="stat-value">${upcomingCount}</div>
        </div>
        <div class="stat-icon-wrapper">📅</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <h5>Completed Masses</h5>
          <div class="stat-value" style="color: var(--success);">${completedCount}</div>
        </div>
        <div class="stat-icon-wrapper">✓</div>
      </div>
    </div>

    <!-- 1. Today's Altar Prayer Offerings & Intentions List -->
    <div class="card card-elevated card-gold-border" style="margin-top: 2rem;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <h3 style="font-size: 1.15rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <span>📖</span> Today's Mass Intentions & Prayer Offerings Name List
          </h3>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0.25rem 0 0 0;">
            Parishioners and intentions registered for today's Holy Mass celebration (${formatDate(todayStr)})
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <a href="/priest/today-prayers" class="btn btn-gold btn-sm" data-route="/priest/today-prayers">
            🖨️ Full Printable Altar Sheet
          </a>
          <a href="/priest/intentions" class="btn btn-outline btn-sm" data-route="/priest/intentions">
            📋 View All Intentions
          </a>
        </div>
      </div>

      <div class="card-body" style="padding: 0;">
        ${todayIntentions.length === 0 ? `
          <div class="empty-state" style="padding: 2.5rem 1rem;">
            <div class="empty-icon">📖</div>
            <h4>No Approved Intentions for Today</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">
              New bookings confirmed for today will appear here and on the altar sheet automatically.
            </p>
            <a href="/priest/intentions" class="btn btn-primary btn-sm" data-route="/priest/intentions">Manage All Intentions</a>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="church-table">
              <thead>
                <tr>
                  <th>Mass Time</th>
                  <th>Category</th>
                  <th>Person(s) to Pray For</th>
                  <th>Offered By (Parishioner)</th>
                  <th>Offering (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${todayIntentions.map(b => `
                  <tr>
                    <td><strong>⏰ ${b.massTime}</strong></td>
                    <td><span class="badge badge-departed">${b.intentionType}</span></td>
                    <td>
                      <strong style="color: var(--primary-navy); font-size: 0.95rem;">${b.personNames}</strong>
                      ${b.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">“${b.notes}”</div>` : ''}
                    </td>
                    <td>
                      <div>${b.fullName}</div>
                      <small style="color: var(--text-muted);">${b.phone || ''}</small>
                    </td>
                    <td><strong>${formatCurrency(b.offeringAmount || b.amount || 150)}</strong></td>
                    <td>
                      <span class="badge badge-approved">Approved</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>

    <!-- 2. Pending Intentions Awaiting Action -->
    <div class="card card-elevated" style="margin-top: 2rem;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="font-size: 1.15rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <span>⏳</span> Prayer Requests Awaiting Clergy Review
          </h3>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0.25rem 0 0 0;">
            Review incoming prayer intentions submitted online by parishioners.
          </p>
        </div>
        <span class="badge badge-pending">${pendingRequests.length} Pending</span>
      </div>

      <div class="card-body" style="padding: 0;">
        ${pendingRequests.length === 0 ? `
          <div class="empty-state" style="padding: 2.5rem 1rem;">
            <div class="empty-icon">✓</div>
            <h4>All Caught Up</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem;">There are no pending Mass intentions waiting for approval.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="church-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Intention Type</th>
                  <th>Person(s) to Pray For</th>
                  <th>Requested Date & Time</th>
                  <th>Offered By</th>
                  <th>Offering (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pendingRequests.map(b => `
                  <tr>
                    <td><strong>${b.bookingId}</strong></td>
                    <td><span class="badge badge-departed">${b.intentionType}</span></td>
                    <td>
                      <strong style="color: var(--primary-navy);">${b.personNames}</strong>
                      ${b.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${b.notes}</div>` : ''}
                    </td>
                    <td>
                      <div>${b.fullName}</div>
                      <small style="color: var(--text-muted);">${b.phone}</small>
                    </td>
                    <td><strong>${formatCurrency(b.offeringAmount || b.amount || 150)}</strong></td>
                    <td>
                      <div style="display: flex; gap: 0.4rem;">
                        <button class="btn btn-primary btn-sm btn-approve" data-booking-id="${b.bookingId}">
                          ✓ Approve
                        </button>
                        <button class="btn btn-danger btn-sm btn-reject" data-booking-id="${b.bookingId}">
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>

    <!-- OFFLINE BOOKING MODAL -->
    ${modalHtml}
  `;

  return await renderDashboardLayout({
    activeRoute: '/priest',
    title: 'Priest Portal',
    contentHtml
  });
}

export function attachPriestDashboardEvents(router) {
  attachDashboardEvents(router);
  attachOfflineBookingModalEvents(router);

  const user = authService.getCurrentUser();

  // Approve action
  document.querySelectorAll('.btn-approve').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.bookingId;
      await bookingService.updateStatus(id, 'APPROVED', '', user?.fullName || 'Parish Vicar');
      notificationService.success(`Mass intention ${id} approved successfully!`);
      router.navigate('/priest');
    });
  });

  // Reject action
  document.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.bookingId;
      const reason = prompt('Please enter reason for rejection (optional):', 'Mass capacity full or liturgical conflict');
      if (reason !== null) {
        await bookingService.updateStatus(id, 'REJECTED', reason, user?.fullName || 'Parish Vicar');
        notificationService.warning(`Mass intention ${id} was rejected.`);
        router.navigate('/priest');
      }
    });
  });
}
