// Member Profile & Preferences Page

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { authService } from '../../services/authService.js';
import { notificationService } from '../../services/notificationService.js';

export async function renderMemberProfilePage(router) {
  const user = authService.getCurrentUser();

  const contentHtml = `
    <div style="max-width: 680px; margin: 0 auto;">
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Parishioner Profile Settings</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          Update contact coordinates, family unit details, and notification preferences.
        </p>
      </div>

      <div class="card card-elevated card-gold-border" style="padding: 2rem;">
        <form id="profile-edit-form">
          <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2rem;">
            <div class="user-avatar" style="width: 64px; height: 64px; font-size: 1.5rem; background: var(--primary-navy); border: 2px solid var(--gold-accent);">
              ${user?.fullName ? user.fullName.charAt(0) : 'U'}
            </div>
            <div>
              <h3 style="font-size: 1.2rem; margin: 0;">${user?.fullName || 'Parish Member'}</h3>
              <span style="font-size: 0.8rem; color: var(--gold-accent-hover); font-weight: 700; text-transform: uppercase;">
                ${user?.role || 'member'} &bull; Registered Member
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="profFullName">Full Name / Household Name</label>
            <input type="text" id="profFullName" class="form-control" value="${user?.fullName || ''}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="profEmail">Email Address</label>
            <input type="email" id="profEmail" class="form-control" value="${user?.email || ''}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="profPhone">Mobile Number (SMS Updates)</label>
            <input type="tel" id="profPhone" class="form-control" value="${user?.phone || ''}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="profFamilyUnit">Parish Family Unit (Kudumba Kootayma)</label>
            <select id="profFamilyUnit" class="form-select">
              <option value="St. Joseph Unit #4" selected>St. Joseph Unit #4 (Kowdiar East)</option>
              <option value="St. Mary Unit #1">St. Mary Unit #1 (Vellayambalam)</option>
              <option value="St. Thomas Unit #2">St. Thomas Unit #2 (Sasthamangalam)</option>
              <option value="St. Anthony Unit #3">St. Anthony Unit #3 (Jawahar Nagar)</option>
            </select>
          </div>

          <button type="submit" id="btn-save-profile" class="btn btn-gold btn-block" style="margin-top: 1.5rem;">
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/member/profile',
    title: 'Profile Settings',
    contentHtml
  });
}

export function attachMemberProfileEvents(router) {
  attachDashboardEvents(router);

  const form = document.getElementById('profile-edit-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('profFullName').value.trim();
      const email = document.getElementById('profEmail').value.trim();
      const phone = document.getElementById('profPhone').value.trim();

      await authService.updateProfile({ fullName, email, phone });
      notificationService.success('Profile information updated successfully.');
      router.navigate('/member/profile');
    });
  }
}
