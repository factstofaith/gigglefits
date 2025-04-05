// authService.js
// -----------------------------------------------------------------------------
// Authentication service supporting Office 365 and Gmail authentication

import { enhancedFetch, parseErrorResponse, getHttpStatusMessage } from "@/error-handling/networkErrorHandler";
import { reportError, ErrorSeverity, handleAsyncError } from "@/error-handling/error-service";
import { withDockerNetworkErrorHandling } from '@/error-handling/docker';
import { ENV } from '@/utils/environmentConfig';

// Enhance fetch with Docker error handling for containerized environments
const dockerAwareEnhancedFetch = ENV.REACT_APP_RUNNING_IN_DOCKER === 'true' ?
withDockerNetworkErrorHandling(enhancedFetch) :
enhancedFetch;


const AUTH_TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

// Real authentication endpoints for our standardized auth system
const API_ENDPOINTS = {
  login: '/api/v1/auth/login',
  logout: '/api/v1/auth/logout',
  token: '/api/v1/auth/token',
  mfaVerify: '/api/v1/auth/verify-mfa',
  userInfo: '/api/v1/auth/me',
  refreshToken: '/api/v1/auth/refresh',
  validateToken: '/api/v1/auth/validate-token',
  office365: '/api/v1/auth/office365',
  gmail: '/api/v1/auth/gmail'
};

/**
 * Handle authentication errors properly
 * @param {Error} error - The error that occurred
 * @param {string} operation - The authentication operation that failed
 * @param {Object} details - Additional details about the operation
 * @returns {Error} The original error for further handling
 */
function handleAuthError(error, operation, details = {}) {
  // Add specific auth context to the error
  const errorInfo = {
    operation,
    ...details,
    timestamp: new Date().toISOString()
  };

  // Determine appropriate severity based on error type
  let severity = ErrorSeverity.ERROR;

  // Reduce severity for common non-critical auth issues
  if (error.name === 'TokenExpiredError' ||
  error.status === 401 ||
  error.message.includes('expired')) {
    severity = ErrorSeverity.WARNING;
  }

  // Report the error with proper context
  reportError(error, errorInfo, 'authService', severity);

  // Return the error to allow for further handling
  return error;
}

