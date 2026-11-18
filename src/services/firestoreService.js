// Cloud Firestore Repository — Firebase as PRIMARY Database
// Local Storage used only as offline / demo fallback

import { db, isFirebaseConfigured } from '../config/firebase.js';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

import {
  SEED_USERS,
  SEED_PRIESTS,
  SEED_SCHEDULES,
  SEED_INTENTIONS,
  SEED_PAYMENTS,
  SEED_NOTIFICATIONS,
  SEED_SETTINGS,
  SEED_GALLERY
} from '../data/seedData.js';

// Local storage keys for offline fallback
const STORAGE_PREFIX = 'oldd_parish_';

function getLocalCollection(colName, defaultData = []) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + colName);
    if (!raw) {
      localStorage.setItem(STORAGE_PREFIX + colName, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultData;
  }
}

function saveLocalCollection(colName, items) {
  try {
    localStorage.setItem(STORAGE_PREFIX + colName, JSON.stringify(items));
  } catch (e) {
    console.error('Local storage save error:', e);
  }
}

// Initializing seed data in local storage
export function initSeedStore() {
  // 1. Users: remove mock user accounts, keep real ones & admin
  let existingUsers = getLocalCollection('users', []);
  const mockUserIds = ['user_member_01', 'user_priest_01', 'user_member_02', 'user_member_03', 'user_member_04'];
  if (existingUsers && existingUsers.length > 0) {
    const cleanedUsers = existingUsers.filter(u => !mockUserIds.includes(u.id) && !mockUserIds.includes(u.uid));
    if (cleanedUsers.length !== existingUsers.length || !cleanedUsers.some(u => u.username === 'joshwa' || u.role === 'admin')) {
      if (!cleanedUsers.some(u => u.username === 'joshwa')) {
        cleanedUsers.push(SEED_USERS[0]);
      }
      saveLocalCollection('users', cleanedUsers);
    }
  } else {
    saveLocalCollection('users', SEED_USERS);
  }

  // 2. Mass Schedules: clean up any old mock celebrants
  let existingSchedules = getLocalCollection('massSchedules', []);
  const mockNames = ['Rev. Fr. Joseph Thomas', 'Rev. Fr. Antony George', 'Rev. Fr. Mathew Varghese'];
  if (existingSchedules && existingSchedules.length > 0) {
    let updated = false;
    existingSchedules = existingSchedules.map(s => {
      if (mockNames.includes(s.priestName)) {
        updated = true;
        return { ...s, priestName: '', priestId: '' };
      }
      return s;
    });
    if (updated) {
      saveLocalCollection('massSchedules', existingSchedules);
    }
  } else {
    saveLocalCollection('massSchedules', SEED_SCHEDULES);
  }

  // 3. Priests: clean mock priests
  const existingPriests = getLocalCollection('priests', []);
  if (existingPriests.length > 0 && existingPriests.every(p => mockNames.includes(p.name))) {
    saveLocalCollection('priests', []);
  }

  // 4. Mass Intentions: wipe mock intentions
  let existingIntentions = getLocalCollection('massIntentions', []);
  const mockBookingPrefix = 'OLDD-2026-00010';
  if (existingIntentions && existingIntentions.length > 0) {
    const realIntentions = existingIntentions.filter(b => !String(b.bookingId || b.id).startsWith(mockBookingPrefix));
    if (realIntentions.length !== existingIntentions.length) {
      saveLocalCollection('massIntentions', realIntentions);
    }
  } else {
    saveLocalCollection('massIntentions', []);
  }

  // 5. Payments: wipe mock payments
  let existingPayments = getLocalCollection('payments', []);
  if (existingPayments && existingPayments.length > 0) {
    const realPayments = existingPayments.filter(p => !String(p.paymentId || p.id).includes('demo'));
    if (realPayments.length !== existingPayments.length) {
      saveLocalCollection('payments', realPayments);
    }
  } else {
    saveLocalCollection('payments', []);
  }

  // 6. Notifications: wipe mock notifications
  let existingNotifs = getLocalCollection('notifications', []);
  if (existingNotifs && existingNotifs.length > 0) {
    const realNotifs = existingNotifs.filter(n => !['notif_01', 'notif_02', 'notif_03'].includes(n.id));
    if (realNotifs.length !== existingNotifs.length) {
      saveLocalCollection('notifications', realNotifs);
    }
  } else {
    saveLocalCollection('notifications', []);
  }

  // 7. Gallery
  if (!localStorage.getItem(STORAGE_PREFIX + 'gallery')) {
    saveLocalCollection('gallery', SEED_GALLERY);
  }

  // 8. Settings
  if (!localStorage.getItem(STORAGE_PREFIX + 'settings')) {
    localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(SEED_SETTINGS));
  }
}

