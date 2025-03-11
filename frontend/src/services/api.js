// Zastąp zawartość pliku frontend/src/services/api.js

import axios from 'axios';
import { toast } from 'vue3-toastify';

// Zdefiniuj bazowy URL - dostosuj według potrzeb
const backendBaseUrl = `${window.location.protocol}//${window.location.hostname}`;

console.log(`Konfiguracja API: używam adresu bazowego ${backendBaseUrl}/api`);

// Utwórz instancję axios
const api = axios.create({
  baseURL: `${backendBaseUrl}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Dodaj interceptor żądań do logowania
api.interceptors.request.use(
  config => {
    console.log(`[API] Wysyłanie żądania do: ${config.baseURL}${config.url}`);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Dodaj interceptor odpowiedzi do obsługi błędów
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Obsługa błędów
    if (error.response) {
      // Serwer odpowiedział błędem
      const status = error.response.status;
      const data = error.response.data;

      console.error(`[API] Odpowiedź serwera z błędem ${status}:`, data);

      let errorMessage = 'Wystąpił błąd';
      if (status === 400) {
        // Bad Request - błędy walidacji pól
        if (data.detail) {
          errorMessage = data.detail;
        } else {
          // Pobierz pierwszy komunikat błędu walidacji
          const firstField = Object.keys(data)[0];
          if (firstField && data[firstField]) {
            errorMessage = `${firstField}: ${data[firstField]}`;
          }
        }
        toast.error(errorMessage);
      } else if (status === 404) {
        // Not Found
        toast.error('Zasób nie został znaleziony');
      } else if (status === 500) {
        // Server Error
        toast.error('Błąd serwera. Spróbuj ponownie później.');
      }
    } else if (error.request) {
      // Żądanie wysłane, ale brak odpowiedzi
      console.error(`[API] Brak odpowiedzi:`, error.request);
      toast.error('Brak odpowiedzi serwera. Sprawdź połączenie.');
    } else {
      // Błąd przy ustawianiu żądania
      console.error(`[API] Błąd konfiguracji żądania:`, error.message);
      toast.error(`Błąd: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export default api;