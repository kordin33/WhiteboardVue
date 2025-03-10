import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { useToast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/styles/main.scss';

const app = createApp(App);

// Configure toast notifications
app.use(useToast, {
  autoClose: 3000,
  position: 'top-right',
  theme: 'colored',
  clearOnUrlChange: false,
  pauseOnHover: true,
  hideProgressBar: false,
  closeOnClick: true,
  rtl: false
});

// Use Vue Router and Vuex Store
app.use(router);
app.use(store);

// Error handler
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue Error:', error);
  console.error('Component:', instance);
  console.error('Error Info:', info);

  // Log to server or analytics if needed
  // logErrorToServer(error, instance, info);

  // Show user friendly message
  const toast = useToast();
  toast.error('Wystąpił błąd aplikacji. Spróbuj odświeżyć stronę.');
};

// Mount the app
app.mount('#app');