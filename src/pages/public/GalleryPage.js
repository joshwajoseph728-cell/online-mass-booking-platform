// Public & Administrative Parish Photo Gallery Page

import { renderNavbar, attachNavbarEvents } from '../../components/Navbar.js';
import { renderFooter } from '../../components/Footer.js';
import { galleryService } from '../../services/galleryService.js';
import { authService } from '../../services/authService.js';
import { notificationService } from '../../services/notificationService.js';
import { ROLES } from '../../config/constants.js';
import { i18n } from '../../services/i18n.js';

export async function renderGalleryPage() {
  const currentUser = authService.getCurrentUser();
  const canManage = currentUser && (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.PRIEST);
  const photos = await galleryService.getPhotos('all');

  const categories = [
    { key: 'all', label: i18n.t('gallery.all') },
    { key: 'feasts', label: i18n.t('gallery.feasts') },
    { key: 'liturgy', label: i18n.t('gallery.liturgy') },
    { key: 'community', label: i18n.t('gallery.community') },
    { key: 'altar', label: i18n.t('gallery.altar') }
  ];

  const html = `
    ${renderNavbar('/gallery')}

    <!-- Hero Header -->
    <section class="hero-page-banner" style="background: linear-gradient(135deg, rgba(10, 25, 47, 0.92) 0%, rgba(30, 58, 138, 0.88) 100%), url('/assets/church-logo.jpg') center/cover; padding: 4.5rem 0 3.5rem; text-align: center; color: white;">
      <div class="container">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(212, 175, 55, 0.15); border: 1px solid var(--gold-accent); padding: 0.4rem 1rem; border-radius: 9999px; margin-bottom: 1rem; font-size: 0.85rem; font-weight: 700; color: var(--gold-accent);">
          <span>📸</span> ${i18n.t('nav.gallery')}
        </div>
        <h1 class="church-title" style="color: white; font-size: 2.5rem; margin-bottom: 0.75rem;">
          ${i18n.t('gallery.title')}
        </h1>
        <p style="max-width: 650px; margin: 0 auto 1.5rem; font-size: 1.05rem; opacity: 0.9; color: var(--gold-light);">
          ${i18n.t('gallery.desc')}
        </p>

        ${canManage ? `
          <div style="margin-top: 1.25rem;">
            <button id="btn-open-upload-modal" class="btn btn-gold btn-lg" style="box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4); font-weight: 700;">
              ➕ Add New Photo (Priest & Admin Access)
            </button>
          </div>
        ` : `
          <div style="font-size: 0.85rem; opacity: 0.8;">
            Parish Priests & Administrators can sign in to upload new parish photographs and event albums.
          </div>
        `}
      </div>
    </section>

    <!-- Main Content Area -->
    <section class="section" style="background: var(--bg-surface-alt); min-height: 60vh;">
      <div class="container">

        <!-- Category Filter Tabs -->
        <div style="display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2.5rem;">
          ${categories.map(c => `
            <button class="btn btn-sm gallery-filter-btn ${c.key === 'all' ? 'btn-primary' : 'btn-secondary'}" data-category="${c.key}" style="border-radius: 9999px; padding: 0.5rem 1.25rem; font-size: 0.875rem;">
              ${c.label}
            </button>
          `).join('')}
        </div>

        <!-- Photos Grid -->
        <div id="gallery-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.75rem;">
          ${renderPhotoCardsHtml(photos, canManage)}
        </div>

        ${photos.length === 0 ? `
          <div style="text-align: center; padding: 4rem 1rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🖼️</div>
            <h3>No Photographs in this Category Yet</h3>
            <p style="color: var(--text-muted);">Please check back soon for updates from upcoming parish events.</p>
          </div>
        ` : ''}

      </div>
    </section>

    <!-- Lightbox Modal -->
    <div id="gallery-lightbox" style="display: none; position: fixed; inset: 0; background: rgba(5, 12, 25, 0.94); z-index: 9999; align-items: center; justify-content: center; padding: 1.5rem; backdrop-filter: blur(8px);">
      <button id="btn-close-lightbox" style="position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; width: 44px; height: 44px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
      
      <div style="max-width: 900px; width: 100%; background: var(--bg-surface-elevated); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--gold-accent); box-shadow: var(--shadow-xl);">
        <img id="lightbox-img" src="" alt="Parish Photo" style="width: 100%; max-height: 65vh; object-fit: contain; background: black; display: block;" />
        <div style="padding: 1.5rem 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 1rem;">
            <h3 id="lightbox-title" style="margin: 0; color: var(--primary-navy); font-size: 1.35rem;"></h3>
            <span id="lightbox-badge" class="badge badge-gold" style="font-size: 0.75rem;"></span>
          </div>
          <p id="lightbox-caption" style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.75rem;"></p>
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
            <span id="lightbox-date"></span>
            <span id="lightbox-uploader"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Photo Modal for Admin & Priest -->
    <div id="upload-photo-modal" style="display: none; position: fixed; inset: 0; background: rgba(10, 25, 47, 0.75); z-index: 9999; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px);">
      <div class="card card-elevated card-gold-border" style="width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; padding: 2rem; background: #fff; position: relative;">
        <button id="btn-close-upload-modal" style="position: absolute; top: 1.25rem; right: 1.25rem; background: none; border: none; font-size: 1.75rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #fdf6e2; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; border: 1px solid var(--gold-accent);">
            <span style="font-size: 1.35rem;">📸</span>
          </div>
          <h3 style="font-size: 1.4rem; margin-bottom: 0.25rem; color: var(--primary-navy);">Upload Parish Photograph</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Add new parish feasts, masses, or event photos to the public gallery.</p>
        </div>

        <form id="upload-photo-form">
          <div class="form-group">
            <label class="form-label" for="photoTitle">Photo / Event Title <span class="required">*</span></label>
            <input type="text" id="photoTitle" class="form-control" placeholder="e.g. Annual Feast Procession 2026" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label" for="photoCategory">Gallery Category <span class="required">*</span></label>
              <select id="photoCategory" class="form-control" required>
                <option value="feasts">Feasts & Celebrations</option>
                <option value="liturgy">Holy Mass & Liturgy</option>
                <option value="community">Parish Community & Youth</option>
                <option value="altar">Altar & Sanctuary</option>
                <option value="events">Special Events & Festivals</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="photoDate">Event / Taken Date <span class="required">*</span></label>
              <input type="date" id="photoDate" class="form-control" value="${new Date().toISOString().split('T')[0]}" required />
            </div>
          </div>

          <!-- Upload Mode: File or URL -->
          <div class="form-group" style="margin-top: 0.5rem;">
            <label class="form-label">
              <span>Photo Source <span class="required">*</span></span>
            </label>
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
              <input type="file" id="photoFileInput" accept="image/*" style="display: none;" />
              <button type="button" id="btn-browse-photo-file" class="btn btn-primary btn-sm">
                📁 Choose Image File
              </button>
              <button type="button" id="btn-toggle-url-input" class="btn btn-outline btn-sm">
                🔗 Or Paste Image URL
              </button>
            </div>

            <div id="url-input-container" style="display: none; margin-bottom: 0.75rem;">
              <input type="url" id="photoUrlInput" class="form-control" placeholder="https://example.com/church-photo.jpg" />
            </div>

            <input type="hidden" id="finalPhotoDataUrl" required />
            <div id="upload-preview-container" style="display: none; text-align: center; background: #f8fafc; padding: 0.75rem; border-radius: var(--radius-md); border: 1px dashed var(--border-medium); margin-top: 0.5rem;">
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--gold-accent-hover); display: block; margin-bottom: 0.5rem;">Preview:</span>
              <img id="photo-preview-img" src="" alt="Preview" style="max-height: 180px; max-width: 100%; border-radius: 4px; object-fit: contain;" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="photoCaption">Description / Caption</label>
            <textarea id="photoCaption" class="form-control" rows="2" placeholder="Brief description of the occasion, celebrants, or parish memory..."></textarea>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="button" id="btn-cancel-upload" class="btn btn-secondary btn-block">Cancel</button>
            <button type="submit" id="btn-submit-photo" class="btn btn-gold btn-block" style="box-shadow: var(--shadow-gold);">
              Publish Photo to Gallery
            </button>
          </div>
        </form>
      </div>
    </div>

    ${renderFooter()}
  `;

  return html;
}

