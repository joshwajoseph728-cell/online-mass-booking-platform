// Priest Profile & Pastoral Assignment Settings

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { authService } from '../../services/authService.js';
import { notificationService } from '../../services/notificationService.js';
import { CHURCH_DETAILS } from '../../config/constants.js';

export async function renderPriestProfilePage(router) {
  const user = authService.getCurrentUser();

  const contentHtml = `
    <div style="max-width: 680px; margin: 0 auto;">
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Priest Pastoral Profile</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          Clergy credentials, assigned liturgical languages, and vicar notifications.
        </p>
      </div>

      <div class="card card-elevated card-gold-border" style="padding: 2rem;">
        <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2rem;">
          <div class="user-avatar" style="width: 70px; height: 70px; font-size: 1.75rem; background: var(--primary-navy); border: 2px solid var(--gold-accent);">
            ✝
          </div>
          <div>
            <h3 style="font-size: 1.25rem; margin: 0;">${user?.fullName || 'Rev. Fr. Joseph Thomas'}</h3>
            <span style="font-size: 0.8rem; color: var(--gold-accent-hover); font-weight: 700; text-transform: uppercase;">
              Parish Vicar & Rector &bull; ${CHURCH_DETAILS.diocese}
            </span>
          </div>
        </div>

        <form id="priest-profile-form">
          <div class="form-group">
            <label class="form-label" for="priestName">Clergy Title & Full Name</label>
            <input type="text" id="priestName" class="form-control" value="${user?.fullName || 'Rev. Fr. Joseph Thomas'}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="priestEmail">Official Clergy Email</label>
            <input type="email" id="priestEmail" class="form-control" value="${user?.email || 'priest@ourladyofdolours.org'}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="priestPhone">Contact Mobile (Pastoral Office)</label>
            <input type="tel" id="priestPhone" class="form-control" value="${user?.phone || '+91 94471 23456'}" required />
          </div>

          <div class="form-group">
            <label class="form-label">Pastoral Designation</label>
            <input type="text" class="form-control" value="Parish Priest & Vicar" readonly style="background: var(--bg-surface-alt);" />
          </div>

          <button type="submit" class="btn btn-gold btn-block" style="margin-top: 1.5rem;">
            Save Clergy Information
          </button>
        </form>
      </div>
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/priest/profile',
    title: 'Clergy Profile',
    contentHtml
  });
}

export function attachPriestProfileEvents(router) {
  attachDashboardEvents(router);

  document.getElementById('priest-profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('priestName').value.trim();
    const email = document.getElementById('priestEmail').value.trim();
    const phone = document.getElementById('priestPhone').value.trim();

    await authService.updateProfile({ fullName, email, phone });
    notificationService.success('Clergy profile details updated.');
    router.navigate('/priest/profile');
  });
}
