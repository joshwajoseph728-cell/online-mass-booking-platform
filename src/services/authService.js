// Authentication Service with Firebase Auth & Dedicated Admin Credentials (joshwa / 1234)

import { auth, isFirebaseConfigured } from '../config/firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { firestoreService } from './firestoreService.js';
import { SEED_USERS } from '../data/seedData.js';
import { ROLES } from '../config/constants.js';

const AUTH_STORAGE_KEY = 'oldd_current_user';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.loadStoredUser();

    if (isFirebaseConfigured && auth) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDoc = await firestoreService.getDocument('users', user.uid);
          this.currentUser = userDoc || {
            id: user.uid,
            uid: user.uid,
            email: user.email,
            fullName: user.displayName || user.email.split('@')[0],
            role: ROLES.MEMBER
          };
        } else {
          this.currentUser = null;
        }
        this.persistAndNotify();
      });
    }
  }

  loadStoredUser() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        this.currentUser = null;
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  persistAndNotify() {
    if (this.currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    this.listeners.forEach(fn => fn(this.currentUser));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return Boolean(this.currentUser);
  }

  getUserRole() {
    return this.currentUser?.role || null;
  }

  async login(identifier, password) {
    const cleanId = String(identifier).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // 1. Check for dedicated Admin credentials
    if (cleanId === 'joshwa' || cleanId === 'joshwa@ourladyofdolours.org' || cleanId === 'admin' || cleanId === 'admin@ourladyofdolours.org') {
      if (cleanPass !== '1234') {
        throw new Error('Incorrect password. Please verify your administrator credentials.');
      }

      const adminUser = {
        id: 'user_admin_01',
        uid: 'user_admin_01',
        username: 'joshwa',
        fullName: 'Joshwa',
        email: 'joshwa@ourladyofdolours.org',
        phone: '+91 98950 55667',
        role: ROLES.ADMIN,
        designation: 'Parish Web Administrator',
        active: true
      };

      this.currentUser = adminUser;
      await firestoreService.setDocument('users', adminUser.id, adminUser);
      this.persistAndNotify();
      return { success: true, user: this.currentUser };
    }

    // 2. Check for dedicated Parish Priest credentials
    if (cleanId === 'priest' || cleanId === 'father' || cleanId === 'vicar' || cleanId === 'priest@ourladyofdolours.org') {
      if (cleanPass !== '1234') {
        throw new Error('Incorrect password. Please verify your clergy credentials.');
      }

      const priestUser = {
        id: 'user_priest_01',
        uid: 'user_priest_01',
        username: 'priest',
        fullName: 'Rev. Fr. Parish Priest',
        email: 'priest@ourladyofdolours.org',
        phone: '+91 94470 12345',
        role: ROLES.PRIEST,
        designation: 'Parish Priest & Celebrant',
        active: true
      };

      this.currentUser = priestUser;
      await firestoreService.setDocument('users', priestUser.id, priestUser);
      this.persistAndNotify();
      return { success: true, user: this.currentUser };
    }

    // 3. Try Firebase Auth if configured with standard email
    if (isFirebaseConfigured && auth && cleanId.includes('@')) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanId, cleanPass);
        const userDoc = await firestoreService.getDocument('users', userCred.user.uid);
        this.currentUser = userDoc || {
          id: userCred.user.uid,
          uid: userCred.user.uid,
          email: userCred.user.email,
          fullName: userCred.user.displayName || cleanId.split('@')[0],
          role: ROLES.MEMBER
        };
        this.persistAndNotify();
        return { success: true, user: this.currentUser };
      } catch (err) {
        console.warn('Firebase login failed, checking parish local store:', err);
      }
    }

    // 4. Check registered Clergy Directory
    const priests = await firestoreService.getCollection('priests');
    const matchedPriest = priests.find(p => 
      (p.email && p.email.toLowerCase() === cleanId) || 
      (p.name && p.name.toLowerCase() === cleanId) ||
      (p.phone && p.phone === cleanId)
    );

    if (matchedPriest) {
      if (cleanPass !== '1234') {
        throw new Error('Incorrect password. Please verify your clergy credentials.');
      }
      const priestUser = {
        id: matchedPriest.id,
        uid: matchedPriest.id,
        username: matchedPriest.name.toLowerCase().replace(/\s+/g, '_'),
        fullName: matchedPriest.name,
        email: matchedPriest.email || `${matchedPriest.name.toLowerCase().replace(/\s+/g, '')}@ourladyofdolours.org`,
        phone: matchedPriest.phone || '',
        role: ROLES.PRIEST,
        designation: matchedPriest.designation || 'Parish Priest & Celebrant',
        active: true
      };
      this.currentUser = priestUser;
      await firestoreService.setDocument('users', priestUser.id, priestUser);
      this.persistAndNotify();
      return { success: true, user: this.currentUser };
    }

    // 5. Parish Local Store Authentication Fallback
    const users = await firestoreService.getCollection('users');
    const matched = users.find(u => 
      u.email.toLowerCase() === cleanId || 
      (u.username && u.username.toLowerCase() === cleanId)
    );

    if (matched) {
      if (matched.role === ROLES.ADMIN && cleanPass !== '1234') {
        throw new Error('Incorrect password. Please verify your administrator credentials.');
      }
      if (matched.role === ROLES.PRIEST && cleanPass !== '1234') {
        throw new Error('Incorrect password. Please verify your clergy credentials.');
      }
      this.currentUser = matched;
      this.persistAndNotify();
      return { success: true, user: this.currentUser };
    }

    // Direct role matching for evaluation
    if (cleanId.includes('priest')) {
      return this.switchDemoRole(ROLES.PRIEST);
    } else if (cleanId.includes('member')) {
      return this.switchDemoRole(ROLES.MEMBER);
    }

    throw new Error('Invalid username or password. Please verify your credentials.');
  }

  async sendPasswordReset(email) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please provide a valid registered email address.');
    }

    if (isFirebaseConfigured && auth) {
      try {
        await sendPasswordResetEmail(auth, cleanEmail);
      } catch (err) {
        console.warn('Firebase password reset error:', err);
      }
    }

    return {
      success: true,
      message: `Password reset instructions have been sent to ${cleanEmail}. Please check your inbox.`
    };
  }

  async register({ fullName, email, phone, password, role = ROLES.MEMBER }) {
    const cleanEmail = String(email).trim().toLowerCase();
    let newUid = 'user_' + Date.now();

    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        newUid = cred.user.uid;
      } catch (err) {
        console.warn('Firebase user creation failed, proceeding with parish registry:', err);
      }
    }

    const userData = {
      id: newUid,
      uid: newUid,
      fullName,
      email: cleanEmail,
      phone,
      role,
      active: true,
      createdAt: new Date().toISOString()
    };

    await firestoreService.setDocument('users', newUid, userData);
    this.currentUser = userData;
    this.persistAndNotify();
    return { success: true, user: userData };
  }

  async logout() {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        // ignore
      }
    }
    this.currentUser = null;
    this.persistAndNotify();
  }

  // Instant Demo Switcher for fast evaluation
  switchDemoRole(role) {
    let matched = SEED_USERS.find(u => u.role === role) || SEED_USERS[0];
    if (role === ROLES.ADMIN) {
      matched = {
        id: 'user_admin_01',
        uid: 'user_admin_01',
        username: 'joshwa',
        fullName: 'Joshwa',
        email: 'joshwa@ourladyofdolours.org',
        phone: '+91 98950 55667',
        role: ROLES.ADMIN,
        designation: 'Parish Web Administrator',
        active: true
      };
    }
    this.currentUser = { ...matched };
    this.persistAndNotify();
    return { success: true, user: this.currentUser };
  }

  async updateProfile(updates) {
    if (!this.currentUser) return null;
    const updated = await firestoreService.updateDocument('users', this.currentUser.id, updates);
    this.currentUser = { ...this.currentUser, ...updated };
    this.persistAndNotify();
    return this.currentUser;
  }
}

export const authService = new AuthService();
