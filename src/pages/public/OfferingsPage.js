// Public Online Offerings & Tithes Page

import { renderNavbar, attachNavbarEvents } from '../../components/Navbar.js';
import { renderFooter } from '../../components/Footer.js';
import { paymentService } from '../../services/paymentService.js';
import { notificationService } from '../../services/notificationService.js';
import { authService } from '../../services/authService.js';

export async function renderOfferingsPage() {
  const user = authService.getCurrentUser();

  const html = `
    ${renderNavbar('/offerings')}

    <!-- Header -->
    <section class="section section-alt" style="padding: 3.5rem 0 2rem; border-bottom: 1px solid var(--border-subtle); text-align: center;">
      <div class="container">
        <span class="section-eyebrow">Stewardship & Faith</span>
        <h1 class="church-title" style="font-size: 2.5rem; margin-bottom: 0.5rem;">Parish Offerings & Tithes</h1>
        <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto;">
          “Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.” (2 Corinthians 9:7)
        </p>
      </div>
    </section>

    <!-- Donation Categories -->
    <section class="section">
      <div class="container" style="max-width: 960px;">
        <div class="card card-elevated card-gold-border" style="padding: 2.5rem 2rem;">
          <h3 style="font-size: 1.4rem; margin-bottom: 0.5rem;">Online Church Contribution Form</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">
            Select a parish fund and enter your donation details. Secure payments powered by Razorpay.
          </p>

          <form id="offerings-form">
            <!-- Fund Selection -->
            <div class="form-group">
              <label class="form-label">
                <span>Select Contribution Category <span class="required">*</span></span>
              </label>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-top: 0.25rem;">
                <label style="border: 2px solid var(--border-medium); border-radius: var(--radius-md); padding: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; background: var(--bg-surface-elevated);">
                  <input type="radio" name="fundCategory" value="Church Restoration Fund" checked />
                  <div>
                    <strong style="display: block; font-size: 0.95rem;">Church Restoration</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Heritage maintenance</span>
                  </div>
                </label>

                <label style="border: 2px solid var(--border-medium); border-radius: var(--radius-md); padding: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; background: var(--bg-surface-elevated);">
                  <input type="radio" name="fundCategory" value="Poor & Needy Relief (Charity)" />
                  <div>
                    <strong style="display: block; font-size: 0.95rem;">Charity & Poor Relief</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Food & medical kits</span>
                  </div>
                </label>

                <label style="border: 2px solid var(--border-medium); border-radius: var(--radius-md); padding: 1rem; cursor: pointer; display: flex; align-items: center; gap: 0.6rem; background: var(--bg-surface-elevated);">
                  <input type="radio" name="fundCategory" value="Sunday Tithe & Parish Maintenance" />
                  <div>
                    <strong style="display: block; font-size: 0.95rem;">Sunday Tithe & Dues</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Liturgical expenses</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Amount Chips -->
            <div class="form-group" style="margin-top: 1.5rem;">
              <label class="form-label">
                <span>Donation Amount (INR ₹) <span class="required">*</span></span>
              </label>
              <div class="offering-chips-row">
                <button type="button" class="offering-chip" data-amount="500">₹500</button>
                <button type="button" class="offering-chip selected" data-amount="1000">₹1,000</button>
                <button type="button" class="offering-chip" data-amount="2500">₹2,500</button>
                <button type="button" class="offering-chip" data-amount="5000">₹5,000</button>
                <button type="button" class="offering-chip" data-amount="custom">Custom</button>
              </div>

              <div id="custom-donation-wrapper" style="display: none; margin-top: 0.5rem;">
                <input 
                  type="number" 
                  id="customDonationInput" 
                  class="form-control" 
                  placeholder="Enter amount (min ₹100)"
                  min="100" 
                  step="100" 
                />
              </div>
              <input type="hidden" id="donationAmount" name="amount" value="1000" />
            </div>

            <!-- Donor Details -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
              <div class="form-group">
                <label class="form-label" for="donorName">
                  <span>Donor Full Name <span class="required">*</span></span>
                </label>
                <input 
                  type="text" 
                  id="donorName" 
                  name="donorName" 
                  class="form-control" 
                  value="${user?.fullName || ''}" 
                  placeholder="e.g. Maria Fernandez"
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="donorPhone">
                  <span>Phone Number <span class="required">*</span></span>
                </label>
                <input 
                  type="tel" 
                  id="donorPhone" 
                  name="donorPhone" 
                  class="form-control" 
                  value="${user?.phone || '+91 '}" 
                  placeholder="+91 98470 12345" 
                  required 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="donorEmail">
                <span>Email Address (for tax/payment acknowledgment)</span>
              </label>
              <input 
                type="email" 
                id="donorEmail" 
                name="donorEmail" 
                class="form-control" 
                value="${user?.email || ''}" 
                placeholder="name@example.com" 
              />
            </div>

            <button type="submit" id="btn-submit-offering" class="btn btn-gold btn-block btn-lg" style="margin-top: 1.5rem; box-shadow: var(--shadow-gold);">
              🔒 Proceed to Contribute Offering
            </button>
          </form>
        </div>
      </div>
    </section>

    ${renderFooter()}
  `;

  return html;
}

export function attachOfferingsEvents(router) {
  attachNavbarEvents(router);

  const chips = document.querySelectorAll('.offering-chip');
  const customWrapper = document.getElementById('custom-donation-wrapper');
  const customInput = document.getElementById('customDonationInput');
  const hiddenAmt = document.getElementById('donationAmount');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      const amt = chip.dataset.amount;
      if (amt === 'custom') {
        customWrapper.style.display = 'block';
        hiddenAmt.value = customInput.value || '1000';
      } else {
        customWrapper.style.display = 'none';
        hiddenAmt.value = amt;
      }
    });
  });

  if (customInput) {
    customInput.addEventListener('input', (e) => {
      hiddenAmt.value = e.target.value;
    });
  }

  const form = document.getElementById('offerings-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit-offering');
      const amount = Number(hiddenAmt.value) || 1000;
      const donorName = document.getElementById('donorName').value.trim();
      const donorPhone = document.getElementById('donorPhone').value.trim();
      const donorEmail = document.getElementById('donorEmail').value.trim();
      const fund = form.fundCategory.value;

      if (!donorName || !donorPhone) {
        notificationService.error('Please enter donor name and phone number.');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Processing Offering...';

      try {
        await paymentService.processPayment({
          amount,
          bookingId: `DON-${Date.now()}`,
          parishionerName: donorName,
          email: donorEmail,
          phone: donorPhone,
          intentionType: fund
        });

        notificationService.success(`Thank you, ${donorName}! Your offering of ₹${amount} for ${fund} was received.`);
        form.reset();
      } catch (err) {
        notificationService.error(err.message || 'Donation could not be processed.');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '🔒 Proceed to Contribute Offering';
      }
    });
  }
}
