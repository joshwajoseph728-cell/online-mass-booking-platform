// Multi-Step Mass Intention Booking Wizard Component (with Dynamic Departed Souls ₹50/head slots)

import { renderNavbar, attachNavbarEvents } from '../../components/Navbar.js';
import { renderFooter } from '../../components/Footer.js';
import { INTENTION_TYPES, DEFAULT_OFFERING_AMOUNTS, ROLES } from '../../config/constants.js';
import { firestoreService } from '../../services/firestoreService.js';
import { authService } from '../../services/authService.js';
import { bookingService } from '../../services/bookingService.js';
import { paymentService } from '../../services/paymentService.js';
import { pdfService } from '../../services/pdfService.js';
import { notificationService } from '../../services/notificationService.js';
import { validateBookingForm } from '../../utils/validators.js';
import { getTodayDateString, formatFullDate, formatDate } from '../../utils/dateUtils.js';
import { formatCurrency } from '../../utils/formatters.js';

export async function renderMassBookingPage(router) {
  const user = authService.getCurrentUser();
  const schedules = await firestoreService.getCollection('massSchedules');
  const activeSchedules = schedules.filter(s => s.active !== false);

  const todayStr = getTodayDateString();

  const html = `
    ${renderNavbar('/mass-booking')}

    <!-- Header -->
    <section class="section section-alt" style="padding: 3.5rem 0 2rem; border-bottom: 1px solid var(--border-subtle); text-align: center;">
      <div class="container">
        <span class="section-eyebrow">Sacred Mass Intentions</span>
        <h1 class="church-title" style="font-size: 2.5rem; margin-bottom: 0.5rem;">Book a Mass Intention</h1>
        <p style="color: var(--text-secondary); max-width: 580px; margin: 0 auto;">
          Offer the Holy Sacrifice of the Mass for departed loved ones (₹50 per head), thanksgiving, healing, or special petitions.
        </p>
      </div>
    </section>

    <!-- Main Wizard Container -->
    <div class="container booking-wizard-container">
      <!-- Step Indicator Bar -->
      <div class="wizard-steps-bar">
        <div class="wizard-step-node active" id="step-node-1">
          <div class="step-bubble">1</div>
          <span class="step-label">Intention</span>
        </div>
        <div class="wizard-step-node" id="step-node-2">
          <div class="step-bubble">2</div>
          <span class="step-label">Schedule</span>
        </div>
        <div class="wizard-step-node" id="step-node-3">
          <div class="step-bubble">3</div>
          <span class="step-label">Offering</span>
        </div>
        <div class="wizard-step-node" id="step-node-4">
          <div class="step-bubble">4</div>
          <span class="step-label">Review</span>
        </div>
        <div class="wizard-step-node" id="step-node-5">
          <div class="step-bubble">5</div>
          <span class="step-label">Confirmed</span>
        </div>
      </div>

      <!-- FORM WIZARD BODY -->
      <div class="card card-elevated card-gold-border" style="padding: 2.5rem 2rem;">
        <form id="mass-booking-form" novalidate>
          
          <!-- STEP 1: INTENTION TYPE & NAMES -->
          <div id="step-panel-1" class="wizard-panel">
            <h3 style="margin-bottom: 0.5rem; font-size: 1.35rem;">Step 1: Choose Intention Category & Names</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
              Select the spiritual intention for this Holy Mass. For Departed Souls, specify the number of members (₹50/head).
            </p>

            <div class="intention-types-grid">
              ${Object.values(INTENTION_TYPES).map((it, idx) => `
                <div class="intention-card-option ${idx === 0 ? 'selected' : ''}" data-type-id="${it.id}">
                  <div class="intention-card-header">
                    <div class="intention-icon-box">${it.icon}</div>
                    <div class="intention-radio-check"></div>
                  </div>
                  <div>
                    <div class="intention-card-title">${it.label} ${it.id === 'Departed Soul' ? '<span style="font-size: 0.75rem; background: var(--gold-accent-light); color: #854d0e; padding: 0.15rem 0.45rem; border-radius: 999px; font-weight: 800;">₹50/Head</span>' : ''}</div>
                    <p class="intention-card-desc">${it.description}</p>
                  </div>
                </div>
              `).join('')}
            </div>

            <input type="hidden" id="selected-intention-type" name="intentionType" value="Departed Soul" />

            <!-- DEPARTED SOULS HEAD COUNT & DYNAMIC SLOTS WRAPPER -->
            <div id="departed-souls-container" style="background: var(--bg-surface-alt); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-medium); margin-bottom: 1.5rem;">
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
                <div>
                  <label class="form-label" style="margin: 0; font-size: 0.95rem;">
                    <span>Number of Departed Souls / Members <span class="required">*</span></span>
                  </label>
                  <span style="font-size: 0.8rem; color: #15803d; font-weight: 700;">
                    Stipend Rate: ₹50 per head
                  </span>
                </div>

                <!-- Head Count Counter Controls -->
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <button type="button" id="btn-dec-souls" class="btn btn-secondary btn-sm" style="width: 36px; height: 36px; font-size: 1.2rem; font-weight: 800; padding: 0;">-</button>
                  <input 
                    type="number" 
                    id="soulCountInput" 
                    name="numberOfSouls" 
                    value="1" 
                    min="1" 
                    max="30" 
                    style="width: 60px; text-align: center; font-weight: 800; font-size: 1.1rem; padding: 0.4rem; border-radius: var(--radius-md); border: 1px solid var(--border-medium);" 
                  />
                  <button type="button" id="btn-inc-souls" class="btn btn-gold btn-sm" style="width: 36px; height: 36px; font-size: 1.2rem; font-weight: 800; padding: 0;">+</button>
                </div>
              </div>

              <!-- Dynamic Slots Area -->
              <div id="soul-slots-wrapper" style="display: flex; flex-direction: column; gap: 0.75rem;">
                <!-- Dynamically populated slots will appear here -->
              </div>

              <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <button type="button" id="btn-add-soul-slot" class="btn btn-outline btn-sm">
                  ➕ Add Another Departed Soul Slot
                </button>
                <div style="font-size: 0.9rem; font-weight: 700; color: var(--primary-navy);" id="departed-total-indicator">
                  Calculated Offering: 1 × ₹50 = ₹50
                </div>
              </div>
            </div>

            <!-- STANDARD NAMES INPUT FOR OTHER INTENTIONS (Thanksgiving, Special Intention, Healing) -->
            <div id="standard-names-container" class="form-group" style="display: none;">
              <label class="form-label" for="personNames">
                <span>Person Name(s) / Family to Pray For <span class="required">*</span></span>
              </label>
              <input 
                type="text" 
                id="personNames" 
                name="personNames" 
                class="form-control" 
                placeholder="e.g. Fernandez Family / Baby Emmanuel / Dr. Celine"
              />
              <div class="form-feedback" id="err-personNames"></div>
            </div>

            <!-- Hidden field that combines all names for consistent backend processing -->
            <input type="hidden" id="combinedPersonNames" name="combinedPersonNames" value="" />

            <div class="form-group" style="margin-top: 1rem;">
              <label class="form-label" for="notes">
                <span>Remembrance Notes / Prayer Petition (Optional)</span>
              </label>
              <textarea 
                id="notes" 
                name="notes" 
                class="form-control" 
                rows="2" 
                placeholder="e.g. 1st Death Anniversary remembrance / Thanksgiving for 25th Wedding Anniversary"
              ></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
              <button type="button" id="btn-next-step-1" class="btn btn-gold btn-lg">
                Continue to Mass Schedule &rarr;
              </button>
            </div>
          </div>

          <!-- STEP 2: DATE & MASS SCHEDULE -->
          <div id="step-panel-2" class="wizard-panel" style="display: none;">
            <h3 style="margin-bottom: 0.5rem; font-size: 1.35rem;">Step 2: Select Date & Available Mass Time</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
              Choose the liturgical date and celebrant time slot for your intention.
            </p>

            <div class="form-group">
              <label class="form-label" for="massDate">
                <span>Date of Holy Mass <span class="required">*</span></span>
              </label>
              <input 
                type="date" 
                id="massDate" 
                name="massDate" 
                class="form-control" 
                min="${todayStr}"
                value="${todayStr}"
                required 
              />
              <div class="form-feedback" id="err-massDate"></div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span>Available Mass Timings <span class="required">*</span></span>
              </label>
              <div class="time-slots-grid" id="time-slots-container">
                ${activeSchedules.map((s, idx) => `
                  <div class="time-slot-btn ${idx === 0 ? 'selected' : ''}" data-time="${s.time}" data-priest="${s.priestName || ''}">
                    <span class="time-slot-hour">${s.time}</span>
                    <span class="time-slot-meta">${s.language} &bull; ${s.location || 'Main Altar'}</span>
                    <span style="font-size: 0.7rem; color: #15803d; font-weight: 700;">✓ Available</span>
                  </div>
                `).join('')}
              </div>
              <input type="hidden" id="selected-mass-time" name="massTime" value="${activeSchedules[0]?.time || '07:00 AM'}" />
              <input type="hidden" id="selected-priest-name" name="approvedBy" value="${activeSchedules[0]?.priestName || 'Parish Vicar'}" />
              <div class="form-feedback" id="err-massTime"></div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
              <button type="button" class="btn btn-secondary btn-prev" data-target="1">&larr; Back</button>
              <button type="button" id="btn-next-step-2" class="btn btn-gold btn-lg">
                Continue to Parishioner & Offering &rarr;
              </button>
            </div>
          </div>

          <!-- STEP 3: CONTACT & OFFERING -->
          <div id="step-panel-3" class="wizard-panel" style="display: none;">
            <h3 style="margin-bottom: 0.5rem; font-size: 1.35rem;">Step 3: Parishioner Information & Offering</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
              Provide your contact details for receipt generation and review the offering amount.
            </p>

            <div class="form-row-2col">
              <div class="form-group">
                <label class="form-label" for="fullName">
                  <span>Full Name <span class="required">*</span></span>
                </label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  class="form-control" 
                  value="${user?.fullName || ''}" 
                  placeholder="e.g. Joseph Fernandez" 
                  required 
                />
                <div class="form-feedback" id="err-fullName"></div>
              </div>

              <div class="form-group">
                <label class="form-label" for="phone">
                  <span>Phone Number (for SMS confirmation) <span class="required">*</span></span>
                </label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  class="form-control" 
                  value="${user?.phone || '+91 '}" 
                  placeholder="+91 98470 12345" 
                  required 
                />
                <div class="form-feedback" id="err-phone"></div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="email">
                <span>Email Address (for PDF Receipt)</span>
              </label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                class="form-control" 
                value="${user?.email || ''}" 
                placeholder="name@example.com" 
              />
              <div class="form-feedback" id="err-email"></div>
            </div>

            <!-- Dynamic Offering Amount Section -->
            <div class="form-group" style="margin-top: 1rem;">
              <label class="form-label">
                <span>Mass Offering Stipend (INR ₹) <span class="required">*</span></span>
              </label>

              <!-- Dynamic chips row will be rendered based on intention & souls count -->
              <div class="offering-chips-row" id="offering-chips-container">
                <!-- Dynamically populated chips -->
              </div>

              <div id="custom-amount-wrapper" style="display: none; margin-top: 0.5rem;">
                <input 
                  type="number" 
                  id="customOfferingInput" 
                  class="form-control" 
                  placeholder="Enter custom stipend amount"
                  min="50" 
                  step="50" 
                />
              </div>

              <input type="hidden" id="offeringAmount" name="offeringAmount" value="50" />
              <div class="form-feedback" id="err-offeringAmount"></div>
              <span class="form-help" id="offering-explanation-text">
                The stipend for Departed Souls is calculated at ₹50 per head. Additional offerings support parish altar ministry and church maintenance.
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
              <button type="button" class="btn btn-secondary btn-prev" data-target="2">&larr; Back</button>
              <button type="button" id="btn-next-step-3" class="btn btn-gold btn-lg">
                Review Intention Details &rarr;
              </button>
            </div>
          </div>

          <!-- STEP 4: REVIEW & CHECKOUT -->
          <div id="step-panel-4" class="wizard-panel" style="display: none;">
            <h3 style="margin-bottom: 0.5rem; font-size: 1.35rem;">Step 4: Review Details & Sacred Offering</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
              Please verify the information below before proceeding to payment verification (Option 1: 12-Digit UTR or Option 2: Upload Screenshot).
            </p>

            <div class="review-summary-box">
              <div class="review-item-row">
                <span class="review-item-label">Intention Category:</span>
                <span class="review-item-val" id="rev-type">Departed Soul</span>
              </div>
              <div class="review-item-row">
                <span class="review-item-label">Departed Souls / Names:</span>
                <span class="review-item-val" id="rev-names">-</span>
              </div>
              <div class="review-item-row">
                <span class="review-item-label">Mass Schedule:</span>
                <span class="review-item-val" id="rev-schedule">-</span>
              </div>
              <div class="review-item-row">
                <span class="review-item-label">Parishioner Details:</span>
                <span class="review-item-val" id="rev-person">-</span>
              </div>
              <div class="review-item-row">
                <span class="review-item-label">Remembrance Notes:</span>
                <span class="review-item-val" id="rev-notes">None</span>
              </div>
              <div class="review-item-row" style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-md); margin-top: 0.5rem;">
                <span class="review-item-label" style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">Total Offering Amount:</span>
                <span class="review-item-val" id="rev-amount" style="font-size: 1.35rem; color: var(--primary-navy); font-weight: 800;">₹50</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
              <button type="button" class="btn btn-secondary btn-prev" data-target="3">&larr; Back to Edit</button>
              <button type="button" id="btn-submit-payment" class="btn btn-gold btn-lg" style="box-shadow: var(--shadow-gold);">
                🔒 Proceed to Pay & Confirm Mass
              </button>
            </div>
          </div>

          <!-- STEP 5: CONFIRMATION & RECEIPT -->
          <div id="step-panel-5" class="wizard-panel" style="display: none;">
            <div class="confirmation-card-success">
              <div class="confirmation-check-icon" id="conf-icon">✓</div>
              <h2 style="font-size: 1.85rem; color: var(--primary-navy); margin-bottom: 0.5rem;" id="conf-title">Mass Intention Confirmed!</h2>
              <p style="color: var(--text-secondary); max-width: 520px; margin: 0 auto;" id="conf-subtitle">
                Your Mass intention has been recorded in the parish registry and scheduled on the altar prayer list.
              </p>

              <div>
                <span class="booking-id-pill" id="conf-booking-id">OLDD-2026-000123</span>
              </div>

              <div style="background: var(--bg-surface-alt); border-radius: var(--radius-lg); padding: 1.25rem; max-width: 480px; margin: 0 auto 1.5rem; font-size: 0.9rem; text-align: left;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                  <span style="color: var(--text-muted);">Intention:</span>
                  <strong id="conf-type">Departed Soul</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                  <span style="color: var(--text-muted);">For:</span>
                  <strong id="conf-names">-</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                  <span style="color: var(--text-muted);">Mass Date & Time:</span>
                  <strong id="conf-schedule">-</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                  <span style="color: var(--text-muted);">Offering Amount:</span>
                  <strong style="color: var(--primary-navy);" id="conf-amount">₹50</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-muted);">Status:</span>
                  <span id="conf-status-badge" class="badge badge-approved">Approved</span>
                </div>
              </div>

              <!-- Uploaded Screenshot Preview on Confirmation -->
              <div id="conf-screenshot-container" style="display: none; max-width: 320px; margin: 0 auto 1.5rem; text-align: center;">
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Attached Payment Receipt:</span>
                <img id="conf-screenshot-preview" src="" alt="Submitted Receipt" style="max-height: 140px; border-radius: var(--radius-md); border: 1px solid var(--border-gold); box-shadow: var(--shadow-sm);" />
              </div>

              <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button type="button" id="btn-download-pdf-receipt" class="btn btn-primary">
                  📄 Download Official PDF Receipt
                </button>
                <button type="button" id="btn-print-receipt" class="btn btn-outline">
                  🖨️ Print Receipt
                </button>
                <a href="/member/bookings" class="btn btn-gold" data-route="/member/bookings">
                  View in My Bookings &rarr;
                </a>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>

    ${renderFooter()}
  `;

  return html;
}

