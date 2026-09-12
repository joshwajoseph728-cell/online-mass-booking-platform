// Main Application Entry Point & Bootstrapper

// Styles
import './assets/styles/main.css';
import './assets/styles/components.css';
import './assets/styles/public.css';
import './assets/styles/dashboard.css';
import './assets/styles/booking.css';

// Seed & Database Initializer
import { initSeedStore } from './services/firestoreService.js';
import { router } from './router.js';

// Initialize Theme from localStorage
function initTheme() {
  const savedTheme = localStorage.getItem('oldd_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('theme-dark');
    document.body.classList.remove('theme-light');
  } else {
    document.body.classList.add('theme-light');
    document.body.classList.remove('theme-dark');
  }
}

// Bootstrap Application
function bootstrap() {
  initTheme();
  initSeedStore();
  router.init();
  console.log('⛪ Our Lady of Dolours Parish Portal initialized successfully.');
}

bootstrap();
