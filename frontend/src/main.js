// Dodaj tę sekcję na początku pliku main.js
import { installMockServices } from './services/mockData';

// Zainstaluj zmodyfikowane serwisy
const mockServices = installMockServices();
console.log('[App] Zmodyfikowane serwisy zainicjalizowane');

// Reszta oryginalnego pliku main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { toast, ToastPlugin } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/styles/main.scss';

// Add this import
import TestPage from './components/common/TestPage.vue';

const app = createApp(App);

// Register test page component globally
app.component('TestPage', TestPage);

// Add debug info to router navigation
const originalPush = router.push;
router.push = function(location) {
  console.log(`[Router] Navigating to:`, location);
  return originalPush.call(this, location).catch(err => {
    console.error('[Router] Navigation failed:', err);
    toast.error(`Navigation error: ${err.message}`);
    throw err;
  });
};

// Use Vue Router and Vuex Store
app.use(router);
app.use(store);

// Configure toast notifications
app.use(ToastPlugin, {
  autoClose: 3000,
  position: 'top-right',
  theme: 'colored',
  clearOnUrlChange: false,
  pauseOnHover: true,
  hideProgressBar: false,
  closeOnClick: true,
  rtl: false
});

// Error handler
app.config.errorHandler = (error, instance, info) => {
  console.error('[Vue Error]:', error);
  console.error('[Component]:', instance?.$options?.name || 'Unknown');
  console.error('[Error Info]:', info);

  // Show user friendly message
  toast.error('Wystąpił błąd aplikacji. Spróbuj odświeżyć stronę.');
};

// Add a warning if bootstrap is not loaded properly
if (typeof bootstrap === 'undefined') {
  console.warn('[Bootstrap] Bootstrap JavaScript is not loaded correctly!');
} else {
  console.log('[Bootstrap] Bootstrap JavaScript is available:', bootstrap.version);
}

// Mount the app
app.mount('#app');

console.log('[App] Application started');