export function attachMassBookingEvents(router) {
  attachNavbarEvents();

  let completedBookingData = null;
  let currentSoulCount = 1;

  // Step Node Management Helper
  const setStep = (stepNumber) => {
    for (let i = 1; i <= 5; i++) {
      const panel = document.getElementById(`step-panel-${i}`);
      const node = document.getElementById(`step-node-${i}`);
      if (panel) panel.style.display = i === stepNumber ? 'block' : 'none';
      if (node) {
        node.classList.toggle('active', i === stepNumber);
        node.classList.toggle('completed', i < stepNumber);
      }
    }
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  // Helper: Render Dynamic Slots for Departed Souls
  const renderSoulSlots = (count) => {
    const wrapper = document.getElementById('soul-slots-wrapper');
    if (!wrapper) return;

    // Preserve existing input values if any
    const existingValues = [];
    wrapper.querySelectorAll('.soul-slot-input').forEach(inp => {
      existingValues.push(inp.value);
    });

    let html = '';
    for (let i = 1; i <= count; i++) {
      const val = existingValues[i - 1] || '';
      html += `
        <div class="soul-slot-row" style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-navy); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; flex-shrink: 0;">
            #${i}
          </div>
          <div style="flex: 1;">
            <input 
              type="text" 
              class="form-control soul-slot-input" 
              data-slot-index="${i}" 
              placeholder="Name of Departed Soul #${i} (e.g. Late Anthony Fernandez)"
              value="${val}" 
              required
            />
          </div>
          ${count > 1 ? `
            <button type="button" class="btn btn-secondary btn-sm btn-remove-soul-slot" data-remove-index="${i}" title="Remove this slot" style="padding: 0.4rem 0.6rem; color: var(--danger);">
              ✕
            </button>
          ` : ''}
        </div>
      `;
    }

    wrapper.innerHTML = html;

    // Update indicator
    const totalIndicator = document.getElementById('departed-total-indicator');
    if (totalIndicator) {
      totalIndicator.textContent = `Calculated Offering: ${count} × ₹50 = ₹${count * 50}`;
    }

    // Attach slot remove handlers
    wrapper.querySelectorAll('.btn-remove-soul-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentSoulCount > 1) {
          currentSoulCount--;
          document.getElementById('soulCountInput').value = currentSoulCount;
          renderSoulSlots(currentSoulCount);
          updateOfferingOptions();
        }
      });
    });
  };

  // Helper: Update Offering Amount Chips in Step 3 based on intention type & head count
  const updateOfferingOptions = () => {
    const intentionType = document.getElementById('selected-intention-type')?.value || 'Departed Soul';
    const chipsContainer = document.getElementById('offering-chips-container');
    const hiddenOffering = document.getElementById('offeringAmount');
    const customWrapper = document.getElementById('custom-amount-wrapper');
    const customInput = document.getElementById('customOfferingInput');
    const explanationText = document.getElementById('offering-explanation-text');

    if (!chipsContainer) return;

    if (intentionType === 'Departed Soul') {
      const baseAmount = currentSoulCount * 50;
      const amounts = [baseAmount, baseAmount + 50, baseAmount + 100, baseAmount + 250];

      chipsContainer.innerHTML = `
        ${amounts.map((amt, idx) => `
          <button type="button" class="offering-chip ${idx === 0 ? 'selected' : ''}" data-amount="${amt}">
            ₹${amt} ${idx === 0 ? `(${currentSoulCount} Head${currentSoulCount > 1 ? 's' : ''})` : ''}
          </button>
        `).join('')}
        <button type="button" class="offering-chip" data-amount="custom">Custom</button>
      `;

      hiddenOffering.value = baseAmount;
      if (customInput) customInput.min = baseAmount;
      if (explanationText) {
        explanationText.innerHTML = `Calculated at <strong>₹50 per head</strong> (${currentSoulCount} Departed Soul${currentSoulCount > 1 ? 's' : ''} = ₹${baseAmount}). Additional offerings support church liturgical ministry.`;
      }
    } else {
      const amounts = [100, 250, 500, 1000];
      chipsContainer.innerHTML = `
        ${amounts.map((amt, idx) => `
          <button type="button" class="offering-chip ${amt === 250 ? 'selected' : ''}" data-amount="${amt}">
            ₹${amt}
          </button>
        `).join('')}
        <button type="button" class="offering-chip" data-amount="custom">Custom</button>
      `;
      hiddenOffering.value = 250;
      if (customInput) customInput.min = 50;
      if (explanationText) {
        explanationText.textContent = 'The Mass stipend supports parish liturgical ministry, altar bread & wine, and celebrant sustenance.';
      }
    }

    // Attach click listeners to new chips
    chipsContainer.querySelectorAll('.offering-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chipsContainer.querySelectorAll('.offering-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        const amt = chip.dataset.amount;
        if (amt === 'custom') {
          customWrapper.style.display = 'block';
          hiddenOffering.value = customInput.value || (intentionType === 'Departed Soul' ? currentSoulCount * 50 : 100);
        } else {
          customWrapper.style.display = 'none';
          hiddenOffering.value = amt;
        }
      });
    });
  };

  // Initialize initial 1 slot for Departed Souls
  renderSoulSlots(1);
  updateOfferingOptions();

  // Head Count Controls (+ / - / input)
  const soulCountInput = document.getElementById('soulCountInput');
  document.getElementById('btn-inc-souls')?.addEventListener('click', () => {
    if (currentSoulCount < 30) {
      currentSoulCount++;
      soulCountInput.value = currentSoulCount;
      renderSoulSlots(currentSoulCount);
      updateOfferingOptions();
    }
  });

  document.getElementById('btn-dec-souls')?.addEventListener('click', () => {
    if (currentSoulCount > 1) {
      currentSoulCount--;
      soulCountInput.value = currentSoulCount;
      renderSoulSlots(currentSoulCount);
      updateOfferingOptions();
    }
  });

  soulCountInput?.addEventListener('change', (e) => {
    let val = parseInt(e.target.value, 10) || 1;
    if (val < 1) val = 1;
    if (val > 30) val = 30;
    currentSoulCount = val;
    e.target.value = currentSoulCount;
    renderSoulSlots(currentSoulCount);
    updateOfferingOptions();
  });

  document.getElementById('btn-add-soul-slot')?.addEventListener('click', () => {
    if (currentSoulCount < 30) {
      currentSoulCount++;
      soulCountInput.value = currentSoulCount;
      renderSoulSlots(currentSoulCount);
      updateOfferingOptions();
    }
  });

  // 1. Intention Type Card Selection
  const typeCards = document.querySelectorAll('.intention-card-option');
  const departedContainer = document.getElementById('departed-souls-container');
  const standardContainer = document.getElementById('standard-names-container');

  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const val = card.dataset.typeId;
      document.getElementById('selected-intention-type').value = val;

      if (val === 'Departed Soul') {
        departedContainer.style.display = 'block';
        standardContainer.style.display = 'none';
      } else {
        departedContainer.style.display = 'none';
        standardContainer.style.display = 'block';
      }

      updateOfferingOptions();
    });
  });

  // 2. Time Slot Selection
  const timeSlots = document.querySelectorAll('.time-slot-btn');
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      document.getElementById('selected-mass-time').value = slot.dataset.time;
      document.getElementById('selected-priest-name').value = slot.dataset.priest || 'Parish Priest';
    });
  });

  const customInput = document.getElementById('customOfferingInput');
  const hiddenOffering = document.getElementById('offeringAmount');
  if (customInput) {
    customInput.addEventListener('input', (e) => {
      hiddenOffering.value = e.target.value;
    });
  }

  // Navigation: Step 1 -> Step 2
  document.getElementById('btn-next-step-1')?.addEventListener('click', () => {
    const intentionType = document.getElementById('selected-intention-type').value;
    let combinedNames = '';

    if (intentionType === 'Departed Soul') {
      const slotInputs = document.querySelectorAll('.soul-slot-input');
      const namesList = [];
      let hasEmpty = false;

      slotInputs.forEach(inp => {
        const val = inp.value.trim();
        if (!val) {
          hasEmpty = true;
          inp.classList.add('is-invalid');
        } else {
          inp.classList.remove('is-invalid');
          namesList.push(val);
        }
      });

      if (hasEmpty || namesList.length === 0) {
        notificationService.error('Please enter the name for each departed soul slot.');
        return;
      }
      combinedNames = namesList.join(' & ');
    } else {
      const stdNameInput = document.getElementById('personNames');
      const val = stdNameInput.value.trim();
      if (!val) {
        document.getElementById('err-personNames').textContent = 'Please enter person/family name(s) to pray for.';
        stdNameInput.classList.add('is-invalid');
        return;
      }
      stdNameInput.classList.remove('is-invalid');
      document.getElementById('err-personNames').textContent = '';
      combinedNames = val;
    }

    document.getElementById('combinedPersonNames').value = combinedNames;
    setStep(2);
  });

  // Navigation: Step 2 -> Step 3
  document.getElementById('btn-next-step-2')?.addEventListener('click', () => {
    const dateVal = document.getElementById('massDate').value;
    if (!dateVal) {
      document.getElementById('err-massDate').textContent = 'Please select a date.';
      return;
    }
    document.getElementById('err-massDate').textContent = '';
    setStep(3);
  });

  // Navigation: Step 3 -> Step 4 (Review)
  document.getElementById('btn-next-step-3')?.addEventListener('click', () => {
    const form = document.getElementById('mass-booking-form');
    const intentionType = form.intentionType.value;
    const combinedNames = document.getElementById('combinedPersonNames').value;

    const formData = {
      fullName: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      intentionType,
      numberOfSouls: currentSoulCount,
      personNames: combinedNames,
      massDate: form.massDate.value,
      massTime: form.massTime.value,
      offeringAmount: Number(hiddenOffering.value) || (intentionType === 'Departed Soul' ? currentSoulCount * 50 : 250),
      notes: form.notes.value.trim()
    };

    const validation = validateBookingForm(formData);
    if (!validation.isValid) {
      Object.keys(validation.errors).forEach(key => {
        const errEl = document.getElementById(`err-${key}`);
        if (errEl) errEl.textContent = validation.errors[key];
        const inputEl = document.getElementById(key);
        if (inputEl) inputEl.classList.add('is-invalid');
      });
      notificationService.error('Please fill all required fields correctly.');
      return;
    }

    // Populate Step 4 Review summary
    document.getElementById('rev-type').innerHTML = `${formData.intentionType} ${intentionType === 'Departed Soul' ? `<span style="font-size: 0.8rem; color: #854d0e; font-weight: 700;">(${currentSoulCount} Head${currentSoulCount > 1 ? 's' : ''} @ ₹50/head)</span>` : ''}`;
    document.getElementById('rev-names').textContent = formData.personNames;
    document.getElementById('rev-schedule').textContent = `${formatDate(formData.massDate)} at ${formData.massTime}`;
    document.getElementById('rev-person').textContent = `${formData.fullName} (${formData.phone})`;
    document.getElementById('rev-notes').textContent = formData.notes || 'None';
    document.getElementById('rev-amount').textContent = `₹${formData.offeringAmount}`;

    setStep(4);
  });

  // Back Button Handlers
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = Number(e.currentTarget.dataset.target);
      setStep(target);
    });
  });

  // Step 4 -> Payment & Creation
  document.getElementById('btn-submit-payment')?.addEventListener('click', async () => {
    const submitBtn = document.getElementById('btn-submit-payment');
    const form = document.getElementById('mass-booking-form');
    const user = authService.getCurrentUser();
    const intentionType = form.intentionType.value;
    const combinedNames = document.getElementById('combinedPersonNames').value;

    const bookingPayload = {
      userId: user?.id || 'guest_' + Date.now(),
      fullName: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      intentionType,
      numberOfSouls: intentionType === 'Departed Soul' ? currentSoulCount : 1,
      personNames: combinedNames,
      massDate: form.massDate.value,
      massTime: form.massTime.value,
      notes: form.notes.value.trim(),
      offeringAmount: Number(hiddenOffering.value) || (intentionType === 'Departed Soul' ? currentSoulCount * 50 : 250),
      approvedBy: document.getElementById('selected-priest-name').value || 'Parish Priest'
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Processing Offering...';

    try {
      // 1. Process payment via Option 2 (Screenshot Upload) or Gateway
      const paymentResult = await paymentService.processPayment({
        amount: bookingPayload.offeringAmount,
        bookingId: 'OLDD-PREVIEW',
        parishionerName: bookingPayload.fullName,
        email: bookingPayload.email,
        phone: bookingPayload.phone,
        intentionType: `${bookingPayload.intentionType} (${bookingPayload.numberOfSouls} head)`
      });

      // 2. Save booking in Firestore with status, UTR, and screenshot
      const isPending = paymentResult.paymentStatus === 'PENDING_VERIFICATION';
      const newBooking = await bookingService.createBooking({
        ...bookingPayload,
        paymentId: paymentResult.paymentId,
        paymentMethod: paymentResult.paymentMethod || 'UPI Payment',
        paymentStatus: paymentResult.paymentStatus || 'PAID',
        receiptScreenshot: paymentResult.receiptScreenshot || null,
        utrNumber: paymentResult.utrNumber || null,
        paymentVerificationMode: paymentResult.paymentVerificationMode || (paymentResult.receiptScreenshot ? 'OPTION_2_SCREENSHOT' : 'OPTION_1_UTR'),
        optionalRef: paymentResult.optionalRef || ''
      });

      completedBookingData = newBooking;

      // 3. Populate Confirmation Screen dynamically
      document.getElementById('conf-booking-id').textContent = newBooking.bookingId;
      document.getElementById('conf-type').textContent = `${newBooking.intentionType} ${newBooking.numberOfSouls > 1 ? `(${newBooking.numberOfSouls} Heads)` : ''}`;
      document.getElementById('conf-names').textContent = newBooking.personNames;
      document.getElementById('conf-schedule').textContent = `${formatDate(newBooking.massDate)} at ${newBooking.massTime}`;
      document.getElementById('conf-amount').textContent = `₹${newBooking.offeringAmount}`;

      const iconEl = document.getElementById('conf-icon');
      const titleEl = document.getElementById('conf-title');
      const subEl = document.getElementById('conf-subtitle');
      const badgeEl = document.getElementById('conf-status-badge');
      const dlBtn = document.getElementById('btn-download-pdf-receipt');
      const printBtn = document.getElementById('btn-print-receipt');
      const ssContainer = document.getElementById('conf-screenshot-container');
      const ssImg = document.getElementById('conf-screenshot-preview');

      if (isPending) {
        iconEl.textContent = paymentResult.utrNumber ? '🔢' : '📸';
        iconEl.style.background = '#fef3c7';
        iconEl.style.color = '#d97706';
        titleEl.textContent = paymentResult.utrNumber ? 'UPI UTR Reference Submitted!' : 'Payment Receipt Submitted!';
        subEl.textContent = paymentResult.utrNumber
          ? `Your 12-digit UTR (${paymentResult.utrNumber}) has been submitted to Rev. Father & the Church Office. Once verified against church accounts, your intention will be scheduled on the altar sheet and your official PDF receipt will unlock.`
          : 'Your UPI receipt screenshot has been submitted to Rev. Father & the Church Office. Once verified, your intention will be scheduled on the altar sheet and your official PDF receipt will unlock.';
        badgeEl.textContent = 'Pending Office Verification';
        badgeEl.className = 'badge badge-pending';

        if (paymentResult.receiptScreenshot) {
          ssImg.src = paymentResult.receiptScreenshot;
          ssContainer.style.display = 'block';
        } else {
          ssContainer.style.display = 'none';
        }

        dlBtn.style.display = 'none';
        printBtn.style.display = 'none';
        notificationService.success(paymentResult.utrNumber ? '12-digit UTR submitted for parish verification!' : 'Receipt screenshot submitted for parish verification!');
      } else {
        iconEl.textContent = '✓';
        iconEl.style.background = '#dcfce7';
        iconEl.style.color = '#15803d';
        titleEl.textContent = 'Mass Intention Confirmed!';
        subEl.textContent = 'Your Mass intention has been recorded in the parish registry and scheduled on the altar prayer list.';
        badgeEl.textContent = 'PAID & APPROVED';
        badgeEl.className = 'badge badge-approved';
        ssContainer.style.display = 'none';
        dlBtn.style.display = 'inline-flex';
        printBtn.style.display = 'inline-flex';
        notificationService.success('Mass intention booked and confirmed successfully!');
      }

      setStep(5);
    } catch (err) {
      console.error('Booking submission error:', err);
      notificationService.error(err.message || 'Payment or booking was not completed.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🔒 Proceed to Pay & Confirm Mass';
    }
  });

  // Download PDF Receipt Event
  document.getElementById('btn-download-pdf-receipt')?.addEventListener('click', () => {
    if (completedBookingData) {
      pdfService.generateMemberReceiptPDF(completedBookingData);
      notificationService.success('Receipt downloaded successfully!');
    }
  });

  // Print Receipt Event
  document.getElementById('btn-print-receipt')?.addEventListener('click', () => {
    window.print();
  });
}
