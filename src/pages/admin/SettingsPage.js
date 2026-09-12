// Admin: Church Portal Settings & UPI Payment / QR Code Photo Upload Page

import { renderDashboardLayout, attachDashboardEvents } from '../../components/DashboardLayout.js';
import { firestoreService } from '../../services/firestoreService.js';
import { notificationService } from '../../services/notificationService.js';

export async function renderSettingsPage(router) {
  const settings = await firestoreService.getSettings();

  const currentQrSrc = settings.upiQrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(settings.upiId || 'ourladyofdolours@sbi')}%26pn=${encodeURIComponent(settings.upiAccountName || 'Our Lady of Dolours Church')}%26cu=INR`;

  const contentHtml = `
    <div style="max-width: 840px; margin: 0 auto;">
      <div style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;">Parish Settings & Payment Configuration</h2>
        <p style="color: var(--text-muted); margin: 0; font-size: 0.85rem;">
          Configure church coordinates, upload official payment QR code photos, UPI mobile numbers, and booking rules.
        </p>
      </div>

      <div class="card card-elevated card-gold-border" style="padding: 2rem;">
        <form id="church-settings-form">
          
          <!-- 0. WEBSITE LOGO & BRANDING CUSTOMIZATION -->
          <h4 style="color: var(--primary-navy); margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🎨</span> Website Logo & Parish Branding
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Change the official parish logo displayed on the website header, navigation bars, and administrative portal.
          </p>

          <div style="display: grid; grid-template-columns: 1fr auto; gap: 1.5rem; align-items: center; background: var(--bg-surface-alt); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-medium); margin-bottom: 2rem;">
            <div>
              <label class="form-label">Upload New Church Logo</label>
              <input type="file" id="logo-file-picker" accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp" style="display: none;" />
              
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
                <button type="button" id="btn-trigger-logo-upload" class="btn btn-primary btn-sm">
                  📁 Choose Logo Image / Photo
                </button>
                <button type="button" id="btn-reset-default-logo" class="btn btn-outline btn-sm">
                  🔄 Revert to Default Shield Crest
                </button>
              </div>

              <input type="hidden" id="uploadedLogoDataUrl" value="${settings.logoUrl || ''}" />
              <span class="form-help" id="logo-status-text">
                ${settings.logoUrl ? '✓ Custom parish logo active.' : 'Using official Marian shield golden crest.'}
              </span>
            </div>

            <!-- Current Logo Preview Box -->
            <div style="text-align: center;">
              <span style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--gold-accent-hover); display: block; margin-bottom: 0.35rem;">Live Logo Preview</span>
              <div id="preview-logo-box" style="width: 70px; height: 70px; border-radius: var(--radius-md); background: var(--primary-navy); border: 2px solid var(--gold-accent); display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 4px;">
                ${settings.logoUrl ? `
                  <img id="preview-logo-img" src="${settings.logoUrl}" alt="Church Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                ` : `
                  <svg id="preview-logo-svg" width="38" height="38" viewBox="0 0 100 100" fill="none">
                    <path d="M50 5 L88 20 C88 58 72 85 50 95 C28 85 12 20 Z" fill="#d4af37"/>
                    <rect x="45" y="28" width="10" height="46" rx="2" fill="#1e3a8a"/>
                    <rect x="28" y="42" width="44" height="10" rx="2" fill="#1e3a8a"/>
                  </svg>
                `}
              </div>
            </div>
          </div>

          <!-- 1. PARISH PROFILE & CONTACT -->
          <h4 style="color: var(--primary-navy); margin-bottom: 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⛪</span> Parish Profile & Coordinates
          </h4>

          <div class="form-group">
            <label class="form-label" for="setChurchName">Official Parish Name <span class="required">*</span></label>
            <input type="text" id="setChurchName" class="form-control" value="${settings.churchName || ''}" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="setLocation">Parish Address & Location <span class="required">*</span></label>
            <input type="text" id="setLocation" class="form-control" value="${settings.address || ''}" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label" for="setPhone">Office Landline / Phone</label>
              <input type="text" id="setPhone" class="form-control" value="${settings.phone || ''}" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="setEmergency">Emergency Clergy Line</label>
              <input type="text" id="setEmergency" class="form-control" value="${settings.emergencyPhone || ''}" required />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label" for="setEmail">Office Email</label>
              <input type="email" id="setEmail" class="form-control" value="${settings.email || ''}" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="setVicarName">Parish Vicar / Rector Name</label>
              <input type="text" id="setVicarName" class="form-control" value="${settings.vicarName || ''}" />
            </div>
          </div>

          <!-- 2. DIRECT UPI & QR CODE PHOTO UPLOAD CONFIGURATION -->
          <h4 style="color: var(--primary-navy); margin: 2rem 0 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>💳</span> Parish Payment QR Code & Mobile Number
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            Upload your official bank / Google Pay / PhonePe QR code photo or image file, or let the portal generate one automatically.
          </p>

          <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2rem; align-items: flex-start;">
            <div>
              <div class="form-group">
                <label class="form-label" for="setUpiId">
                  <span>Parish Official UPI ID / VPA <span class="required">*</span></span>
                </label>
                <input 
                  type="text" 
                  id="setUpiId" 
                  class="form-control" 
                  value="${settings.upiId || 'ourladyofdolours@sbi'}" 
                  placeholder="e.g. church@sbi or vicar@okaxis" 
                  required 
                />
                <span class="form-help">UPI Virtual Payment Address of the church parish bank account.</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="setUpiPhone">
                  <span>Parish GPay / PhonePe Mobile Number <span class="required">*</span></span>
                </label>
                <input 
                  type="text" 
                  id="setUpiPhone" 
                  class="form-control" 
                  value="${settings.upiPhone || '+91 94471 23456'}" 
                  placeholder="+91 94471 23456" 
                  required 
                />
                <span class="form-help">Mobile number registered for direct UPI transfers.</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="setUpiName">
                  <span>Beneficiary / Account Name</span>
                </label>
                <input 
                  type="text" 
                  id="setUpiName" 
                  class="form-control" 
                  value="${settings.upiAccountName || 'Our Lady of Dolours Parish Church'}" 
                  placeholder="Our Lady of Dolours Parish Church" 
                />
              </div>

              <!-- PHOTO / FILE UPLOAD CONTROLS -->
              <div class="form-group" style="margin-top: 1.25rem;">
                <label class="form-label">
                  <span>Upload QR Code Photo / File (PNG, JPG, JPEG)</span>
                </label>

                <input type="file" id="qr-file-picker" accept="image/png, image/jpeg, image/jpg, image/webp" style="display: none;" />

                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  <button type="button" id="btn-trigger-qr-upload" class="btn btn-primary btn-sm">
                    📁 Choose Photo / Image File
                  </button>
                  <button type="button" id="btn-reset-auto-qr" class="btn btn-outline btn-sm">
                    🔄 Reset to Auto UPI QR
                  </button>
                </div>
                <input type="hidden" id="uploadedQrDataUrl" value="${settings.upiQrImageUrl || ''}" />
                <span class="form-help" id="upload-status-text" style="margin-top: 0.35rem; display: block;">
                  ${settings.upiQrImageUrl && settings.upiQrImageUrl.startsWith('data:image') ? '✓ Custom QR Photo currently loaded.' : 'Using auto-generated live QR.'}
                </span>
              </div>
            </div>

            <!-- Live QR Code Preview Card -->
            <div class="card card-gold-border" style="padding: 1.5rem; text-align: center; background: var(--bg-surface-elevated);">
              <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--gold-accent-hover); display: block; margin-bottom: 0.75rem;">
                Live Parish QR Preview
              </span>
              <div style="background: white; padding: 0.75rem; border-radius: var(--radius-md); display: inline-block; border: 1px solid var(--border-medium); margin-bottom: 0.75rem; max-width: 100%;">
                <img 
                  id="preview-qr-img" 
                  src="${currentQrSrc}" 
                  alt="Parish UPI QR Code" 
                  style="width: 170px; height: 170px; object-fit: contain; display: block;" 
                />
              </div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--primary-navy);" id="preview-upi-id">
                ${settings.upiId || 'ourladyofdolours@sbi'}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted);" id="preview-upi-phone">
                📞 ${settings.upiPhone || '+91 94471 23456'}
              </div>
            </div>
          </div>

          <!-- 3. MASS BOOKING POLICIES -->
          <h4 style="color: var(--primary-navy); margin: 2rem 0 1rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🕯️</span> Mass Booking Rules & Methods
          </h4>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label" for="setMinOffering">Departed Soul Offering Rate (₹ per head)</label>
              <input type="number" id="setMinOffering" class="form-control" value="50" min="50" step="10" />
            </div>

            <div class="form-group">
              <label class="form-label" for="setMaxDays">Max Booking Advance (Days)</label>
              <input type="number" id="setMaxDays" class="form-control" value="${settings.maxDaysAdvance || 90}" min="7" />
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 600;">
              <input type="checkbox" id="setAllowUpi" ${settings.allowUpiDirect !== false ? 'checked' : ''} style="width: 18px; height: 18px;" />
              Enable Direct UPI QR & Phone Payment Option
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 600;">
              <input type="checkbox" id="setAllowRazorpay" ${settings.allowRazorpay !== false ? 'checked' : ''} style="width: 18px; height: 18px;" />
              Enable Razorpay Online Payment Gateway
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; font-weight: 600;">
              <input type="checkbox" id="setAllowCash" ${settings.allowCashAtOffice !== false ? 'checked' : ''} style="width: 18px; height: 18px;" />
              Enable Cash Stipend Submission at Parish Office
            </label>
          </div>

          <button type="submit" class="btn btn-gold btn-block btn-lg" style="margin-top: 2rem; box-shadow: var(--shadow-gold);">
            💾 Save All Parish Settings & QR Photo
          </button>
        </form>
      </div>
    </div>
  `;

  return await renderDashboardLayout({
    activeRoute: '/admin/settings',
    title: 'Parish Settings',
    contentHtml
  });
}

export function attachSettingsEvents(router) {
  attachDashboardEvents(router);

  // Logo management elements
  const logoPicker = document.getElementById('logo-file-picker');
  const triggerLogoBtn = document.getElementById('btn-trigger-logo-upload');
  const resetLogoBtn = document.getElementById('btn-reset-default-logo');
  const logoHiddenInput = document.getElementById('uploadedLogoDataUrl');
  const logoBox = document.getElementById('preview-logo-box');
  const logoStatusText = document.getElementById('logo-status-text');

  triggerLogoBtn?.addEventListener('click', () => logoPicker?.click());

  logoPicker?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notificationService.error('Please select an image file under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        logoHiddenInput.value = dataUrl;
        if (logoBox) {
          logoBox.innerHTML = `<img src="${dataUrl}" alt="New Logo" style="width: 100%; height: 100%; object-fit: contain;" />`;
        }
        if (logoStatusText) {
          logoStatusText.innerHTML = `<span style="color: #15803d; font-weight: 700;">✓ New Logo Selected: ${file.name} (Click Save below)</span>`;
        }
        notificationService.success(`Loaded new logo: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  });

  resetLogoBtn?.addEventListener('click', () => {
    logoHiddenInput.value = '';
    if (logoPicker) logoPicker.value = '';
    if (logoBox) {
      logoBox.innerHTML = `
        <svg width="38" height="38" viewBox="0 0 100 100" fill="none">
          <path d="M50 5 L88 20 C88 58 72 85 50 95 C28 85 12 20 Z" fill="#d4af37"/>
          <rect x="45" y="28" width="10" height="46" rx="2" fill="#1e3a8a"/>
          <rect x="28" y="42" width="44" height="10" rx="2" fill="#1e3a8a"/>
        </svg>
      `;
    }
    if (logoStatusText) {
      logoStatusText.textContent = 'Using official Marian shield golden crest.';
    }
    notificationService.info('Reverted to default shield crest logo.');
  });

  // UPI and QR elements
  const upiInput = document.getElementById('setUpiId');
  const upiPhoneInput = document.getElementById('setUpiPhone');
  const upiNameInput = document.getElementById('setUpiName');
  const qrHiddenInput = document.getElementById('uploadedQrDataUrl');
  const previewImg = document.getElementById('preview-qr-img');
  const previewUpiId = document.getElementById('preview-upi-id');
  const previewUpiPhone = document.getElementById('preview-upi-phone');
  const filePicker = document.getElementById('qr-file-picker');
  const triggerBtn = document.getElementById('btn-trigger-qr-upload');
  const resetBtn = document.getElementById('btn-reset-auto-qr');
  const statusText = document.getElementById('upload-status-text');

  const updatePreview = () => {
    const vpa = upiInput?.value.trim() || 'ourladyofdolours@sbi';
    const phone = upiPhoneInput?.value.trim() || '+91 94471 23456';
    const name = upiNameInput?.value.trim() || 'Our Lady of Dolours Church';
    const customPhoto = qrHiddenInput?.value.trim();

    if (previewUpiId) previewUpiId.textContent = vpa;
    if (previewUpiPhone) previewUpiPhone.textContent = `📞 ${phone}`;

    if (customPhoto) {
      if (previewImg) previewImg.src = customPhoto;
    } else {
      const generated = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${encodeURIComponent(vpa)}%26pn=${encodeURIComponent(name)}%26cu=INR`;
      if (previewImg) previewImg.src = generated;
    }
  };

  upiInput?.addEventListener('input', updatePreview);
  upiPhoneInput?.addEventListener('input', updatePreview);
  upiNameInput?.addEventListener('input', updatePreview);

  // File Upload Trigger
  triggerBtn?.addEventListener('click', () => {
    filePicker.click();
  });

  // Handle File Selection
  filePicker?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notificationService.error('Please select an image file smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const dataUrl = loadEvt.target.result;
        qrHiddenInput.value = dataUrl;
        if (previewImg) previewImg.src = dataUrl;
        if (statusText) statusText.innerHTML = `<span style="color: #15803d; font-weight: 700;">✓ New QR Photo Selected: ${file.name}</span>`;
        notificationService.success(`Loaded QR Photo: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  });

  // Reset to Auto QR
  resetBtn?.addEventListener('click', () => {
    qrHiddenInput.value = '';
    filePicker.value = '';
    if (statusText) statusText.textContent = 'Using auto-generated live UPI QR.';
    updatePreview();
    notificationService.info('Reverted to auto-generated UPI QR code.');
  });

  // Save Settings
  document.getElementById('church-settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const upiVal = document.getElementById('setUpiId').value.trim();
    const upiNameVal = document.getElementById('setUpiName').value.trim();
    const customPhotoVal = qrHiddenInput.value.trim();
    const customLogoVal = logoHiddenInput?.value.trim() || '';

    const finalQr = customPhotoVal || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiVal)}%26pn=${encodeURIComponent(upiNameVal)}%26cu=INR`;

    const payload = {
      logoUrl: customLogoVal,
      churchName: document.getElementById('setChurchName').value.trim(),
      address: document.getElementById('setLocation').value.trim(),
      phone: document.getElementById('setPhone').value.trim(),
      emergencyPhone: document.getElementById('setEmergency').value.trim(),
      email: document.getElementById('setEmail').value.trim(),
      vicarName: document.getElementById('setVicarName').value.trim(),
      upiId: upiVal,
      upiPhone: document.getElementById('setUpiPhone').value.trim(),
      upiAccountName: upiNameVal,
      upiQrImageUrl: finalQr,
      maxDaysAdvance: Number(document.getElementById('setMaxDays').value) || 90,
      allowUpiDirect: document.getElementById('setAllowUpi').checked,
      allowRazorpay: document.getElementById('setAllowRazorpay').checked,
      allowCashAtOffice: document.getElementById('setAllowCash').checked
    };

    await firestoreService.saveSettings(payload);
    notificationService.success('Parish settings, logo branding & QR photo saved successfully!');
    router.navigate('/admin/settings');
  });
}
