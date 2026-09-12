// Admin: User & Parishioner Directory Management with Dedicated Authentication Gate

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { firestoreService } from '../../services/firestoreService.js';
import { notificationService } from '../../services/notificationService.js';
import { authService } from '../../services/authService.js';
import { formatDate } from '../../utils/dateUtils.js';

export async function renderManageUsersPage(router) {
  const isUnlocked = sessionStorage.getItem('oldd_user_directory_unlocked') === 'true';

  // 1. If not unlocked, render dedicated Security Gate / Login Screen
  if (!isUnlocked) {
    const loginGateHtml = `
      <div style="min-height: calc(100vh - 220px); display: flex; align-items: center; justify-content: center; padding: 1rem;">
        <div class="card card-elevated card-gold-border" style="width: 100%; max-width: 480px; padding: 2.5rem 2rem; text-align: center; background: var(--bg-surface-elevated); box-shadow: var(--shadow-xl);">
          
          <div style="width: 64px; height: 64px; border-radius: var(--radius-full); background: var(--primary-navy); border: 2px solid var(--gold-accent); color: #d4af37; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
            🔒
          </div>

          <span class="badge badge-gold" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;">
            Security Protected Zone
          </span>

          <h2 style="font-size: 1.5rem; color: var(--primary-navy); margin-bottom: 0.5rem;">
            User Directory Access Verification
          </h2>

          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.75rem; line-height: 1.5;">
            The parishioner and user registry contains private contact and account information. Please enter your Administrator credentials to unlock the directory.
          </p>

          <form id="user-dir-login-form" style="text-align: left;">
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label class="form-label" for="dirUsername" style="font-weight: 600; font-size: 0.85rem;">
                Administrator Username or Email <span class="required">*</span>
              </label>
              <input 
                type="text" 
                id="dirUsername" 
                class="form-control" 
                placeholder="Enter admin username" 
                required 
                autocomplete="username"
              />
            </div>

            <div class="form-group" style="margin-bottom: 1.5rem;">
              <label class="form-label" for="dirPassword" style="font-weight: 600; font-size: 0.85rem;">
                Administrator Password <span class="required">*</span>
              </label>
              <input 
                type="password" 
                id="dirPassword" 
                class="form-control" 
                placeholder="••••••••" 
                required 
                autocomplete="current-password"
              />
            </div>

            <button type="submit" id="btn-unlock-dir" class="btn btn-primary btn-block btn-lg" style="margin-bottom: 1rem; font-weight: 700;">
              🔓 Unlock User Directory
            </button>
          </form>

          <div style="margin-top: 1rem; font-size: 0.85rem;">
            <a href="/admin" data-route="/admin" style="color: var(--text-muted); text-decoration: underline;">
              &larr; Cancel and return to Parish Overview
            </a>
          </div>

        </div>
      </div>
    `;

    return await renderDashboardLayout({
      activeRoute: '/admin/users',
      title: 'User Directory (Authentication Required)',
      contentHtml: loginGateHtml
    });
  }

  // 2. If unlocked, render the full User Directory
  const users = await firestoreService.getCollection('users');

  const contentHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <span style="font-size: 1.5rem;">👥</span>
          <h2 style="font-size: 1.5rem; margin: 0;">User & Parishioner Directory</h2>
        </div>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          Total registered parishioners: <strong>${users.length}</strong> &bull; Manage accounts, assign clergy/admin roles, and toggle access.
        </p>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button id="btn-lock-user-directory" class="btn btn-outline" title="Lock directory session">
          🔒 Lock Directory
        </button>
        <button id="btn-open-add-user" class="btn btn-gold">
          ➕ Add New Parishioner
        </button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="card" style="padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <input 
          type="text" 
          id="user-search-input" 
          class="form-control" 
          placeholder="Search by name, email, phone, or role..." 
          style="flex: 1; min-width: 240px;"
        />
        <select id="user-role-filter" class="form-select" style="width: auto; min-width: 160px;">
          <option value="ALL">All Roles</option>
          <option value="member">Members</option>
          <option value="priest">Priests / Clergy</option>
          <option value="admin">Administrators</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card card-elevated">
      <div class="card-body" style="padding: 0;">
        <div class="table-responsive">
          <table class="church-table">
            <thead>
              <tr>
                <th>User / Household</th>
                <th>Email Address</th>
                <th>Contact Phone</th>
                <th>System Role</th>
                <th>Status</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="users-table-tbody">
              ${users.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    No users registered yet. Click "Add New Parishioner" above.
                  </td>
                </tr>
              ` : users.map(u => `
                <tr data-user-row data-role="${u.role || 'member'}" data-search="${((u.fullName || '') + ' ' + (u.email || '') + ' ' + (u.phone || '')).toLowerCase()}">
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div class="user-avatar" style="width: 34px; height: 34px; font-size: 0.85rem; font-weight: 700; background: var(--primary-navy); color: #d4af37; border: 1px solid var(--gold-accent);">
                        ${u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <strong style="color: var(--primary-navy);">${u.fullName || 'Parishioner'}</strong>
                        ${u.designation ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${u.designation}</div>` : ''}
                      </div>
                    </div>
                  </td>
                  <td>${u.email || '<span style="color: var(--text-muted); font-style: italic;">N/A</span>'}</td>
                  <td>${u.phone || '<span style="color: var(--text-muted); font-style: italic;">N/A</span>'}</td>
                  <td>
                    <select class="form-select user-role-select" data-user-id="${u.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; width: auto; font-weight: 600;">
                      <option value="member" ${u.role === 'member' ? 'selected' : ''}>Member</option>
                      <option value="priest" ${u.role === 'priest' ? 'selected' : ''}>Priest / Clergy</option>
                      <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Administrator</option>
                    </select>
                  </td>
                  <td>
                    <span class="badge ${u.active !== false ? 'badge-completed' : 'badge-rejected'}">
                      ${u.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td><small style="color: var(--text-muted);">${formatDate(u.createdAt)}</small></td>
                  <td>
                    <div style="display: flex; gap: 0.4rem;">
                      <button class="btn btn-outline btn-sm btn-edit-user" 
                        data-id="${u.id}" 
                        data-name="${u.fullName || ''}" 
                        data-email="${u.email || ''}" 
                        data-phone="${u.phone || ''}"
                        data-role="${u.role || 'member'}"
                        title="Edit User">
                        ✏️
                      </button>
                      <button class="btn btn-outline btn-sm btn-toggle-status" 
                        data-user-id="${u.id}" 
                        data-current-active="${u.active !== false}"
                        title="${u.active !== false ? 'Deactivate Account' : 'Activate Account'}">
                        ${u.active !== false ? '🔒' : '🔓'}
                      </button>
                      ${u.username !== 'joshwa' && u.role !== 'admin' ? `
                        <button class="btn btn-danger btn-sm btn-delete-user" data-user-id="${u.id}" title="Delete User">
                          🗑️
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ADD / EDIT USER MODAL -->
    <div id="user-modal-backdrop" class="modal-backdrop" style="display: none;">
      <div class="modal-dialog" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title" id="user-modal-title">Add New Parishioner</h3>
          <button type="button" class="modal-close-btn" id="btn-close-user-modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="user-edit-form">
            <input type="hidden" id="editUserId" value="" />

            <div class="form-group">
              <label class="form-label" for="userFullName">Full Name / Household <span class="required">*</span></label>
              <input type="text" id="userFullName" class="form-control" placeholder="e.g. John & Mary" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="userEmail">Email Address <span class="required">*</span></label>
              <input type="email" id="userEmail" class="form-control" placeholder="parishioner@example.com" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="userPhone">Phone Number</label>
              <input type="text" id="userPhone" class="form-control" placeholder="+91 94470 00000" />
            </div>

            <div class="form-group">
              <label class="form-label" for="userRole">Account Role <span class="required">*</span></label>
              <select id="userRole" class="form-select">
                <option value="member">Parish Member</option>
                <option value="priest">Priest / Clergy</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-user-form">Cancel</button>
              <button type="submit" class="btn btn-gold">Save Parishioner</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/admin/users',
    title: 'User Management',
    contentHtml
  });
}

export function attachManageUsersEvents(router) {
  attachDashboardEvents(router);

  const isUnlocked = sessionStorage.getItem('oldd_user_directory_unlocked') === 'true';

  // 1. Handle Login Gate if not unlocked
  if (!isUnlocked) {
    const loginForm = document.getElementById('user-dir-login-form');
    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('dirUsername').value.trim();
      const password = document.getElementById('dirPassword').value.trim();

      const submitBtn = document.getElementById('btn-unlock-dir');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying Credentials...';
      }

      try {
        const cleanUser = username.toLowerCase();
        // Check Admin credentials
        if (cleanUser === 'joshwa' || cleanUser === 'joshwa@ourladyofdolours.org' || cleanUser === 'admin' || cleanUser === 'admin@ourladyofdolours.org') {
          if (password !== '1234') {
            throw new Error('Incorrect Administrator password.');
          }
        } else {
          // Check local or remote credentials
          await authService.login(username, password);
        }

        // Grant access
        sessionStorage.setItem('oldd_user_directory_unlocked', 'true');
        notificationService.success('Administrator verified! User Directory unlocked.');
        router.navigate('/admin/users');
      } catch (err) {
        notificationService.error(err.message || 'Authentication failed. Please check credentials.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '🔓 Unlock User Directory';
        }
      }
    });

    return;
  }

  // 2. When Unlocked: Attach User Management Events

  // Lock Directory Button
  document.getElementById('btn-lock-user-directory')?.addEventListener('click', () => {
    sessionStorage.removeItem('oldd_user_directory_unlocked');
    notificationService.info('User Directory has been locked.');
    router.navigate('/admin/users');
  });

  // Modal Elements
  const userModal = document.getElementById('user-modal-backdrop');
  const modalTitle = document.getElementById('user-modal-title');
  const userForm = document.getElementById('user-edit-form');
  const idInput = document.getElementById('editUserId');
  const nameInput = document.getElementById('userFullName');
  const emailInput = document.getElementById('userEmail');
  const phoneInput = document.getElementById('userPhone');
  const roleSelect = document.getElementById('userRole');

  const openUserModal = (isEdit = false) => {
    modalTitle.textContent = isEdit ? 'Edit Parishioner Details' : 'Add New Parishioner';
    userModal.style.display = 'flex';
  };

  const closeUserModal = () => {
    userModal.style.display = 'none';
    userForm.reset();
    idInput.value = '';
  };

  document.getElementById('btn-open-add-user')?.addEventListener('click', () => {
    userForm.reset();
    idInput.value = '';
    openUserModal(false);
  });

  document.getElementById('btn-close-user-modal')?.addEventListener('click', closeUserModal);
  document.getElementById('btn-cancel-user-form')?.addEventListener('click', closeUserModal);

  // Edit User Click
  document.querySelectorAll('.btn-edit-user').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const d = e.currentTarget.dataset;
      idInput.value = d.id;
      nameInput.value = d.name;
      emailInput.value = d.email;
      phoneInput.value = d.phone;
      roleSelect.value = d.role;
      openUserModal(true);
    });
  });

  // Save User Form Submit
  userForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = idInput.value || ('user_' + Date.now());
    const payload = {
      id: userId,
      uid: userId,
      fullName: nameInput.value.trim(),
      email: emailInput.value.trim().toLowerCase(),
      phone: phoneInput.value.trim(),
      role: roleSelect.value,
      active: true,
      updatedAt: new Date().toISOString()
    };

    if (!idInput.value) {
      payload.createdAt = new Date().toISOString();
    }

    await firestoreService.setDocument('users', userId, payload);
    notificationService.success(`User ${payload.fullName} saved successfully.`);
    closeUserModal();
    router.navigate('/admin/users');
  });

  // Change Role
  document.querySelectorAll('.user-role-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const uid = e.target.dataset.userId;
      const newRole = e.target.value;
      await firestoreService.updateDocument('users', uid, { role: newRole });
      notificationService.success(`User role updated to: ${newRole.toUpperCase()}`);
    });
  });

  // Toggle Active
  document.querySelectorAll('.btn-toggle-status').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const uid = e.currentTarget.dataset.userId;
      const cur = e.currentTarget.dataset.currentActive === 'true';
      await firestoreService.updateDocument('users', uid, { active: !cur });
      notificationService.success(`User account ${!cur ? 'activated' : 'deactivated'}.`);
      router.navigate('/admin/users');
    });
  });

  // Delete User
  document.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const uid = e.currentTarget.dataset.userId;
      if (confirm('Are you sure you want to permanently delete this user account?')) {
        await firestoreService.deleteDocument('users', uid);
        notificationService.success('User account removed.');
        router.navigate('/admin/users');
      }
    });
  });

  // Live Search & Filter
  const searchInput = document.getElementById('user-search-input');
  const roleFilter = document.getElementById('user-role-filter');

  const filterRows = () => {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const r = roleFilter?.value || 'ALL';

    document.querySelectorAll('[data-user-row]').forEach(row => {
      const rowSearch = row.dataset.search || '';
      const rowRole = row.dataset.role || '';

      const matchesSearch = !q || rowSearch.includes(q);
      const matchesRole = r === 'ALL' || rowRole === r;

      if (matchesSearch && matchesRole) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  };

  searchInput?.addEventListener('input', filterRows);
  roleFilter?.addEventListener('change', filterRows);
}

