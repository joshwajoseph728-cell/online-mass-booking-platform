// Parish Member Dashboard Overview

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { authService } from '../../services/authService.js';
import { bookingService } from '../../services/bookingService.js';
import { pdfService } from '../../services/pdfService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { formatDate, isToday } from '../../utils/dateUtils.js';

export async function renderMemberDashboard(router) {
  const user = authService.getCurrentUser();
  const bookings = await bookingService.getMemberBookings(user?.id);

  const totalBookings = bookings.length;
  const upcomingCount = bookings.filter(b => b.bookingStatus === 'APPROVED' || b.bookingStatus === 'SCHEDULED').length;
  const pendingCount = bookings.filter(b => b.bookingStatus === 'PENDING').length;
  const completedCount = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;

  const recentBookings = bookings.slice(0, 5);

  const contentHtml = `
    <!-- Welcome Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.65rem; margin-bottom: 0.25rem;">Peace be with you, ${user?.fullName || 'Parishioner'}</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">
          Parish Member Portal &bull; Family Unit: St. Joseph Unit #4
        </p>
      </div>
      <a href="/mass-booking" class="btn btn-gold" data-route="/mass-booking">
        <span>➕ Book New Mass Intention</span>
      </a>
    </div>

    <!-- 4 Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <h5>Total Bookings</h5>
          <div class="stat-value">${totalBookings}</div>
        </div>
        <div class="stat-icon-wrapper">📖</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <h5>Upcoming Masses</h5>
          <div class="stat-value" style="color: var(--primary-navy);">${upcomingCount}</div>
        </div>
        <div class="stat-icon-wrapper">⏰</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <h5>Pending Approval</h5>
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
    </div>

    <!-- Recent Bookings Table Card -->
    <div class="card card-elevated" style="margin-top: 2rem;">
      <div class="card-header">
        <h3 style="font-size: 1.15rem; margin: 0;">Recent Mass Intentions</h3>
        <a href="/member/bookings" class="btn btn-outline btn-sm" data-route="/member/bookings">
          View All (${totalBookings}) &rarr;
        </a>
      </div>

      <div class="card-body" style="padding: 0;">
        ${recentBookings.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📖</div>
            <h4>No Mass Intentions Yet</h4>
            <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 360px;">
              You have not booked any Mass intentions. Offer prayers for your family or departed loved ones.
            </p>
            <a href="/mass-booking" class="btn btn-gold" data-route="/mass-booking" style="margin-top: 1rem;">
              Book First Mass Intention
            </a>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="church-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Intention Type</th>
                  <th>Person(s) to Pray For</th>
                  <th>Mass Schedule</th>
                  <th>Stipend</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                ${recentBookings.map(b => `
                  <tr>
                    <td><strong>${b.bookingId}</strong></td>
                    <td><span class="badge badge-departed">${b.intentionType}</span></td>
                    <td><strong>${b.personNames}</strong></td>
                    <td>
                      <div>${formatDate(b.massDate)}</div>
                      <small style="color: var(--text-muted);">${b.massTime}</small>
                    </td>
                    <td>${formatCurrency(b.offeringAmount)}</td>
                    <td><span class="badge ${b.bookingStatus === 'APPROVED' ? 'badge-approved' : b.bookingStatus === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}">${b.bookingStatus}</span></td>
                    <td>
                      <button class="btn btn-outline btn-sm btn-dl-receipt" data-booking-id="${b.bookingId}">
                        📄 PDF
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/member',
    title: 'Parishioner Overview',
    contentHtml
  });
}

export function attachMemberDashboardEvents(router) {
  attachDashboardEvents(router);

  document.querySelectorAll('.btn-dl-receipt').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.bookingId;
      const b = await bookingService.getBooking(id);
      if (b) pdfService.generateMemberReceiptPDF(b);
    });
  });
}
