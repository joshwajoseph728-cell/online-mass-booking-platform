// Official Church Footer Component

import { CHURCH_DETAILS } from '../config/constants.js';

export function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Parish Identity & Vicar -->
          <div class="footer-brand">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <div style="width: 38px; height: 38px; border-radius: var(--radius-md); background: #1e3a8a; display: flex; align-items: center; justify-content: center; border: 1px solid var(--gold-accent);">
                <span style="color: #d4af37; font-size: 1.2rem;">✝</span>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 1.15rem; font-family: var(--font-serif);">${CHURCH_DETAILS.name}</h3>
                <span style="font-size: 0.75rem; color: #d4af37; text-transform: uppercase; letter-spacing: 0.05em;">Est. ${CHURCH_DETAILS.established}</span>
              </div>
            </div>
            <p>
              Dedicated to Our Lady of Seven Sorrows. A welcoming Eucharistic community rooted in faith, prayer, and service in ${CHURCH_DETAILS.diocese}.
            </p>
            <div style="font-size: 0.825rem; color: #cbd5e1; margin-top: 0.5rem;">
              <strong>Parish Vicar:</strong> Rev. Fr. Joseph Thomas
            </div>
          </div>

          <!-- Quick Navigation -->
          <div class="footer-col">
            <h4>Parish Links</h4>
            <ul class="footer-links">
              <li><a href="/" data-route="/">Home</a></li>
              <li><a href="/about" data-route="/about">About Our Parish</a></li>
              <li><a href="/gallery" data-route="/gallery">Photo Gallery</a></li>
              <li><a href="/mass-schedule" data-route="/mass-schedule">Mass Timetable</a></li>
              <li><a href="/mass-booking" data-route="/mass-booking">Book Mass Intention</a></li>
              <li><a href="/offerings" data-route="/offerings">Online Offerings</a></li>
              <li><a href="/contact" data-route="/contact">Church Office</a></li>
            </ul>
          </div>

          <!-- Mass & Confession Timings -->
          <div class="footer-col">
            <h4>Eucharist Timings</h4>
            <ul class="footer-links" style="font-size: 0.825rem; gap: 0.5rem;">
              <li><strong style="color: #ffffff;">Daily Weekdays:</strong><br>6:30 AM (Mal) &bull; 7:00 AM (Eng) &bull; 5:30 PM (Tamil) &bull; 6:30 PM (Mal)</li>
              <li><strong style="color: #ffffff;">Sundays:</strong><br>6:00 AM (Mal) &bull; 7:30 AM (Eng) &bull; 9:00 AM (Mal) &bull; 10:30 AM (Tamil) &bull; 5:30 PM (Eng/Tamil)</li>
              <li><strong style="color: #d4af37;">Confessions:</strong><br>30 mins before every Holy Mass</li>
            </ul>
          </div>

          <!-- Contact & Sacraments -->
          <div class="footer-col">
            <h4>Church Office</h4>
            <p style="font-size: 0.85rem; margin-bottom: 0.75rem;">
              📍 ${CHURCH_DETAILS.location}
            </p>
            <p style="font-size: 0.85rem; margin-bottom: 0.75rem;">
              📞 Office: ${CHURCH_DETAILS.phone}<br>
              🚑 Sick Calls / Emergency: ${CHURCH_DETAILS.emergencyPhone}
            </p>
            <p style="font-size: 0.85rem; margin-bottom: 0;">
              ✉️ ${CHURCH_DETAILS.email}
            </p>
          </div>
        </div>

        <!-- Bottom Copyright -->
        <div class="footer-bottom">
          <div>
            &copy; ${currentYear} Our Lady of Dolours Parish. All Rights Reserved.
          </div>
          <div style="display: flex; gap: 1.5rem;">
            <a href="/login" data-route="/login" style="color: #cbd5e1; font-weight: 600;">Parishioner & Clergy Portal</a>
            <span style="color: #64748b;">|</span>
            <span style="color: #94a3b8;">Built with Reverence & Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}
