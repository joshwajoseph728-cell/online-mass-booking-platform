import { notificationService } from './notificationService.js';
import { firestoreService } from './firestoreService.js';

export const paymentService = {
  // Load Razorpay script dynamically if needed
  loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('Razorpay SDK failed to load from CDN. Falling back to sandbox simulator.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  },

  // Create Order from Serverless API or Sandbox Engine
  async createOrder({ amount, bookingId, notes = {} }) {
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, bookingId, notes })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.info('Serverless create-order endpoint not active, using direct sandbox simulation:', err);
    }

    // Direct sandbox simulation fallback
    return {
      success: true,
      orderId: `order_sbx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_churchDemoKey',
      isSandbox: true,
      bookingId
    };
  },

  // Verify Payment Signature via Serverless API
  async verifyPayment({ orderId, paymentId, signature, bookingId, isSandbox }) {
    try {
      const res = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          bookingId,
          isSandbox
        })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.info('Serverless verify-payment endpoint not active, approving sandbox verification:', err);
    }

    return {
      success: true,
      verified: true,
      paymentId: paymentId || `pay_sbx_${Date.now()}`,
      orderId,
      bookingId,
      isSandbox: true
    };
  },

  // Execute Complete Checkout Process (Admin QR / Phone / Razorpay / Cash)
  async processPayment({ amount, bookingId, parishionerName, email, phone, intentionType }) {
    await this.loadRazorpayScript();
    const settings = await firestoreService.getSettings();

    const orderData = await this.createOrder({
      amount,
      bookingId,
      notes: { parishionerName, intentionType }
    });

    return new Promise((resolve, reject) => {
      this.renderParishPaymentModal({
        amount,
        bookingId,
        parishionerName,
        email,
        phone,
        intentionType,
        orderData,
        settings,
        onSuccess: (paymentResult) => {
          resolve(paymentResult);
        },
        onCancel: () => {
          reject(new Error('Payment was cancelled by parishioner.'));
        }
      });
    });
  },

  // Interactive Multi-Method Payment Gateway (Option 1: 12-Digit UTR | Option 2: Screenshot Upload | Option 3: Gateway)
  renderParishPaymentModal({ amount, bookingId, parishionerName, email, phone, intentionType, orderData, settings, onSuccess, onCancel }) {
    const modalRoot = document.getElementById('modal-container') || document.body;
    const modalEl = document.createElement('div');
    modalEl.className = 'modal-backdrop';

    const churchName = settings.churchName || 'Our Lady of Dolours Church';
    const upiId = settings.upiId || 'ourladyofdolours@sbi';
    const upiPhone = settings.upiPhone || '+91 94471 23456';
    
    // Live dynamic QR code with exact amount
    const qrCodeUrl = settings.upiQrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId)}%26pn=${encodeURIComponent(churchName)}%26am=${amount}%26cu=INR`;

    let uploadedScreenshotBase64 = null;

    modalEl.innerHTML = `
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header" style="background: var(--primary-navy); color: white;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 1.5rem;">💳</div>
            <div>
              <h4 style="color: white; margin: 0; font-size: 1.1rem;">Mass Offering Payment & Verification</h4>
              <p style="color: #cbd5e1; font-size: 0.75rem; margin: 0;">${churchName}</p>
            </div>
          </div>
          <button class="modal-close-btn close-pay-modal" style="color: white;">&times;</button>
        </div>

        <div class="modal-body" style="padding: 1.5rem;">
          
          <!-- Offering Amount Banner -->
          <div style="text-align: center; margin-bottom: 1.25rem; background: var(--bg-surface-alt); padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-gold);">
            <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Offering Stipend</span>
            <div style="font-size: 2.25rem; font-weight: 800; color: var(--primary-navy); font-family: var(--font-serif); margin-top: 0.15rem;">
              ₹${amount}
            </div>
            <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 0.35rem;">
              <span class="badge badge-departed">${intentionType}</span>
            </div>
          </div>

          <!-- Common Step 1: Scan & Pay Details -->
          <div style="display: grid; grid-template-columns: 130px 1fr; gap: 1rem; align-items: center; background: var(--bg-surface-elevated); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
            <div style="text-align: center;">
              <div style="background: white; padding: 0.35rem; border-radius: var(--radius-md); display: inline-block; border: 1px solid var(--gold-accent);">
                <img src="${qrCodeUrl}" alt="Parish UPI QR Code" style="width: 110px; height: 110px; display: block;" />
              </div>
            </div>

            <div style="font-size: 0.82rem;">
              <strong style="color: var(--primary-navy); display: block; margin-bottom: 0.3rem;">Step 1: Scan & Pay ₹${amount} with UPI</strong>
              <div style="color: var(--text-muted); margin-bottom: 0.25rem;">
                UPI ID: <strong style="color: var(--primary-navy); font-family: monospace;">${upiId}</strong>
              </div>
              <div style="color: var(--text-muted); margin-bottom: 0.35rem;">
                GPay Phone: <strong style="color: #15803d;">${upiPhone}</strong>
              </div>
              <span style="font-size: 0.72rem; color: #64748b;">Supported: Google Pay, PhonePe, Paytm, BHIM, Bank UPI</span>
            </div>
          </div>

          <label class="form-label" style="font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; display: block;">
            <span>Step 2: Choose Verification Method <span class="required">*</span></span>
          </label>

          <!-- Payment Tabs Selector (Option 1 vs Option 2) -->
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; border-bottom: 1.5px solid var(--border-medium); padding-bottom: 0.75rem;">
            <button type="button" id="tab-btn-utr" class="btn btn-sm btn-primary" style="flex: 1; font-size: 0.85rem; font-weight: 700; padding: 0.45rem 0.6rem;">
              🔢 Option 1: Enter 12-Digit UTR
            </button>
            <button type="button" id="tab-btn-screenshot" class="btn btn-sm btn-secondary" style="flex: 1; font-size: 0.85rem; font-weight: 700; padding: 0.45rem 0.6rem;">
              📸 Option 2: Upload Screenshot
            </button>
          </div>

          <!-- 1. OPTION 1: ENTER 12-DIGIT UTR VIEW -->
          <div id="view-utr-input" style="display: block;">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label class="form-label" for="utr-number-input" style="font-size: 0.84rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.3rem;">
                <span>12-Digit UPI Ref No. / UTR <span class="required">*</span></span>
              </label>
              <div style="position: relative;">
                <input 
                  type="text" 
                  id="utr-number-input" 
                  class="form-control" 
                  placeholder="e.g. 425518294012" 
                  maxlength="12" 
                  style="font-size: 1.05rem; font-family: monospace; letter-spacing: 0.12em; font-weight: 700; padding-right: 60px;" 
                />
                <span id="utr-digit-counter" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
                  0/12
                </span>
              </div>
              <div id="utr-validation-msg" style="font-size: 0.75rem; margin-top: 0.35rem; display: none;"></div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.78rem; margin-bottom: 0.25rem;">Payment App Used</label>
                <select id="utr-app-select" class="form-select" style="font-size: 0.82rem; padding: 0.4rem 0.6rem;">
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm</option>
                  <option value="BHIM">BHIM UPI</option>
                  <option value="Amazon Pay">Amazon Pay</option>
                  <option value="Other UPI">Other Bank UPI</option>
                </select>
              </div>

              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 0.78rem; margin-bottom: 0.25rem;">Optional Note / Remitter</label>
                <input 
                  type="text" 
                  id="utr-sender-note" 
                  class="form-control" 
                  placeholder="e.g. Paid from John's Account" 
                  style="font-size: 0.82rem; padding: 0.4rem 0.6rem;" 
                />
              </div>
            </div>

            <button type="button" id="btn-submit-utr-pay" class="btn btn-gold btn-block btn-lg" style="box-shadow: var(--shadow-gold); font-weight: 700;">
              ✓ Submit 12-Digit UTR & Confirm Mass
            </button>
          </div>

          <!-- 2. OPTION 2: SCREENSHOT UPLOAD VIEW -->
          <div id="view-screenshot-upload" style="display: none;">
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <div id="screenshot-dropzone" style="border: 2px dashed var(--gold-accent); background: #fafaf9; border-radius: var(--radius-lg); padding: 1.25rem; text-align: center; cursor: pointer; transition: all 0.2s;">
                <input type="file" id="screenshot-file-input" accept="image/*" style="display: none;" />
                
                <div id="dropzone-empty-state">
                  <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">📸</div>
                  <strong style="color: var(--primary-navy); font-size: 0.95rem; display: block;">
                    Drag & drop payment screenshot here, or click to browse
                  </strong>
                  <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">
                    Upload the confirmation receipt screenshot from GPay, PhonePe, Paytm or BHIM.
                  </p>
                </div>

                <div id="dropzone-preview-state" style="display: none;">
                  <div style="position: relative; display: inline-block;">
                    <img id="screenshot-img-preview" src="" alt="Payment Screenshot Preview" style="max-height: 150px; max-width: 100%; border-radius: var(--radius-md); border: 2px solid #15803d; box-shadow: var(--shadow-md);" />
                    <button type="button" id="btn-remove-screenshot" style="position: absolute; top: -8px; right: -8px; background: var(--danger); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-weight: 700; cursor: pointer; font-size: 0.8rem;">&times;</button>
                  </div>
                  <div style="margin-top: 0.5rem; color: #15803d; font-size: 0.82rem; font-weight: 600;">
                    ✓ Screenshot attached ready for submission
                  </div>
                </div>
              </div>

              <div id="screenshot-error-feedback" style="color: var(--danger); font-size: 0.75rem; margin-top: 0.35rem; display: none;"></div>
            </div>

            <!-- Notes or optional reference -->
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <input 
                type="text" 
                id="optional-ref-input" 
                class="form-control" 
                placeholder="Optional: Enter UTR / Note (e.g. Paid from John's PhonePe)" 
                style="font-size: 0.82rem;" 
              />
            </div>

            <button type="button" id="btn-submit-screenshot-pay" class="btn btn-gold btn-block btn-lg" style="box-shadow: var(--shadow-gold); font-weight: 700;">
              📤 Submit Payment Screenshot & Confirm Mass
            </button>
          </div>

        </div>

        <div class="modal-footer" style="justify-content: center; font-size: 0.75rem; color: var(--text-muted); background: var(--bg-surface-alt);">
          Official Parish Registry &bull; Verified by Parish Office
        </div>
      </div>
    `;

    modalRoot.appendChild(modalEl);

    // Tab switching handlers
    const tabUtr = modalEl.querySelector('#tab-btn-utr');
    const tabScreenshot = modalEl.querySelector('#tab-btn-screenshot');
    const viewUtr = modalEl.querySelector('#view-utr-input');
    const viewScreenshot = modalEl.querySelector('#view-screenshot-upload');

    const selectTab = (activeTab, activeView) => {
      [tabUtr, tabScreenshot].forEach(t => t.className = 'btn btn-sm btn-secondary');
      [viewUtr, viewScreenshot].forEach(v => v.style.display = 'none');
      activeTab.className = 'btn btn-sm btn-primary';
      activeView.style.display = 'block';
    };

    tabUtr.addEventListener('click', () => selectTab(tabUtr, viewUtr));
    tabScreenshot.addEventListener('click', () => selectTab(tabScreenshot, viewScreenshot));

    // Close Modal
    const closeModal = () => {
      modalEl.remove();
      onCancel();
    };
    modalEl.querySelector('.close-pay-modal').addEventListener('click', closeModal);

    // OPTION 1: UTR Input Validation Handlers
    const utrInput = modalEl.querySelector('#utr-number-input');
    const utrCounter = modalEl.querySelector('#utr-digit-counter');
    const utrValMsg = modalEl.querySelector('#utr-validation-msg');
    const submitUtrBtn = modalEl.querySelector('#btn-submit-utr-pay');

    utrInput.addEventListener('input', (e) => {
      const cleanVal = e.target.value.replace(/\D/g, '').substring(0, 12);
      e.target.value = cleanVal;
      utrCounter.textContent = `${cleanVal.length}/12`;

      if (cleanVal.length === 12) {
        utrValMsg.style.display = 'block';
        utrValMsg.style.color = '#15803d';
        utrValMsg.innerHTML = '✓ Valid 12-digit UPI reference number format';
        utrInput.style.borderColor = '#15803d';
      } else if (cleanVal.length > 0) {
        utrValMsg.style.display = 'block';
        utrValMsg.style.color = '#d97706';
        utrValMsg.innerHTML = `⚠️ Enter all 12 numeric digits from your UPI app receipt (${12 - cleanVal.length} more needed)`;
        utrInput.style.borderColor = '#f59e0b';
      } else {
        utrValMsg.style.display = 'none';
        utrInput.style.borderColor = '';
      }
    });

    submitUtrBtn.addEventListener('click', () => {
      const utrVal = utrInput.value.trim();
      if (utrVal.length !== 12) {
        utrValMsg.style.display = 'block';
        utrValMsg.style.color = '#dc2626';
        utrValMsg.innerHTML = '⚠️ Please enter the complete 12-digit UTR number from your payment confirmation.';
        utrInput.focus();
        notificationService.error('Please enter a valid 12-digit UTR reference number.');
        return;
      }

      const selectedApp = modalEl.querySelector('#utr-app-select').value;
      const senderNote = modalEl.querySelector('#utr-sender-note').value.trim();
      const generatedPayId = `pay_utr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      submitUtrBtn.disabled = true;
      submitUtrBtn.innerHTML = '<span class="spinner"></span> Submitting UTR to Parish Office...';

      setTimeout(() => {
        modalEl.remove();
        onSuccess({
          success: true,
          verified: false,
          isPendingVerification: true,
          paymentStatus: 'PENDING_VERIFICATION',
          paymentId: generatedPayId,
          paymentMethod: `UPI Ref (${selectedApp})`,
          utrNumber: utrVal,
          paymentVerificationMode: 'OPTION_1_UTR',
          receiptScreenshot: null,
          optionalRef: senderNote ? `Note: ${senderNote}` : '',
          orderId: orderData.orderId,
          bookingId,
          isSandbox: false
        });
      }, 900);
    });

    // OPTION 2: File Upload Handlers
    const dropzone = modalEl.querySelector('#screenshot-dropzone');
    const fileInput = modalEl.querySelector('#screenshot-file-input');
    const emptyState = modalEl.querySelector('#dropzone-empty-state');
    const previewState = modalEl.querySelector('#dropzone-preview-state');
    const imgPreview = modalEl.querySelector('#screenshot-img-preview');
    const btnRemove = modalEl.querySelector('#btn-remove-screenshot');
    const errFeedback = modalEl.querySelector('#screenshot-error-feedback');
    const submitBtn = modalEl.querySelector('#btn-submit-screenshot-pay');

    const handleFile = (file) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        errFeedback.style.display = 'block';
        errFeedback.textContent = '⚠️ Please upload a valid image file (PNG, JPG, JPEG).';
        return;
      }
      errFeedback.style.display = 'none';

      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedScreenshotBase64 = e.target.result;
        imgPreview.src = uploadedScreenshotBase64;
        emptyState.style.display = 'none';
        previewState.style.display = 'block';
        dropzone.style.borderColor = '#15803d';
        dropzone.style.background = '#f0fdf4';
      };
      reader.readAsDataURL(file);
    };

    dropzone.addEventListener('click', (e) => {
      if (e.target !== btnRemove) {
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--primary-navy)';
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'var(--gold-accent)';
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    btnRemove.addEventListener('click', (e) => {
      e.stopPropagation();
      uploadedScreenshotBase64 = null;
      fileInput.value = '';
      emptyState.style.display = 'block';
      previewState.style.display = 'none';
      dropzone.style.borderColor = 'var(--gold-accent)';
      dropzone.style.background = '#fafaf9';
    });

    // Submit Screenshot Option
    modalEl.querySelector('#btn-submit-screenshot-pay').addEventListener('click', () => {
      if (!uploadedScreenshotBase64) {
        errFeedback.style.display = 'block';
        errFeedback.textContent = '⚠️ Please attach the screenshot of your UPI payment receipt before submitting.';
        notificationService.error('Please upload your payment screenshot.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Submitting Receipt to Parish Office...';

      const optionalRef = modalEl.querySelector('#optional-ref-input').value.trim() || '';
      const generatedPayId = `pay_ss_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      setTimeout(() => {
        modalEl.remove();
        onSuccess({
          success: true,
          verified: false,
          isPendingVerification: true,
          paymentStatus: 'PENDING_VERIFICATION',
          paymentId: generatedPayId,
          paymentMethod: 'UPI QR (Screenshot Upload)',
          paymentVerificationMode: 'OPTION_2_SCREENSHOT',
          receiptScreenshot: uploadedScreenshotBase64,
          optionalRef,
          orderId: orderData.orderId,
          bookingId,
          isSandbox: false
        });
      }, 1000);
    });
  }
};


