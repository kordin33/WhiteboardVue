import axios from 'axios';
import { useToast } from 'vue3-toastify';
import router from '@/router';
import tokenUtils from '@/utils/tokenUtils';

const toast = useToast();

// Create axios instance
const api = axios.create({
  baseURL: '/api',
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

    // If error is 401 Unauthorized and not already retrying
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = tokenUtils.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post('/api/auth/refresh/', {
          refresh: refreshToken
        });

        // Save new tokens
        tokenUtils.saveTokens(response.data.access, refreshToken);

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
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
      toast.error('Brak odpowiedzi serwera. Sprawdź połączenie.');
    } else {
      // Error setting up request
      toast.error(`Błąd: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default api;