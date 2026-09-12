// Priest Liturgical Calendar & Date Inspector

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { bookingService } from '../../services/bookingService.js';
import { formatDate, getTodayDateString, getDaysInMonth } from '../../utils/dateUtils.js';

export async function renderPriestCalendarPage(router) {
  const allBookings = await bookingService.getAllBookings();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysCount = getDaysInMonth(year, month);
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Map intentions count by day string: 'YYYY-MM-DD': count
  const dateCounts = {};
  allBookings.forEach(b => {
    if (b.massDate) {
      dateCounts[b.massDate] = (dateCounts[b.massDate] || 0) + 1;
    }
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const contentHtml = `
    <div style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Liturgical Calendar & Intentions Map</h2>
      <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
        Click on any date to inspect scheduled Mass times, intention types, and parishioner petitions.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2rem; align-items: flex-start;">
      
      <!-- Calendar Grid Box -->
      <div class="card card-elevated card-gold-border" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.25rem; font-family: var(--font-serif); margin: 0; color: var(--primary-navy);">
            ${monthNames[month]} ${year}
          </h3>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--gold-accent-hover);">
            Daily Mass Timetable
          </span>
        </div>

        <!-- Day Names Header -->
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; text-align: center; font-weight: 700; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        <!-- Calendar Days Grid -->
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;">
          ${Array(firstDayIndex).fill(0).map(() => `
            <div style="height: 64px; background: transparent;"></div>
          `).join('')}

          ${Array.from({ length: daysCount }, (_, i) => i + 1).map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const count = dateCounts[dateStr] || 0;
            const isCurrentDay = dateStr === getTodayDateString();

            return `
              <div 
                class="calendar-day-cell ${isCurrentDay ? 'today' : ''}" 
                data-date="${dateStr}"
                style="height: 64px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 0.35rem 0.45rem; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; background: ${isCurrentDay ? 'var(--primary-blue-subtle)' : 'var(--bg-surface)'}; transition: all 0.2s;"
              >
                <span style="font-size: 0.85rem; font-weight: 700; color: ${isCurrentDay ? 'var(--primary-navy)' : 'var(--text-primary)'};">${day}</span>
                ${count > 0 ? `
                  <span style="font-size: 0.65rem; font-weight: 800; background: var(--gold-accent); color: #0f172a; padding: 0.1rem 0.35rem; border-radius: var(--radius-full); text-align: center;">
                    ${count} Masses
                  </span>
                ` : `
                  <span style="font-size: 0.65rem; color: var(--text-muted);">0</span>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Date Details Side Panel -->
      <div class="card card-elevated" id="calendar-details-panel" style="padding: 1.5rem;">
        <h4 style="margin-bottom: 0.5rem; color: var(--primary-navy); font-size: 1.15rem;" id="selected-date-title">
          Selected Date: ${formatDate(getTodayDateString())}
        </h4>
        <div id="selected-date-content" style="margin-top: 1rem;">
          <p style="color: var(--text-muted); font-size: 0.85rem;">Click any date cell on the left to inspect scheduled intentions.</p>
        </div>
      </div>

    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/priest/calendar',
    title: 'Liturgical Calendar',
    contentHtml
  });
}

export function attachPriestCalendarEvents(router) {
  attachDashboardEvents(router);

  const cells = document.querySelectorAll('.calendar-day-cell');
  const detailsTitle = document.getElementById('selected-date-title');
  const detailsContent = document.getElementById('selected-date-content');

  const loadDateDetails = async (dateStr) => {
    detailsTitle.textContent = `Schedule for: ${formatDate(dateStr)}`;
    const { raw, structured } = await bookingService.getGroupedIntentionsForDate(dateStr);

    if (raw.length === 0) {
      detailsContent.innerHTML = `
        <div class="empty-state" style="padding: 2rem 0;">
          <div class="empty-icon">📅</div>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">No approved intentions booked for this date.</p>
        </div>
      `;
      return;
    }

    const times = Object.keys(structured);
    detailsContent.innerHTML = times.map(time => {
      const items = structured[time].all;
      return `
        <div style="background: var(--bg-surface-alt); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem; border-left: 3px solid var(--gold-accent);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="color: var(--primary-navy); font-size: 1rem;">⏰ ${time} Mass</strong>
            <span class="badge badge-approved">${items.length} Intentions</span>
          </div>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.85rem;">
            ${items.map(item => `
              <li style="border-bottom: 1px dashed var(--border-medium); padding-bottom: 0.25rem;">
                <strong>${item.intentionType}:</strong> ${item.personNames} <span style="color: var(--text-muted); font-size: 0.75rem;">(by ${item.fullName})</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }).join('');
  };

  cells.forEach(cell => {
    cell.addEventListener('click', (e) => {
      cells.forEach(c => c.style.borderColor = 'var(--border-subtle)');
      cell.style.borderColor = 'var(--gold-accent)';
      const d = cell.dataset.date;
      loadDateDetails(d);
    });
  });

  // Initial load today
  loadDateDetails(getTodayDateString());
}
