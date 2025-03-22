// authService.js
// -----------------------------------------------------------------------------
// Authentication service supporting Office 365 and Gmail authentication

const AUTH_TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

// Mock authentication endpoints - in a real app these would point to your backend
const API_ENDPOINTS = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  office365: '/api/auth/office365',
  gmail: '/api/auth/gmail',
  userInfo: '/api/auth/user',
  refreshToken: '/api/auth/refresh'
};

// Mock implementation for local development
// In a real app, these would make API calls to your backend
export const authService = {
  // Initialize auth on app start
  initialize: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userInfo = JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null');
    return { token, userInfo };
  },

  // Login with username and password
  login: async (username, password) => {
    // Mock successful login
    const token = 'mock_token_' + Math.random().toString(36).substring(2);
    const userInfo = {
      id: 'user_1',
      username,
      email: `${username}@example.com`,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      role: username === 'admin' ? 'admin' : 'user'
    };
    
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    
    return { token, userInfo };
  },

  // Logout
  logout: async () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    return true;
  },

  // Office 365 authentication
  loginWithOffice365: async () => {
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
  },

  // Gmail authentication
  loginWithGmail: async () => {
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
  },

  // Get current user info
  getCurrentUser: async () => {
    const userInfo = JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null');
    return userInfo;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Check if user is an admin
  isAdmin: async () => {
    const userInfo = JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null');
    return userInfo?.role === 'admin';
  },

  // Refresh token
  refreshToken: async () => {
    // In a real app, this would send the refresh token to get a new access token
    const token = 'refreshed_token_' + Math.random().toString(36).substring(2);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return token;
  }
};

export default authService;