import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { bookingService } from '../../services/bookingService.js';
import { authService } from '../../services/authService.js';
import { notificationService } from '../../services/notificationService.js';
import { pdfService } from '../../services/pdfService.js';
import { formatDate, formatDateTime } from '../../utils/dateUtils.js';
import { formatCurrency } from '../../utils/formatters.js';
import { renderOfflineBookingModalHtml, attachOfflineBookingModalEvents } from '../../components/OfflineBookingModal.js';

export async function renderPriestIntentionsPage(router) {
  const allBookings = await bookingService.getAllBookings();
  const modalHtml = await renderOfflineBookingModalHtml();
  const pendingVerifications = allBookings.filter(b => b.paymentStatus === 'PENDING_VERIFICATION' || (b.bookingStatus === 'PENDING' && (b.receiptScreenshot || b.utrNumber)));

  const contentHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Manage All Parish Mass Intentions</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          Filter by intention category, parishioner name, liturgical dates, and approval statuses.
        </p>
      </div>

      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button id="btn-open-offline-booking-modal" class="btn btn-gold btn-open-offline-booking-modal">
          ➕ Register Cash / Offline Intention
        </button>
      </div>
    </div>

    <!-- Pending Verification Alert Banner -->
    ${pendingVerifications.length > 0 ? `
      <div style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="font-size: 1.8rem;">⚡</div>
          <div>
            <strong style="color: #92400e; font-size: 0.98rem;">${pendingVerifications.length} Offering Verification(s) Awaiting Rev. Father's Approval</strong>
            <p style="color: #b45309; font-size: 0.82rem; margin: 0.15rem 0 0 0;">
              Parishioners submitted offerings via <strong>Option 1 (12-Digit UTR)</strong> and <strong>Option 2 (Screenshot Upload)</strong>. Verify and release to Altar Prayer List with 1 click.
            </p>
          </div>
        </div>
        <button type="button" id="btn-priest-filter-pending-ss" class="btn btn-gold btn-sm" style="font-weight: 700;">
          🔍 Review Pending (${pendingVerifications.length})
        </button>
      </div>
    ` : ''}

    <!-- Search & Filters -->
    <div class="card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 1rem;">
        <input type="text" id="priest-search-input" class="form-control" placeholder="Search by name, UTR, booking ID, phone..." />
        <select id="priest-type-select" class="form-select">
          <option value="ALL">All Categories</option>
          <option value="Departed Soul">Departed Soul</option>
          <option value="Thanksgiving">Thanksgiving</option>
          <option value="Healing Prayer">Healing Prayer</option>
          <option value="Special Intention">Special Intention</option>
        </select>
        <select id="priest-status-select" class="form-select">
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved (On Altar)</option>
          <option value="COMPLETED">Mass Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input type="date" id="priest-date-filter" class="form-control" title="Filter by Mass date" />
      </div>
    </div>

    <!-- Intentions Table -->
    <div class="card card-elevated">
      <div class="card-body" style="padding: 0;">
        <div class="table-responsive">
          <table class="church-table">
            <thead>
              <tr>
                <th>Booking ID & Time</th>
                <th>Category</th>
                <th>Person(s) to Pray For</th>
                <th>Mass Date & Time</th>
                <th>Parishioner</th>
                <th>Offering & Verification</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="priest-intentions-tbody">
              ${allBookings.map(b => `
                <tr data-type="${b.intentionType}" data-status="${b.bookingStatus}" data-date="${b.massDate || ''}" data-has-ss="${b.receiptScreenshot ? '1' : '0'}" data-has-utr="${b.utrNumber ? '1' : '0'}" data-search="${(b.bookingId + ' ' + (b.utrNumber || '') + ' ' + b.personNames + ' ' + b.fullName + ' ' + b.phone).toLowerCase()}">
                  <td>
                    <strong style="font-family: monospace; color: var(--primary-navy);">${b.bookingId}</strong>
                    <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.15rem;">
                      🕒 ${formatDateTime(b.createdAt)}
                    </div>
                  </td>
                  <td><span class="badge badge-departed">${b.intentionType}</span></td>
                  <td>
                    <strong style="color: var(--primary-navy);">${b.personNames}</strong>
                    ${b.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">“${b.notes}”</div>` : ''}
                  </td>
                  <td>
                    <div>${formatDate(b.massDate)}</div>
                    <small style="color: var(--text-muted);">${b.massTime}</small>
                  </td>
                  <td>
                    <div>${b.fullName}</div>
                    <small style="color: var(--text-muted);">${b.phone}</small>
                  </td>
                  <td>
                    <strong>${formatCurrency(b.offeringAmount || b.amount || 150)}</strong>
                    <div style="font-size: 0.72rem; color: ${b.paymentStatus === 'PAID' ? '#15803d' : b.paymentStatus === 'REJECTED' ? '#b91c1c' : '#d97706'}; font-weight: 700;">
                      ${b.paymentStatus === 'PAID' ? '✓ PAID' : b.paymentStatus === 'REJECTED' ? '✕ REJECTED' : '⏳ PENDING'}
                    </div>
                    ${b.utrNumber ? `
                      <div style="font-size: 0.68rem; font-family: monospace; color: #3730a3; font-weight: 700; margin-top: 0.2rem; background: #e0e7ff; padding: 0.15rem 0.4rem; border-radius: var(--radius-sm); display: inline-block;">
                        🔢 UTR: ${b.utrNumber}
                      </div>
                    ` : b.receiptScreenshot ? `
                      <div style="font-size: 0.68rem; color: #92400e; font-weight: 700; margin-top: 0.2rem; background: #fef3c7; padding: 0.15rem 0.4rem; border-radius: var(--radius-sm); display: inline-block;">
                        📸 Screenshot
                      </div>
                    ` : ''}
                  </td>
                  <td>
                    <span class="badge ${b.bookingStatus === 'APPROVED' ? 'badge-approved' : b.bookingStatus === 'COMPLETED' ? 'badge-completed' : b.bookingStatus === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}">
                      ${b.bookingStatus}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                      ${b.utrNumber ? `
                        <button class="btn btn-gold btn-sm btn-priest-view-utr" data-id="${b.bookingId}" title="Verify 12-Digit UTR Reference" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; font-weight: 700;">
                          🔢 Verify UTR
                        </button>
                      ` : b.receiptScreenshot ? `
                        <button class="btn btn-gold btn-sm btn-priest-view-ss" data-id="${b.bookingId}" title="Check Transaction Time & Verify Receipt" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; font-weight: 700;">
                          📸 Check & Verify
                        </button>
                      ` : ''}
                      ${b.bookingStatus === 'PENDING' ? `
                        <button class="btn btn-primary btn-sm btn-action-approve" data-id="${b.bookingId}" title="Verify and release to altar">✓ Tick & Release</button>
                        <button class="btn btn-danger btn-sm btn-action-reject" data-id="${b.bookingId}">✕ Reject</button>
                      ` : b.bookingStatus === 'APPROVED' ? `
                        <button class="btn btn-gold btn-sm btn-action-complete" data-id="${b.bookingId}">✓ Complete Mass</button>
                      ` : ''}
                      <button class="btn btn-outline btn-sm btn-priest-receipt" data-id="${b.bookingId}">📄</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- PRIEST VERIFICATION MODAL CONTAINER -->
    <div id="priest-ss-modal-container"></div>

    <!-- OFFLINE BOOKING MODAL -->
    ${modalHtml}
  `;

  return await renderDashboardLayout({
    activeRoute: '/priest/intentions',
    title: 'Mass Intentions Directory',
    contentHtml
  });
}

export function attachPriestIntentionsEvents(router) {
  attachDashboardEvents(router);
  attachOfflineBookingModalEvents(router);

  const user = authService.getCurrentUser();
  const searchInput = document.getElementById('priest-search-input');
  const typeSelect = document.getElementById('priest-type-select');
  const statusSelect = document.getElementById('priest-status-select');
  const dateFilter = document.getElementById('priest-date-filter');
  const tbody = document.getElementById('priest-intentions-tbody');

  const filterTable = () => {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const type = typeSelect?.value || 'ALL';
    const status = statusSelect?.value || 'ALL';
    const date = dateFilter?.value || '';

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
      const rowSearch = row.dataset.search || '';
      const rowType = row.dataset.type || '';
      const rowStatus = row.dataset.status || '';
      const rowDate = row.dataset.date || '';

      const matchQ = !q || rowSearch.includes(q);
      const matchType = type === 'ALL' || rowType === type;
      const matchStatus = status === 'ALL' || rowStatus === status;
      const matchDate = !date || rowDate === date;

      row.style.display = (matchQ && matchType && matchStatus && matchDate) ? '' : 'none';
    });
  };

  searchInput?.addEventListener('input', filterTable);
  typeSelect?.addEventListener('change', filterTable);
  statusSelect?.addEventListener('change', filterTable);
  dateFilter?.addEventListener('change', filterTable);

  // Quick filter for pending verifications
  document.getElementById('btn-priest-filter-pending-ss')?.addEventListener('click', () => {
    statusSelect.value = 'PENDING';
    filterTable();
  });

  // OPTION 1: View UTR Modal Handler
  document.querySelectorAll('.btn-priest-view-utr').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const booking = await bookingService.getBooking(id);
      if (!booking) return;

      const modalContainer = document.getElementById('priest-ss-modal-container');
      modalContainer.innerHTML = `
        <div class="modal-backdrop" id="priest-active-verif-modal">
          <div class="modal-dialog" style="max-width: 540px;">
            <div class="modal-header" style="background: var(--primary-navy); color: white;">
              <div>
                <h4 style="color: white; margin: 0; font-size: 1.1rem;">🔢 Option 1: 12-Digit UTR Clergy Verification</h4>
                <p style="color: #cbd5e1; font-size: 0.75rem; margin: 0;">Parishioner Offering &bull; Booking: ${booking.bookingId}</p>
              </div>
              <button class="modal-close-btn" id="btn-close-priest-verif-modal" style="color: white;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 1.25rem;">
              
              <!-- UTR Details Box -->
              <div style="background: #eef2ff; border: 1.5px solid #a5b4fc; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem; text-align: center;">
                <span style="font-size: 0.8rem; color: #4338ca; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; display: block; margin-bottom: 0.25rem;">
                  Submitted 12-Digit UPI Reference / UTR
                </span>
                <div style="font-size: 1.75rem; font-family: monospace; font-weight: 800; color: #1e1b4b; letter-spacing: 0.15em; background: white; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px dashed #6366f1;">
                  ${booking.utrNumber}
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #4338ca;">
                  App: <strong>${booking.paymentMethod}</strong> &bull; Submitted: <strong>${formatDateTime(booking.createdAt)}</strong>
                </div>
              </div>

              <!-- Booking Summary Info -->
              <div style="background: var(--bg-surface-elevated); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1rem; text-align: left; font-size: 0.82rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span style="color: var(--text-muted);">Parishioner:</span>
                  <strong>${booking.fullName} (${booking.phone})</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span style="color: var(--text-muted);">Intention For:</span>
                  <strong style="color: var(--primary-navy);">${booking.personNames} (${booking.intentionType})</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span style="color: var(--text-muted);">Mass Date & Time:</span>
                  <strong>${formatDate(booking.massDate)} at ${booking.massTime}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Offering Amount:</span>
                  <strong style="color: #15803d; font-size: 0.95rem;">₹${booking.offeringAmount || 150}</strong>
                </div>
              </div>

              <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: var(--radius-md); padding: 0.75rem 1rem; font-size: 0.78rem; color: #166534;">
                👉 <strong>Bank Check</strong>: Confirm bank credit of <strong>₹${booking.offeringAmount || 150}</strong> for UTR <strong>${booking.utrNumber}</strong> received around <strong>${formatDateTime(booking.createdAt)}</strong>.
              </div>
            </div>

            <div class="modal-footer" style="display: flex; gap: 0.75rem; justify-content: space-between; background: var(--bg-surface-alt);">
              <button type="button" id="btn-priest-reject-utr" class="btn btn-danger btn-sm" style="font-weight: 700;">
                ✕ Reject UTR
              </button>
              <button type="button" id="btn-priest-approve-utr" class="btn btn-gold" style="font-weight: 700; box-shadow: var(--shadow-gold);">
                ✓ Verify UTR & Publish to Altar Prayer Sheet
              </button>
            </div>
          </div>
        </div>
      `;

      const activeModal = document.getElementById('priest-active-verif-modal');
      const close = () => activeModal?.remove();
      document.getElementById('btn-close-priest-verif-modal')?.addEventListener('click', close);

      document.getElementById('btn-priest-approve-utr')?.addEventListener('click', async () => {
        await bookingService.verifyAndApproveReceipt(booking.bookingId, user?.fullName || 'Rev. Father');
        notificationService.success(`✓ UTR Verified! "${booking.personNames}" is now published on Today's Altar Prayer Sheet.`);
        close();
        router.navigate('/priest/intentions');
      });

      document.getElementById('btn-priest-reject-utr')?.addEventListener('click', async () => {
        const reason = prompt('Please enter the reason for rejection (e.g. UTR not found in parish accounts):', 'UTR reference not found in church account');
        if (reason) {
          await bookingService.rejectReceipt(booking.bookingId, reason, user?.fullName || 'Rev. Father');
          notificationService.warning(`Booking ${booking.bookingId} payment rejected.`);
          close();
          router.navigate('/priest/intentions');
        }
      });
    });
  });

  // OPTION 2: View Screenshot Modal Handler
  document.querySelectorAll('.btn-priest-view-ss').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const booking = await bookingService.getBooking(id);
      if (!booking || !booking.receiptScreenshot) return;

      const modalContainer = document.getElementById('priest-ss-modal-container');
      modalContainer.innerHTML = `
        <div class="modal-backdrop" id="priest-active-ss-modal">
          <div class="modal-dialog" style="max-width: 580px;">
            <div class="modal-header" style="background: var(--primary-navy); color: white;">
              <div>
                <h4 style="color: white; margin: 0; font-size: 1.1rem;">📸 Option 2: Check Transaction Time & Verify Intention</h4>
                <p style="color: #cbd5e1; font-size: 0.75rem; margin: 0;">Parishioner Offering &bull; Booking: ${booking.bookingId}</p>
              </div>
              <button class="modal-close-btn" id="btn-close-priest-ss-modal" style="color: white;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 1.25rem;">
              
              <!-- Transaction Time Comparison Box -->
              <div style="background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: var(--radius-md); padding: 0.85rem 1rem; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                  <strong style="color: #1e40af; font-size: 0.88rem;">🕒 Booking Submission Timestamp:</strong>
                  <span class="badge" style="background: #dbeafe; color: #1e40af; font-size: 0.8rem; font-weight: 700; padding: 0.25rem 0.6rem;">
                    ${formatDateTime(booking.createdAt)}
                  </span>
                </div>
                <p style="color: #1e3a8a; font-size: 0.78rem; margin: 0; line-height: 1.4;">
                  🔎 <strong>Clergy Verification Check</strong>: Compare the transaction date and time on the uploaded UPI screenshot below with the booking timestamp above (<strong>${formatDateTime(booking.createdAt)}</strong>). If the payment matches, click <strong>✓ Verify & Publish to Altar Prayer Sheet</strong>.
                </p>
              </div>

              <!-- Booking Summary Info -->
              <div style="background: var(--bg-surface-elevated); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1rem; text-align: left; font-size: 0.82rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span style="color: var(--text-muted);">Parishioner:</span>
                  <strong>${booking.fullName} (${booking.phone})</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span style="color: var(--text-muted);">Intention For:</span>
                  <strong style="color: var(--primary-navy);">${booking.personNames} (${booking.intentionType})</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                  <span style="color: var(--text-muted);">Mass Date & Time:</span>
                  <strong>${formatDate(booking.massDate)} at ${booking.massTime}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Offering Amount:</span>
                  <strong style="color: #15803d; font-size: 0.95rem;">₹${booking.offeringAmount || 150}</strong>
                </div>
              </div>

              <!-- Full Screenshot Image -->
              <div style="background: #0f172a; padding: 0.5rem; border-radius: var(--radius-md); max-height: 340px; overflow-y: auto; text-align: center;">
                <img src="${booking.receiptScreenshot}" alt="Uploaded Receipt Screenshot" style="max-width: 100%; border-radius: var(--radius-sm); display: block; margin: 0 auto;" />
              </div>
            </div>

            <div class="modal-footer" style="display: flex; gap: 0.75rem; justify-content: space-between; background: var(--bg-surface-alt);">
              <button type="button" id="btn-priest-reject-ss" class="btn btn-danger btn-sm" style="font-weight: 700;">
                ✕ Reject (Time / Amount Mismatch)
              </button>
              <button type="button" id="btn-priest-approve-ss" class="btn btn-gold" style="font-weight: 700; box-shadow: var(--shadow-gold);">
                ✓ Verify & Publish to Altar Prayer Sheet
              </button>
            </div>
          </div>
        </div>
      `;

      const activeModal = document.getElementById('priest-active-ss-modal');
      const close = () => activeModal?.remove();
      document.getElementById('btn-close-priest-ss-modal')?.addEventListener('click', close);

      // Approve in modal -> Publishes to Altar Prayer Sheet
      document.getElementById('btn-priest-approve-ss')?.addEventListener('click', async () => {
        await bookingService.verifyAndApproveReceipt(booking.bookingId, user?.fullName || 'Rev. Father');
        notificationService.success(`✓ Approved! "${booking.personNames}" is now published on Today's Altar Prayer Sheet.`);
        close();
        router.navigate('/priest/intentions');
      });

      // Reject in modal
      document.getElementById('btn-priest-reject-ss')?.addEventListener('click', async () => {
        const reason = prompt('Please enter the reason for rejection (e.g. Transaction time does not match, payment not credited):', 'Transaction time does not match booking timestamp');
        if (reason) {
          await bookingService.rejectReceipt(booking.bookingId, reason, user?.fullName || 'Rev. Father');
          notificationService.warning(`Booking ${booking.bookingId} payment rejected.`);
          close();
          router.navigate('/priest/intentions');
        }
      });
    });
  });

  // Approve
  document.querySelectorAll('.btn-action-approve').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      await bookingService.verifyAndApproveReceipt(id, user?.fullName || 'Parish Vicar');
      notificationService.success(`Intention ${id} approved & published to Altar.`);
      router.navigate('/priest/intentions');
    });
  });

  // Reject
  document.querySelectorAll('.btn-action-reject').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const reason = prompt('Reason for rejection:');
      if (reason !== null) {
        await bookingService.rejectReceipt(id, reason, user?.fullName || 'Parish Vicar');
        notificationService.warning(`Intention ${id} rejected.`);
        router.navigate('/priest/intentions');
      }
    });
  });

  // Complete
  document.querySelectorAll('.btn-action-complete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      await bookingService.updateStatus(id, 'COMPLETED', 'Mass offered.', user?.fullName || 'Parish Vicar');
      notificationService.success(`Intention ${id} marked as Completed.`);
      router.navigate('/priest/intentions');
    });
  });

  // Receipt
  document.querySelectorAll('.btn-priest-receipt').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const b = await bookingService.getBooking(id);
      if (b) pdfService.generateMemberReceiptPDF(b);
    });
  });
}

