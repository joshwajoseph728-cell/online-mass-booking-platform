// Public Mass Schedule & Liturgical Calendar Page

import { renderNavbar, attachNavbarEvents } from '../../components/Navbar.js';
import { renderFooter } from '../../components/Footer.js';
import { CHURCH_DETAILS, ROLES } from '../../config/constants.js';
import { firestoreService } from '../../services/firestoreService.js';
import { authService } from '../../services/authService.js';

export async function renderMassSchedulePage() {
  const user = authService.getCurrentUser();
  const canManage = user && (user.role === ROLES.ADMIN || user.role === ROLES.PRIEST);
  const manageRoute = user?.role === ROLES.PRIEST ? '/priest/schedules' : '/admin/schedules';

  const schedules = await firestoreService.getCollection('massSchedules');
  const weekdaySchedules = schedules.filter(s => s.dayType === 'weekday' && s.active !== false);
  const sundaySchedules = schedules.filter(s => s.dayType === 'sunday' && s.active !== false);

  const html = `
    ${renderNavbar('/mass-schedule')}

    <!-- Header -->
    <section class="section section-alt" style="padding: 3.5rem 0 2rem; border-bottom: 1px solid var(--border-subtle); text-align: center;">
      <div class="container">
        <span class="section-eyebrow">Eucharistic Timetable</span>
        <h1 class="church-title" style="font-size: 2.5rem; margin-bottom: 0.5rem;">Mass Schedule & Liturgy</h1>
        <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto;">
          Celebrate the Holy Eucharist with our parish community. Daily confession and Novenas to Our Lady of Dolours.
        </p>

        ${canManage ? `
          <div style="margin-top: 1.25rem;">
            <a href="${manageRoute}" class="btn btn-gold btn-sm" data-route="${manageRoute}" style="box-shadow: 0 4px 12px rgba(212, 175, 55, 0.35); font-weight: 700;">
              ⚙️ Manage Mass Schedules & Assign Celebrants (Clergy Access)
            </a>
          </div>
        ` : ''}
      </div>
    </section>

    <!-- Schedule Content -->
    <section class="section">
      <div class="container">
        
        <!-- Filter Tabs -->
        <div class="schedule-tabs">
          <button class="schedule-tab-btn active" id="tab-btn-weekday">Weekday Masses (Mon – Sat)</button>
          <button class="schedule-tab-btn" id="tab-btn-sunday">Sunday Masses (The Lord’s Day)</button>
        </div>

        <!-- WEEKDAY GRID -->
        <div id="weekday-section" class="schedule-grid-container">
          <div class="schedule-cards-grid">
            ${weekdaySchedules.map(s => `
              <div class="schedule-card card-gold-border">
                <div class="schedule-card-time">
                  <span class="schedule-time-badge">${s.time}</span>
                  <span class="language-pill">${s.language}</span>
                </div>
                <div class="schedule-details">
                  <h5>Daily Eucharistic Celebration</h5>
                  <p>📍 ${s.location || 'Main Altar'}</p>
                  <p>✝ Celebrant: <strong style="color: var(--primary-navy);">${s.priestName && s.priestName.trim() ? s.priestName : '<span style="color: var(--text-muted); font-weight: normal; font-style: italic;">To be announced by Parish</span>'}</strong></p>
                  <p style="font-size: 0.75rem; color: #15803d; font-weight: 700;">• Maximum Mass Intentions: ${s.capacity || 30}</p>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <a href="/mass-booking" class="btn btn-gold btn-sm" data-route="/mass-booking" style="flex: 1; text-align: center;">
                    Book Intention for ${s.time} &rarr;
                  </a>
                  ${canManage ? `
                    <a href="${manageRoute}" class="btn btn-outline btn-sm" data-route="${manageRoute}" title="Assign Celebrant" style="padding: 0.4rem 0.6rem;">
                      ✏️
                    </a>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- SUNDAY GRID (hidden by default) -->
        <div id="sunday-section" class="schedule-grid-container" style="display: none;">
          <div class="schedule-cards-grid">
            ${sundaySchedules.map(s => `
              <div class="schedule-card card-gold-border">
                <div class="schedule-card-time">
                  <span class="schedule-time-badge">${s.time}</span>
                  <span class="language-pill">${s.language}</span>
                </div>
                <div class="schedule-details">
                  <h5>${s.time === '07:30 AM' ? 'Solemn Sunday High Mass' : 'Sunday Parish Liturgy'}</h5>
                  <p>📍 ${s.location || 'Main Sanctuary'}</p>
                  <p>✝ Celebrant: <strong style="color: var(--primary-navy);">${s.priestName && s.priestName.trim() ? s.priestName : '<span style="color: var(--text-muted); font-weight: normal; font-style: italic;">To be announced by Parish</span>'}</strong></p>
                  <p style="font-size: 0.75rem; color: #15803d; font-weight: 700;">• Maximum Mass Intentions: ${s.capacity || 40}</p>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <a href="/mass-booking" class="btn btn-gold btn-sm" data-route="/mass-booking" style="flex: 1; text-align: center;">
                    Book Intention for ${s.time} &rarr;
                  </a>
                  ${canManage ? `
                    <a href="${manageRoute}" class="btn btn-outline btn-sm" data-route="${manageRoute}" title="Assign Celebrant" style="padding: 0.4rem 0.6rem;">
                      ✏️
                    </a>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- SPECIAL DEVOTIONS & NOVENAS -->
        <div style="margin-top: 4rem; background: var(--bg-surface-alt); border-radius: var(--radius-xl); padding: 2.5rem 2rem; border: 1px solid var(--border-subtle);">
          <div class="section-header" style="margin-bottom: 2rem;">
            <span class="section-eyebrow">Weekly Pious Practices</span>
            <h3 style="font-size: 1.85rem;">Novenas & Eucharistic Adoration</h3>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
            <div class="card" style="padding: 1.5rem;">
              <h4 style="color: var(--primary-navy); margin-bottom: 0.35rem;">Novena to Our Lady of Dolours</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Every Friday after the 6:00 PM Holy Mass</p>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Special blessing of the sick and veneration of the relic of the True Cross.</p>
            </div>

            <div class="card" style="padding: 1.5rem;">
              <h4 style="color: var(--primary-navy); margin-bottom: 0.35rem;">Novena to St. Anthony of Padua</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Every Tuesday after the 6:30 AM & 6:00 PM Masses</p>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Petitions for lost items, family peace, and distribution of St. Anthony’s Bread to the poor.</p>
            </div>

            <div class="card" style="padding: 1.5rem;">
              <h4 style="color: var(--primary-navy); margin-bottom: 0.35rem;">First Friday Adoration</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">First Friday of every month: 5:00 PM – 6:00 PM</p>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Solemn Eucharistic exposition, silence, Rosary, and Benediction of the Blessed Sacrament.</p>
            </div>
          </div>
        </div>

      </div>
    </section>

    ${renderFooter()}
  `;

  return html;
}

export function attachMassScheduleEvents(router) {
  attachNavbarEvents(router);

  const weekdayBtn = document.getElementById('tab-btn-weekday');
  const sundayBtn = document.getElementById('tab-btn-sunday');
  const weekdaySec = document.getElementById('weekday-section');
  const sundaySec = document.getElementById('sunday-section');

  if (weekdayBtn && sundayBtn && weekdaySec && sundaySec) {
    weekdayBtn.addEventListener('click', () => {
      weekdayBtn.classList.add('active');
      sundayBtn.classList.remove('active');
      weekdaySec.style.display = 'block';
      sundaySec.style.display = 'none';
    });

    sundayBtn.addEventListener('click', () => {
      sundayBtn.classList.add('active');
      weekdayBtn.classList.remove('active');
      sundaySec.style.display = 'block';
      weekdaySec.style.display = 'none';
    });
  }
}
