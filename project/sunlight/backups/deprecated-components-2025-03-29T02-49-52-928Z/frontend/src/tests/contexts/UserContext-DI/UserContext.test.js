// UserContext.test.js
// -----------------------------------------------------------------------------
// Tests for UserContext provider using manual mocking and dependency injection

import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the server to avoid conflicts with MSW
jest.mock('../../mocks/server', () => ({}));

// Create mock functions for the API service
const mockExecuteCustom = jest.fn();
const mockUpdate = jest.fn();
const mockGetById = jest.fn();
const mockGetAll = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();

// Create a mock API service with our mock functions
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

// Explicitly create mock functions for authService
const initialize = jest.fn();
const login = jest.fn();
const logout = jest.fn();
const getCurrentUser = jest.fn();
const loginWithOffice365 = jest.fn();
const loginWithGmail = jest.fn();
const isAuthenticated = jest.fn();
const isAdmin = jest.fn();

// Import the real authService module
import * as authServiceModule from '@services/authService';

// Manually mock its methods
authServiceModule.default.initialize = initialize;
authServiceModule.default.login = login;
authServiceModule.default.logout = logout;
authServiceModule.default.getCurrentUser = getCurrentUser;
authServiceModule.default.loginWithOffice365 = loginWithOffice365;
authServiceModule.default.loginWithGmail = loginWithGmail;
authServiceModule.default.isAuthenticated = isAuthenticated;
authServiceModule.default.isAdmin = isAdmin;

// Setup default return values for our mocks
initialize.mockReturnValue({
  token: 'mock-token',
  userInfo: defaultUser
});
login.mockResolvedValue({
  token: 'mock-token',
  userInfo: defaultUser,
  expiresIn: 3600000
});
logout.mockResolvedValue(true);
getCurrentUser.mockResolvedValue(defaultUser);
loginWithOffice365.mockImplementation(() => new Promise(() => {}));
loginWithGmail.mockImplementation(() => new Promise(() => {}));
isAuthenticated.mockReturnValue(true);
isAdmin.mockReturnValue(false);

// Import the UserContext components after setting up mocks
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
    </div>
  );
}

describe('UserContext', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
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
    
    // Verify that initialize was called
    expect(initialize).toHaveBeenCalled();
    
    // Verify that getCurrentUser was called
    expect(getCurrentUser).toHaveBeenCalled();
    
    // Verify user data is displayed
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-id')).toHaveTextContent('123');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    
    // Verify settings were fetched
    expect(mockExecuteCustom).toHaveBeenCalledWith('123/settings', 'GET');
  });
  
  test('fetches user settings when requested', async () => {
    renderWithContext();
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Clear previous API calls
    mockExecuteCustom.mockClear();
    
    // Setup custom settings for this specific fetch
    const customSettings = {
      theme: 'custom-theme',
      language: 'es',
      notifications: { email: true, sms: true }
    };
    mockExecuteCustom.mockResolvedValueOnce(customSettings);
    
    // Click the fetch settings button
    fireEvent.click(screen.getByTestId('fetch-settings-button'));
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByTestId('settings-loading')).toHaveTextContent('Not Loading');
    });
    
    // Verify API was called with correct parameters
    expect(mockExecuteCustom).toHaveBeenCalledWith('123/settings', 'GET');
    
    // Verify settings are displayed
    expect(screen.getByTestId('user-settings')).toHaveTextContent('custom-theme');
    expect(screen.getByTestId('user-settings')).toHaveTextContent('es');
  });
});