// Public Contact & Church Office Inquiries Page

import { renderNavbar, attachNavbarEvents } from '../../components/Navbar.js';
import { renderFooter } from '../../components/Footer.js';
import { CHURCH_DETAILS } from '../../config/constants.js';
import { notificationService } from '../../services/notificationService.js';

export function renderContactPage() {
  const html = `
    ${renderNavbar('/contact')}

    <!-- Header -->
    <section class="section section-alt" style="padding: 3.5rem 0 2rem; border-bottom: 1px solid var(--border-subtle); text-align: center;">
      <div class="container">
        <span class="section-eyebrow">Parish Secretariat & Sacraments</span>
        <h1 class="church-title" style="font-size: 2.5rem; margin-bottom: 0.5rem;">Contact Church Office</h1>
        <p style="color: var(--text-secondary); max-width: 580px; margin: 0 auto;">
          Inquire regarding sacraments, priest appointments, certificate requests, or pastoral visits.
        </p>
      </div>
    </section>

    <!-- Main Grid -->
    <section class="section">
      <div class="container">
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3.5rem;">
          
          <!-- Inquiry Form -->
          <div class="card card-elevated" style="padding: 2.5rem 2rem;">
            <h3 style="font-size: 1.35rem; margin-bottom: 0.5rem;">Send a Pastoral Message / Inquiry</h3>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem;">
              Our parish office staff will respond to your message promptly during office hours.
            </p>

            <form id="contact-inquiry-form">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label" for="contactName">Your Name <span class="required">*</span></label>
                  <input type="text" id="contactName" class="form-control" placeholder="Joseph Fernandez" required />
                </div>
                <div class="form-group">
                  <label class="form-label" for="contactPhone">Phone Number <span class="required">*</span></label>
                  <input type="tel" id="contactPhone" class="form-control" placeholder="+91 98470 12345" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="contactEmail">Email Address</label>
                <input type="email" id="contactEmail" class="form-control" placeholder="name@example.com" />
              </div>

              <div class="form-group">
                <label class="form-label" for="inquiryType">Subject / Department <span class="required">*</span></label>
                <select id="inquiryType" class="form-select">
                  <option value="General Pastoral Inquiry">General Pastoral Inquiry</option>
                  <option value="Priest Appointment / Spiritual Counseling">Priest Appointment / Spiritual Counseling</option>
                  <option value="Sacrament (Baptism / Marriage Banns)">Sacrament (Baptism / Marriage Banns)</option>
                  <option value="Sick Call / Anointing of the Sick">Sick Call / Anointing of the Sick</option>
                  <option value="Certificate / Parish Records">Certificate / Parish Records</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="contactMessage">Message / Request Details <span class="required">*</span></label>
                <textarea id="contactMessage" class="form-control" rows="4" placeholder="Please describe how the parish can assist you..." required></textarea>
              </div>

              <button type="submit" id="btn-submit-contact" class="btn btn-primary btn-block btn-lg">
                ✉️ Send Message to Church Office
              </button>
            </form>
          </div>

          <!-- Office Info & Timings Cards -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <div class="card card-gold-border" style="padding: 1.75rem;">
              <h4 style="color: var(--primary-navy); margin-bottom: 0.75rem; font-size: 1.15rem;">📍 Parish Secretariat</h4>
              <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">
                <strong>${CHURCH_DETAILS.name}</strong><br>
                ${CHURCH_DETAILS.location}
              </p>
              <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                <div>📞 <strong>Office:</strong> ${CHURCH_DETAILS.phone}</div>
                <div>🚑 <strong>Emergency Sick Calls:</strong> ${CHURCH_DETAILS.emergencyPhone}</div>
                <div>✉️ <strong>Email:</strong> ${CHURCH_DETAILS.email}</div>
              </div>
            </div>

            <div class="card" style="padding: 1.75rem;">
              <h4 style="color: var(--primary-navy); margin-bottom: 0.75rem; font-size: 1.15rem;">⏰ Office & Secretariat Hours</h4>
              <ul style="font-size: 0.85rem; color: var(--text-secondary); padding-left: 1.25rem; line-height: 1.8;">
                <li><strong>Tuesday to Saturday:</strong> 9:00 AM – 1:00 PM & 4:00 PM – 6:30 PM</li>
                <li><strong>Sunday:</strong> 8:30 AM – 12:30 PM</li>
                <li><strong style="color: var(--danger);">Monday:</strong> Closed (Clergy Rest Day)</li>
              </ul>
            </div>

            <div class="card" style="padding: 1.75rem; background: var(--bg-surface-elevated);">
              <h4 style="color: var(--gold-accent-hover); margin-bottom: 0.5rem; font-size: 1.15rem;">✝ Emergency Sacraments</h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
                For urgent Anointing of the Sick or emergency hospital visits, the clergy emergency line is monitored 24/7 at <strong>${CHURCH_DETAILS.emergencyPhone}</strong>.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>

    ${renderFooter()}
  `;

  return html;
}

export function attachContactEvents(router) {
  attachNavbarEvents(router);

  const form = document.getElementById('contact-inquiry-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const subject = document.getElementById('inquiryType').value;
      notificationService.success(`Thank you, ${name}. Your message regarding "${subject}" has been transmitted to the parish office.`);
      form.reset();
    });
  }
}
