// Admin: Parish Reports & Liturgical Statistics Export

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { firestoreService } from '../../services/firestoreService.js';
import { notificationService } from '../../services/notificationService.js';
import { formatCurrency } from '../../utils/formatters.js';

export async function renderReportsPage(router) {
  const bookings = await firestoreService.getCollection('massIntentions');
  const payments = await firestoreService.getCollection('payments');

  const totalAmount = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const contentHtml = `
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Parish Reports & Audit Statements</h2>
      <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
        Generate consolidated reports for parish council meetings, diocesan submissions, and finance audits.
      </p>
    </div>

    <!-- Report Generator Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
      
      <!-- 1. Mass Intentions Summary -->
      <div class="card card-gold-border" style="padding: 1.75rem;">
        <div style="font-size: 2rem; color: var(--primary-navy); margin-bottom: 0.75rem;">📖</div>
        <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">Mass Intentions Register</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          Complete log of all Departed Souls, Thanksgiving, and Healing prayer intentions with celebrant approvals.
        </p>
        <button id="btn-rep-intentions-csv" class="btn btn-primary btn-block btn-sm">
          📊 Export Intentions CSV
        </button>
      </div>

      <!-- 2. Offerings & Financial Audit -->
      <div class="card card-gold-border" style="padding: 1.75rem;">
        <div style="font-size: 2rem; color: #15803d; margin-bottom: 0.75rem;">💳</div>
        <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">Offerings & Financial Ledger</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          Total Collections to date: <strong>${formatCurrency(totalAmount)}</strong>. Itemized Razorpay reconciliation.
        </p>
        <button id="btn-rep-financial-csv" class="btn btn-gold btn-block btn-sm">
          💰 Export Financial Ledger CSV
        </button>
      </div>

      <!-- 3. Diocesan Annual Statistical Report -->
      <div class="card" style="padding: 1.75rem;">
        <div style="font-size: 2rem; color: var(--gold-accent-hover); margin-bottom: 0.75rem;">⛪</div>
        <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">Liturgical Statistics Report</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          Summary breakdown of intentions fulfilled, active clergy celebrants, and monthly trends.
        </p>
        <button id="btn-print-summary-sheet" class="btn btn-outline btn-block btn-sm">
          🖨️ Print Executive Summary
        </button>
      </div>

    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/admin/reports',
    title: 'Parish Reports',
    contentHtml
  });
}

export function attachReportsEvents(router) {
  attachDashboardEvents(router);

  document.getElementById('btn-rep-intentions-csv')?.addEventListener('click', async () => {
    const bookings = await firestoreService.getCollection('massIntentions');
    const headers = ['Booking ID', 'Category', 'Person Names', 'Offering Amount', 'Status', 'Date', 'Time'];
    const rows = [
      headers.join(','),
      ...bookings.map(b => [b.bookingId, `"${b.intentionType}"`, `"${b.personNames.replace(/"/g, '""')}"`, b.offeringAmount, b.bookingStatus, b.massDate, b.massTime].join(','))
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Parish_Intentions_Report_${Date.now()}.csv`;
    a.click();
    notificationService.success('Intentions CSV generated.');
  });

  document.getElementById('btn-rep-financial-csv')?.addEventListener('click', async () => {
    const payments = await firestoreService.getCollection('payments');
    const headers = ['Payment ID', 'Booking ID', 'Amount', 'Date', 'Status'];
    const rows = [
      headers.join(','),
      ...payments.map(p => [p.paymentId, p.bookingId, p.amount, p.createdAt, p.status].join(','))
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Parish_Financial_Report_${Date.now()}.csv`;
    a.click();
    notificationService.success('Financial CSV generated.');
  });

  document.getElementById('btn-print-summary-sheet')?.addEventListener('click', () => {
    window.print();
  });
}
