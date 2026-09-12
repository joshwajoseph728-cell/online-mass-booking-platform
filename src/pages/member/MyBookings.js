// Member "My Bookings" List & Filtering Page

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { authService } from '../../services/authService.js';
import { bookingService } from '../../services/bookingService.js';
import { pdfService } from '../../services/pdfService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { formatDate } from '../../utils/dateUtils.js';

export async function renderMyBookingsPage(router) {
  const user = authService.getCurrentUser();
  const bookings = await bookingService.getMemberBookings(user?.id);

  const contentHtml = `
    <!-- Top Action Toolbar -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">My Mass Intentions History</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          View details, track prayer fulfillment, and download official receipts.
        </p>
      </div>
      <a href="/mass-booking" class="btn btn-gold" data-route="/mass-booking">
        <span>➕ Book New Mass</span>
      </a>
    </div>

    <!-- Search & Filter Controls -->
    <div class="card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem;">
        <input type="text" id="filter-search-input" class="form-control" placeholder="Search by name, booking ID, or notes..." />
        <select id="filter-type-select" class="form-select">
          <option value="ALL">All Intention Types</option>
          <option value="Departed Soul">Departed Soul</option>
          <option value="Thanksgiving">Thanksgiving</option>
          <option value="Healing Prayer">Healing Prayer</option>
          <option value="Special Intention">Special Intention</option>
        </select>
        <select id="filter-status-select" class="form-select">
          <option value="ALL">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
    </div>

    <!-- Bookings Table -->
    <div class="card card-elevated">
      <div class="card-body" style="padding: 0;">
        <div class="table-responsive">
          <table class="church-table" id="member-bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Intention Category</th>
                <th>Person(s) to Pray For</th>
                <th>Mass Date & Time</th>
                <th>Stipend</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="bookings-tbody">
              ${bookings.map(b => {
                const isPending = b.paymentStatus === 'PENDING_VERIFICATION' || b.bookingStatus === 'PENDING';
                const isPaid = b.paymentStatus === 'PAID';
                const isRejected = b.paymentStatus === 'REJECTED' || b.bookingStatus === 'REJECTED';

                return `
                  <tr data-type="${b.intentionType}" data-status="${b.bookingStatus}" data-search="${(b.bookingId + ' ' + b.personNames + ' ' + (b.notes || '')).toLowerCase()}">
                    <td><strong style="font-family: monospace;">${b.bookingId}</strong></td>
                    <td><span class="badge badge-departed">${b.intentionType}</span></td>
                    <td>
                      <strong>${b.personNames}</strong>
                      ${b.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${b.notes}</div>` : ''}
                    </td>
                    <td>
                      <div>${formatDate(b.massDate)}</div>
                      <small style="color: var(--text-muted);">${b.massTime}</small>
                    </td>
                    <td>
                      <strong>${formatCurrency(b.offeringAmount)}</strong>
                      <div style="font-size: 0.72rem; color: ${isPaid ? '#15803d' : isRejected ? '#b91c1c' : '#d97706'}; font-weight: 700;">
                        ${isPaid ? '✓ PAID' : isRejected ? '✕ REJECTED' : '⏳ VERIFYING'}
                      </div>
                    </td>
                    <td>
                      <span class="badge ${isPaid ? 'badge-approved' : isRejected ? 'badge-rejected' : 'badge-pending'}">
                        ${isPaid ? 'Approved & Scheduled' : isRejected ? 'Rejected' : 'Pending Verification'}
                      </span>
                    </td>
                    <td>
                      <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
                        ${b.receiptScreenshot ? `
                          <button class="btn btn-outline btn-sm btn-member-view-ss" data-img="${b.receiptScreenshot}" data-id="${b.bookingId}" title="View Uploaded Receipt">
                            📸 Receipt
                          </button>
                        ` : ''}
                        ${isPaid ? `
                          <button class="btn btn-gold btn-sm btn-dl-receipt" data-booking-id="${b.bookingId}" title="Download Official Church PDF Receipt">
                            📄 Download PDF
                          </button>
                        ` : `
                          <span style="font-size: 0.72rem; color: var(--text-muted); font-style: italic;">
                            ${isRejected ? 'Please contact church office' : 'Unlocks after priest approval'}
                          </span>
                        `}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Member Screenshot Modal -->
    <div id="member-ss-modal-container"></div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/member/bookings',
    title: 'My Bookings',
    contentHtml
  });
}

export function attachMyBookingsEvents(router) {
  attachDashboardEvents(router);

  const searchInput = document.getElementById('filter-search-input');
  const typeSelect = document.getElementById('filter-type-select');
  const statusSelect = document.getElementById('filter-status-select');
  const tbody = document.getElementById('bookings-tbody');

  const applyFilters = () => {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const type = typeSelect?.value || 'ALL';
    const status = statusSelect?.value || 'ALL';

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
      const rowSearch = row.dataset.search || '';
      const rowType = row.dataset.type || '';
      const rowStatus = row.dataset.status || '';

      const matchQ = !q || rowSearch.includes(q);
      const matchType = type === 'ALL' || rowType === type;
      const matchStatus = status === 'ALL' || rowStatus === status;

      row.style.display = (matchQ && matchType && matchStatus) ? '' : 'none';
    });
  };

  searchInput?.addEventListener('input', applyFilters);
  typeSelect?.addEventListener('change', applyFilters);
  statusSelect?.addEventListener('change', applyFilters);

  // View Uploaded Receipt
  document.querySelectorAll('.btn-member-view-ss').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const img = e.currentTarget.dataset.img;
      const id = e.currentTarget.dataset.id;
      const modalContainer = document.getElementById('member-ss-modal-container');
      modalContainer.innerHTML = `
        <div class="modal-backdrop" id="mem-ss-modal">
          <div class="modal-dialog" style="max-width: 440px;">
            <div class="modal-header" style="background: var(--primary-navy); color: white;">
              <div>
                <h4 style="color: white; margin: 0; font-size: 1.05rem;">Attached UPI Receipt</h4>
                <p style="color: #cbd5e1; font-size: 0.75rem; margin: 0;">Booking: ${id}</p>
              </div>
              <button class="modal-close-btn" id="btn-close-mem-ss" style="color: white;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 1rem; text-align: center;">
              <img src="${img}" alt="Attached Receipt" style="max-width: 100%; max-height: 400px; border-radius: var(--radius-md);" />
            </div>
          </div>
        </div>
      `;
      const activeModal = document.getElementById('mem-ss-modal');
      document.getElementById('btn-close-mem-ss')?.addEventListener('click', () => activeModal?.remove());
    });
  });

  // Download PDF Receipt
  document.querySelectorAll('.btn-dl-receipt').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.bookingId;
      const b = await bookingService.getBooking(id);
      if (b) pdfService.generateMemberReceiptPDF(b);
    });
  });
}
