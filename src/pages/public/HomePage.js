// Public Home Page Component

import { renderNavbar, attachNavbarEvents } from '../../components/Navbar.js';
import { renderFooter } from '../../components/Footer.js';
import { CHURCH_DETAILS } from '../../config/constants.js';
import { firestoreService } from '../../services/firestoreService.js';
import { i18n } from '../../services/i18n.js';

export async function renderHomePage() {
  const schedules = await firestoreService.getCollection('massSchedules');
  const activeSchedules = schedules.filter(s => s.active !== false);

  const html = `
    ${renderNavbar('/')}

    <!-- 1. HERO SECTION -->
    <section class="hero-section">
      <div class="hero-backdrop-pattern"></div>
      <div class="container">
        <div class="hero-grid">
          <div class="hero-content">
            <div class="hero-badge">
              <span>⛪</span> ${i18n.t('hero.welcomeBadge')}
            </div>
            <h1 class="hero-title">
              ${i18n.t('hero.title')}
            </h1>
            <p class="hero-subtitle">
              ${i18n.t('hero.subtitle')}
            </p>
            <div class="hero-actions">
              <a href="/mass-booking" class="btn btn-gold btn-lg" data-route="/mass-booking">
                <span>${i18n.t('hero.btnBook')}</span>
              </a>
              <a href="/mass-schedule" class="btn btn-outline btn-lg" data-route="/mass-schedule">
                <span>${i18n.t('hero.btnSchedule')}</span>
              </a>
            </div>
            <div class="hero-stats-strip">
              <div class="hero-stat-item">
                <h4>Est. 1896</h4>
                <p>${i18n.t('hero.statYears')}</p>
              </div>
              <div class="hero-stat-item">
                <h4>8+ Masses</h4>
                <p>${i18n.t('hero.statMasses')}</p>
              </div>
              <div class="hero-stat-item">
                <h4>100% Verified</h4>
                <p>${i18n.t('hero.statVerified')}</p>
              </div>
            </div>
          </div>

          <div class="hero-image-card" style="position: relative; overflow: hidden; background: radial-gradient(circle at center, #ffffff 40%, #f1f5f9 100%); min-height: 400px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-xl); border: 2px solid var(--gold-accent); box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 1.5rem;">
            <!-- Official Parish Emblem Photo -->
            <img 
              src="/assets/church-logo.jpg" 
              alt="Our Lady of Dolours Church - Marthandanthurai" 
              class="hero-church-img"
              style="width: 100%; max-width: 340px; height: auto; object-fit: contain; display: block; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.12)); transition: transform 0.3s ease;"
              onmouseover="this.style.transform='scale(1.03)'"
              onmouseout="this.style.transform='scale(1)'"
            />

            <div class="hero-image-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(10, 25, 47, 0.94) 70%); padding: 1.25rem 1.25rem 1rem; color: white; text-align: center;">
              <div class="hero-overlay-title" style="font-size: 1.1rem; font-weight: 700; color: var(--gold-accent); letter-spacing: 0.03em;">${i18n.t('brand.title')}</div>
              <p class="hero-overlay-desc" style="font-size: 0.8rem; font-weight: 600; opacity: 0.95; margin: 0.2rem 0 0; color: #fdf6e2; letter-spacing: 0.08em; text-transform: uppercase;">${i18n.t('brand.location')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. WELCOME / ABOUT CHURCH -->
    <section class="section">
      <div class="container">
        <div class="vicar-message-grid">
          <div>
            <span class="section-eyebrow">A Message from the Parish Vicar</span>
            <h2 class="section-title">A Living Sanctuary of Prayer, Grace & Fellowship</h2>
            <p>
              For over a century, the Parish of Our Lady of Dolours has been a spiritual refuge and beacon of Catholic faith in Marthandanthurai. Under the maternal protection of Our Lady of Seven Sorrows, our community gathers daily for the Holy Sacrifice of the Mass in Tamil, Malayalam, and English.
            </p>
            <p>
              Through this online portal, parishioners living locally or abroad can securely request Mass intentions, offer thanksgiving, and request healing prayers for their loved ones.
            </p>
            <div style="margin-top: 1.5rem; display: flex; align-items: center; gap: 1rem;">
              <div style="width: 50px; height: 50px; border-radius: var(--radius-full); background: var(--primary-navy); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.2rem;">
                JT
              </div>
              <div>
                <h5 style="margin: 0; font-size: 1rem;">Rev. Fr. Joseph Thomas</h5>
                <span style="font-size: 0.825rem; color: var(--gold-accent-hover); font-weight: 600;">Parish Priest & Vicar</span>
              </div>
            </div>
          </div>

          <div class="intentions-preview-grid">
            <div class="card card-elevated" style="padding: 1.5rem; text-align: center;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🕊️</div>
              <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${i18n.t('intention.departed')}</h4>
              <p style="font-size: 0.8rem; margin: 0;">Remembering the faithful departed in the Eucharistic sacrifice.</p>
            </div>
            <div class="card card-elevated" style="padding: 1.5rem; text-align: center;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">✨</div>
              <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${i18n.t('intention.thanksgiving')}</h4>
              <p style="font-size: 0.8rem; margin: 0;">Praising the Almighty for birthdays, anniversaries & blessings.</p>
            </div>
            <div class="card card-elevated" style="padding: 1.5rem; text-align: center;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌿</div>
              <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${i18n.t('intention.healing')}</h4>
              <p style="font-size: 0.8rem; margin: 0;">Intercessory petitions for the sick, afflicted, and recovering.</p>
            </div>
            <div class="card card-elevated" style="padding: 1.5rem; text-align: center;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🕯️</div>
              <h4 style="font-size: 1.1rem; margin-bottom: 0.25rem;">${i18n.t('intention.special')}</h4>
              <p style="font-size: 0.8rem; margin: 0;">Guidance for studies, employment, travels, and vocations.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. MASS SCHEDULE PREVIEW -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Daily Liturgical Timetable</span>
          <h2 class="section-title">Holy Mass Timings</h2>
          <p class="section-desc">Join our parish in celebrating the Holy Eucharist. Confessions available 30 minutes before all services.</p>
        </div>

        <div class="schedule-cards-grid">
          ${activeSchedules.slice(0, 4).map(s => `
            <div class="schedule-card card-gold-border">
              <div class="schedule-card-time">
                <span class="schedule-time-badge">${s.time}</span>
                <span class="language-pill">${s.language}</span>
              </div>
              <div class="schedule-details">
                <h5>${s.dayType === 'sunday' ? 'Sunday Liturgy' : 'Weekday Mass'}</h5>
                <p>📍 ${s.location || 'Main Altar'}</p>
                <p>✝ Celebrant: <strong>${s.priestName && s.priestName.trim() ? s.priestName : 'To be announced'}</strong></p>
              </div>
              <a href="/mass-booking" class="btn btn-outline-gold btn-sm" data-route="/mass-booking">
                Book Intention for this Mass &rarr;
              </a>
            </div>
          `).join('')}
        </div>

        <div style="text-align: center; margin-top: 2.5rem;">
          <a href="/mass-schedule" class="btn btn-primary" data-route="/mass-schedule">
            View Complete Weekly Timetable & Confession Hours
          </a>
        </div>
      </div>
    </section>

    <!-- 4. HOW IT WORKS -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Simple & Transparent Process</span>
          <h2 class="section-title">How Mass Booking Works</h2>
          <p class="section-desc">Four effortless steps to have your intention announced and prayed for at the altar.</p>
        </div>

        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h4>Select Intention</h4>
            <p>Choose Departed Soul, Thanksgiving, Healing Prayer, or Special Intention.</p>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h4>Choose Schedule</h4>
            <p>Pick your preferred date, Mass time slot, and language from live schedules.</p>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h4>Stipend Offering</h4>
            <p>Submit your prayer offering safely via Razorpay (UPI, Cards, NetBanking).</p>
          </div>
          <div class="step-card">
            <div class="step-number">4</div>
            <h4>Altar Prayer List</h4>
            <p>Receive your instant PDF receipt. The priest prays for your intention at the altar.</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 3rem;">
          <a href="/mass-booking" class="btn btn-gold btn-lg" data-route="/mass-booking">
            Begin Mass Booking Now
          </a>
        </div>
      </div>
    </section>

    <!-- 5. SPIRITUAL REFLECTION / PRAYER SECTION -->
    <section class="section" style="padding-top: 0;">
      <div class="container">
        <div class="prayer-reflection-card">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--gold-accent);">✝</div>
          <h3>The Greatest Act of Prayer</h3>
          <p class="prayer-quote">
            “The Holy Mass is the greatest prayer that exists. It is the Sacrifice of the Cross renewed on the altar, giving infinite glory to God and boundless grace to souls.”
          </p>
          <span class="prayer-citation">— St. Padre Pio</span>
        </div>
      </div>
    </section>

    <!-- 6. ONLINE OFFERINGS & TITHES -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-header">
          <span class="section-eyebrow">Support God's House & Ministries</span>
          <h2 class="section-title">Parish Offerings & Tithes</h2>
          <p class="section-desc">Support parish maintenance, charity funds for the destitute, and church restoration.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <div class="card" style="padding: 2rem; text-align: center;">
            <div style="font-size: 2.5rem; color: var(--gold-accent); margin-bottom: 0.75rem;">⛪</div>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Church Restoration Fund</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Helping preserve our historic sanctuary, bell tower, and stained glass windows.</p>
            <a href="/offerings" class="btn btn-outline-gold btn-block" data-route="/offerings">Contribute Offering</a>
          </div>

          <div class="card" style="padding: 2rem; text-align: center;">
            <div style="font-size: 2.5rem; color: var(--gold-accent); margin-bottom: 0.75rem;">🤝</div>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Poor & Needy Relief</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Providing food rations, medical aid, and school kits for underprivileged families.</p>
            <a href="/offerings" class="btn btn-outline-gold btn-block" data-route="/offerings">Donate to Charity</a>
          </div>

          <div class="card" style="padding: 2rem; text-align: center;">
            <div style="font-size: 2.5rem; color: var(--gold-accent); margin-bottom: 0.75rem;">🌸</div>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">Altar Flowers & Candles</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">Sponsor flowers and sanctuary lamps before Our Lady of Dolours.</p>
            <a href="/offerings" class="btn btn-outline-gold btn-block" data-route="/offerings">Sponsor Altar</a>
          </div>
        </div>
      </div>
    </section>

    <!-- 6.5 PARISH PHOTO GALLERY PREVIEW -->
    <section class="section" style="padding: 3.5rem 0;">
      <div class="container">
        <div class="section-header" style="display: flex; justify-content: space-between; align-items: flex-end; text-align: left; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;">
          <div>
            <span class="section-eyebrow">Parish Moments & Celebrations</span>
            <h2 class="section-title" style="margin-bottom: 0.25rem;">Parish Life in Photographs</h2>
            <p class="section-desc" style="margin: 0;">Glimpses of sacred liturgies, feast day processions, and community events.</p>
          </div>
          <a href="/gallery" class="btn btn-outline-gold" data-route="/gallery">
            📸 View Full Gallery →
          </a>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
          <div class="card card-gold-border" style="padding: 0; overflow: hidden; position: relative; height: 220px; border-radius: var(--radius-lg);">
            <img src="https://images.unsplash.com/photo-1548625361-195fe5795df5?w=600&q=80" alt="Procession" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: linear-gradient(transparent, rgba(10,25,47,0.85)); display: flex; align-items: flex-end; padding: 1rem; color: white;">
              <div>
                <span class="badge badge-gold" style="font-size: 0.65rem; margin-bottom: 0.35rem;">Feast Procession</span>
                <h5 style="margin: 0; font-size: 0.95rem; color: white;">Annual Feast of Our Lady</h5>
              </div>
            </div>
          </div>
          <div class="card card-gold-border" style="padding: 0; overflow: hidden; position: relative; height: 220px; border-radius: var(--radius-lg);">
            <img src="https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&q=80" alt="Altar" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: linear-gradient(transparent, rgba(10,25,47,0.85)); display: flex; align-items: flex-end; padding: 1rem; color: white;">
              <div>
                <span class="badge badge-gold" style="font-size: 0.65rem; margin-bottom: 0.35rem;">Sacred Altar</span>
                <h5 style="margin: 0; font-size: 0.95rem; color: white;">Eucharistic Sanctuary</h5>
              </div>
            </div>
          </div>
          <div class="card card-gold-border" style="padding: 0; overflow: hidden; position: relative; height: 220px; border-radius: var(--radius-lg);">
            <img src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80" alt="Choir" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: linear-gradient(transparent, rgba(10,25,47,0.85)); display: flex; align-items: flex-end; padding: 1rem; color: white;">
              <div>
                <span class="badge badge-gold" style="font-size: 0.65rem; margin-bottom: 0.35rem;">Liturgy & Music</span>
                <h5 style="margin: 0; font-size: 0.95rem; color: white;">Saint Cecilia Parish Choir</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. CONTACT & OFFICE SNIPPET -->
    <section class="section section-alt">
      <div class="container">
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); padding: 3rem 2rem; box-shadow: var(--shadow-md); display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2.5rem; align-items: center;">
          <div>
            <span class="section-eyebrow">Visit or Inquire</span>
            <h2 style="font-size: 2rem; margin-bottom: 1rem;">Parish Office & Pastoral Services</h2>
            <p style="margin-bottom: 1.5rem;">
              Our parish office is open Tuesday through Sunday. Whether you need certificate attestations, baptismal arrangements, wedding banns, or house blessings, our clergy and staff are here to assist.
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <a href="/contact" class="btn btn-primary" data-route="/contact">Contact Office & Location</a>
              <a href="tel:${CHURCH_DETAILS.phone.replace(/[^0-9+]/g, '')}" class="btn btn-outline">Call Office: ${CHURCH_DETAILS.phone}</a>
            </div>
          </div>
          <div style="background: var(--bg-surface-alt); padding: 1.5rem; border-radius: var(--radius-lg); border-left: 4px solid var(--gold-accent);">
            <h4 style="margin-bottom: 0.5rem; color: var(--primary-navy);">Confession Schedule</h4>
            <p style="font-size: 0.85rem; margin-bottom: 0.75rem;">“Repent, and believe in the Gospel.”</p>
            <ul style="font-size: 0.85rem; color: var(--text-secondary); padding-left: 1.25rem; line-height: 1.6;">
              <li>30 minutes before every weekday Mass</li>
              <li>Saturdays: 5:00 PM – 6:00 PM</li>
              <li>Anytime by appointment with the Parish Vicar</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    ${renderFooter()}
  `;

  return html;
}

export function attachHomePageEvents(router) {
  attachNavbarEvents(router);
}
