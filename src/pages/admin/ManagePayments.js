// Admin: Payments & Razorpay Transaction Ledger

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { firestoreService } from '../../services/firestoreService.js';
import { formatCurrency } from '../../utils/formatters.js';
import { formatDate } from '../../utils/dateUtils.js';

export async function renderManagePaymentsPage(router) {
  const payments = await firestoreService.getCollection('payments');
  const totalAmount = payments
    .filter(p => p.status === 'PAID')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const contentHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Payment Transactions & Razorpay Audit</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          Verified Mass offerings & donor collections: <strong>${formatCurrency(totalAmount)}</strong>
        </p>
      </div>

      <button id="btn-export-payments-csv" class="btn btn-outline btn-sm">
        📊 Export Ledger CSV
      </button>
    </div>

    <!-- Payment Stats Summary Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem;">
      <div class="card" style="padding: 1.25rem;">
        <h5 style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Total Transactions</h5>
        <div style="font-size: 1.75rem; font-weight: 800; color: var(--primary-navy);">${payments.length}</div>
      </div>
      <div class="card" style="padding: 1.25rem;">
        <h5 style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Total Collected</h5>
        <div style="font-size: 1.75rem; font-weight: 800; color: #15803d;">${formatCurrency(totalAmount)}</div>
      </div>
      <div class="card" style="padding: 1.25rem;">
        <h5 style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Gateway Mode</h5>
        <div style="font-size: 1.15rem; font-weight: 700; color: var(--gold-accent-hover); margin-top: 0.35rem;">Razorpay Verified</div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="card card-elevated">
      <div class="card-body" style="padding: 0;">
        <div class="table-responsive">
          <table class="church-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Booking Ref</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Razorpay Order ID</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${payments.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    No payment transactions recorded yet. Completed online offerings will appear here.
                  </td>
                </tr>
              ` : payments.map(p => `
                <tr>
                  <td><strong style="font-family: monospace;">${p.paymentId}</strong></td>
                  <td>${p.bookingId || 'N/A'}</td>
                  <td><strong style="color: #15803d;">${formatCurrency(p.amount)}</strong></td>
                  <td><span class="language-pill">${p.paymentMethod || 'Razorpay / UPI'}</span></td>
                  <td><small style="color: var(--text-muted); font-family: monospace;">${p.razorpayOrderId || 'N/A'}</small></td>
                  <td>${formatDate(p.createdAt)}</td>
                  <td>
                    <span class="badge ${p.status === 'PAID' ? 'badge-paid' : 'badge-unpaid'}">
                      ${p.status}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/admin/payments',
    title: 'Payment Transactions',
    contentHtml
  });
}

export function attachManagePaymentsEvents(router) {
  attachDashboardEvents(router);

  document.getElementById('btn-export-payments-csv')?.addEventListener('click', async () => {
    const payments = await firestoreService.getCollection('payments');
    const headers = ['Payment ID', 'Booking ID', 'Amount', 'Method', 'Razorpay Order ID', 'Date', 'Status'];
    const csvRows = [
      headers.join(','),
      ...payments.map(p => [
        p.paymentId,
        p.bookingId || '',
        p.amount,
        `"${p.paymentMethod || 'Razorpay'}"`,
        p.razorpayOrderId || '',
        p.createdAt,
        p.status
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Parish_Payment_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  });
}
