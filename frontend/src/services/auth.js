import api from './api';
import tokenUtils from '@/utils/tokenUtils';

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Response with user data and tokens
   */
  async register(userData) {
    const response = await api.post('/auth/register/', userData);

    // Save tokens and user data
    if (response.data && response.data.access) {
      tokenUtils.saveTokens(response.data.access, response.data.refresh);
      tokenUtils.saveUser(response.data.user);
    }

    return response.data;
  },

  /**
   * Login a user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise} - Response with user data and tokens
   */
  async login(username, password) {
    const response = await api.post('/auth/login/', { username, password });

    // Save tokens and user data
    if (response.data && response.data.access) {
      tokenUtils.saveTokens(response.data.access, response.data.refresh);
      tokenUtils.saveUser(response.data.user);
    }

    return response.data;
  },

  /**
   * Logout the current user
   */
  logout() {
    tokenUtils.clearTokens();
  },

  /**
   * Get the currently authenticated user
   * @returns {Promise} - Response with user data
   */
  async getCurrentUser() {
    // If we have user data in local storage and we're authenticated, return it
    if (tokenUtils.isAuthenticated()) {
      const userData = tokenUtils.getUser();
      if (userData) {
        return userData;
      }
    }

    // Otherwise, fetch user data from API
    try {
      const response = await api.get('/auth/me/');
      tokenUtils.saveUser(response.data);
      return response.data;
    } catch (error) {
      // If request fails, user might not be authenticated
      tokenUtils.clearTokens();
      throw error;
    }
  },

  /**
   * Refresh the access token
   * @returns {Promise} - Response with new tokens
   */
  async refreshToken() {
    const refreshToken = tokenUtils.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh/', { refresh: refreshToken });

    if (response.data && response.data.access) {
      tokenUtils.saveTokens(response.data.access, refreshToken);
    }

    return response.data;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return tokenUtils.isAuthenticated();
  }
};

export default authService;