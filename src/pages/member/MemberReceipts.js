// Member PDF Receipts & Official Records Page

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { authService } from '../../services/authService.js';
import { bookingService } from '../../services/bookingService.js';
import { pdfService } from '../../services/pdfService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { formatDate } from '../../utils/dateUtils.js';

export async function renderMemberReceiptsPage(router) {
  const user = authService.getCurrentUser();
  const bookings = await bookingService.getMemberBookings(user?.id);
  const paidBookings = bookings.filter(b => b.paymentStatus === 'PAID');

  const contentHtml = `
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Official Mass Intention Receipts</h2>
      <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
        Download or print digitally signed parish receipts with verified payment references.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
      ${paidBookings.map(b => `
        <div class="card card-gold-border" style="padding: 1.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Receipt & Record</span>
              <h4 style="font-family: monospace; font-size: 1.15rem; margin: 0.2rem 0 0; color: var(--primary-navy);">${b.bookingId}</h4>
            </div>
            <span class="badge badge-paid">PAID &bull; ${formatCurrency(b.offeringAmount)}</span>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.25rem; background: var(--bg-surface-alt); padding: 0.85rem; border-radius: var(--radius-md);">
            <div><strong>For:</strong> ${b.personNames}</div>
            <div><strong>Intention:</strong> ${b.intentionType}</div>
            <div><strong>Mass Date:</strong> ${formatDate(b.massDate)} at ${b.massTime}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Ref: ${b.paymentId || 'N/A'}</div>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-primary btn-sm btn-block btn-generate-pdf" data-booking-id="${b.bookingId}">
              📄 Download PDF
            </button>
            <button class="btn btn-outline btn-sm btn-print-single" data-booking-id="${b.bookingId}">
              🖨️ Print
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/member/receipts',
    title: 'Parish Receipts',
    contentHtml
  });
}

export function attachMemberReceiptsEvents(router) {
  attachDashboardEvents(router);

  document.querySelectorAll('.btn-generate-pdf').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.bookingId;
      const b = await bookingService.getBooking(id);
      if (b) pdfService.generateMemberReceiptPDF(b);
    });
  });

  document.querySelectorAll('.btn-print-single').forEach(btn => {
    btn.addEventListener('click', () => {
      window.print();
    });
  });
}
