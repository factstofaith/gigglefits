// authService.test.js
import axios from 'axios';
import { authService } from '@services/authService';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = (() => {
  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';


  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Mock the window.location object
const originalLocation = window.location;
delete window.location;
window.location = {
  href: '',
};

describe('Auth Service', () => {
  // Constants for testing
  const AUTH_TOKEN_KEY = 'auth_token';
  const USER_INFO_KEY = 'user_info';
  const REFRESH_TOKEN_KEY = 'refresh_token';
  const TOKEN_EXPIRY_KEY = 'token_expiry';

  const mockUserInfo = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
  };

  const mockToken = 'mock-jwt-token';
  const mockRefreshToken = 'mock-refresh-token';

  // Set up mocks before each test
  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Clear mock data
    localStorageMock.clear();
    jest.clearAllMocks();
    
    // Setup default axios mock responses
    axios.post.mockImplementation((url) => {
      if (url === '/token') {
        return Promise.resolve({
          data: {
            access_token: mockToken,
            token_type: 'Bearer',
          },
        });
      } else if (url === '/api/auth/refresh') {
        return Promise.resolve({
          data: {
            access_token: 'refreshed-token',
            expires_in: 1800, // 30 minutes
          },
        });
      }
      return Promise.reject(new Error('Not Found'));
    });

    // Setup mock for the auth client's get method
    axios.create.mockReturnValue({
      get: jest.fn().mockImplementation((url) => {
        if (url === '/api/auth/user' || url === '/api/integrations/current-user') {
          return Promise.resolve({ data: mockUserInfo });
        }
        return Promise.reject(new Error('Not Found'));
      }),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    });
  });

  afterEach(() => {
    // Restore original implementations
    window.location = originalLocation;
  });

  // Test initialize
  describe('initialize', () => {
    it('returns token and user info from localStorage', () => {
      // Arrange
      localStorageMock.setItem(AUTH_TOKEN_KEY, mockToken);
      localStorageMock.setItem(USER_INFO_KEY, JSON.stringify(mockUserInfo));
      
      // Set future expiry
      const futureExpiry = Date.now() + 3600 * 1000;
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, futureExpiry.toString());
      
      // Act
      const result = authService.initialize();
      
      // Assert
      expect(result).toEqual({
        token: mockToken,
        userInfo: mockUserInfo,
      });
    });
    
    it('attempts to refresh token if expired', () => {
      // Arrange
      localStorageMock.setItem(AUTH_TOKEN_KEY, mockToken);
      
      // Set expired token
      const pastExpiry = Date.now() - 1000;
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, pastExpiry.toString());
      
      // Spy on refreshToken method
      const refreshSpy = jest.spyOn(authService, 'refreshToken')
        .mockResolvedValueOnce({ token: 'refreshed-token', expiresIn: 1800 * 1000 });
      
      // Act
      authService.initialize();
      
      // Assert
      expect(refreshSpy).toHaveBeenCalled();
      
      // Cleanup
      refreshSpy.mockRestore();
    });
    
    it('calls logout if token refresh fails', async () => {
      // Arrange
      localStorageMock.setItem(AUTH_TOKEN_KEY, mockToken);
      
      // Set expired token
      const pastExpiry = Date.now() - 1000;
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, pastExpiry.toString());
      
      // Spy on refreshToken and logout methods
      const refreshSpy = jest.spyOn(authService, 'refreshToken')
        .mockRejectedValueOnce(new Error('Refresh failed'));
      
      const logoutSpy = jest.spyOn(authService, 'logout')
        .mockResolvedValueOnce(true);
      
      // Act
      const result = authService.initialize();
      
      // Wait for promises to resolve
      await new Promise(process.nextTick);
      
      // Assert
      expect(refreshSpy).toHaveBeenCalled();
      expect(logoutSpy).toHaveBeenCalled();
      
      // Cleanup
      refreshSpy.mockRestore();
      logoutSpy.mockRestore();
    });
  });

  // Test login
  describe('login', () => {
    it('authenticates user and retrieves token', async () => {
      // Act
      const result = await authService.login('user@example.com', 'password');
      
      // Assert
      expect(axios.post).toHaveBeenCalledWith('/token', expect.any(URLSearchParams), expect.any(Object));
      expect(localStorage.setItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY, mockToken);
      expect(localStorage.setItem).toHaveBeenCalledWith(USER_INFO_KEY, JSON.stringify(mockUserInfo));
      expect(localStorage.setItem).toHaveBeenCalledWith(TOKEN_EXPIRY_KEY, expect.any(String));
      
      expect(result).toEqual({
        token: mockToken,
        userInfo: mockUserInfo,
        expiresIn: expect.any(Number),
      });
    });
    
    it('throws error if login fails', async () => {
      // Arrange
      axios.post.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      // Act and Assert
      await expect(authService.login('bad@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
    
    it('throws error if user info fetch fails', async () => {
      // Arrange
      const mockAxiosClient = axios.create();
      mockAxiosClient.get.mockRejectedValueOnce(new Error('User info fetch failed'));
      
      // Act and Assert
      await expect(authService.login('user@example.com', 'password'))
        .rejects.toThrow('User info fetch failed');
    });
  });
  
  // Test logout
  describe('logout', () => {
    it('clears auth data from localStorage', async () => {
      // Arrange
      localStorageMock.setItem(AUTH_TOKEN_KEY, mockToken);
      localStorageMock.setItem(REFRESH_TOKEN_KEY, mockRefreshToken);
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, '123456789');
      localStorageMock.setItem(USER_INFO_KEY, JSON.stringify(mockUserInfo));
      
      // Act
      const result = await authService.logout();
      
      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(TOKEN_EXPIRY_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(USER_INFO_KEY);
      expect(result).toBe(true);
    });
  });
  
  // Test OAuth login methods
  describe('OAuth login methods', () => {
    it('redirects to Office 365 authentication endpoint', () => {
      // Act
      authService.loginWithOffice365();
      
      // Assert
      expect(window.location.href).toBe('/api/auth/office365');
    });
    
    it('redirects to Gmail authentication endpoint', () => {
      // Act
      authService.loginWithGmail();
      
      // Assert
      expect(window.location.href).toBe('/api/auth/gmail');
    });
  });
  
  // Test getCurrentUser
  describe('getCurrentUser', () => {
    it('fetches user info from API and updates localStorage', async () => {
      // Arrange
      const mockAxiosClient = axios.create();
      
      // Set future expiry to avoid refresh attempts
      const futureExpiry = Date.now() + 3600 * 1000;
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, futureExpiry.toString());
      
      // Act
      const result = await authService.getCurrentUser();
      
      // Assert
      expect(result).toEqual(mockUserInfo);
      expect(localStorage.setItem).toHaveBeenCalledWith(USER_INFO_KEY, JSON.stringify(mockUserInfo));
    });
    
    it('refreshes token if expired before fetching user', async () => {
      // Arrange
      const refreshSpy = jest.spyOn(authService, 'refreshToken')
        .mockResolvedValueOnce({ token: 'refreshed-token', expiresIn: 1800 * 1000 });
      
      // Set expired token
      const pastExpiry = Date.now() - 1000;
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, pastExpiry.toString());
      
      // Act
      await authService.getCurrentUser();
      
      // Assert
      expect(refreshSpy).toHaveBeenCalled();
      
      // Cleanup
      refreshSpy.mockRestore();
    });
    
    it('falls back to localStorage user info if API call fails', async () => {
      // Arrange
      const mockAxiosClient = axios.create();
      mockAxiosClient.get.mockRejectedValueOnce(new Error('API error'));
      
      const storedUserInfo = { id: '456', name: 'Stored User', role: 'user' };
      localStorageMock.setItem(USER_INFO_KEY, JSON.stringify(storedUserInfo));
      
      // Set future expiry to avoid refresh attempts
      const futureExpiry = Date.now() + 3600 * 1000;
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, futureExpiry.toString());
      
      // Act
      const result = await authService.getCurrentUser();
      
      // Assert
      expect(result).toEqual(storedUserInfo);
    });
  });
  
  // Test isAuthenticated
  describe('isAuthenticated', () => {
    it('returns true if valid token exists', () => {
      // Arrange
      localStorageMock.setItem(AUTH_TOKEN_KEY, mockToken);
      
      // Set future expiry
      const futureExpiry = Date.now() + 3600 * 1000;
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, futureExpiry.toString());
      
      // Act
      const result = authService.isAuthenticated();
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('returns false if token is expired', () => {
      // Arrange
      localStorageMock.setItem(AUTH_TOKEN_KEY, mockToken);
      
      // Set expired token
      const pastExpiry = Date.now() - 1000;
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, pastExpiry.toString());
      
      // Act
      const result = authService.isAuthenticated();
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('returns false if no token exists', () => {
      // Act (no token set in localStorage)
      const result = authService.isAuthenticated();
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  // Test isAdmin
  describe('isAdmin', () => {
    it('returns true if user has admin role', async () => {
      // Arrange
      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce({
        id: '123',
        name: 'Admin User',
        role: 'admin',
      });
      
      // Act
      const result = await authService.isAdmin();
      
      // Assert
      expect(result).toBe(true);
    });
    
    it('returns false if user does not have admin role', async () => {
      // Arrange
      jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce({
        id: '123',
        name: 'Regular User',
        role: 'user',
      });
      
      // Act
      const result = await authService.isAdmin();
      
      // Assert
      expect(result).toBe(false);
    });
    
    it('returns false if getCurrentUser fails', async () => {
      // Arrange
      jest.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce(new Error('Failed to get user'));
      
      // Act
      const result = await authService.isAdmin();
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  // Test refreshToken
  describe('refreshToken', () => {
    it('refreshes token and updates localStorage', async () => {
      // Arrange
      localStorageMock.setItem(REFRESH_TOKEN_KEY, mockRefreshToken);
      
      // Act
      const result = await authService.refreshToken();
      
      // Assert
      expect(axios.post).toHaveBeenCalledWith('/api/auth/refresh', { refresh_token: mockRefreshToken });
      expect(localStorage.setItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY, 'refreshed-token');
      expect(localStorage.setItem).toHaveBeenCalledWith(TOKEN_EXPIRY_KEY, expect.any(String));
      
      expect(result).toEqual({
        token: 'refreshed-token',
        expiresIn: 1800 * 1000, // 30 minutes in ms
      });
    });
    
    it('throws error if no refresh token is available', async () => {
      // Act and Assert
      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
    });
    
    it('throws error if refresh request fails', async () => {
      // Arrange
      localStorageMock.setItem(REFRESH_TOKEN_KEY, mockRefreshToken);
      axios.post.mockRejectedValueOnce(new Error('Refresh failed'));
      
      // Act and Assert
      await expect(authService.refreshToken()).rejects.toThrow('Refresh failed');
    });
  });
  
  // Test getAuthToken
  describe('getAuthToken', () => {
    it('returns token directly if not expired', async () => {
      // Arrange
      localStorageMock.setItem(AUTH_TOKEN_KEY, mockToken);
      
      // Set future expiry
      const futureExpiry = Date.now() + 3600 * 1000;
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, futureExpiry.toString());
      
      // Spy to ensure refreshToken is not called
      const refreshSpy = jest.spyOn(authService, 'refreshToken');
      
      // Act
      const result = await authService.getAuthToken();
      
      // Assert
      expect(result).toBe(mockToken);
      expect(refreshSpy).not.toHaveBeenCalled();
      
      // Cleanup
      refreshSpy.mockRestore();
    });
    
    it('refreshes token if expired before returning', async () => {
      // Arrange
      localStorageMock.setItem(AUTH_TOKEN_KEY, mockToken);
      
      // Set expired token
      const pastExpiry = Date.now() - 1000;
      localStorageMock.setItem(TOKEN_EXPIRY_KEY, pastExpiry.toString());
      
      // Mock refreshToken to update the token
      const refreshSpy = jest.spyOn(authService, 'refreshToken')
        .mockImplementationOnce(async () => {
          localStorageMock.setItem(AUTH_TOKEN_KEY, 'refreshed-token');
          const newExpiry = Date.now() + 1800 * 1000;
          localStorageMock.setItem(TOKEN_EXPIRY_KEY, newExpiry.toString());
          return { token: 'refreshed-token', expiresIn: 1800 * 1000 };
        });
      
      // Act
      const result = await authService.getAuthToken();
      
      // Assert
      expect(refreshSpy).toHaveBeenCalled();
      expect(result).toBe('refreshed-token');
      
      // Cleanup
      refreshSpy.mockRestore();
    });
  });
});