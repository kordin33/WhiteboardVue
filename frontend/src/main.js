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

// Utwórz aplikację
const app = createApp(App);

// Użyj Vue Router i Vuex Store
app.use(router);
app.use(store);

// Konfiguracja powiadomień toast
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

// Obsługa błędów
app.config.errorHandler = (error, instance, info) => {
  console.error('Błąd Vue:', error);
  console.error('Komponent:', instance);
  console.error('Informacje o błędzie:', info);

  // Pokaż przyjazny dla użytkownika komunikat
  toast.error('Wystąpił błąd aplikacji. Spróbuj odświeżyć stronę.');
};

// Dodajmy globalny monitorowanie błędów
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Globalny błąd JavaScript:', message);
  console.error('Źródło:', source);
  console.error('Linia:', lineno);
  console.error('Szczegóły:', error);
};

// Zamontuj aplikację
app.mount('#app');

console.log('Aplikacja Vue została utworzona i zamontowana pomyślnie');