// Auto-run init
initSeedStore();

export const firestoreService = {

  // ─────────────────────────────────────────────────────────
  // GET COLLECTION  (Firebase PRIMARY → Local fallback)
  // ─────────────────────────────────────────────────────────
  async getCollection(colName) {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, colName));
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Keep local cache in sync for offline use
        saveLocalCollection(colName, docs);
        return docs;
      } catch (err) {
        console.warn(`Firestore getCollection [${colName}] error, using local cache:`, err);
      }
    }
    return getLocalCollection(colName);
  },

  // ─────────────────────────────────────────────────────────
  // GET SINGLE DOCUMENT
  // ─────────────────────────────────────────────────────────
  async getDocument(colName, docId) {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, colName, docId));
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() };
        }
      } catch (err) {
        console.warn(`Firestore getDocument [${colName}/${docId}] error:`, err);
      }
    }
    const items = getLocalCollection(colName);
    return items.find(item => item.id === docId || item.bookingId === docId || item.uid === docId) || null;
  },

  // ─────────────────────────────────────────────────────────
  // SAVE / OVERWRITE DOCUMENT
  // ─────────────────────────────────────────────────────────
  async setDocument(colName, docId, data) {
    const payload = {
      ...data,
      id: docId,
      updatedAt: new Date().toISOString()
    };

    // 1. Firebase Firestore (primary)
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, colName, docId), payload, { merge: true });
        console.log(`✅ Firebase saved [${colName}/${docId}]`);
      } catch (err) {
        console.warn(`Firestore setDocument [${colName}/${docId}] error:`, err);
      }
    }

    // 2. Always keep local store in sync (offline fallback)
    const items = getLocalCollection(colName);
    const idx = items.findIndex(i => i.id === docId || i.bookingId === docId);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...payload };
    } else {
      items.unshift(payload);
    }
    saveLocalCollection(colName, items);

    return payload;
  },

  // ─────────────────────────────────────────────────────────
  // UPDATE SPECIFIC FIELDS
  // ─────────────────────────────────────────────────────────
  async updateDocument(colName, docId, updates) {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, colName, docId), {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn(`Firestore updateDoc [${colName}/${docId}] error:`, err);
      }
    }

    const items = getLocalCollection(colName);
    const idx = items.findIndex(i => i.id === docId || i.bookingId === docId);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
      saveLocalCollection(colName, items);
      return items[idx];
    }
    return null;
  },

  // ─────────────────────────────────────────────────────────
  // DELETE DOCUMENT
  // ─────────────────────────────────────────────────────────
  async deleteDocument(colName, docId) {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, colName, docId));
      } catch (err) {
        console.warn(`Firestore deleteDoc [${colName}/${docId}] error:`, err);
      }
    }

    const items = getLocalCollection(colName);
    const filtered = items.filter(i => i.id !== docId && i.bookingId !== docId);
    saveLocalCollection(colName, filtered);
    return true;
  },

  // ─────────────────────────────────────────────────────────
  // QUERY DOCUMENTS with filter
  // ─────────────────────────────────────────────────────────
  async queryDocuments(colName, filterFn) {
    const all = await this.getCollection(colName);
    return filterFn ? all.filter(filterFn) : all;
  },

  // ─────────────────────────────────────────────────────────
  // REALTIME LISTENER — receives live updates from Firestore
  // Returns the unsubscribe function (call it to stop listening)
  // ─────────────────────────────────────────────────────────
  subscribeToCollection(colName, callback) {
    if (!isFirebaseConfigured || !db) return () => {};
    try {
      const unsubscribe = onSnapshot(
        collection(db, colName),
        (snap) => {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          saveLocalCollection(colName, docs);
          if (typeof callback === 'function') callback(docs);
        },
        (err) => {
          console.warn(`Firestore realtime [${colName}] error:`, err);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Firestore subscribeToCollection error:', err);
      return () => {};
    }
  },

  // ─────────────────────────────────────────────────────────
  // SETTINGS
  // ─────────────────────────────────────────────────────────
  async getSettings() {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'settings', 'church'));
        if (snap.exists()) return { ...SEED_SETTINGS, ...snap.data() };
      } catch (e) { /* fallback */ }
    }
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + 'settings');
      if (raw) return { ...SEED_SETTINGS, ...JSON.parse(raw) };
    } catch (e) { /* fallback */ }
    return { ...SEED_SETTINGS };
  },

  async saveSettings(updates) {
    const current = await this.getSettings();
    const merged = { ...current, ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(merged));
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'settings', 'church'), merged, { merge: true });
      } catch (err) {
        console.warn('Firestore settings update error:', err);
      }
    }
    return merged;
  }
};
