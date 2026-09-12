// Gallery Service for Parish Photos, Feasts, and Liturgical Events

import { firestoreService } from './firestoreService.js';
import { SEED_GALLERY } from '../data/seedData.js';

class GalleryService {
  async getPhotos(category = null) {
    const photos = await firestoreService.getCollection('gallery');
    const items = photos && photos.length > 0 ? photos : SEED_GALLERY;
    if (!category || category === 'all') {
      return items.sort((a, b) => new Date(b.eventDate || b.createdAt) - new Date(a.eventDate || a.createdAt));
    }
    return items
      .filter(p => p.category === category)
      .sort((a, b) => new Date(b.eventDate || b.createdAt) - new Date(a.eventDate || a.createdAt));
  }

  async addPhoto(photoData) {
    const newId = 'gal_' + Date.now();
    const photo = {
      id: newId,
      title: photoData.title,
      category: photoData.category || 'feasts',
      categoryLabel: photoData.categoryLabel || this.getCategoryLabel(photoData.category),
      imageUrl: photoData.imageUrl,
      caption: photoData.caption || '',
      eventDate: photoData.eventDate || new Date().toISOString().split('T')[0],
      uploadedBy: photoData.uploadedBy || 'Parish Office',
      uploadedRole: photoData.uploadedRole || 'admin',
      createdAt: new Date().toISOString()
    };

    await firestoreService.setDocument('gallery', newId, photo);
    return photo;
  }

  async deletePhoto(photoId) {
    return await firestoreService.deleteDocument('gallery', photoId);
  }

  getCategoryLabel(cat) {
    const map = {
      feasts: 'Feasts & Celebrations',
      liturgy: 'Holy Mass & Liturgy',
      community: 'Parish Community & Youth',
      altar: 'Altar & Sanctuary',
      events: 'Special Events & Festivals'
    };
    return map[cat] || 'Parish Moments';
  }
}

export const galleryService = new GalleryService();
