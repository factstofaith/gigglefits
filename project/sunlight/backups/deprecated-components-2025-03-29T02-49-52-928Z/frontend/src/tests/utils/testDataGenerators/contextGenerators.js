/**
 * Context Generators
 * 
 * This module provides functions for generating test data for React context providers,
 * including both the values and the callbacks they provide.
 */

import { 
  generateUser, 
  generateTenant, 
  generateApplicationList, 
  generateIntegrationList, 
  generateDatasetList 
} from './entityGenerators';

import { generateNotifications, generateToastList } from './uiStateGenerators';

/**
 * Generate User Context value
 * @param {Object} options Options for context generation
 * @returns {Object} User context value
 */
export const generateUserContext = (options = {}) => {
  // Added display name
  generateUserContext.displayName = 'generateUserContext';

  // Added display name
  generateUserContext.displayName = 'generateUserContext';

  // Added display name
  generateUserContext.displayName = 'generateUserContext';

  // Added display name
  generateUserContext.displayName = 'generateUserContext';

  const {
    isAuthenticated = true,
    isAdmin = false,
    isLoading = false
  } = options;
  
  // Generate user object if authenticated
  const user = isAuthenticated ? generateUser({
    role: isAdmin ? 'admin' : 'user',
    ...options.userOverrides
  }) : null;
  
  // Generate mock callbacks
  const login = jest.fn();
  const logout = jest.fn();
  const updateUser = jest.fn();
  const checkAuth = jest.fn().mockImplementation(() => Promise.resolve(isAuthenticated));
  
  return {
    // Context state
    isAuthenticated,
    isLoading,
    user,
    
    // Actions
    login,
    logout,
    updateUser,
    checkAuth
  };
};

/**
 * Generate Tenant Context value
 * @param {Object} options Options for context generation
 * @returns {Object} Tenant context value
 */
export const generateTenantContext = (options = {}) => {
  // Added display name
  generateTenantContext.displayName = 'generateTenantContext';

  // Added display name
  generateTenantContext.displayName = 'generateTenantContext';

  // Added display name
  generateTenantContext.displayName = 'generateTenantContext';

  // Added display name
  generateTenantContext.displayName = 'generateTenantContext';

  const {
    isLoading = false,
    tenantCount = 1
  } = options;
  
  // Generate tenant list
  const tenants = Array(tenantCount).fill(0).map((_, i) => 
    generateTenant({
      id: `tenant-${i + 1}`,
      name: `Test Tenant ${i + 1}`,
      ...options.tenantOverrides
    })
  );
  
  // Set current tenant (first one by default)
  const currentTenant = tenants[0];
  
  // Generate mock callbacks
  const setCurrentTenant = jest.fn();
  const fetchTenants = jest.fn().mockImplementation(() => Promise.resolve(tenants));
  const createTenant = jest.fn();
  const updateTenant = jest.fn();
  const deleteTenant = jest.fn();
  
  return {
    // Context state
    isLoading,
    tenants,
    currentTenant,
    
    // Actions
    setCurrentTenant,
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant
  };
};

/**
 * Generate Notification Context value
 * @param {Object} options Options for context generation
 * @returns {Object} Notification context value
 */
export const generateNotificationContext = (options = {}) => {
  // Added display name
  generateNotificationContext.displayName = 'generateNotificationContext';

  // Added display name
  generateNotificationContext.displayName = 'generateNotificationContext';

  // Added display name
  generateNotificationContext.displayName = 'generateNotificationContext';

  // Added display name
  generateNotificationContext.displayName = 'generateNotificationContext';

  const {
    notificationType = 'info',
    notificationCount = 2,
    showToastList = true
  } = options;
  
  // Generate notification state
  const notificationState = generateNotifications(notificationType, notificationCount);
  
  // Generate toast notifications
  const toasts = showToastList ? generateToastList(2) : [];
  
  // Generate mock callbacks
  const addNotification = jest.fn();
  const removeNotification = jest.fn();
  const markAsRead = jest.fn();
  const markAllAsRead = jest.fn();
  const showToast = jest.fn();
  const hideToast = jest.fn();
  const toggleNotificationCenter = jest.fn();
  
  return {
    // Context state
    notifications: notificationState.notifications,
    unreadCount: notificationState.unreadCount,
    showNotificationCenter: notificationState.showNotificationCenter,
    toasts,
    
    // Actions
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    showToast,
    hideToast,
    toggleNotificationCenter
  };
};

