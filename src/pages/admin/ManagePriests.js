// Parish Priest & Admin: Clergy & Celebrants Directory Management (Add, Edit, Remove)

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { firestoreService } from '../../services/firestoreService.js';
import { notificationService } from '../../services/notificationService.js';
import { authService } from '../../services/authService.js';
import { ROLES } from '../../config/constants.js';

export async function renderManagePriestsPage(router) {
  const user = authService.getCurrentUser();
  if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.PRIEST)) {
    return `
      <div class="container" style="padding: 5rem 1rem; text-align: center; max-width: 500px; margin: 0 auto;">
        <div class="card card-elevated" style="padding: 3rem 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
          <h2 style="color: var(--danger); margin-bottom: 0.5rem;">Access Restricted</h2>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem;">
            The Priest & Clergy Directory is strictly reserved for Parish Administrators and Priests. Please sign in with an authorized account.
          </p>
          <a href="/login" class="btn btn-primary" data-route="/login">Go to Login</a>
        </div>
      </div>
    `;
  }

  const isPriest = user?.role === ROLES.PRIEST;
  const currentRoute = isPriest ? '/priest/priests' : '/admin/priests';

  const priests = await firestoreService.getCollection('priests');

  const contentHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <span style="font-size: 1.5rem;">✝️</span>
          <h2 style="font-size: 1.5rem; margin: 0;">Parish Clergy & Celebrants Directory</h2>
        </div>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          Add, edit, or configure parish vicars, assistant priests, and visiting celebrants for Mass scheduling.
        </p>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <a href="${isPriest ? '/priest/schedules' : '/admin/schedules'}" class="btn btn-outline" data-route="${isPriest ? '/priest/schedules' : '/admin/schedules'}">
          ⏰ Mass Schedules
        </a>
        <button id="btn-open-priest-modal" class="btn btn-gold">
          ➕ Add New Priest / Celebrant
        </button>
      </div>
    </div>

    <!-- Priests Cards Grid -->
    ${priests.length === 0 ? `
      <div class="card card-elevated" style="padding: 3.5rem 1rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">✝️</div>
        <h3 style="color: var(--primary-navy); margin-bottom: 0.5rem;">No Clergy Members Registered Yet</h3>
        <p style="color: var(--text-muted); max-width: 500px; margin: 0 auto 1.5rem; font-size: 0.9rem;">
          Add your Parish Priest, Vicar, Assistant Vicars, or regular visiting celebrants to easily assign them to daily and Sunday Mass schedules.
        </p>
        <button id="btn-open-priest-modal-empty" class="btn btn-gold">
          ➕ Add First Celebrant
        </button>
      </div>
    ` : `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
        ${priests.map(p => `
          <div class="card card-gold-border" style="padding: 1.75rem; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="width: 80px; height: 80px; border-radius: var(--radius-full); background: var(--primary-navy); color: #d4af37; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 1rem; border: 3px solid var(--gold-accent);">
                ✝
              </div>
              <h4 style="font-size: 1.2rem; margin-bottom: 0.25rem; color: var(--primary-navy);">${p.name}</h4>
              <span class="badge badge-gold" style="font-size: 0.8rem; display: inline-block; margin-bottom: 0.85rem;">
                ${p.designation || 'Parish Clergy'}
              </span>

              <div style="background: var(--bg-surface-alt); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; text-align: left; margin-bottom: 1.25rem;">
                <div style="margin-bottom: 0.25rem;">📞 <strong>Phone:</strong> ${p.phone || 'N/A'}</div>
                <div style="margin-bottom: 0.25rem;">✉️ <strong>Email:</strong> ${p.email || 'N/A'}</div>
                <div>🗓️ <strong>Ordination / Year:</strong> ${p.ordinationYear || 'N/A'}</div>
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
              <button class="btn btn-outline btn-sm btn-block btn-edit-priest" 
                data-id="${p.id}" 
                data-name="${p.name}" 
                data-desig="${p.designation || ''}" 
                data-phone="${p.phone || ''}"
                data-email="${p.email || ''}"
                data-ord="${p.ordinationYear || ''}">
                ✏️ Edit
              </button>
              <button class="btn btn-danger btn-sm btn-delete-priest" data-id="${p.id}" title="Remove">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `}

    <!-- ADD / EDIT PRIEST MODAL -->
    <div id="priest-form-modal-backdrop" class="modal-backdrop" style="display: none;">
      <div class="modal-dialog" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title" id="priest-modal-title">Add Priest / Celebrant</h3>
          <button type="button" class="modal-close-btn" id="btn-close-priest-modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="priest-details-form">
            <input type="hidden" id="editPriestId" value="" />

            <div class="form-group">
              <label class="form-label" for="priestFullName">Priest Full Name <span class="required">*</span></label>
              <input type="text" id="priestFullName" class="form-control" placeholder="e.g. Rev. Fr. John Britto" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="priestDesignation">Designation / Role <span class="required">*</span></label>
              <input type="text" id="priestDesignation" class="form-control" placeholder="e.g. Parish Vicar, Assistant Vicar, Guest Celebrant" value="Parish Vicar" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="priestPhoneNum">Contact Phone</label>
                <input type="text" id="priestPhoneNum" class="form-control" placeholder="+91 94470 00000" />
              </div>

              <div class="form-group">
                <label class="form-label" for="priestOrdYear">Ordination Year</label>
                <input type="text" id="priestOrdYear" class="form-control" placeholder="e.g. 2012" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="priestEmailAddr">Email Address</label>
              <input type="email" id="priestEmailAddr" class="form-control" placeholder="clergy@ourladyofdolours.org" />
            </div>

            <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-priest-form">Cancel</button>
              <button type="submit" class="btn btn-gold">Save Priest</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: currentRoute,
    title: 'Clergy Directory',
    contentHtml
  });
}

export function attachManagePriestsEvents(router) {
  const user = authService.getCurrentUser();
  if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.PRIEST)) {
    return;
  }

  attachDashboardEvents(router);

  const isPriest = user?.role === ROLES.PRIEST;
  const redirectRoute = isPriest ? '/priest/priests' : '/admin/priests';

  const modal = document.getElementById('priest-form-modal-backdrop');
  const modalTitle = document.getElementById('priest-modal-title');
  const form = document.getElementById('priest-details-form');
  const idInput = document.getElementById('editPriestId');
  const nameInput = document.getElementById('priestFullName');
  const desigInput = document.getElementById('priestDesignation');
  const phoneInput = document.getElementById('priestPhoneNum');
  const ordInput = document.getElementById('priestOrdYear');
  const emailInput = document.getElementById('priestEmailAddr');

  const openModal = (isEdit = false) => {
    modalTitle.textContent = isEdit ? 'Edit Priest / Celebrant Details' : 'Add New Priest / Celebrant';
    modal.style.display = 'flex';
  };

  const closeModal = () => {
    modal.style.display = 'none';
    form.reset();
    idInput.value = '';
  };

  document.getElementById('btn-open-priest-modal')?.addEventListener('click', () => {
    form.reset();
    idInput.value = '';
    openModal(false);
  });

  document.getElementById('btn-open-priest-modal-empty')?.addEventListener('click', () => {
    form.reset();
    idInput.value = '';
    openModal(false);
  });

  document.getElementById('btn-close-priest-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel-priest-form')?.addEventListener('click', closeModal);

  // Edit Priest Click
  document.querySelectorAll('.btn-edit-priest').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const d = e.currentTarget.dataset;
      idInput.value = d.id;
      nameInput.value = d.name;
      desigInput.value = d.desig;
      phoneInput.value = d.phone;
      emailInput.value = d.email;
      ordInput.value = d.ord;
      openModal(true);
    });
  });

  // Save Priest Form Submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    if (!name) return;

    const priestId = idInput.value || ('priest_' + Date.now());
    const payload = {
      id: priestId,
      name,
      designation: desigInput.value.trim() || 'Parish Clergy',
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      ordinationYear: ordInput.value.trim(),
      active: true,
      updatedAt: new Date().toISOString()
    };

    if (!idInput.value) {
      payload.createdAt = new Date().toISOString();
    }

    await firestoreService.setDocument('priests', priestId, payload);
    notificationService.success(`${name} saved in clergy directory.`);
    closeModal();
    router.navigate(redirectRoute);
  });

  // Delete Priest
  document.querySelectorAll('.btn-delete-priest').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm('Are you sure you want to remove this priest from the parish directory?')) {
        await firestoreService.deleteDocument('priests', id);
        notificationService.success('Priest removed.');
        router.navigate(redirectRoute);
      }
    });
  });
}