// Mock implementation for local development with proper error handling
// In a real app, these would make API calls to your backend
export const authService = {
  // Initialize auth on app start
  initialize: () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const userInfo = JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null');
      return { token, userInfo };
    } catch (error) {
      // Handle storage or parsing errors
      handleAuthError(error, 'initialize');
      // Return empty values to allow app to continue functioning
      return { token: null, userInfo: null };
    }
  },

  // Login with username and password
  login: async (username, password, rememberMe = false) => {
    try {
      // Use real backend implementation
      const response = await dockerAwareEnhancedFetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password, 
          remember_me: rememberMe,
          set_cookie: true
        }),
        credentials: 'include' // Important for cookie handling
      });
      
      if (!response.ok) {
        const errorData = await parseErrorResponse(response);
        const error = new Error(errorData.message || 'Login failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      const data = await response.json();
      
      // Handle MFA required response
      if (data.mfa_required) {
        return {
          mfaRequired: true,
          mfaToken: data.mfa_token,
          userId: data.user_id
        };
      }
      
      // Store token and user info locally for easy access
      // Note: The token is also stored in a secure HttpOnly cookie
      if (data.access_token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
      }
      
      if (data.user) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(data.user));
      }
      
      return { 
        token: data.access_token, 
        userInfo: data.user,
        refreshToken: data.refresh_token
      };
    } catch (error) {
      // Handle login errors
      handleAuthError(error, 'login', { username });
      throw error;
    }
  },

  // Verify MFA code during login
  verifyMfa: async (userId, mfaToken, mfaCode, rememberMe = false) => {
    try {
      const response = await dockerAwareEnhancedFetch(API_ENDPOINTS.mfaVerify, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId,
          mfa_token: mfaToken,
          mfa_code: mfaCode,
          remember_me: rememberMe,
          set_cookie: true
        }),
        credentials: 'include' // Important for cookie handling
      });
      
      if (!response.ok) {
        const errorData = await parseErrorResponse(response);
        const error = new Error(errorData.message || 'MFA verification failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      const data = await response.json();
      
      // Store token and user info locally for easy access
      if (data.access_token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
      }
      
      if (data.user) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(data.user));
      }
      
      return { 
        token: data.access_token, 
        userInfo: data.user,
        refreshToken: data.refresh_token
      };
    } catch (error) {
      handleAuthError(error, 'verifyMfa');
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      // Call the real logout API
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      // Call logout endpoint with cookies and authorization header
      await dockerAwareEnhancedFetch(API_ENDPOINTS.logout, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include' // Important for cookie handling
      });
      
      // Always clear local storage
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);

      return true;
    } catch (error) {
      // Handle logout errors, but still clear local storage
      handleAuthError(error, 'logout');

      // Still remove local tokens even if API call fails
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);

      // Return true to indicate successful logout from user perspective
      return true;
    }
  },

  // Office 365 authentication
  loginWithOffice365: async () => {
    try {
      // In a real app, this would redirect to Microsoft's OAuth endpoint
      window.alert('Redirecting to Office 365 login...');

      // Mock successful login after OAuth flow
      const token = 'mock_o365_token_' + Math.random().toString(36).substring(2);
      const userInfo = {
        id: 'o365_user_1',
        username: 'o365user',
        email: 'user@company.onmicrosoft.com',
        name: 'Office 365 User',
        role: 'user',
        provider: 'office365'
      };

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));

      return { token, userInfo };
    } catch (error) {
      // Handle Office 365 login errors
      handleAuthError(error, 'loginWithOffice365');
      throw error;
    }
  },

  // Gmail authentication
  loginWithGmail: async () => {
    try {
      // In a real app, this would redirect to Google's OAuth endpoint
      window.alert('Redirecting to Gmail login...');

      // Mock successful login after OAuth flow
      const token = 'mock_gmail_token_' + Math.random().toString(36).substring(2);
      const userInfo = {
        id: 'gmail_user_1',
        username: 'gmailuser',
        email: 'user@gmail.com',
        name: 'Gmail User',
        role: 'user',
        provider: 'gmail'
      };

      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));

      return { token, userInfo };
    } catch (error) {
      // Handle Gmail login errors
      handleAuthError(error, 'loginWithGmail');
      throw error;
    }
  },

  // Get current user info from server
  getCurrentUser: async () => {
    try {
      // Get token from localStorage or cookies
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      // Call the user info endpoint
      const response = await dockerAwareEnhancedFetch(API_ENDPOINTS.userInfo, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include' // For cookie-based auth
      });
      
      if (!response.ok) {
        // If unauthorized, clear stored data
        if (response.status === 401) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(USER_INFO_KEY);
        }
        
        const errorData = await parseErrorResponse(response);
        const error = new Error(errorData.message || 'Failed to get user info');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      // Parse and store user data
      const data = await response.json();
      const userData = data.data; // Extract from standard response format
      
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
      return userData;
    } catch (error) {
      // Handle user info errors
      handleAuthError(error, 'getCurrentUser');
      
      // Return cached user info as fallback
      try {
        return JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null');
      } catch {
        return null;
      }
    }
  },

  // Check if user is authenticated by validating token
  isAuthenticated: async () => {
    try {
      // Check local token first
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      
      // If no token in localStorage, check cookies by validating with server
      const response = await dockerAwareEnhancedFetch(API_ENDPOINTS.validateToken, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include' // For cookie-based auth
      });
      
      if (!response.ok) {
        // Clear local storage if token invalid
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
        return false;
      }
      
      // Parse validation response
      const data = await response.json();
      return data.data?.valid === true;
    } catch (error) {
      // Handle validation errors
      handleAuthError(error, 'isAuthenticated');
      return false;
    }
  },

  // Check if user is an admin
  isAdmin: async () => {
    try {
      // Get current user to ensure up-to-date role information
      const userInfo = await authService.getCurrentUser();
      return userInfo?.role === 'admin';
    } catch (error) {
      // Handle admin check errors
      handleAuthError(error, 'isAdmin');
      return false;
    }
  },

  // Refresh access token using refresh token
  refreshToken: async () => {
    try {
      // Call refresh token endpoint with refresh token from cookie
      const response = await dockerAwareEnhancedFetch(API_ENDPOINTS.refreshToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // No body needed if using HttpOnly cookies
        credentials: 'include' // Important for cookie handling
      });
      
      if (!response.ok) {
        // If token refresh fails, log out the user
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      
      // Update localStorage with new access token
      if (data.access_token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
      }
      
      return data.access_token;
    } catch (error) {
      // Handle token refresh errors
      handleAuthError(error, 'refreshToken');

      // Clear tokens if refresh failed
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);

      throw error;
    }
  },
  
  // Validate token directly with server
  validateToken: async (token) => {
    try {
      const response = await dockerAwareEnhancedFetch(API_ENDPOINTS.validateToken, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include' // For cookie-based auth
      });
      
      if (!response.ok) {
        return { valid: false };
      }
      
      const data = await response.json();
      return data.data || { valid: false };
    } catch (error) {
      handleAuthError(error, 'validateToken');
      return { valid: false };
    }
  }
};

export default authService;