/**
 * Generate Integration Context value
 * @param {Object} options Options for context generation
 * @returns {Object} Integration context value
 */
export const generateIntegrationContext = (options = {}) => {
  // Added display name
  generateIntegrationContext.displayName = 'generateIntegrationContext';

  // Added display name
  generateIntegrationContext.displayName = 'generateIntegrationContext';

  // Added display name
  generateIntegrationContext.displayName = 'generateIntegrationContext';

  // Added display name
  generateIntegrationContext.displayName = 'generateIntegrationContext';

  const {
    isLoading = false,
    integrationCount = 3,
    selectedIntegrationIndex = 0
  } = options;
  
  // Generate integration list
  const integrations = generateIntegrationList(integrationCount, options.integrationOverrides);
  
  // Set selected integration
  const selectedIntegration = integrations[selectedIntegrationIndex];
  
  // Generate mock callbacks
  const fetchIntegrations = jest.fn().mockImplementation(() => Promise.resolve(integrations));
  const getIntegrationById = jest.fn().mockImplementation(id => 
    Promise.resolve(integrations.find(i => i.id === id))
  );
  const createIntegration = jest.fn();
  const updateIntegration = jest.fn();
  const deleteIntegration = jest.fn();
  const executeIntegration = jest.fn();
  const setSelectedIntegration = jest.fn();
  
  return {
    // Context state
    isLoading,
    integrations,
    selectedIntegration,
    filters: { status: 'all', type: 'all' },
    
    // Actions
    fetchIntegrations,
    getIntegrationById,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    executeIntegration,
    setSelectedIntegration,
    applyFilters: jest.fn()
  };
};

/**
 * Generate Application Context value
 * @param {Object} options Options for context generation
 * @returns {Object} Application context value
 */
export const generateApplicationContext = (options = {}) => {
  // Added display name
  generateApplicationContext.displayName = 'generateApplicationContext';

  // Added display name
  generateApplicationContext.displayName = 'generateApplicationContext';

  // Added display name
  generateApplicationContext.displayName = 'generateApplicationContext';

  // Added display name
  generateApplicationContext.displayName = 'generateApplicationContext';

  const {
    isLoading = false,
    applicationCount = 3,
    selectedApplicationIndex = 0
  } = options;
  
  // Generate application list
  const applications = generateApplicationList(applicationCount, options.applicationOverrides);
  
  // Set selected application
  const selectedApplication = applications[selectedApplicationIndex];
  
  // Generate mock callbacks
  const fetchApplications = jest.fn().mockImplementation(() => Promise.resolve(applications));
  const getApplicationById = jest.fn().mockImplementation(id => 
    Promise.resolve(applications.find(a => a.id === id))
  );
  const createApplication = jest.fn();
  const updateApplication = jest.fn();
  const deleteApplication = jest.fn();
  const setSelectedApplication = jest.fn();
  
  return {
    // Context state
    isLoading,
    applications,
    selectedApplication,
    filters: { status: 'all', type: 'all' },
    
    // Actions
    fetchApplications,
    getApplicationById,
    createApplication,
    updateApplication,
    deleteApplication,
    setSelectedApplication,
    applyFilters: jest.fn()
  };
};

/**
 * Generate Dataset Context value
 * @param {Object} options Options for context generation
 * @returns {Object} Dataset context value
 */
export const generateDatasetContext = (options = {}) => {
  // Added display name
  generateDatasetContext.displayName = 'generateDatasetContext';

  // Added display name
  generateDatasetContext.displayName = 'generateDatasetContext';

  // Added display name
  generateDatasetContext.displayName = 'generateDatasetContext';

  // Added display name
  generateDatasetContext.displayName = 'generateDatasetContext';

  const {
    isLoading = false,
    datasetCount = 3,
    selectedDatasetIndex = 0
  } = options;
  
  // Generate dataset list
  const datasets = generateDatasetList(datasetCount, options.datasetOverrides);
  
  // Set selected dataset
  const selectedDataset = datasets[selectedDatasetIndex];
  
  // Generate mock callbacks
  const fetchDatasets = jest.fn().mockImplementation(() => Promise.resolve(datasets));
  const getDatasetById = jest.fn().mockImplementation(id => 
    Promise.resolve(datasets.find(d => d.id === id))
  );
  const createDataset = jest.fn();
  const updateDataset = jest.fn();
  const deleteDataset = jest.fn();
  const setSelectedDataset = jest.fn();
  
  return {
    // Context state
    isLoading,
    datasets,
    selectedDataset,
    filters: { status: 'all', source: 'all' },
    
    // Actions
    fetchDatasets,
    getDatasetById,
    createDataset,
    updateDataset,
    deleteDataset,
    setSelectedDataset,
    applyFilters: jest.fn()
  };
};

