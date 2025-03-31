/**
 * authService.js
 * -----------------------------------------------------------------------------
 * Authentication service supporting multiple authentication methods,
 * token management, and user session handling. Provides comprehensive
 * authentication support for username/password and OAuth-based methods
 * including Office 365 and Gmail authentication.
 * 
 * @module services/authService
 */
import axios from 'axios';

/**
 * LocalStorage key for storing the authentication token
 * @type {string}
 * @private
 */
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * LocalStorage key for storing user information
 * @type {string}
 * @private
 */
const USER_INFO_KEY = 'user_info';

/**
 * LocalStorage key for storing the refresh token
 * @type {string}
 * @private
 */
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * LocalStorage key for token expiration timestamp
 * @type {string}
 * @private
 */
const TOKEN_EXPIRY_KEY = 'token_expiry';

/**
 * API endpoints for authentication operations
 * @type {Object}
 * @private
 */
const API_ENDPOINTS = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  office365: '/api/auth/office365',
  gmail: '/api/auth/gmail',
  userInfo: '/api/auth/user',
  refreshToken: '/api/auth/refresh',
  currentUser: '/api/integrations/current-user',
};

/**
 * Axios instance for authentication API calls
 * Automatically includes the auth token in request headers
 * @type {Object}
 * @private
 */
const authApiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add request interceptor to include auth token in all requests
 * Automatically adds Authorization header with bearer token if available
 * @private
 */
authApiClient.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Helper function to get the current auth token from local storage
 * 
 * @function
 * @private
 * @returns {string|null} The current auth token or null if not found
 */
const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

/**
 * Helper function to get the refresh token from local storage
 * 
 * @function
 * @private
 * @returns {string|null} The refresh token or null if not found
 */
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

/**
 * Helper function to check if the current token is expired or about to expire
 * Considers a token expired if it will expire within the next 5 minutes
 * 
 * @function
 * @private
 * @returns {boolean} True if token is expired or about to expire, false otherwise
 */
const isTokenExpired = () => {
  // Added display name
  isTokenExpired.displayName = 'isTokenExpired';

  // Added display name
  isTokenExpired.displayName = 'isTokenExpired';

  // Added display name
  isTokenExpired.displayName = 'isTokenExpired';

  // Added display name
  isTokenExpired.displayName = 'isTokenExpired';

  // Added display name
  isTokenExpired.displayName = 'isTokenExpired';


  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;

  // Check if token is expired or about to expire (within 5 minutes)
  return Date.now() > parseInt(expiry, 10) - 5 * 60 * 1000;
};

/**
 * Centralized authentication service
 * Provides methods for authentication, token management, and user session handling
 * 
 * @namespace
 */
