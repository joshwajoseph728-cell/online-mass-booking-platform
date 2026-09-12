import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { firestoreService } from '../../services/firestoreService.js';
import { bookingService } from '../../services/bookingService.js';
import { pdfService } from '../../services/pdfService.js';
import { notificationService } from '../../services/notificationService.js';
import { formatDate, formatDateTime } from '../../utils/dateUtils.js';
import { formatCurrency } from '../../utils/formatters.js';
import { renderOfflineBookingModalHtml, attachOfflineBookingModalEvents } from '../../components/OfflineBookingModal.js';
import { supabaseService } from '../../services/supabaseService.js';

export async function renderManageBookingsPage(router) {
  const bookings = await firestoreService.getCollection('massIntentions');
  const modalHtml = await renderOfflineBookingModalHtml();
  const pendingVerifications = bookings.filter(b => b.paymentStatus === 'PENDING_VERIFICATION' || (b.bookingStatus === 'PENDING' && (b.receiptScreenshot || b.utrNumber)));

  const contentHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Master Mass Intentions Database</h2>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 700; color: #15803d; background: #f0fdf4; border: 1px solid #86efac; padding: 0.2rem 0.6rem; border-radius: var(--radius-full);">
            <span style="width: 7px; height: 7px; background: #22c55e; border-radius: 50%; display: inline-block;"></span>
            LIVE SYNC
          </span>
        </div>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          Total registered intentions: <strong>${bookings.length}</strong> (Online & Counter Cash)
        </p>
      </div>

      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button id="btn-refresh-bookings" class="btn btn-outline btn-sm" title="Refresh Live Data">
          🔄 Refresh
        </button>
        <button id="btn-open-offline-booking-modal" class="btn btn-gold btn-sm btn-open-offline-booking-modal">
          ➕ Register Cash / Counter Intention
        </button>
        <button id="btn-export-bookings-csv" class="btn btn-outline btn-sm">
          📊 Export CSV
        </button>
      </div>
    </div>

    <!-- Pending Verification Alert Banner (Option 1 UTR & Option 2 Screenshot) -->
    ${pendingVerifications.length > 0 ? `
      <div style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: var(--radius-lg); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="font-size: 1.8rem;">⚡</div>
          <div>
            <strong style="color: #92400e; font-size: 0.98rem;">${pendingVerifications.length} Payment Verification(s) Awaiting Parish Office Approval</strong>
            <p style="color: #b45309; font-size: 0.82rem; margin: 0.15rem 0 0 0;">
              Parishioners submitted offerings via <strong>Option 1 (12-Digit UTR)</strong> and <strong>Option 2 (Screenshot Upload)</strong>. Verify and forward names to Rev. Father's portal.
            </p>
          </div>
        </div>
        <button type="button" id="btn-filter-pending-screenshots" class="btn btn-gold btn-sm" style="font-weight: 700;">
          🔍 Review Pending (${pendingVerifications.length})
        </button>
      </div>
    ` : ''}

    <!-- Search & Filter Controls -->
    <div class="card" style="padding: 1.25rem; margin-bottom: 1.5rem;">
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem;">
        <input type="text" id="admin-booking-search" class="form-control" placeholder="Search by booking ID, UTR, parishioner name, phone, or intention..." />
        <select id="admin-booking-status" class="form-select">
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending (Awaiting Approval)</option>
          <option value="APPROVED">Approved</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select id="admin-booking-type" class="form-select">
          <option value="ALL">All Intention Types</option>
          <option value="Departed Soul">Departed Soul</option>
          <option value="Thanksgiving">Thanksgiving</option>
          <option value="Healing Prayer">Healing Prayer</option>
          <option value="Special Intention">Special Intention</option>
        </select>
      </div>
    </div>

    <!-- Bookings Table -->
    <div class="card card-elevated">
      <div class="card-body" style="padding: 0;">
        <div class="table-responsive">
          <table class="church-table">
            <thead>
              <tr>
                <th>Booking ID & Time</th>
                <th>Category</th>
                <th>Person(s) to Pray For</th>
                <th>Parishioner</th>
                <th>Mass Date & Time</th>
                <th>Stipend & Verification</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="admin-bookings-tbody">
              ${bookings.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    No Mass intentions booked yet. Bookings submitted by parishioners will appear here.
                  </td>
                </tr>
              ` : bookings.map(b => `
                <tr data-type="${b.intentionType}" data-status="${b.bookingStatus}" data-has-ss="${b.receiptScreenshot ? '1' : '0'}" data-has-utr="${b.utrNumber ? '1' : '0'}" data-search="${(b.bookingId + ' ' + (b.utrNumber || '') + ' ' + b.personNames + ' ' + b.fullName + ' ' + b.phone).toLowerCase()}">
                  <td>
                    <strong style="font-family: monospace; color: var(--primary-navy);">${b.bookingId}</strong>
                    <div style="font-size: 0.72rem; color: #64748b; margin-top: 0.15rem;">
                      🕒 ${formatDateTime(b.createdAt)}
                    </div>
                  </td>
                  <td><span class="badge badge-departed">${b.intentionType}</span></td>
                  <td>
                    <strong>${b.personNames}</strong>
                    ${b.notes ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${b.notes}</div>` : ''}
                  </td>
                  <td>
                    <div>${b.fullName}</div>
                    <small style="color: var(--text-muted);">${b.phone}</small>
                  </td>
                  <td>
                    <div>${formatDate(b.massDate)}</div>
                    <small style="color: var(--text-muted);">${b.massTime}</small>
                  </td>
                  <td>
                    <strong>${formatCurrency(b.offeringAmount)}</strong>
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
                    <select class="form-select admin-status-select" data-id="${b.bookingId}" style="padding: 0.2rem 0.4rem; font-size: 0.75rem; width: auto;">
                      <option value="PENDING" ${b.bookingStatus === 'PENDING' ? 'selected' : ''}>Pending</option>
                      <option value="APPROVED" ${b.bookingStatus === 'APPROVED' ? 'selected' : ''}>Approved</option>
                      <option value="SCHEDULED" ${b.bookingStatus === 'SCHEDULED' ? 'selected' : ''}>Scheduled</option>
                      <option value="COMPLETED" ${b.bookingStatus === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                      <option value="REJECTED" ${b.bookingStatus === 'REJECTED' ? 'selected' : ''}>Rejected</option>
                    </select>
                  </td>
                  <td>
                    <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                      ${b.utrNumber ? `
                        <button class="btn btn-gold btn-sm btn-view-utr" data-id="${b.bookingId}" title="Verify 12-Digit UTR Reference" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; font-weight: 700;">
                          🔢 Verify UTR
                        </button>
                      ` : b.receiptScreenshot ? `
                        <button class="btn btn-gold btn-sm btn-view-screenshot" data-id="${b.bookingId}" title="Check Transaction Time & Verify Receipt" style="padding: 0.25rem 0.55rem; font-size: 0.75rem; font-weight: 700;">
                          📸 Check & Verify
                        </button>
                      ` : ''}
                      <button class="btn btn-outline btn-sm btn-admin-receipt" data-id="${b.bookingId}" title="Download PDF Receipt">
                        📄
                      </button>
                      <button class="btn btn-danger btn-sm btn-admin-delete" data-id="${b.bookingId}" title="Delete">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- VERIFICATION MODAL CONTAINER -->
    <div id="screenshot-modal-container"></div>

    <!-- OFFLINE BOOKING MODAL -->
    ${modalHtml}
  `;

  return await renderDashboardLayout({
    activeRoute: '/admin/bookings',
    title: 'Master Bookings',
    contentHtml
  });
}

export function attachManageBookingsEvents(router) {
  attachDashboardEvents(router);
  attachOfflineBookingModalEvents(router);

  const search = document.getElementById('admin-booking-search');
  const statusSel = document.getElementById('admin-booking-status');
  const typeSel = document.getElementById('admin-booking-type');
  const tbody = document.getElementById('admin-bookings-tbody');

  const filter = () => {
    const q = (search?.value || '').toLowerCase().trim();
    const st = statusSel?.value || 'ALL';
    const tp = typeSel?.value || 'ALL';

    const rows = tbody.querySelectorAll('tr');
    rows.forEach(r => {
      const matchQ = !q || (r.dataset.search || '').includes(q);
      const matchSt = st === 'ALL' || r.dataset.status === st;
      const matchTp = tp === 'ALL' || r.dataset.type === tp;

      r.style.display = (matchQ && matchSt && matchTp) ? '' : 'none';
    });
  };

  search?.addEventListener('input', filter);
  statusSel?.addEventListener('change', filter);
  typeSel?.addEventListener('change', filter);

  // Refresh live data button
  document.getElementById('btn-refresh-bookings')?.addEventListener('click', () => {
    notificationService.info('Refreshing bookings from Supabase cloud...');
    router.navigate('/admin/bookings');
  });

  // Supabase Realtime Listener: Auto-update on new booking from any phone
  if (supabaseService.isConfigured()) {
    const channel = supabaseService.subscribeToBookings((payload) => {
      if (payload.eventType === 'INSERT') {
        const booker = payload.new?.full_name || 'A parishioner';
        const souls = payload.new?.person_names || '';
        notificationService.success(`🔔 New Mass Intention received from ${booker} (${souls})!`);
        setTimeout(() => {
          router.navigate('/admin/bookings');
        }, 800);
      } else if (payload.eventType === 'UPDATE') {
        setTimeout(() => {
          router.navigate('/admin/bookings');
        }, 500);
      }
    });
  }

  // Quick filter for pending verifications
  document.getElementById('btn-filter-pending-screenshots')?.addEventListener('click', () => {
    statusSel.value = 'PENDING';
    filter();
  });

  // OPTION 1: View UTR Modal Handler
  document.querySelectorAll('.btn-view-utr').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const booking = await bookingService.getBooking(id);
      if (!booking) return;

      const modalContainer = document.getElementById('screenshot-modal-container');
      modalContainer.innerHTML = `
        <div class="modal-backdrop" id="active-verification-modal">
          <div class="modal-dialog" style="max-width: 540px;">
            <div class="modal-header" style="background: var(--primary-navy); color: white;">
              <div>
                <h4 style="color: white; margin: 0; font-size: 1.1rem;">🔢 Option 1: 12-Digit UTR Bank Verification</h4>
                <p style="color: #cbd5e1; font-size: 0.75rem; margin: 0;">Booking Ref: ${booking.bookingId}</p>
              </div>
              <button class="modal-close-btn" id="btn-close-verif-modal" style="color: white;">&times;</button>
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
                  <span style="color: var(--text-muted);">Offering Stipend:</span>
                  <strong style="color: #15803d; font-size: 0.95rem;">₹${booking.offeringAmount}</strong>
                </div>
              </div>

              <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: var(--radius-md); padding: 0.75rem 1rem; font-size: 0.78rem; color: #166534;">
                👉 <strong>Bank Check</strong>: Please check church SBI/UPI bank ledger for credit of <strong>₹${booking.offeringAmount}</strong> with UTR <strong>${booking.utrNumber}</strong> around <strong>${formatDateTime(booking.createdAt)}</strong>.
              </div>
            </div>

            <div class="modal-footer" style="display: flex; gap: 0.75rem; justify-content: space-between; background: var(--bg-surface-alt);">
              <button type="button" id="btn-modal-reject-utr" class="btn btn-danger btn-sm" style="font-weight: 700;">
                ✕ Reject UTR
              </button>
              <button type="button" id="btn-modal-approve-utr" class="btn btn-gold" style="font-weight: 700; box-shadow: var(--shadow-gold);">
                ✓ Verify UTR & Send Namelist to Priest Portal
              </button>
            </div>
          </div>
        </div>
      `;

      const activeModal = document.getElementById('active-verification-modal');
      const close = () => activeModal?.remove();
      document.getElementById('btn-close-verif-modal')?.addEventListener('click', close);

      document.getElementById('btn-modal-approve-utr')?.addEventListener('click', async () => {
        await bookingService.verifyAndApproveReceipt(booking.bookingId, 'Parish Admin');
        notificationService.success(`✓ UTR Verified! "${booking.personNames}" namelist has been successfully added to Rev. Father's Priest Portal and Altar Prayer Sheet.`);
        close();
        router.navigate('/admin/bookings');
      });

      document.getElementById('btn-modal-reject-utr')?.addEventListener('click', async () => {
        const reason = prompt('Please enter the reason for rejection (e.g. UTR not found in bank statement, amount mismatch):', 'UTR reference not found in parish bank statement');
        if (reason) {
          await bookingService.rejectReceipt(booking.bookingId, reason, 'Parish Admin');
          notificationService.warning(`Booking ${booking.bookingId} rejected.`);
          close();
          router.navigate('/admin/bookings');
        }
      });
    });
  });

  // OPTION 2: View Screenshot Modal Handler
  document.querySelectorAll('.btn-view-screenshot').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const booking = await bookingService.getBooking(id);
      if (!booking || !booking.receiptScreenshot) return;

      const modalContainer = document.getElementById('screenshot-modal-container');
      modalContainer.innerHTML = `
        <div class="modal-backdrop" id="active-ss-modal">
          <div class="modal-dialog" style="max-width: 580px;">
            <div class="modal-header" style="background: var(--primary-navy); color: white;">
              <div>
                <h4 style="color: white; margin: 0; font-size: 1.1rem;">📸 Option 2: Check Transaction Time & Verify Intention</h4>
                <p style="color: #cbd5e1; font-size: 0.75rem; margin: 0;">Booking Ref: ${booking.bookingId}</p>
              </div>
              <button class="modal-close-btn" id="btn-close-ss-modal" style="color: white;">&times;</button>
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
                  🔎 <strong>Admin Verification Check</strong>: Compare the transaction date and time on the uploaded UPI screenshot below with the booking timestamp above (<strong>${formatDateTime(booking.createdAt)}</strong>). If the payment matches, click <strong>✓ Verify & Send to Priest Portal</strong>.
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
                  <span style="color: var(--text-muted);">Offering Stipend:</span>
                  <strong style="color: #15803d; font-size: 0.95rem;">₹${booking.offeringAmount}</strong>
                </div>
              </div>

              <!-- Full Screenshot Image with preview container -->
              <div style="background: #0f172a; padding: 0.5rem; border-radius: var(--radius-md); max-height: 340px; overflow-y: auto; text-align: center;">
                <img src="${booking.receiptScreenshot}" alt="Uploaded Receipt Screenshot" style="max-width: 100%; border-radius: var(--radius-sm); display: block; margin: 0 auto;" />
              </div>
            </div>

            <div class="modal-footer" style="display: flex; gap: 0.75rem; justify-content: space-between; background: var(--bg-surface-alt);">
              <button type="button" id="btn-modal-reject-ss" class="btn btn-danger btn-sm" style="font-weight: 700;">
                ✕ Reject (Time / Amount Mismatch)
              </button>
              <button type="button" id="btn-modal-approve-ss" class="btn btn-gold" style="font-weight: 700; box-shadow: var(--shadow-gold);">
                ✓ Verify & Send Namelist to Priest Portal
              </button>
            </div>
          </div>
        </div>
      `;

      const activeModal = document.getElementById('active-ss-modal');
      const close = () => activeModal?.remove();
      document.getElementById('btn-close-ss-modal')?.addEventListener('click', close);

      // Approve in modal -> Immediately releases namelist to Priest Portal & Altar Sheet
      document.getElementById('btn-modal-approve-ss')?.addEventListener('click', async () => {
        await bookingService.verifyAndApproveReceipt(booking.bookingId, 'Parish Admin');
        notificationService.success(`✓ Payment verified! "${booking.personNames}" namelist has been successfully added to Rev. Father's Priest Portal and Altar Prayer Sheet.`);
        close();
        router.navigate('/admin/bookings');
      });

      // Reject in modal
      document.getElementById('btn-modal-reject-ss')?.addEventListener('click', async () => {
        const reason = prompt('Please enter the reason for rejection (e.g. Transaction time does not match, payment not credited):', 'Transaction time does not match booking timestamp');
        if (reason) {
          await bookingService.rejectReceipt(booking.bookingId, reason, 'Parish Admin');
          notificationService.warning(`Booking ${booking.bookingId} rejected.`);
          close();
          router.navigate('/admin/bookings');
        }
      });
    });
  });

  // Status Change
  document.querySelectorAll('.admin-status-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const val = e.target.value;
      await bookingService.updateStatus(id, val, 'Status modified by administrator', 'Parish Admin');
      notificationService.success(`Booking ${id} status updated to ${val}.`);
    });
  });

  // Receipt Download
  document.querySelectorAll('.btn-admin-receipt').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      const b = await bookingService.getBooking(id);
      if (b) pdfService.generateMemberReceiptPDF(b);
    });
  });

  // Delete Booking
  document.querySelectorAll('.btn-admin-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm(`Permanently delete booking ${id}?`)) {
        await firestoreService.deleteDocument('massIntentions', id);
        notificationService.success(`Booking ${id} deleted.`);
        router.navigate('/admin/bookings');
      }
    });
  });

  // CSV Export
  document.getElementById('btn-export-bookings-csv')?.addEventListener('click', async () => {
    const bookings = await firestoreService.getCollection('massIntentions');
    const headers = ['Booking ID', 'Intention Type', 'Person Names', 'Parishioner Name', 'Phone', 'Mass Date', 'Mass Time', 'Offering Amount', 'Status'];
    const csvRows = [
      headers.join(','),
      ...bookings.map(b => [
        b.bookingId,
        `"${b.intentionType}"`,
        `"${b.personNames.replace(/"/g, '""')}"`,
        `"${b.fullName}"`,
        b.phone,
        b.massDate,
        b.massTime,
        b.offeringAmount,
        b.bookingStatus
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mass_Intentions_Master_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    notificationService.success('CSV Export downloaded.');
  });
}

