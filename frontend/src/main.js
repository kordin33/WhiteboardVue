import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const app = createApp(App);

// Konfiguracja Toast
const toastOptions = {
  autoClose: 3000,
  position: toast.POSITION.TOP_RIGHT,
  theme: toast.THEME.COLORED,
};

// Rejestracja globalnych komponentów

// Użycie pluginów
app.use(router);
app.use(store);
app.use(toast, toastOptions);

// Wyłapywanie błędów
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue error:', err);
  console.error('Info:', info);
  toast.error('Wystąpił błąd aplikacji');
};

// Montowanie aplikacji
app.mount('#app');

console.log('[App] Application started');