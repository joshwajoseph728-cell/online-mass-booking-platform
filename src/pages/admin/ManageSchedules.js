// Parish Priest & Admin: Mass Schedules & Celebrants Management (Add, Edit, Assign Celebrant, Delete)

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { firestoreService } from '../../services/firestoreService.js';
import { notificationService } from '../../services/notificationService.js';
import { authService } from '../../services/authService.js';
import { ROLES } from '../../config/constants.js';

export async function renderManageSchedulesPage(router) {
  const user = authService.getCurrentUser();
  const isPriest = user?.role === ROLES.PRIEST;
  const currentRoute = isPriest ? '/priest/schedules' : '/admin/schedules';

  const schedules = await firestoreService.getCollection('massSchedules');
  const priests = await firestoreService.getCollection('priests');

  const contentHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
          <span style="font-size: 1.5rem;">⏰</span>
          <h2 style="font-size: 1.5rem; margin: 0;">Mass Timetables & Celebrant Management</h2>
        </div>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          Add or edit daily & Sunday Mass schedules, assign clergy / celebrant priests, and configure intention capacities.
        </p>
      </div>

      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button id="btn-quick-add-priest-top" class="btn btn-outline">
          ✝️ Add New Priest / Celebrant
        </button>
        <button id="btn-open-add-modal" class="btn btn-gold">
          ➕ Add New Mass Schedule
        </button>
      </div>
    </div>

    <!-- Quick Info Banner -->
    <div style="background: var(--bg-surface-alt); border-left: 4px solid var(--gold-accent); padding: 1rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
      <div>
        <strong style="color: var(--primary-navy); font-size: 0.95rem;">✝ Liturgical Celebrant Assignment:</strong>
        <p style="margin: 0.2rem 0 0; font-size: 0.85rem; color: var(--text-secondary);">
          You can assign registered parish priests, visiting celebrants, or leave as "To be announced" for any Mass time.
        </p>
      </div>
      <span class="badge badge-gold" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
        ${schedules.length} Scheduled Masses
      </span>
    </div>

    <!-- Schedules Table -->
    <div class="card card-elevated">
      <div class="card-body" style="padding: 0;">
        <div class="table-responsive">
          <table class="church-table">
            <thead>
              <tr>
                <th>Mass Time</th>
                <th>Day Type</th>
                <th>Language</th>
                <th>Assigned Celebrant</th>
                <th>Location / Altar</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${schedules.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    No Mass schedules configured yet. Click "Add New Mass Schedule" above.
                  </td>
                </tr>
              ` : schedules.map(s => {
                const celebrantDisplay = s.priestName && s.priestName.trim() ? s.priestName : '<span style="color: var(--text-muted); font-style: italic;">To be announced</span>';
                return `
                  <tr>
                    <td><strong style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--primary-navy);">${s.time}</strong></td>
                    <td><span class="badge ${s.dayType === 'sunday' ? 'badge-thanksgiving' : 'badge-departed'}">${s.dayType}</span></td>
                    <td><span class="language-pill">${s.language}</span></td>
                    <td>
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-weight: 600; color: var(--primary-navy);">${celebrantDisplay}</span>
                        <button class="btn btn-sm btn-outline btn-quick-assign-priest" 
                          data-id="${s.id}" 
                          data-time="${s.time}" 
                          data-current-priest="${s.priestName || ''}" 
                          style="padding: 0.15rem 0.45rem; font-size: 0.7rem;" 
                          title="Quick Assign Celebrant">
                          ✏️ Assign
                        </button>
                      </div>
                    </td>
                    <td>${s.location || 'Main Sanctuary'}</td>
                    <td><strong>${s.capacity || 30}</strong> Intentions</td>
                    <td>
                      <span class="badge ${s.active !== false ? 'badge-completed' : 'badge-rejected'}">
                        ${s.active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div style="display: flex; gap: 0.4rem;">
                        <button class="btn btn-outline btn-sm btn-edit-sched" 
                          data-id="${s.id}" 
                          data-time="${s.time}" 
                          data-daytype="${s.dayType}" 
                          data-lang="${s.language}" 
                          data-priest="${s.priestName || ''}" 
                          data-loc="${s.location || 'Main Sanctuary'}" 
                          data-cap="${s.capacity || 30}"
                          data-active="${s.active !== false}"
                          title="Full Edit">
                          ✏️ Edit
                        </button>
                        <button class="btn btn-danger btn-sm btn-del-sched" data-id="${s.id}" title="Delete Schedule">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 1. FULL ADD / EDIT MASS SCHEDULE MODAL -->
    <div id="schedule-modal-backdrop" class="modal-backdrop" style="display: none;">
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header">
          <h3 class="modal-title" id="sched-modal-title">Add Mass Schedule</h3>
          <button type="button" class="modal-close-btn" id="btn-close-sched-modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="schedule-edit-form">
            <input type="hidden" id="editSchedId" value="" />

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="schedTime">Mass Time (e.g. 07:00 AM) <span class="required">*</span></label>
                <input type="text" id="schedTime" class="form-control" placeholder="07:00 AM" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="schedDayType">Day Type <span class="required">*</span></label>
                <select id="schedDayType" class="form-select">
                  <option value="weekday">Weekday (Mon – Sat)</option>
                  <option value="sunday">Sunday (The Lord’s Day)</option>
                  <option value="feast">Feast Day / Special</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="schedLang">Liturgical Language <span class="required">*</span></label>
                <select id="schedLang" class="form-select">
                  <option value="Malayalam">Malayalam</option>
                  <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                  <option value="English">English</option>
                  <option value="English & Tamil">English & Tamil</option>
                  <option value="English & Malayalam">English & Malayalam</option>
                  <option value="Latin">Latin Tridentine</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="schedCap">Max Intention Capacity <span class="required">*</span></label>
                <input type="number" id="schedCap" class="form-control" value="35" min="5" max="150" required />
              </div>
            </div>

            <!-- Celebrant Assignment -->
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <label class="form-label" for="schedPriest" style="margin: 0;">Assigned Celebrant Priest</label>
                <a href="#" id="link-add-celebrant-inline" style="font-size: 0.78rem; font-weight: 700; color: var(--primary-navy);">+ Add New to Directory</a>
              </div>
              <select id="schedPriest" class="form-select">
                <option value="">-- To be announced / Unassigned --</option>
                ${priests.map(p => `
                  <option value="${p.name}">${p.name} (${p.designation || 'Clergy'})</option>
                `).join('')}
                <option value="__custom__">➕ Type Custom / Visiting Priest Name...</option>
              </select>

              <div id="custom-priest-container" style="display: none; margin-top: 0.5rem;">
                <input type="text" id="schedCustomPriest" class="form-control" placeholder="Enter Celebrant Name (e.g. Rev. Fr. John Britto)" />
                <small style="color: var(--text-muted); font-size: 0.75rem;">Specify guest celebrant, visiting rector, or special preacher name.</small>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="schedLoc">Sanctuary / Altar Location</label>
              <input type="text" id="schedLoc" class="form-control" placeholder="Main Sanctuary / Main Altar" value="Main Sanctuary" />
            </div>

            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600;">
                <input type="checkbox" id="schedActive" checked style="width: 18px; height: 18px;" />
                Schedule is Active for Public Online Bookings
              </label>
            </div>

            <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-sched">Cancel</button>
              <button type="submit" class="btn btn-gold">Save Schedule</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 2. QUICK ASSIGN CELEBRANT MODAL -->
    <div id="quick-assign-modal-backdrop" class="modal-backdrop" style="display: none;">
      <div class="modal-dialog" style="max-width: 460px;">
        <div class="modal-header">
          <h3 class="modal-title" id="qa-modal-title">Assign Celebrant</h3>
          <button type="button" class="modal-close-btn" id="btn-close-qa-modal">&times;</button>
        </div>
        <div class="modal-body">
          <form id="quick-assign-form">
            <input type="hidden" id="qaSchedId" value="" />

            <div style="background: var(--bg-surface-alt); padding: 0.75rem 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
              <div style="font-size: 0.8rem; color: var(--text-muted);">Mass Time:</div>
              <strong id="qa-time-display" style="font-size: 1.15rem; color: var(--primary-navy); font-family: var(--font-serif);"></strong>
            </div>

            <div class="form-group">
              <label class="form-label" for="qaPriestSelect">Select Celebrant Priest</label>
              <select id="qaPriestSelect" class="form-select">
                <option value="">-- To be announced / Unassigned --</option>
                ${priests.map(p => `
                  <option value="${p.name}">${p.name} (${p.designation || 'Clergy'})</option>
                `).join('')}
                <option value="__custom__">➕ Type Custom / Visiting Priest Name...</option>
              </select>

              <div id="qa-custom-container" style="display: none; margin-top: 0.5rem;">
                <input type="text" id="qaCustomPriest" class="form-control" placeholder="Enter Celebrant Name (e.g. Rev. Fr. John Britto)" />
              </div>
            </div>

            <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-qa">Cancel</button>
              <button type="submit" class="btn btn-gold">Update Celebrant</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 3. ADD NEW PRIEST INLINE MODAL -->
    <div id="add-priest-inline-modal" class="modal-backdrop" style="display: none; z-index: 10001;">
      <div class="modal-dialog" style="max-width: 460px;">
        <div class="modal-header">
          <h3 class="modal-title">Add Priest to Clergy Directory</h3>
          <button type="button" class="modal-close-btn" id="btn-close-inline-priest">&times;</button>
        </div>
        <div class="modal-body">
          <form id="inline-priest-form">
            <div class="form-group">
              <label class="form-label" for="newPriestName">Priest Full Name <span class="required">*</span></label>
              <input type="text" id="newPriestName" class="form-control" placeholder="Rev. Fr. Name" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="newPriestDesig">Designation / Role</label>
              <input type="text" id="newPriestDesig" class="form-control" placeholder="e.g. Parish Vicar, Assistant Vicar, Visiting Preacher" value="Parish Priest" />
            </div>

            <div class="form-group">
              <label class="form-label" for="newPriestPhone">Contact Phone Number</label>
              <input type="text" id="newPriestPhone" class="form-control" placeholder="+91 94470 00000" />
            </div>

            <div class="modal-footer" style="padding: 1rem 0 0; background: transparent;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-inline-priest">Cancel</button>
              <button type="submit" class="btn btn-gold">Save Priest to Directory</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: currentRoute,
    title: 'Mass Schedules & Celebrants',
    contentHtml
  });
}

