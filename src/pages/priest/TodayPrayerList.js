import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { bookingService } from '../../services/bookingService.js';
import { pdfService } from '../../services/pdfService.js';
import { notificationService } from '../../services/notificationService.js';
import { authService } from '../../services/authService.js';
import { getTodayDateString, formatFullDate } from '../../utils/dateUtils.js';
import { formatCurrency } from '../../utils/formatters.js';
import { renderOfflineBookingModalHtml, attachOfflineBookingModalEvents } from '../../components/OfflineBookingModal.js';

export async function renderTodayPrayerListPage(router) {
  const todayStr = getTodayDateString();
  const { raw, byTime, structured } = await bookingService.getGroupedIntentionsForDate(todayStr);
  const modalHtml = await renderOfflineBookingModalHtml();

  const massTimes = Object.keys(structured);

  const contentHtml = `
    <!-- Top Altar Toolbar -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.65rem; margin-bottom: 0.25rem;">Altar Mass Intentions & Prayer Sheet</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.9rem;">
          Official liturgical intentions grouped by Mass time and intention categories for <strong>${formatFullDate(todayStr)}</strong>.
        </p>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button id="btn-open-offline-booking-modal" class="btn btn-outline btn-sm btn-open-offline-booking-modal">
          ➕ Add Cash Intention
        </button>
        <button id="btn-dl-altar-pdf" class="btn btn-primary btn-sm" ${raw.length === 0 ? 'disabled' : ''}>
          📄 Download Altar PDF
        </button>
        <button id="btn-print-altar-sheet" class="btn btn-gold btn-sm">
          🖨️ Print Prayer Sheet
        </button>
      </div>
    </div>

    <!-- ALTAR PRAYER SHEET BODY -->
    <div class="altar-sheet" id="altar-printable-content">
      <div class="altar-sheet-header">
        <div style="font-size: 2rem; color: var(--gold-accent); margin-bottom: 0.25rem;">✝</div>
        <h2 class="altar-sheet-title">OUR LADY OF DOLOURS PARISH CHURCH</h2>
        <div class="altar-sheet-date">${formatFullDate(todayStr)} &bull; DAILY MASS INTENTIONS & PRAYER OFFERINGS</div>
      </div>

      ${massTimes.length === 0 ? `
        <div class="empty-state" style="padding: 4rem 1rem;">
          <div class="empty-icon">📖</div>
          <h3>No Mass Intentions Scheduled Today</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            There are no approved intentions for ${todayStr}. Intentions booked online for today will automatically appear here.
          </p>
        </div>
      ` : `
        <div>
          ${massTimes.map(time => {
            const timeData = structured[time];
            const cats = timeData.categories;
            const hasDeparted = cats['Departed Soul'] && cats['Departed Soul'].length > 0;
            const hasThanks = cats['Thanksgiving'] && cats['Thanksgiving'].length > 0;
            const hasHealing = cats['Healing Prayer'] && cats['Healing Prayer'].length > 0;
            const hasSpecial = cats['Special Intention'] && cats['Special Intention'].length > 0;

            return `
              <div class="mass-group-card">
                <div class="mass-group-header">
                  <h4>⏰ ${time} MASS</h4>
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 0.8rem; background: rgba(255,255,255,0.2); padding: 0.2rem 0.6rem; border-radius: var(--radius-full);">
                      ${timeData.all.length} Total Intentions
                    </span>
                    <button class="btn btn-gold btn-sm btn-mark-mass-completed" data-time="${time}" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">
                      ✓ Mark Mass Completed
                    </button>
                  </div>
                </div>

                <!-- 1. DEPARTED SOULS -->
                ${hasDeparted ? `
                  <div class="intention-category-block">
                    <div class="intention-category-title">
                      <span>✝️ DEPARTED SOULS (${cats['Departed Soul'].length})</span>
                    </div>
                    <ul class="prayer-names-list">
                      ${cats['Departed Soul'].map(item => `
                        <li class="prayer-name-item">
                          <div>
                            <span style="color: var(--text-primary); font-size: 1rem; font-weight: 600;">• ${item.personNames}</span>
                            ${item.notes ? `<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; margin-left: 0.85rem;">“${item.notes}”</div>` : ''}
                          </div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); text-align: right;">
                            <div>By: <strong>${item.fullName}</strong></div>
                            <div>Offering: ${formatCurrency(item.offeringAmount || item.amount || 150)}</div>
                          </div>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}

                <!-- 2. THANKSGIVING -->
                ${hasThanks ? `
                  <div class="intention-category-block">
                    <div class="intention-category-title">
                      <span>✨ THANKSGIVING (${cats['Thanksgiving'].length})</span>
                    </div>
                    <ul class="prayer-names-list">
                      ${cats['Thanksgiving'].map(item => `
                        <li class="prayer-name-item">
                          <div>
                            <span style="color: var(--text-primary); font-size: 1rem; font-weight: 600;">• ${item.personNames}</span>
                            ${item.notes ? `<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; margin-left: 0.85rem;">“${item.notes}”</div>` : ''}
                          </div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); text-align: right;">
                            <div>By: <strong>${item.fullName}</strong></div>
                            <div>Offering: ${formatCurrency(item.offeringAmount || item.amount || 150)}</div>
                          </div>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}

                <!-- 3. HEALING PRAYER -->
                ${hasHealing ? `
                  <div class="intention-category-block">
                    <div class="intention-category-title">
                      <span>🕊️ HEALING PRAYER (${cats['Healing Prayer'].length})</span>
                    </div>
                    <ul class="prayer-names-list">
                      ${cats['Healing Prayer'].map(item => `
                        <li class="prayer-name-item">
                          <div>
                            <span style="color: var(--text-primary); font-size: 1rem; font-weight: 600;">• ${item.personNames}</span>
                            ${item.notes ? `<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; margin-left: 0.85rem;">“${item.notes}”</div>` : ''}
                          </div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); text-align: right;">
                            <div>By: <strong>${item.fullName}</strong></div>
                            <div>Offering: ${formatCurrency(item.offeringAmount || item.amount || 150)}</div>
                          </div>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}

                <!-- 4. SPECIAL INTENTION -->
                ${hasSpecial ? `
                  <div class="intention-category-block">
                    <div class="intention-category-title">
                      <span>🕯️ SPECIAL INTENTION (${cats['Special Intention'].length})</span>
                    </div>
                    <ul class="prayer-names-list">
                      ${cats['Special Intention'].map(item => `
                        <li class="prayer-name-item">
                          <div>
                            <span style="color: var(--text-primary); font-size: 1rem; font-weight: 600;">• ${item.personNames}</span>
                            ${item.notes ? `<div style="font-size: 0.8rem; color: var(--text-muted); font-style: italic; margin-left: 0.85rem;">“${item.notes}”</div>` : ''}
                          </div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); text-align: right;">
                            <div>By: <strong>${item.fullName}</strong></div>
                            <div>Offering: ${formatCurrency(item.offeringAmount || item.amount || 150)}</div>
                          </div>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                ` : ''}

              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>

    <!-- OFFLINE BOOKING MODAL -->
    ${modalHtml}
  `;

  return await renderDashboardLayout({
    activeRoute: '/priest/today-prayers',
    title: "Today's Altar Prayer List",
    contentHtml
  });
}

export function attachTodayPrayerListEvents(router) {
  attachDashboardEvents(router);
  attachOfflineBookingModalEvents(router);

  const todayStr = getTodayDateString();
  const user = authService.getCurrentUser();

  // Download Altar Sheet PDF
  document.getElementById('btn-dl-altar-pdf')?.addEventListener('click', async () => {
    const { byTime } = await bookingService.getGroupedIntentionsForDate(todayStr);
    pdfService.generatePriestPrayerListPDF(todayStr, byTime);
    notificationService.success('Altar Prayer List PDF downloaded!');
  });

  // Print Prayer Sheet
  document.getElementById('btn-print-altar-sheet')?.addEventListener('click', () => {
    window.print();
  });

  // Mark Mass Completed
  document.querySelectorAll('.btn-mark-mass-completed').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const time = e.currentTarget.dataset.time;
      const { raw } = await bookingService.getGroupedIntentionsForDate(todayStr);
      const timeItems = raw.filter(i => i.massTime === time);

      if (confirm(`Mark all ${timeItems.length} intentions for ${time} Mass as COMPLETED?`)) {
        for (const item of timeItems) {
          await bookingService.updateStatus(item.bookingId, 'COMPLETED', 'Holy Sacrifice of the Mass offered.', user?.fullName || 'Parish Priest');
        }
        notificationService.success(`${time} Holy Mass intentions marked as Completed.`);
        router.navigate('/priest/today-prayers');
      }
    });
  });
}
