// Toast Alert Engine & In-App Notification Service

import { firestoreService } from './firestoreService.js';
import { authService } from './authService.js';

class NotificationService {
  constructor() {
    this.toastContainer = null;
    this.listeners = [];
  }

  ensureToastContainer() {
    if (!this.toastContainer) {
      this.toastContainer = document.getElementById('toast-container');
      if (!this.toastContainer) {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.className = 'toast-container';
        document.body.appendChild(this.toastContainer);
      }
    }
    return this.toastContainer;
  }

  toast({ title, message, type = 'info', duration = 4000 }) {
    const container = this.ensureToastContainer();
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toastEl.innerHTML = `
      <div style="font-weight: 800; font-size: 1.1rem; color: var(--gold-accent);">${icons[type] || 'ℹ'}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    toastEl.querySelector('.toast-close').addEventListener('click', () => {
      toastEl.remove();
    });

    container.appendChild(toastEl);

    if (duration > 0) {
      setTimeout(() => {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(20px)';
        setTimeout(() => toastEl.remove(), 250);
      }, duration);
    }
  }

  success(message, title = 'Success') {
    this.toast({ title, message, type: 'success' });
  }

  error(message, title = 'Error') {
    this.toast({ title, message, type: 'error' });
  }

  warning(message, title = 'Attention') {
    this.toast({ title, message, type: 'warning' });
  }

  info(message, title = 'Notice') {
    this.toast({ title, message, type: 'info' });
  }

  // Persistent in-app notifications
  async createNotification({ userId, title, message, type = 'general' }) {
    const notifId = 'notif_' + Date.now();
    const notification = {
      id: notifId,
      userId: userId || 'all',
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };

    await firestoreService.setDocument('notifications', notifId, notification);
    this.notifySubscribers();
    return notification;
  }

  async getUserNotifications(userId) {
    const all = await firestoreService.getCollection('notifications');
    return all.filter(n => n.userId === userId || n.userId === 'all');
  }

  async markAsRead(notificationId) {
    return await firestoreService.updateDocument('notifications', notificationId, { read: true });
  }

  async markAllAsRead(userId) {
    const userNotifs = await this.getUserNotifications(userId);
    for (const n of userNotifs) {
      await firestoreService.updateDocument('notifications', n.id, { read: true });
    }
    this.notifySubscribers();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifySubscribers() {
    this.listeners.forEach(fn => fn());
  }
}

export const notificationService = new NotificationService();