export const authService = {
  /**
   * Initializes authentication state on application start
   * Attempts to refresh token if expired and returns the current auth state
   * 
   * @function
   * @returns {Object} Current authentication state with token and user info
   * 
   * @example
   * // On app initialization
   * const { token, userInfo } = authService.initialize();
   * if (token && userInfo) {
   * }
   */
  initialize: () => {
    const token = getAuthToken();
    const userInfo = JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null');

    // If token exists but is expired, try to refresh it
    if (token && isTokenExpired()) {
      authService.refreshToken().catch(() => {
        // If refresh fails, clear authentication state
        authService.logout();
      });
    }

    return { token, userInfo };
  },

  /**
   * Authenticates a user with username and password
   * 
   * @function
   * @async
   * @param {string} username - User's username or email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication result with token and user info
   * @throws {Error} If authentication fails
   * 
   * @example
   * // Login with username and password
   * try {
   *   const auth = await authService.login('user@example.com', 'password123');
   * } catch (error) {
   *   console.error('Login failed:', error);
   * }
   */
  login: async (username, password) => {
    try {
      // Submit credentials to the token endpoint
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post('/token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Extract data from response
      const { access_token, token_type } = response.data;

      // Set token expiry (default to 30 minutes if not specified in backend)
      const expiresIn = 30 * 60 * 1000; // 30 minutes
      const expiryTime = Date.now() + expiresIn;

      // Store the token
      localStorage.setItem(AUTH_TOKEN_KEY, access_token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      // Parse token payload to check for bypass_mfa flag
      try {
        const tokenPayload = JSON.parse(atob(access_token.split('.')[1]));
        if (tokenPayload.bypass_mfa) {
          localStorage.setItem('bypass_mfa', 'true');
        } else {
          localStorage.removeItem('bypass_mfa');
        }
      } catch (parseError) {
        console.error('Error parsing token payload:', parseError);
        localStorage.removeItem('bypass_mfa');
      }

      // Get user info using the token
      try {
        const userResponse = await authApiClient.get(API_ENDPOINTS.userInfo);
        const userInfo = userResponse.data;

        // Store user info
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));

        return {
          token: access_token,
          userInfo,
          expiresIn,
        };
      } catch (userError) {
        console.error('Error fetching user info:', userError);
        throw userError;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Logs out the current user
   * Clears all authentication data from local storage
   * 
   * @function
   * @async
   * @returns {Promise<boolean>} True if logout successful
   * @throws {Error} If logout fails
   * 
   * @example
   * // Logout the current user
   * try {
   *   await authService.logout();
   *   navigate('/login');
   * } catch (error) {
   *   console.error('Logout failed:', error);
   * }
   */
  logout: async () => {
    try {
      // In a real implementation, this would call the backend to invalidate the token

      // Clear local storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      localStorage.removeItem(USER_INFO_KEY);

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Initiates Office 365 OAuth authentication flow
   * Redirects the user to Microsoft's authentication page
   * 
   * @function
   * @async
   * @returns {Promise<never>} A promise that never resolves (due to redirect)
   * @throws {Error} If OAuth flow initiation fails
   * 
   * @example
   * // Redirect to Office 365 login
   * try {
   *   await authService.loginWithOffice365();
   *   // This line won't execute due to redirect
   * } catch (error) {
   *   console.error('Failed to start Office 365 login flow:', error);
   * }
   */
  loginWithOffice365: async () => {
    try {
      // Start Office 365 OAuth flow by redirecting to the backend endpoint
      // which will redirect to Microsoft's OAuth endpoint
      window.location.href = API_ENDPOINTS.office365;

      // The function will not return due to the redirect
      // The backend will handle the OAuth flow and redirect back to our app
      // with the token in the URL, which will be handled by our application's
      // authentication callback route

      // Return a promise that never resolves since we're redirecting
      return new Promise(() => {});
    } catch (error) {
      console.error('Office 365 login error:', error);
      throw error;
    }
  },

  /**
   * Initiates Gmail OAuth authentication flow
   * Redirects the user to Google's authentication page
   * 
   * @function
   * @async
   * @returns {Promise<never>} A promise that never resolves (due to redirect)
   * @throws {Error} If OAuth flow initiation fails
   * 
   * @example
   * // Redirect to Gmail login
   * try {
   *   await authService.loginWithGmail();
   *   // This line won't execute due to redirect
   * } catch (error) {
   *   console.error('Failed to start Gmail login flow:', error);
   * }
   */
  loginWithGmail: async () => {
    try {
      // Start Gmail OAuth flow by redirecting to the backend endpoint
      // which will redirect to Google's OAuth endpoint
      window.location.href = API_ENDPOINTS.gmail;

      // The function will not return due to the redirect
      // The backend will handle the OAuth flow and redirect back to our app
      // with the token in the URL, which will be handled by our application's
      // authentication callback route

      // Return a promise that never resolves since we're redirecting
      return new Promise(() => {});
    } catch (error) {
      console.error('Gmail login error:', error);
      throw error;
    }
  },

  /**
   * Gets current user information
   * Automatically refreshes token if needed and tries to get fresh data from API
   * 
   * @function
   * @async
   * @returns {Promise<Object|null>} Current user information or null if not authenticated
   * @throws {Error} If getting user information fails
   * 
   * @example
   * // Get current user info
   * try {
   *   const user = await authService.getCurrentUser();
   *   if (user) {
   *   } else {
   *   }
   * } catch (error) {
   *   console.error('Failed to get user info:', error);
   * }
   */
  getCurrentUser: async () => {
    try {
      // First check if we need to refresh the token
      if (isTokenExpired()) {
        await authService.refreshToken();
      }

      // Try to get user from API first
      try {
        const response = await authApiClient.get(API_ENDPOINTS.currentUser);
        // Update the stored user info
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(response.data));
        return response.data;
      } catch (apiError) {
        console.warn('Error fetching current user from API:', apiError);
        // Fall back to stored user info
        const userInfo = JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null');
        return userInfo;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  /**
   * Checks if a user is currently authenticated
   * Verifies both token existence and token validity
   * 
   * @function
   * @returns {boolean} True if user is authenticated, false otherwise
   * 
   * @example
   * // Check if user is authenticated
   * if (authService.isAuthenticated()) {
   * } else {
   *   navigate('/login');
   * }
   */
  isAuthenticated: () => {
    const token = getAuthToken();
    return !!token && !isTokenExpired();
  },

  /**
   * Checks if the current user has admin role
   * 
   * @function
   * @async
   * @returns {Promise<boolean>} True if user is an admin, false otherwise
   * 
   * @example
   * // Check if user is an admin
   * const isAdmin = await authService.isAdmin();
   * if (isAdmin) {
   *   showAdminControls();
   * }
   */
  isAdmin: async () => {
    try {
      const userInfo = await authService.getCurrentUser();
      return userInfo?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  /**
   * Refreshes the authentication token
   * 
   * @function
   * @async
   * @returns {Promise<Object>} New token and expiration information
   * @throws {Error} If token refresh fails
   * 
   * @example
   * // Manually refresh token
   * try {
   *   const { token, expiresIn } = await authService.refreshToken();
   * } catch (error) {
   *   console.error('Token refresh failed:', error);
   *   // Handle token refresh failure, e.g., redirect to login
   * }
   */
  refreshToken: async () => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call the backend refresh endpoint
      const response = await axios.post(API_ENDPOINTS.refreshToken, {
        refresh_token: refreshToken,
      });

      // Extract data from response
      const { access_token, expires_in } = response.data;

      // Calculate expiry time in milliseconds
      const expiresIn = (expires_in || 30 * 60) * 1000; // Convert seconds to milliseconds, default 30 min
      const expiryTime = Date.now() + expiresIn;

      // Store the new token
      localStorage.setItem(AUTH_TOKEN_KEY, access_token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

      return { token: access_token, expiresIn };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  /**
   * Gets the current auth token, refreshing it if needed
   * 
   * @function
   * @async
   * @returns {Promise<string|null>} The current authentication token or null if not available
   * @throws {Error} If token refresh fails
   * 
   * @example
   * // Get the current auth token for a custom API call
   * try {
   *   const token = await authService.getAuthToken();
   *   if (token) {
   *     // Make API call with token
   *     axios.get('/api/custom-endpoint', {
   *       headers: { Authorization: `Bearer ${token}` }
   *     });
   *   }
   * } catch (error) {
   *   console.error('Failed to get auth token:', error);
   * }
   */
  getAuthToken: async () => {
    if (isTokenExpired()) {
      await authService.refreshToken();
    }
    return getAuthToken();
  },
};

export default authService;
