/**
 * Context Generators for Test Data
 * 
 * This module provides functions for generating React context test data
 * for various application contexts like user, tenant, notification, etc.
 * 
 * These generators are environment-agnostic and can be used in both
 * Jest and Cypress test environments.
 * 
 * @version 1.0.0
 */

import { generateUser, generateTenant, generateDatasetList, generateApplicationList, generateIntegrationList } from './entityGenerators';
import { generateToastList, generateNotifications, generateThemeState } from './uiStateGenerators';

/**
 * Generate a user context
 * @param {Object} options User context options
 * @returns {Object} User context
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

  const user = options.user || generateUser(options.userOverrides);
  const isAuthenticated = options.isAuthenticated !== undefined ? options.isAuthenticated : true;
  
  return {
    user,
    isAuthenticated,
    isAdmin: user.role === 'admin',
    permissions: user.permissions || [],
    login: jest.fn ? jest.fn() : (() => {}),
    logout: jest.fn ? jest.fn() : (() => {}),
    updateUser: jest.fn ? jest.fn() : (() => {}),
    refreshToken: jest.fn ? jest.fn() : (() => {}),
    isLoading: false,
    error: null,
    ...options
  };
};

/**
 * Generate a tenant context
 * @param {Object} options Tenant context options
 * @returns {Object} Tenant context
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

  const tenant = options.tenant || generateTenant(options.tenantOverrides);
  const tenants = options.tenants || [tenant];
  
  return {
    tenant,
    tenants,
    isLoading: false,
    error: null,
    setCurrentTenant: jest.fn ? jest.fn() : (() => {}),
    refreshTenants: jest.fn ? jest.fn() : (() => {}),
    ...options
  };
};

/**
 * Generate a notification context
 * @param {Object} options Notification context options
 * @returns {Object} Notification context
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

  const toasts = options.toasts || generateToastList(2);
  const notifications = options.notifications || generateNotifications('info', 3);
  
  // Calculate unread count based on notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {
    // State
    toasts,
    notifications,
    preferences: {
      desktopNotifications: false,
      emailNotifications: false,
      notificationSound: true,
      ...options.preferences
    },
    notificationCenter: {
      isOpen: false,
      unreadCount,
      ...options.notificationCenter
    },
    
    // Methods
    showToast: jest.fn ? jest.fn() : (() => {}),
    addNotification: jest.fn ? jest.fn() : (() => {}),
    updateNotification: jest.fn ? jest.fn() : (() => {}),
    removeNotification: jest.fn ? jest.fn() : (() => {}),
    markAsRead: jest.fn ? jest.fn() : (() => {}),
    markAllAsRead: jest.fn ? jest.fn() : (() => {}),
    clearAllNotifications: jest.fn ? jest.fn() : (() => {}),
    toggleNotificationCenter: jest.fn ? jest.fn() : (() => {}),
    updatePreferences: jest.fn ? jest.fn() : (() => {}),
    
    ...options
  };
};

/**
 * Generate an integration context
 * @param {Object} options Integration context options
 * @returns {Object} Integration context
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

  const integrations = options.integrations || generateIntegrationList(3, options.integrationOverrides);
  
  return {
    // State
    integrations,
    selectedIntegration: options.selectedIntegration || integrations[0],
    isLoading: false,
    error: null,
    flowNodeTypes: ['source', 'transform', 'destination', 'router', 'action', 'dataset', 'trigger'],
    
    // Methods
    fetchIntegrations: jest.fn ? jest.fn() : (() => {}),
    createIntegration: jest.fn ? jest.fn() : (() => {}),
    updateIntegration: jest.fn ? jest.fn() : (() => {}),
    deleteIntegration: jest.fn ? jest.fn() : (() => {}),
    executeIntegration: jest.fn ? jest.fn() : (() => {}),
    selectIntegration: jest.fn ? jest.fn() : (() => {}),
    validateIntegration: jest.fn ? jest.fn() : (() => {}),
    
    ...options
  };
};

/**
 * Generate an application context
 * @param {Object} options Application context options
 * @returns {Object} Application context
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

  const applications = options.applications || generateApplicationList(3, options.applicationOverrides);
  
  return {
    // State
    applications,
    selectedApplication: options.selectedApplication || applications[0],
    isLoading: false,
    error: null,
    
    // Methods
    fetchApplications: jest.fn ? jest.fn() : (() => {}),
    createApplication: jest.fn ? jest.fn() : (() => {}),
    updateApplication: jest.fn ? jest.fn() : (() => {}),
    deleteApplication: jest.fn ? jest.fn() : (() => {}),
    selectApplication: jest.fn ? jest.fn() : (() => {}),
    
    ...options
  };
};

/**
 * Generate a dataset context
 * @param {Object} options Dataset context options
 * @returns {Object} Dataset context
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

  const datasets = options.datasets || generateDatasetList(3, options.datasetOverrides);
  
  return {
    // State
    datasets,
    selectedDataset: options.selectedDataset || datasets[0],
    isLoading: false,
    error: null,
    
    // Methods
    fetchDatasets: jest.fn ? jest.fn() : (() => {}),
    createDataset: jest.fn ? jest.fn() : (() => {}),
    updateDataset: jest.fn ? jest.fn() : (() => {}),
    deleteDataset: jest.fn ? jest.fn() : (() => {}),
    selectDataset: jest.fn ? jest.fn() : (() => {}),
    
    ...options
  };
};

/**
 * Generate a theme context
 * @param {Object} options Theme context options
 * @returns {Object} Theme context
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

  const themeState = generateThemeState(options.mode, options.highContrast);
  
  return {
    // State
    ...themeState,
    
    // Methods
    setMode: jest.fn ? jest.fn() : (() => {}),
    toggleMode: jest.fn ? jest.fn() : (() => {}),
    setHighContrast: jest.fn ? jest.fn() : (() => {}),
    toggleHighContrast: jest.fn ? jest.fn() : (() => {}),
    setFontSize: jest.fn ? jest.fn() : (() => {}),
    
    ...options
  };
};

/**
 * Generate a settings context
 * @param {Object} options Settings context options
 * @returns {Object} Settings context
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

  return {
    // State
    preferences: {
      theme: 'light',
      fontSize: 'medium',
      language: 'en',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      timezone: 'UTC',
      notifications: {
        email: true,
        browser: true,
        sound: true
      },
      ...options.preferences
    },
    
    // Methods
    updatePreferences: jest.fn ? jest.fn() : (() => {}),
    resetPreferences: jest.fn ? jest.fn() : (() => {}),
    
    ...options
  };
};

/**
 * Generate a complete set of context providers for testing
 * @param {Object} options Options for all contexts
 * @returns {Object} Combined contexts
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
    user: generateUserContext(options.user),
    tenant: generateTenantContext(options.tenant),
    notification: generateNotificationContext(options.notification),
    integration: generateIntegrationContext(options.integration),
    application: generateApplicationContext(options.application),
    dataset: generateDatasetContext(options.dataset),
    theme: generateThemeContext(options.theme),
    settings: generateSettingsContext(options.settings)
  };
};