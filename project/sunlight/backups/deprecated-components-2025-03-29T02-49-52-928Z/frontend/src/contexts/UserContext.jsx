/**
 * UserContext.jsx
 * -----------------------------------------------------------------------------
 * Context provider for managing user authentication, profile, settings, and MFA
 * across the application. Provides comprehensive user management functionality
 * including authentication flows, profile management, settings, and multi-factor
 * authentication.
 * 
 * @module contexts/UserContext
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '@services/authService';
import { createApiService } from '@utils/apiServiceFactory';
import { userService, mfaService } from '@services/userManagementService';

/**
 * Context for user management
 * Provides user state and operations to components
 * @type {React.Context}
 */
const UserContext = createContext();

/**
 * Custom hook for accessing the user context
 * Provides a convenient way to access user state and operations
 * 
 * @function
 * @returns {Object} User context value
 * @throws {Error} If used outside of a UserProvider
 * 
 * @example
 * // Inside a component
 * function Profile() {
  // Added display name
  Profile.displayName = 'Profile';

 *   const { 
 *     user, 
 *     isAuthenticated, 
 *     updateUserProfile,
 *     logout
 *   } = useUser();
 *   
 *   // Component logic using user context...
 * }
 */
export const useUser = () => {
  // Added display name
  useUser.displayName = 'useUser';

  // Added display name
  useUser.displayName = 'useUser';

  // Added display name
  useUser.displayName = 'useUser';

  // Added display name
  useUser.displayName = 'useUser';

  // Added display name
  useUser.displayName = 'useUser';


  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

/**
 * Default API service for user-related operations
 * Configured with caching to optimize request performance
 * @type {Object}
 * @private
 */
const defaultUserApiService = createApiService({
  baseUrl: '/api/users',
  entityName: 'user',
  cacheConfig: {
    enabled: true,
    ttl: 10 * 60 * 1000, // 10 minutes
  },
});

/**
 * Provider component for user-related state and operations
 * Supports dependency injection for service implementations to facilitate testing
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} [props.apiService=defaultUserApiService] - Service implementation for API operations
 * @returns {React.ReactElement} Provider component
 * 
 * @example
 * // Basic usage
 * function App() {
  // Added display name
  App.displayName = 'App';

 *   return (
 *     <UserProvider>
 *       <LoginForm />
 *       <UserProfile />
 *     </UserProvider>
 *   );
 * }
 * 
 * // With custom service implementation for testing
 * function TestComponent({ mockUserService }) {
  // Added display name
  TestComponent.displayName = 'TestComponent';

 *   return (
 *     <UserProvider apiService={mockUserService}>
 *       <ComponentUnderTest />
 *     </UserProvider>
 *   );
 * }
 */
export const UserProvider = ({ 
  children,
  apiService = defaultUserApiService 
}) => {
  // Added display name
  UserProvider.displayName = 'UserProvider';

  // Added display name
  UserProvider.displayName = 'UserProvider';

  // Added display name
  UserProvider.displayName = 'UserProvider';

  // Added display name
  UserProvider.displayName = 'UserProvider';

  // Added display name
  UserProvider.displayName = 'UserProvider';


  /**
   * User profile information
   * @type {[Object|null, Function]} User object and setter function
   */
  const [user, setUser] = useState(null);
  
  /**
   * Flag indicating if user has admin role
   * @type {[boolean, Function]} Admin flag and setter function
   */
  const [isAdmin, setIsAdmin] = useState(false);
  
  /**
   * Flag indicating if user is authenticated
   * @type {[boolean, Function]} Authentication flag and setter function
   */
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * User preferences and settings
   * @type {[Object|null, Function]} Settings object and setter function
   */
  const [userSettings, setUserSettings] = useState(null);
  
  /**
   * Flag indicating if MFA is enabled for the user
   * @type {[boolean, Function]} MFA enabled flag and setter function
   */
  const [mfaEnabled, setMfaEnabled] = useState(false);
  
  /**
   * Flag indicating if MFA has been verified by the user
   * @type {[boolean, Function]} MFA verified flag and setter function
   */
  const [mfaVerified, setMfaVerified] = useState(false);
  
  /**
   * Flag indicating if MFA bypass is enabled for the user
   * @type {[boolean, Function]} MFA bypass flag and setter function
   */
  const [bypassMfa, setBypassMfa] = useState(false);

  /**
   * Loading state for auth operations
   * @type {[boolean, Function]} Loading state and setter function
   */
  const [isLoading, setIsLoading] = useState(true);
  
  /**
   * Loading state for settings operations
   * @type {[boolean, Function]} Settings loading state and setter function
   */
  const [settingsLoading, setSettingsLoading] = useState(false);

  /**
   * Error state for auth operations
   * @type {[string|null, Function]} Auth error message and setter function
   */
  const [authError, setAuthError] = useState(null);
  
  /**
   * Error state for settings operations
   * @type {[string|null, Function]} Settings error message and setter function
   */
  const [settingsError, setSettingsError] = useState(null);
  
  /**
   * Error state for MFA operations
   * @type {[string|null, Function]} MFA error message and setter function
   */
  const [mfaError, setMfaError] = useState(null);

  /**
   * Effect to initialize authentication state when provider mounts
   * Automatically checks for existing auth tokens and loads user data if authenticated
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Initialize auth service
        const { token, userInfo } = authService.initialize();

        // Check if we have valid auth
        if (token && userInfo) {
          // Verify with server and get fresh user data
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          setIsAdmin(currentUser?.role === 'admin');
          setIsAuthenticated(true);
          
          // Check for MFA bypass in localStorage (set by authService)
          const hasBypassMfa = localStorage.getItem('bypass_mfa') === 'true';
          setBypassMfa(hasBypassMfa);

          // Fetch user settings
          fetchUserSettings(currentUser.id);
          
          // Fetch MFA status
          fetchMfaStatus();
        } else {
          // Not authenticated
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError('Failed to initialize authentication');
        setUser(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Authenticates a user with username and password
   * 
   * @function
   * @async
   * @param {string} username - User's username or email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication result with user info and token
   * @throws {Error} If authentication fails
   * 
   * @example
   * // Login with username and password
   * try {
   *   const result = await login('user@example.com', 'password123');
   * } catch (error) {
   *   console.error('Login failed:', error);
   * }
   */
  const login = useCallback(async (username, password) => {
  // Added display name
  login.displayName = 'login';

    setIsLoading(true);
    setAuthError(null);
    try {
      const authResult = await authService.login(username, password);
      setUser(authResult.userInfo);
      setIsAdmin(authResult.userInfo?.role === 'admin');
      setIsAuthenticated(true);
      
      // Check for MFA bypass in localStorage (set by authService)
      const hasBypassMfa = localStorage.getItem('bypass_mfa') === 'true';
      setBypassMfa(hasBypassMfa);

      // Fetch user settings after successful login
      if (authResult.userInfo?.id) {
        await fetchUserSettings(authResult.userInfo.id);
      }

      return authResult;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initiates Office 365 OAuth authentication flow
   * Redirects the user to Microsoft's authentication page
   * 
   * @function
   * @async
   * @throws {Error} If OAuth initialization fails
   * 
   * @example
   * // Redirect to Office 365 login
   * <button onClick={loginWithOffice365}>
   *   Login with Office 365
   * </button>
   */
  const loginWithOffice365 = useCallback(async () => {
  // Added display name
  loginWithOffice365.displayName = 'loginWithOffice365';

    setIsLoading(true);
    setAuthError(null);
    try {
      await authService.loginWithOffice365();
      // This will redirect the user to Microsoft's OAuth page
      // The function will not return due to the redirect
    } catch (error) {
      console.error('Office 365 login error:', error);
      setAuthError('Office 365 login failed. Please try again.');
      setIsLoading(false);
      throw error;
    }
  }, []);

  /**
   * Initiates Gmail OAuth authentication flow
   * Redirects the user to Google's authentication page
   * 
   * @function
   * @async
   * @throws {Error} If OAuth initialization fails
   * 
   * @example
   * // Redirect to Gmail login
   * <button onClick={loginWithGmail}>
   *   Login with Gmail
   * </button>
   */
  const loginWithGmail = useCallback(async () => {
  // Added display name
  loginWithGmail.displayName = 'loginWithGmail';

    setIsLoading(true);
    setAuthError(null);
    try {
      await authService.loginWithGmail();
      // This will redirect the user to Google's OAuth page
      // The function will not return due to the redirect
    } catch (error) {
      console.error('Gmail login error:', error);
      setAuthError('Gmail login failed. Please try again.');
      setIsLoading(false);
      throw error;
    }
  }, []);

  /**
   * Handles OAuth callback after redirection from OAuth provider
   * Completes the authentication process after user returns from OAuth provider
   * 
   * @function
   * @async
   * @returns {Promise<Object>} Current user information
   * @throws {Error} If OAuth callback processing fails
   * 
   * @example
   * // In an OAuth callback component
   * useEffect(() => {
   *   handleOAuthCallback()
   *     .then(user => {
   *       navigate('/dashboard');
   *     })
   *     .catch(error => {
   *       console.error('OAuth authentication failed:', error);
   *     });
   * }, []);
   */
  const handleOAuthCallback = useCallback(async () => {
  // Added display name
  handleOAuthCallback.displayName = 'handleOAuthCallback';

    setIsLoading(true);
    setAuthError(null);
    try {
      // This would be called after OAuth redirect returns to our app
      // In a real implementation, this would extract the token from the URL
      // and store it in localStorage, then fetch user info
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setIsAdmin(currentUser?.role === 'admin');
      setIsAuthenticated(true);

      // Fetch user settings
      if (currentUser?.id) {
        await fetchUserSettings(currentUser.id);
      }

      return currentUser;
    } catch (error) {
      console.error('OAuth callback error:', error);
      setAuthError('Authentication failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logs out the current user
   * Clears authentication tokens and user state
   * 
   * @function
   * @async
   * @returns {Promise<void>} Resolves when logout is complete
   * 
   * @example
   * // In a header component
   * <button 
   *   onClick={logout}
   *   disabled={isLoading}
   * >
   *   {isLoading ? 'Logging out...' : 'Logout'}
   * </button>
   */
  const logout = useCallback(async () => {
  // Added display name
  logout.displayName = 'logout';

    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
      setUserSettings(null);
      setBypassMfa(false);
      localStorage.removeItem('bypass_mfa');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user data even if logout API fails
      setUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
      setUserSettings(null);
      setBypassMfa(false);
      localStorage.removeItem('bypass_mfa');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetches user settings from the API
   * 
   * @function
   * @async
   * @param {string|number} [userId] - ID of the user to fetch settings for (defaults to current user)
   * @returns {Promise<Object|null>} User settings or null if error or no user ID
   * 
   * @example
   * // Fetch settings for current user
   * const settings = await fetchUserSettings();
   * 
   * // Fetch settings for specific user (admin only)
   * const userSettings = await fetchUserSettings('user-123');
   */
  const fetchUserSettings = useCallback(
    async userId => {
  // Added display name
  fetchUserSettings.displayName = 'fetchUserSettings';

      if (!userId && user?.id) {
        userId = user.id;
      }

      if (!userId) {
        console.warn('Cannot fetch settings: No user ID provided');
        return null;
      }

      setSettingsLoading(true);
      setSettingsError(null);
      try {
        const settings = await apiService.executeCustom(`${userId}/settings`, 'GET');
        setUserSettings(settings);
        return settings;
      } catch (error) {
        console.error('Error fetching user settings:', error);
        setSettingsError('Failed to load user settings');
        return null;
      } finally {
        setSettingsLoading(false);
      }
    },
    [user]
  );

  /**
   * Updates user settings in the API
   * 
   * @function
   * @async
   * @param {Object} settingsData - New settings data
   * @param {string} [settingsData.theme] - UI theme preference
   * @param {string} [settingsData.language] - Language preference
   * @param {Object} [settingsData.notifications] - Notification preferences
   * @param {Object} [settingsData.display] - Display preferences
   * @returns {Promise<Object>} Updated settings
   * @throws {Error} If user is not authenticated or update fails
   * 
   * @example
   * // Update theme and notification settings
   * const updatedSettings = await updateUserSettings({
   *   theme: 'dark',
   *   notifications: {
   *     email: true,
   *     push: false,
   *     integrationAlerts: true
   *   }
   * });
   */
  const updateUserSettings = useCallback(
    async settingsData => {
  // Added display name
  updateUserSettings.displayName = 'updateUserSettings';

      if (!user?.id) {
        throw new Error('Cannot update settings: User not authenticated');
      }

      setSettingsLoading(true);
      setSettingsError(null);
      try {
        const updatedSettings = await apiService.executeCustom(
          `${user.id}/settings`,
          'PUT',
          settingsData
        );

        setUserSettings(updatedSettings);
        return updatedSettings;
      } catch (error) {
        console.error('Error updating user settings:', error);
        setSettingsError('Failed to update user settings');
        throw error;
      } finally {
        setSettingsLoading(false);
      }
    },
    [user]
  );

  /**
   * Updates user profile information
   * 
   * @function
   * @async
   * @param {Object} profileData - New profile data
   * @param {string} [profileData.name] - User's full name
   * @param {string} [profileData.email] - User's email
   * @param {string} [profileData.phone] - User's phone number
   * @param {string} [profileData.title] - User's job title
   * @param {string} [profileData.avatar] - User's avatar URL
   * @returns {Promise<Object>} Updated user profile
   * @throws {Error} If user is not authenticated or update fails
   * 
   * @example
   * // Update user's name and job title
   * const updatedProfile = await updateUserProfile({
   *   name: 'Jane Smith',
   *   title: 'Senior Developer'
   * });
   */
  const updateUserProfile = useCallback(
    async profileData => {
  // Added display name
  updateUserProfile.displayName = 'updateUserProfile';

      if (!user?.id) {
        throw new Error('Cannot update profile: User not authenticated');
      }

      setIsLoading(true);
      setAuthError(null);
      try {
        const updatedUser = await apiService.update(user.id, profileData);
        setUser(updatedUser);
        return updatedUser;
      } catch (error) {
        console.error('Error updating user profile:', error);
        setAuthError('Failed to update user profile');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Changes the current user's password
   * 
   * @function
   * @async
   * @param {string} currentPassword - User's current password
   * @param {string} newPassword - User's new password
   * @returns {Promise<boolean>} True if password change was successful
   * @throws {Error} If user is not authenticated or password change fails
   * 
   * @example
   * // Change password
   * try {
   *   await changePassword('currentPassword123', 'newPassword456');
   *   showSuccessMessage('Password changed successfully');
   * } catch (error) {
   *   showErrorMessage('Failed to change password');
   * }
   */
  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
  // Added display name
  changePassword.displayName = 'changePassword';

      if (!user?.id) {
        throw new Error('Cannot change password: User not authenticated');
      }

      setIsLoading(true);
      setAuthError(null);
      try {
        await apiService.executeCustom(`${user.id}/change-password`, 'POST', {
          currentPassword,
          newPassword,
        });

        return true;
      } catch (error) {
        console.error('Error changing password:', error);
        setAuthError(error.response?.data?.message || 'Failed to change password');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  /**
   * Requests a password reset for a user
   * Sends a password reset email to the specified email address
   * 
   * @function
   * @async
   * @param {string} email - Email address of the user requesting password reset
   * @returns {Promise<boolean>} True if reset request was successful
   * @throws {Error} If reset request fails
   * 
   * @example
   * // Request password reset
   * async function handleForgotPassword(email) {
  // Added display name
  handleForgotPassword.displayName = 'handleForgotPassword';

   *   try {
   *     await requestPasswordReset(email);
   *     setMessage('Password reset instructions sent to your email');
   *   } catch (error) {
   *     setError('Failed to request password reset');
   *   }
   * }
   */
  const requestPasswordReset = useCallback(async email => {
  // Added display name
  requestPasswordReset.displayName = 'requestPasswordReset';

    setIsLoading(true);
    setAuthError(null);
    try {
      await apiService.executeCustom('reset-password/request', 'POST', { email });

      return true;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setAuthError('Failed to request password reset');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Completes a password reset using the provided token
   * 
   * @function
   * @async
   * @param {string} token - Password reset token from the reset email
   * @param {string} newPassword - New password to set
   * @returns {Promise<boolean>} True if password reset was successful
   * @throws {Error} If password reset fails
   * 
   * @example
   * // Complete password reset
   * async function handleResetPassword(token, password) {
  // Added display name
  handleResetPassword.displayName = 'handleResetPassword';

   *   try {
   *     await completePasswordReset(token, password);
   *     setMessage('Password reset successful. You can now log in.');
   *     navigate('/login');
   *   } catch (error) {
   *     setError('Failed to reset password. The link may have expired.');
   *   }
   * }
   */
  const completePasswordReset = useCallback(async (token, newPassword) => {
  // Added display name
  completePasswordReset.displayName = 'completePasswordReset';

    setIsLoading(true);
    setAuthError(null);
    try {
      await apiService.executeCustom('reset-password/complete', 'POST', { token, newPassword });

      return true;
    } catch (error) {
      console.error('Error completing password reset:', error);
      setAuthError('Failed to reset password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get user notification preferences
  const getNotificationPreferences = useCallback(async () => {
  // Added display name
  getNotificationPreferences.displayName = 'getNotificationPreferences';

    if (!user?.id) {
      console.warn('Cannot fetch notification preferences: User not authenticated');
      return null;
    }

    try {
      const preferences = await apiService.executeCustom(
        `${user.id}/notification-preferences`,
        'GET'
      );

      return preferences;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }, [user]);

  // Update user notification preferences
  const updateNotificationPreferences = useCallback(
    async preferences => {
  // Added display name
  updateNotificationPreferences.displayName = 'updateNotificationPreferences';

      if (!user?.id) {
        throw new Error('Cannot update notification preferences: User not authenticated');
      }

      try {
        const updatedPreferences = await apiService.executeCustom(
          `${user.id}/notification-preferences`,
          'PUT',
          preferences
        );

        return updatedPreferences;
      } catch (error) {
        console.error('Error updating notification preferences:', error);
        throw error;
      }
    },
    [user]
  );
  
  // Fetch MFA status
  const fetchMfaStatus = useCallback(async () => {
  // Added display name
  fetchMfaStatus.displayName = 'fetchMfaStatus';

    if (!isAuthenticated) {
      return null;
    }
    
    try {
      const response = await mfaService.getMFAStatus();
      setMfaEnabled(response.data.enabled);
      setMfaVerified(response.data.verified);
      setMfaError(null);
      return response.data;
    } catch (error) {
      console.error('Error fetching MFA status:', error);
      setMfaError('Failed to fetch MFA status');
      return null;
    }
  }, [isAuthenticated]);
  
  // Start MFA enrollment process
  const enrollMfa = useCallback(async () => {
  // Added display name
  enrollMfa.displayName = 'enrollMfa';

    if (!isAuthenticated) {
      throw new Error('User must be authenticated to enroll in MFA');
    }
    
    try {
      const response = await mfaService.enrollMFA();
      setMfaError(null);
      return response.data;
    } catch (error) {
      console.error('Error enrolling in MFA:', error);
      setMfaError(error.response?.data?.detail || 'Failed to enroll in MFA');
      throw error;
    }
  }, [isAuthenticated]);
  
  // Verify MFA enrollment
  const verifyMfa = useCallback(async (code) => {
  // Added display name
  verifyMfa.displayName = 'verifyMfa';

    if (!isAuthenticated) {
      throw new Error('User must be authenticated to verify MFA');
    }
    
    try {
      const response = await mfaService.verifyMFA(code);
      setMfaEnabled(response.data.enabled);
      setMfaVerified(response.data.verified);
      setMfaError(null);
      return response.data;
    } catch (error) {
      console.error('Error verifying MFA:', error);
      setMfaError(error.response?.data?.detail || 'Invalid verification code');
      throw error;
    }
  }, [isAuthenticated]);
  
  // Get MFA recovery codes
  const getRecoveryCodes = useCallback(async () => {
  // Added display name
  getRecoveryCodes.displayName = 'getRecoveryCodes';

    if (!isAuthenticated || !mfaEnabled) {
      throw new Error('MFA must be enabled to get recovery codes');
    }
    
    try {
      const response = await mfaService.getRecoveryCodes();
      setMfaError(null);
      return response.data;
    } catch (error) {
      console.error('Error getting recovery codes:', error);
      setMfaError(error.response?.data?.detail || 'Failed to get recovery codes');
      throw error;
    }
  }, [isAuthenticated, mfaEnabled]);
  
  // Regenerate MFA recovery codes
  const regenerateRecoveryCodes = useCallback(async () => {
  // Added display name
  regenerateRecoveryCodes.displayName = 'regenerateRecoveryCodes';

    if (!isAuthenticated || !mfaEnabled) {
      throw new Error('MFA must be enabled to regenerate recovery codes');
    }
    
    try {
      const response = await mfaService.regenerateRecoveryCodes();
      setMfaError(null);
      return response.data;
    } catch (error) {
      console.error('Error regenerating recovery codes:', error);
      setMfaError(error.response?.data?.detail || 'Failed to regenerate recovery codes');
      throw error;
    }
  }, [isAuthenticated, mfaEnabled]);
  
  // Disable MFA
  const disableMfa = useCallback(async () => {
  // Added display name
  disableMfa.displayName = 'disableMfa';

    if (!isAuthenticated || !mfaEnabled) {
      throw new Error('MFA must be enabled to disable it');
    }
    
    try {
      await mfaService.disableMFA();
      setMfaEnabled(false);
      setMfaVerified(false);
      setMfaError(null);
      return true;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      setMfaError(error.response?.data?.detail || 'Failed to disable MFA');
      throw error;
    }
  }, [isAuthenticated, mfaEnabled]);

  // Context value
  const value = {
    // User state
    user,
    isAdmin,
    isAuthenticated,
    userSettings,
    mfaEnabled,
    mfaVerified,
    bypassMfa,

    // Loading and error states
    isLoading,
    settingsLoading,
    authError,
    settingsError,
    mfaError,

    // Auth methods
    login,
    loginWithOffice365,
    loginWithGmail,
    handleOAuthCallback,
    logout,

    // User profile and settings methods
    fetchUserSettings,
    updateUserSettings,
    updateUserProfile,
    changePassword,
    requestPasswordReset,
    completePasswordReset,
    getNotificationPreferences,
    updateNotificationPreferences,
    
    // MFA methods
    fetchMfaStatus,
    enrollMfa,
    verifyMfa,
    getRecoveryCodes,
    regenerateRecoveryCodes,
    disableMfa,

    // Helper methods
    refreshUserData: () => authService.getCurrentUser().then(setUser),
    clearAuthError: () => setAuthError(null),
    clearSettingsError: () => setSettingsError(null),
    clearMfaError: () => setMfaError(null),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
