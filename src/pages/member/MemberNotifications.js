// Member Notification Center Page

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { authService } from '../../services/authService.js';
import { notificationService } from '../../services/notificationService.js';
import { formatDate } from '../../utils/dateUtils.js';

export async function renderMemberNotificationsPage(router) {
  const user = authService.getCurrentUser();
  const notifs = await notificationService.getUserNotifications(user?.id);

  const contentHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Notification Center</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          Real-time updates regarding your booked Mass intentions, approvals, and reminders.
        </p>
      </div>
      <button id="btn-mark-all-read" class="btn btn-outline btn-sm">
        ✓ Mark All as Read
      </button>
    </div>

    <div class="card card-elevated" style="padding: 1rem 0;">
      ${notifs.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">🔔</div>
          <h4>No Notifications</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem;">You are completely up to date.</p>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column;">
          ${notifs.map(n => `
            <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: 1rem; background: ${n.read ? 'transparent' : 'var(--bg-surface-elevated)'};">
              <div style="font-size: 1.5rem; color: var(--gold-accent);">
                ${n.type === 'approval' ? '✓' : n.type === 'payment' ? '💳' : '🔔'}
              </div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <h4 style="font-size: 1rem; margin: 0; font-weight: ${n.read ? '600' : '800'};">${n.title}</h4>
                  <small style="color: var(--text-muted); font-size: 0.75rem;">${formatDate(n.createdAt)}</small>
                </div>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0;">${n.message}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/member/notifications',
    title: 'Notifications',
    contentHtml
  });
}

export function attachMemberNotificationsEvents(router) {
  attachDashboardEvents(router);

  document.getElementById('btn-mark-all-read')?.addEventListener('click', async () => {
    const user = authService.getCurrentUser();
    if (user) {
      await notificationService.markAllAsRead(user.id);
      notificationService.success('All notifications marked as read.');
      router.navigate('/member/notifications');
    }
  });
}
