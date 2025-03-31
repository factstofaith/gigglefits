// UserContext.test.js
// -----------------------------------------------------------------------------
// Tests for UserContext provider using dependency injection approach

import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the server to avoid conflicts with MSW
jest.mock('../mocks/server', () => ({}));

// Create mock functions
const mockExecuteCustom = jest.fn();
const mockUpdate = jest.fn();
const mockGetById = jest.fn();
const mockGetAll = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();

// Create a mock API service
const mockApiService = {
  executeCustom: mockExecuteCustom,
  update: mockUpdate,
  getById: mockGetById,
  getAll: mockGetAll,
  create: mockCreate,
  delete: mockDelete
};

// Default test data
const defaultUser = { id: '123', name: 'Test User', role: 'user' };
const defaultSettings = {
  theme: 'dark',
  notifications: { email: true, push: false },
};

// Create authService mock implementing needed methods for testing
const mockAuthService = {
  initialize: jest.fn().mockReturnValue({
    token: 'mock-token',
    userInfo: defaultUser
  }),
  login: jest.fn().mockResolvedValue({
    token: 'mock-token',
    userInfo: defaultUser,
    expiresIn: 3600000
  }),
  logout: jest.fn().mockResolvedValue(true),
  loginWithOffice365: jest.fn().mockImplementation(() => new Promise(() => {})),
  loginWithGmail: jest.fn().mockImplementation(() => new Promise(() => {})),
  getCurrentUser: jest.fn().mockResolvedValue(defaultUser),
  isAuthenticated: jest.fn().mockReturnValue(true),
  isAdmin: jest.fn().mockReturnValue(false)
};

// Mock authService
jest.mock('../../services/authService', () => mockAuthService);

// Import the components
import { UserProvider, useUser } from '@contexts/UserContext';

// Test component to interact with the context
function TestComponent() {
  // Added display name
  TestComponent.displayName = 'TestComponent';

  const {
    user,
    isAdmin,
    isAuthenticated,
    userSettings,
    isLoading,
    settingsLoading,
    authError,
    settingsError,
    login,
    loginWithOffice365,
    loginWithGmail,
    handleOAuthCallback,
    logout,
    fetchUserSettings,
    updateUserSettings,
    updateUserProfile,
    changePassword,
    requestPasswordReset,
    completePasswordReset,
    getNotificationPreferences,
    updateNotificationPreferences,
    refreshUserData,
    clearAuthError,
    clearSettingsError,
  } = useUser();

  return (
    <div>
      {/* User state */}
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user-id">{user ? user.id : 'no-user'}</div>
      <div data-testid="user-name">{user ? user.name : 'no-name'}</div>
      <div data-testid="user-email">{user ? user.email : ''}</div>
      <div data-testid="user-role">{user ? user.role : 'no-role'}</div>
      <div data-testid="is-admin">{isAdmin ? 'Admin' : 'Not Admin'}</div>
      <div data-testid="is-authenticated">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      
      {/* User settings */}
      <div data-testid="user-settings">
        {userSettings ? JSON.stringify(userSettings) : 'No Settings'}
      </div>
      <div data-testid="settings-theme">
        {userSettings?.theme || 'no-theme'}
      </div>
      
      {/* Loading states */}
      <div data-testid="settings-loading">{settingsLoading ? 'Loading' : 'Not Loading'}</div>
      
      {/* Error states */}
      <div data-testid="auth-error">{authError || 'No Error'}</div>
      <div data-testid="settings-error">{settingsError || 'No Error'}</div>
      
      {/* Authentication actions */}
      <button data-testid="login-button" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      
      <button data-testid="office365-login-button" onClick={loginWithOffice365}>
        Login with Office 365
      </button>
      
      <button data-testid="gmail-login-button" onClick={loginWithGmail}>
        Login with Gmail
      </button>
      
      <button data-testid="oauth-callback-button" onClick={handleOAuthCallback}>
        Handle OAuth Callback
      </button>
      
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
      
      {/* User profile and settings actions */}
      <button data-testid="fetch-settings-button" onClick={() => fetchUserSettings('123')}>
        Fetch Settings
      </button>
      
      <button 
        data-testid="update-settings-button" 
        onClick={() => updateUserSettings({theme: 'light', language: 'fr'})}
      >
        Update Settings
      </button>
      
      <button
        data-testid="update-profile-button"
        onClick={() => updateUserProfile({ name: 'Updated Name' })}
      >
        Update Profile
      </button>
      
      <button
        data-testid="change-password-button"
        onClick={() => changePassword('oldPassword', 'newPassword')}
      >
        Change Password
      </button>
    </div>
  );
}

describe('UserContext', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set up the mock API service for consistent test behavior
    mockExecuteCustom.mockImplementation((endpoint, method, data) => {
      
      if (endpoint.includes('/settings')) {
        if (method === 'GET') {
          return Promise.resolve(defaultSettings);
        } else if (method === 'PUT') {
          return Promise.resolve({...defaultSettings, ...data});
        }
      }
      
      if (endpoint.includes('notification-preferences')) {
        if (method === 'GET') {
          return Promise.resolve({
            emailEnabled: true,
            pushEnabled: false,
            digestFrequency: 'weekly'
          });
        } else if (method === 'PUT') {
          return Promise.resolve({...data});
        }
      }
      
      if (endpoint.includes('change-password')) {
        return Promise.resolve({ success: true });
      }
      
      if (endpoint.includes('reset-password')) {
        return Promise.resolve({ success: true });
      }
      
      return Promise.resolve({});
    });
    
    mockUpdate.mockImplementation((id, data) => {
      return Promise.resolve({
        id,
        ...defaultUser,
        ...data
      });
    });
  });
  
  // Helper to render with context
  const renderWithContext = () => {
  // Added display name
  renderWithContext.displayName = 'renderWithContext';

  // Added display name
  renderWithContext.displayName = 'renderWithContext';

  // Added display name
  renderWithContext.displayName = 'renderWithContext';

  // Added display name
  renderWithContext.displayName = 'renderWithContext';

  // Added display name
  renderWithContext.displayName = 'renderWithContext';


    return render(
      <UserProvider apiService={mockApiService}>
        <TestComponent />
      </UserProvider>
    );
  };

  test('initializes authentication state on mount', async () => {
    renderWithContext();
    
    // The component should initially be in a loading state
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    
    // Wait for initialization to complete 
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Verify the auth state is initialized correctly
    expect(mockAuthService.initialize).toHaveBeenCalled();
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    expect(mockExecuteCustom).toHaveBeenCalledWith('123/settings', 'GET');
    
    // User should be authenticated and have correct data
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-id')).toHaveTextContent('123');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });
});