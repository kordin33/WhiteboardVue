// Zastąp zawartość pliku frontend/src/services/api.js

// Konfiguracja bazowa dla axios z automatycznym wykrywaniem adresu serwera
import axios from 'axios';

// Auto-wykrywanie bazowego URL na podstawie bieżącego adresu
const getBaseUrl = () => {
  const url = window.location.origin;
  console.log('Wykryty adres serwera:', url);
  return url + '/api';
};

// Tworzenie instancji axios z opcjami domyślnymi
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Pomocna funkcja do debugowania połączeń
const testConnection = async () => {
  console.log('Testowanie połączenia z API...');
  try {
    // Próbujemy prostego endpointu, który powinien działać
    const response = await api.get('/boards/');
    console.log('Test połączenia udany!', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Test połączenia nieudany:', error);
    return { success: false, error };
  }
};

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
      console.error(`[API] Odpowiedź serwera z błędem ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // Żądanie wysłane, ale brak odpowiedzi
      console.error(`[API] Brak odpowiedzi od serwera:`, error.request);
      console.log('Sprawdź, czy backend jest uruchomiony i dostępny na adresie:', getBaseUrl());
    } else {
      // Błąd przy ustawianiu żądania
      console.error(`[API] Błąd konfiguracji żądania:`, error.message);
    }
    return Promise.reject(error);
  }
);

// Eksportuj instancję api oraz funkcję testową
export { api, testConnection };
export default api;