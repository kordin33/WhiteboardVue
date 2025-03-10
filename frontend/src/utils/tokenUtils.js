import jwtDecode from "jwt-decode";

// Keys for token storage
const ACCESS_TOKEN_KEY = "whiteboard_access_token";
const REFRESH_TOKEN_KEY = "whiteboard_refresh_token";
const USER_DATA_KEY = "whiteboard_user";

const tokenUtils = {
  // Save tokens to localStorage
  saveTokens(accessToken, refreshToken) {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  // Save user data
  saveUser(userData) {
    if (userData) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  },

  // Get access token from localStorage
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Get refresh token from localStorage
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Get stored user data
  getUser() {
    // Return a fake user object to bypass authentication
    return {
      id: 1,
      username: "demo_user",
      first_name: "Demo",
      last_name: "User",
      email: "demo@example.com",
      is_staff: true,
    };

    /* Original code commented out
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
    */
  },

  // Clear tokens from localStorage (logout)
  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  // Check if user is authenticated
  isAuthenticated() {
    // BYPASS: Always return true to skip authentication
    console.log("[Auth] Authentication bypass enabled");
    return true;

    /* Original code commented out
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      if (decoded.exp < currentTime) {
        // Token is expired
        return false;
      }

      return true;
    } catch (e) {
      console.error('Error decoding token:', e);
      return false;
    }
    */
  },

  // Get token expiration date
  getTokenExpirationDate() {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (e) {
      console.error("Error decoding token:", e);
      return null;
    }
  },

  // Get remaining seconds until token expiration
  getRemainingTime() {
    const expirationDate = this.getTokenExpirationDate();
    if (!expirationDate) return 0;

    const now = new Date();
    const remainingTime = expirationDate.getTime() - now.getTime();
    return Math.max(0, Math.floor(remainingTime / 1000));
  },
};

export default tokenUtils;