export function attachManageSchedulesEvents(router) {
  attachDashboardEvents(router);

  const user = authService.getCurrentUser();
  const isPriest = user?.role === ROLES.PRIEST;
  const redirectRoute = isPriest ? '/priest/schedules' : '/admin/schedules';

  // 1. Full Schedule Modal Elements
  const schedModal = document.getElementById('schedule-modal-backdrop');
  const modalTitle = document.getElementById('sched-modal-title');
  const form = document.getElementById('schedule-edit-form');
  const idInput = document.getElementById('editSchedId');
  const timeInput = document.getElementById('schedTime');
  const dayTypeSelect = document.getElementById('schedDayType');
  const langSelect = document.getElementById('schedLang');
  const capInput = document.getElementById('schedCap');
  const priestSelect = document.getElementById('schedPriest');
  const customPriestContainer = document.getElementById('custom-priest-container');
  const customPriestInput = document.getElementById('schedCustomPriest');
  const locInput = document.getElementById('schedLoc');
  const activeCheck = document.getElementById('schedActive');

  const openSchedModal = (isEdit = false) => {
    modalTitle.textContent = isEdit ? 'Edit Mass Schedule' : 'Add New Mass Schedule';
    schedModal.style.display = 'flex';
  };

  const closeSchedModal = () => {
    schedModal.style.display = 'none';
    form.reset();
    idInput.value = '';
    customPriestContainer.style.display = 'none';
  };

  document.getElementById('btn-open-add-modal')?.addEventListener('click', () => {
    form.reset();
    idInput.value = '';
    customPriestContainer.style.display = 'none';
    openSchedModal(false);
  });

  document.getElementById('btn-close-sched-modal')?.addEventListener('click', closeSchedModal);
  document.getElementById('btn-cancel-sched')?.addEventListener('click', closeSchedModal);

  // Toggle custom priest input
  priestSelect?.addEventListener('change', () => {
    if (priestSelect.value === '__custom__') {
      customPriestContainer.style.display = 'block';
      customPriestInput.focus();
    } else {
      customPriestContainer.style.display = 'none';
    }
  });

  // Edit Schedule Click
  document.querySelectorAll('.btn-edit-sched').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const d = e.currentTarget.dataset;
      idInput.value = d.id;
      timeInput.value = d.time;
      dayTypeSelect.value = d.daytype;
      langSelect.value = d.lang;
      capInput.value = d.cap;
      locInput.value = d.loc;
      activeCheck.checked = d.active === 'true';

      const priestVal = d.priest || '';
      let found = false;
      for (let opt of priestSelect.options) {
        if (opt.value === priestVal && opt.value !== '__custom__') {
          priestSelect.value = priestVal;
          found = true;
          break;
        }
      }

      if (!found && priestVal) {
        priestSelect.value = '__custom__';
        customPriestInput.value = priestVal;
        customPriestContainer.style.display = 'block';
      } else {
        if (!priestVal) priestSelect.value = '';
        customPriestContainer.style.display = 'none';
      }

      openSchedModal(true);
    });
  });

  // Save Schedule Submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    let celebrantName = priestSelect.value;
    if (celebrantName === '__custom__') {
      celebrantName = customPriestInput.value.trim();
    }

    const schedId = idInput.value || ('sched_' + Date.now());
    const payload = {
      id: schedId,
      time: timeInput.value.trim(),
      dayType: dayTypeSelect.value,
      language: langSelect.value,
      capacity: Number(capInput.value) || 35,
      priestName: celebrantName,
      location: locInput.value.trim() || 'Main Sanctuary',
      active: activeCheck.checked,
      updatedAt: new Date().toISOString()
    };

    if (!idInput.value) {
      payload.createdAt = new Date().toISOString();
    }

    await firestoreService.setDocument('massSchedules', schedId, payload);
    notificationService.success(`Mass schedule for ${payload.time} saved! Celebrant: ${celebrantName || 'To be announced'}`);
    closeSchedModal();
    router.navigate(redirectRoute);
  });

  // Delete Schedule
  document.querySelectorAll('.btn-del-sched').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm('Are you sure you want to delete this Mass schedule?')) {
        await firestoreService.deleteDocument('massSchedules', id);
        notificationService.success('Schedule deleted.');
        router.navigate(redirectRoute);
      }
    });
  });

  // 2. QUICK ASSIGN CELEBRANT MODAL
  const qaModal = document.getElementById('quick-assign-modal-backdrop');
  const qaSchedId = document.getElementById('qaSchedId');
  const qaTimeDisplay = document.getElementById('qa-time-display');
  const qaPriestSelect = document.getElementById('qaPriestSelect');
  const qaCustomContainer = document.getElementById('qa-custom-container');
  const qaCustomPriest = document.getElementById('qaCustomPriest');
  const qaForm = document.getElementById('quick-assign-form');

  const closeQaModal = () => {
    qaModal.style.display = 'none';
    qaForm.reset();
    qaSchedId.value = '';
    qaCustomContainer.style.display = 'none';
  };

  document.querySelectorAll('.btn-quick-assign-priest').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const time = e.currentTarget.dataset.time;
      const curPriest = e.currentTarget.dataset.currentPriest;

      qaSchedId.value = id;
      qaTimeDisplay.textContent = time;

      let found = false;
      for (let opt of qaPriestSelect.options) {
        if (opt.value === curPriest && opt.value !== '__custom__') {
          qaPriestSelect.value = curPriest;
          found = true;
          break;
        }
      }

      if (!found && curPriest) {
        qaPriestSelect.value = '__custom__';
        qaCustomPriest.value = curPriest;
        qaCustomContainer.style.display = 'block';
      } else {
        if (!curPriest) qaPriestSelect.value = '';
        qaCustomContainer.style.display = 'none';
      }

      qaModal.style.display = 'flex';
    });
  });

  document.getElementById('btn-close-qa-modal')?.addEventListener('click', closeQaModal);
  document.getElementById('btn-cancel-qa')?.addEventListener('click', closeQaModal);

  qaPriestSelect?.addEventListener('change', () => {
    if (qaPriestSelect.value === '__custom__') {
      qaCustomContainer.style.display = 'block';
      qaCustomPriest.focus();
    } else {
      qaCustomContainer.style.display = 'none';
    }
  });

  qaForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = qaSchedId.value;
    if (!id) return;

    let celebrantName = qaPriestSelect.value;
    if (celebrantName === '__custom__') {
      celebrantName = qaCustomPriest.value.trim();
    }

    await firestoreService.updateDocument('massSchedules', id, {
      priestName: celebrantName,
      updatedAt: new Date().toISOString()
    });

    notificationService.success(`Celebrant assigned: ${celebrantName || 'To be announced'}`);
    closeQaModal();
    router.navigate(redirectRoute);
  });

  // 3. INLINE ADD PRIEST MODAL
  const inlinePriestModal = document.getElementById('add-priest-inline-modal');
  const inlinePriestForm = document.getElementById('inline-priest-form');

  const openInlinePriestModal = (e) => {
    if (e) e.preventDefault();
    inlinePriestForm.reset();
    inlinePriestModal.style.display = 'flex';
  };

  const closeInlinePriestModal = () => {
    inlinePriestModal.style.display = 'none';
    inlinePriestForm.reset();
  };

  document.getElementById('btn-quick-add-priest-top')?.addEventListener('click', openInlinePriestModal);
  document.getElementById('link-add-celebrant-inline')?.addEventListener('click', openInlinePriestModal);
  document.getElementById('btn-close-inline-priest')?.addEventListener('click', closeInlinePriestModal);
  document.getElementById('btn-cancel-inline-priest')?.addEventListener('click', closeInlinePriestModal);

  inlinePriestForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('newPriestName').value.trim();
    const desig = document.getElementById('newPriestDesig').value.trim() || 'Parish Clergy';
    const phone = document.getElementById('newPriestPhone').value.trim() || '';

    if (!name) return;

    const newId = 'priest_' + Date.now();
    await firestoreService.setDocument('priests', newId, {
      id: newId,
      name,
      designation: desig,
      phone,
      email: '',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      active: true,
      createdAt: new Date().toISOString()
    });

    notificationService.success(`${name} added to parish clergy directory!`);
    closeInlinePriestModal();
    router.navigate(redirectRoute);
  });
}

