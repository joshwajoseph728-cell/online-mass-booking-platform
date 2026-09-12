// Offline Cash / Counter Mass Intention Registration Modal (Used by Admin & Priest)

import { firestoreService } from '../services/firestoreService.js';
import { bookingService } from '../services/bookingService.js';
import { authService } from '../services/authService.js';
import { notificationService } from '../services/notificationService.js';
import { pdfService } from '../services/pdfService.js';
import { getTodayDateString, formatDate } from '../utils/dateUtils.js';
import { formatCurrency } from '../utils/formatters.js';

export async function renderOfflineBookingModalHtml() {
  const schedules = await firestoreService.getCollection('massSchedules');
  const activeSchedules = schedules.filter(s => s.active !== false);
  const todayStr = getTodayDateString();

  return `
    <div id="offline-booking-modal-backdrop" class="modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(10, 25, 47, 0.7); z-index: 99999; align-items: center; justify-content: center; backdrop-filter: blur(4px); padding: 1rem;">
      <div class="card card-elevated card-gold-border" style="width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; background: #fff; padding: 2rem; border-radius: var(--radius-lg); position: relative;">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
          <div>
            <h3 style="margin: 0; font-size: 1.35rem; color: var(--primary-navy); display: flex; align-items: center; gap: 0.5rem;">
              <span>💵</span> Register Offline / Cash Mass Intention
            </h3>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0.25rem 0 0 0;">
              Enter prayer requests received at the church office counter or sacristy.
            </p>
          </div>
          <button type="button" id="btn-close-offline-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); line-height: 1;">&times;</button>
        </div>

        <form id="offline-booking-form">
          <!-- 1. Offerer Info -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.85rem;">Parishioner Name <span class="required">*</span></label>
              <input type="text" id="offlineFullName" class="form-control" placeholder="e.g. Thomas Joseph" required />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.85rem;">Phone Number <span class="required">*</span></label>
              <input type="tel" id="offlinePhone" class="form-control" placeholder="e.g. 9876543210" required />
            </div>
          </div>

          <!-- 2. Category & Date/Time -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.85rem;">Intention Category <span class="required">*</span></label>
              <select id="offlineIntentionType" class="form-select" required>
                <option value="Departed Soul">✝️ Departed Soul (₹50/head)</option>
                <option value="Thanksgiving">✨ Thanksgiving</option>
                <option value="Healing Prayer">🕊️ Healing Prayer</option>
                <option value="Special Intention">🕯️ Special Intention</option>
              </select>
            </div>

            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.85rem;">Mass Date <span class="required">*</span></label>
              <input type="date" id="offlineMassDate" class="form-control" value="${todayStr}" min="${todayStr}" required />
            </div>
          </div>

          <!-- Mass Time Selection -->
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-size: 0.85rem;">Mass Time & Language <span class="required">*</span></label>
            <select id="offlineMassTime" class="form-select" required>
              ${activeSchedules.length > 0 ? activeSchedules.map(s => `
                <option value="${s.time}">⏰ ${s.time} - ${s.language} (${s.location || 'Main Altar'})</option>
              `).join('') : `
                <option value="06:30 AM">06:30 AM - Malayalam</option>
                <option value="07:00 AM">07:00 AM - English</option>
                <option value="05:30 PM">05:30 PM - Tamil</option>
                <option value="06:30 PM">06:30 PM - Malayalam</option>
              `}
            </select>
          </div>

          <!-- Souls Count (for Departed Soul) -->
          <div id="offline-souls-head-block" style="background: #fdf6e2; padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--gold-accent); margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 0.85rem; font-weight: 700; color: #854d0e;">Departed Soul Count:</span>
              <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Stipend rate: ₹50 per soul</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button type="button" id="btn-offline-dec-souls" class="btn btn-secondary btn-sm" style="padding: 0.2rem 0.6rem; font-weight: 800;">-</button>
              <input type="number" id="offlineSoulCount" value="1" min="1" max="20" style="width: 50px; text-align: center; font-weight: 700; border-radius: var(--radius-sm); border: 1px solid #ccc; padding: 0.2rem;" />
              <button type="button" id="btn-offline-inc-souls" class="btn btn-gold btn-sm" style="padding: 0.2rem 0.6rem; font-weight: 800;">+</button>
            </div>
          </div>

          <!-- 3. Person(s) Name(s) -->
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-size: 0.85rem;">Person(s) Name(s) to Pray For <span class="required">*</span></label>
            <input type="text" id="offlinePersonNames" class="form-control" placeholder="e.g. Late Mr. Anthony & Maria / Baby Joshua" required />
            <small style="color: var(--text-muted); font-size: 0.75rem;">Enter names separated by commas for multiple people.</small>
          </div>

          <!-- 4. Notes / Intentions -->
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-size: 0.85rem;">Special Intention / Petition Notes (Optional)</label>
            <input type="text" id="offlineNotes" class="form-control" placeholder="e.g. For swift recovery / 1st Death Anniversary" />
          </div>

          <!-- 5. Offering Amount & Payment Method -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; background: var(--bg-surface-alt); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.85rem; font-weight: 700;">Offering Amount (₹) <span class="required">*</span></label>
              <input type="number" id="offlineOfferingAmount" class="form-control" value="50" min="10" required />
            </div>
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 0.85rem; font-weight: 700;">Payment Status <span class="required">*</span></label>
              <select id="offlinePaymentMethod" class="form-select">
                <option value="Cash (Church Counter)">💵 Cash Paid (Counter)</option>
                <option value="Direct UPI / QR (Office)">📱 UPI / QR Paid (Office)</option>
                <option value="Office Voucher / Exempt">🧾 Free / Parish Priest Exempt</option>
              </select>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button type="button" id="btn-cancel-offline-modal" class="btn btn-secondary btn-block">Cancel</button>
            <button type="submit" id="btn-submit-offline-booking" class="btn btn-gold btn-block btn-lg" style="font-weight: 700;">
              ✓ Confirm & Register Intention
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}

export function attachOfflineBookingModalEvents(router, onBookingAddedCallback = null) {
  const modal = document.getElementById('offline-booking-modal-backdrop');
  const closeBtn = document.getElementById('btn-close-offline-modal');
  const cancelBtn = document.getElementById('btn-cancel-offline-modal');
  const form = document.getElementById('offline-booking-form');

  const typeSelect = document.getElementById('offlineIntentionType');
  const soulsBlock = document.getElementById('offline-souls-head-block');
  const soulCountInput = document.getElementById('offlineSoulCount');
  const btnInc = document.getElementById('btn-offline-inc-souls');
  const btnDec = document.getElementById('btn-offline-dec-souls');
  const amountInput = document.getElementById('offlineOfferingAmount');

  // Open modal triggers across the page
  document.querySelectorAll('.btn-open-offline-booking-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.style.display = 'flex';
      document.getElementById('offlineFullName')?.focus();
    });
  });

  const closeModal = () => {
    if (modal) modal.style.display = 'none';
  };

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  // Update stipend calculation when type or soul count changes
  const updateStipend = () => {
    const selectedType = typeSelect.value;
    if (selectedType === 'Departed Soul') {
      soulsBlock.style.display = 'flex';
      const count = Math.max(1, parseInt(soulCountInput.value) || 1);
      amountInput.value = count * 50;
    } else {
      soulsBlock.style.display = 'none';
      if (parseInt(amountInput.value) <= 50) {
        amountInput.value = 150;
      }
    }
  };

  typeSelect?.addEventListener('change', updateStipend);

  btnInc?.addEventListener('click', () => {
    soulCountInput.value = Math.min(20, (parseInt(soulCountInput.value) || 1) + 1);
    updateStipend();
  });

  btnDec?.addEventListener('click', () => {
    soulCountInput.value = Math.max(1, (parseInt(soulCountInput.value) || 1) - 1);
    updateStipend();
  });

  soulCountInput?.addEventListener('input', updateStipend);

  // Form Submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    const submitBtn = document.getElementById('btn-submit-offline-booking');

    const fullName = document.getElementById('offlineFullName').value.trim();
    const phone = document.getElementById('offlinePhone').value.trim();
    const intentionType = typeSelect.value;
    const numberOfSouls = intentionType === 'Departed Soul' ? (parseInt(soulCountInput.value) || 1) : 1;
    const personNames = document.getElementById('offlinePersonNames').value.trim();
    const massDate = document.getElementById('offlineMassDate').value;
    const massTime = document.getElementById('offlineMassTime').value;
    const notes = document.getElementById('offlineNotes').value.trim();
    const offeringAmount = Number(amountInput.value) || 50;
    const paymentMethod = document.getElementById('offlinePaymentMethod').value;

    if (!fullName || !phone || !personNames || !massDate || !massTime) {
      notificationService.warning('Please fill in all required fields.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Registering Intention...';

    try {
      const newBooking = await bookingService.createBooking({
        userId: 'offline_parishioner_' + Date.now(),
        fullName,
        phone,
        email: '',
        intentionType,
        numberOfSouls,
        personNames,
        massDate,
        massTime,
        notes,
        offeringAmount,
        paymentMethod,
        paymentId: 'CASH_' + Date.now(),
        approvedBy: user?.fullName || 'Parish Office'
      });

      notificationService.success(`Mass Intention ${newBooking.bookingId} registered successfully for ${formatDate(massDate)}!`);
      closeModal();
      form.reset();

      if (onBookingAddedCallback) {
        onBookingAddedCallback(newBooking);
      } else {
        router.navigate(window.location.pathname);
      }
    } catch (err) {
      console.error('Offline booking registration failed:', err);
      notificationService.error(err.message || 'Failed to register offline booking.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '✓ Confirm & Register Intention';
    }
  });
}