/**
 * Generate Theme Context value
 * @param {Object} options Options for context generation
 * @returns {Object} Theme context value
 */
export const generateThemeContext = (options = {}) => {
  // Added display name
  generateThemeContext.displayName = 'generateThemeContext';

  // Added display name
  generateThemeContext.displayName = 'generateThemeContext';

  // Added display name
  generateThemeContext.displayName = 'generateThemeContext';

  // Added display name
  generateThemeContext.displayName = 'generateThemeContext';

  const {
    mode = 'light',
    highContrast = false
  } = options;
  
  // Generate mock theme object
  const theme = {
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
        light: mode === 'light' ? '#42a5f5' : '#e3f2fd',
        dark: mode === 'light' ? '#1565c0' : '#42a5f5'
      },
      secondary: {
        main: mode === 'light' ? '#9c27b0' : '#ce93d8',
        light: mode === 'light' ? '#ba68c8' : '#f3e5f5',
        dark: mode === 'light' ? '#7b1fa2' : '#ba68c8'
      },
      error: {
        main: '#f44336'
      },
      warning: {
        main: '#ff9800'
      },
      info: {
        main: '#2196f3'
      },
      success: {
        main: '#4caf50'
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e'
      },
      text: {
        primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
        secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
      }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14
    },
    spacing: (factor) => `${8 * factor}px`,
    shape: {
      borderRadius: 4
    },
    highContrast
  };
  
  // Generate mock callbacks
  const toggleMode = jest.fn();
  const toggleContrast = jest.fn();
  
  return {
    // Context state
    theme,
    mode,
    highContrast,
    
    // Actions
    toggleMode,
    toggleContrast
  };
};

/**
 * Generate Settings Context value
 * @param {Object} options Options for context generation
 * @returns {Object} Settings context value
 */
export const generateSettingsContext = (options = {}) => {
  // Added display name
  generateSettingsContext.displayName = 'generateSettingsContext';

  // Added display name
  generateSettingsContext.displayName = 'generateSettingsContext';

  // Added display name
  generateSettingsContext.displayName = 'generateSettingsContext';

  // Added display name
  generateSettingsContext.displayName = 'generateSettingsContext';

  const defaultSettings = {
    appearance: {
      theme: 'light',
      density: 'normal',
      animations: true
    },
    notifications: {
      email: true,
      browser: true,
      mobile: false
    },
    privacy: {
      shareData: false,
      analytics: true
    },
    integrations: {
      autoSaveInterval: 30,
      defaultExecutionTimeout: 300
    }
  };
  
  // Merge defaults with any overrides
  const settings = {
    ...defaultSettings,
    ...options.settings
  };
  
  // Generate mock callbacks
  const updateSettings = jest.fn();
  const resetSettings = jest.fn();
  
  return {
    // Context state
    settings,
    isLoading: false,
    
    // Actions
    updateSettings,
    resetSettings
  };
};

/**
 * Generate combined context providers for testing
 * This is useful for testing components that require multiple contexts
 * @param {Object} options Options for context generation
 * @returns {Object} Collection of context values
 */
export const generateTestContexts = (options = {}) => {
  // Added display name
  generateTestContexts.displayName = 'generateTestContexts';

  // Added display name
  generateTestContexts.displayName = 'generateTestContexts';

  // Added display name
  generateTestContexts.displayName = 'generateTestContexts';

  // Added display name
  generateTestContexts.displayName = 'generateTestContexts';

  return {
    userContext: generateUserContext(options.userContext),
    tenantContext: generateTenantContext(options.tenantContext),
    notificationContext: generateNotificationContext(options.notificationContext),
    integrationContext: generateIntegrationContext(options.integrationContext),
    applicationContext: generateApplicationContext(options.applicationContext),
    datasetContext: generateDatasetContext(options.datasetContext),
    themeContext: generateThemeContext(options.themeContext),
    settingsContext: generateSettingsContext(options.settingsContext)
  };
};