function renderPhotoCardsHtml(photos, canManage) {
  if (!photos || photos.length === 0) return '';

  return photos.map(photo => `
    <div class="card card-elevated card-gold-border photo-card" data-category="${photo.category}" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer;">
      <div class="photo-img-wrapper" style="position: relative; height: 230px; overflow: hidden; background: #0a192f;" data-photo-id="${photo.id}">
        <img 
          src="${photo.imageUrl}" 
          alt="${photo.title}" 
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1548625361-195fe5795df5?w=800&q=80'; this.onerror=null;"
          style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; display: block;" 
          class="gallery-thumbnail"
        />
        <div style="position: absolute; top: 0.75rem; left: 0.75rem;">
          <span class="badge badge-gold" style="font-size: 0.7rem; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
            ${photo.categoryLabel || photo.category}
          </span>
        </div>
        ${canManage ? `
          <button class="btn btn-danger btn-sm btn-delete-photo" data-id="${photo.id}" title="Delete Photo" style="position: absolute; top: 0.75rem; right: 0.75rem; padding: 0.25rem 0.5rem; font-size: 0.75rem; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
            🗑️
          </button>
        ` : ''}
        <div class="photo-overlay" style="position: absolute; inset: 0; background: rgba(10, 25, 47, 0.4); opacity: 0; transition: opacity 0.2s ease; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 1.5rem; background: rgba(0,0,0,0.5); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--gold-accent);">🔍</span>
        </div>
      </div>

      <div style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h4 style="font-size: 1.05rem; margin-bottom: 0.35rem; color: var(--primary-navy);">${photo.title}</h4>
          ${photo.caption ? `<p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem; line-height: 1.4;">${photo.caption}</p>` : ''}
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 0.65rem; margin-top: 0.5rem;">
          <span>📅 ${photo.eventDate || 'Recent'}</span>
          <span>👤 ${photo.uploadedBy || 'Parish Office'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

export function attachGalleryEvents(router) {
  attachNavbarEvents(router);

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const cards = document.querySelectorAll('.photo-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
      });
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');

      const selectedCat = btn.dataset.category;
      cards.forEach(card => {
        if (selectedCat === 'all' || card.dataset.category === selectedCat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Hover Effect for image thumbnails
  document.querySelectorAll('.photo-img-wrapper').forEach(wrapper => {
    const overlay = wrapper.querySelector('.photo-overlay');
    const img = wrapper.querySelector('.gallery-thumbnail');
    wrapper.addEventListener('mouseenter', () => {
      if (overlay) overlay.style.opacity = '1';
      if (img) img.style.transform = 'scale(1.05)';
    });
    wrapper.addEventListener('mouseleave', () => {
      if (overlay) overlay.style.opacity = '0';
      if (img) img.style.transform = 'scale(1)';
    });
  });

  // Lightbox Modal
  const lightbox = document.getElementById('gallery-lightbox');
  const closeLightbox = document.getElementById('btn-close-lightbox');

  const openLightboxForPhoto = async (photoId) => {
    const all = await galleryService.getPhotos('all');
    const item = all.find(p => p.id === photoId);
    if (!item || !lightbox) return;

    document.getElementById('lightbox-img').src = item.imageUrl;
    document.getElementById('lightbox-title').textContent = item.title;
    document.getElementById('lightbox-badge').textContent = item.categoryLabel || item.category;
    document.getElementById('lightbox-caption').textContent = item.caption || '';
    document.getElementById('lightbox-date').textContent = `📅 Event Date: ${item.eventDate || 'Parish Archive'}`;
    document.getElementById('lightbox-uploader').textContent = `Uploaded by: ${item.uploadedBy}`;

    lightbox.style.display = 'flex';
  };

  document.querySelectorAll('.photo-img-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete-photo')) return;
      const photoId = wrapper.dataset.photoId;
      openLightboxForPhoto(photoId);
    });
  });

  closeLightbox?.addEventListener('click', () => {
    lightbox.style.display = 'none';
  });

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.style.display = 'none';
  });

  // Delete Photo Action (for Admin & Priest)
  document.querySelectorAll('.btn-delete-photo').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const photoId = btn.dataset.id;
      if (confirm('Are you sure you want to remove this photograph from the parish gallery?')) {
        await galleryService.deletePhoto(photoId);
        notificationService.success('Photograph removed from gallery.');
        router.navigate('/gallery');
      }
    });
  });

  // Upload Photo Modal Controls
  const uploadModal = document.getElementById('upload-photo-modal');
  const openUploadBtn = document.getElementById('btn-open-upload-modal');
  const closeUploadBtn = document.getElementById('btn-close-upload-modal');
  const cancelUploadBtn = document.getElementById('btn-cancel-upload');
  const fileInput = document.getElementById('photoFileInput');
  const browseBtn = document.getElementById('btn-browse-photo-file');
  const toggleUrlBtn = document.getElementById('btn-toggle-url-input');
  const urlContainer = document.getElementById('url-input-container');
  const urlInput = document.getElementById('photoUrlInput');
  const hiddenDataUrl = document.getElementById('finalPhotoDataUrl');
  const previewContainer = document.getElementById('upload-preview-container');
  const previewImg = document.getElementById('photo-preview-img');
  const uploadForm = document.getElementById('upload-photo-form');

  if (openUploadBtn && uploadModal) {
    openUploadBtn.addEventListener('click', () => {
      uploadModal.style.display = 'flex';
    });

    const hideUploadModal = () => {
      uploadModal.style.display = 'none';
    };

    closeUploadBtn?.addEventListener('click', hideUploadModal);
    cancelUploadBtn?.addEventListener('click', hideUploadModal);

    // File Browse Trigger
    browseBtn?.addEventListener('click', () => fileInput?.click());

    // Toggle URL Input
    toggleUrlBtn?.addEventListener('click', () => {
      if (urlContainer) {
        urlContainer.style.display = urlContainer.style.display === 'none' ? 'block' : 'none';
      }
    });

    // Handle File Selection
    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 8 * 1024 * 1024) {
          notificationService.error('Please choose an image file under 8MB.');
          return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
          hiddenDataUrl.value = evt.target.result;
          previewImg.src = evt.target.result;
          previewContainer.style.display = 'block';
          notificationService.info(`Loaded photo: ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    });

    // Handle URL change
    urlInput?.addEventListener('input', () => {
      const val = urlInput.value.trim();
      if (val) {
        hiddenDataUrl.value = val;
        previewImg.src = val;
        previewContainer.style.display = 'block';
      }
    });

    // Form Submit
    uploadForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('photoTitle').value.trim();
      const category = document.getElementById('photoCategory').value;
      const eventDate = document.getElementById('photoDate').value;
      const caption = document.getElementById('photoCaption').value.trim();
      const imageUrl = hiddenDataUrl.value.trim();

      if (!imageUrl) {
        notificationService.warning('Please select an image file or enter an image URL.');
        return;
      }

      const user = authService.getCurrentUser();
      const submitBtn = document.getElementById('btn-submit-photo');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Publishing...';

      try {
        await galleryService.addPhoto({
          title,
          category,
          eventDate,
          caption,
          imageUrl,
          uploadedBy: user?.fullName || (user?.role === 'admin' ? 'Joshwa' : 'Parish Priest'),
          uploadedRole: user?.role || 'admin'
        });

        notificationService.success('Photo successfully added to the parish gallery!');
        hideUploadModal();
        router.navigate('/gallery');
      } catch (err) {
        notificationService.error(err.message || 'Failed to upload photo.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Publish Photo to Gallery';
      }
    });
  }
}
