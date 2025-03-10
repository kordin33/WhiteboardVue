import axios from 'axios';
import { toast } from 'vue3-toastify';
import router from '@/router';
import tokenUtils from '@/utils/tokenUtils';

// Określ bazowy URL - dostosuj według potrzeb
// Opcja 1: Użyj tego samego hosta ale bez portu 4200
const backendBaseUrl = `${window.location.protocol}//${window.location.hostname}`;

// Opcja 2: Jeśli backend działa na innym porcie (np. 8000), odkomentuj poniższą linię
// const backendBaseUrl = `${window.location.protocol}//${window.location.hostname}:8000`;

// Opcja 3: Określ bezpośredni adres backendu
// const backendBaseUrl = 'https://f74c5e62-798b-40db-a09f-0799fb00bfe0-00-1p14hehymb2qj.janeway.replit.dev';

console.log(`Konfiguracja API: używam adresu bazowego ${backendBaseUrl}/api`);

// Create axios instance
const api = axios.create({
  baseURL: `${backendBaseUrl}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = tokenUtils.getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(`[API] Wysyłanie żądania do: ${config.baseURL}${config.url}`);
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and token refresh
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;

    console.error(`[API] Błąd dla URL ${originalRequest ? originalRequest.url : 'nieznanego'}: `, error);

    // If error is 401 Unauthorized and not already retrying
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh the token
        const refreshToken = tokenUtils.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log(`[API] Próba odświeżenia tokenu`);

        const response = await axios.post(`${backendBaseUrl}/api/auth/refresh/`, {
          refresh: refreshToken
        });

        // Save new tokens
        tokenUtils.saveTokens(response.data.access, refreshToken);

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        console.error(`[API] Błąd odświeżania tokenu:`, refreshError);
        tokenUtils.clearTokens();
        toast.error('Sesja wygasła. Zaloguj się ponownie.');
        router.push('/login');
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      console.error(`[API] Odpowiedź serwera z błędem ${status}:`, data);

      let errorMessage = 'Wystąpił błąd';
      if (status === 400) {
        // Bad Request - field validation errors
        if (data.detail) {
          errorMessage = data.detail;
        } else {
          // Get first validation error message
          const firstField = Object.keys(data)[0];
          if (firstField && data[firstField]) {
            errorMessage = `${firstField}: ${data[firstField]}`;
          }
        }
        toast.error(errorMessage);
      } else if (status === 403) {
        // Forbidden
        toast.error('Brak uprawnień do wykonania tej operacji');
      } else if (status === 404) {
        // Not Found
        toast.error('Zasób nie został odnaleziony');
      } else if (status === 500) {
        // Server Error
        toast.error('Błąd serwera. Spróbuj ponownie później.');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error(`[API] Błąd braku odpowiedzi:`, error.request);
      toast.error('Brak odpowiedzi serwera. Sprawdź połączenie.');
    } else {
      // Error setting up request
      console.error(`[API] Błąd konfiguracji żądania:`, error.message);
      toast.error(`Błąd: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export default api;