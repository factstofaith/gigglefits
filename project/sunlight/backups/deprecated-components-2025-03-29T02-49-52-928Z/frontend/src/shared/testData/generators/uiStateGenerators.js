/**
 * UI State Generators for Test Data
 * 
 * This module provides functions for generating UI state test data
 * including form states, notifications, loading states, and more.
 * 
 * These generators are environment-agnostic and can be used in both
 * Jest and Cypress test environments.
 * 
 * @version 1.0.0
 */

import { generateId } from './entityGenerators';

/**
 * Generate form validation errors
 * @param {Object} fields Field names and whether they have errors
 * @returns {Object} Form validation state
 */
export const generateFormValidationErrors = (fields = {}) => {
  // Added display name
  generateFormValidationErrors.displayName = 'generateFormValidationErrors';

  // Added display name
  generateFormValidationErrors.displayName = 'generateFormValidationErrors';

  // Added display name
  generateFormValidationErrors.displayName = 'generateFormValidationErrors';

  // Added display name
  generateFormValidationErrors.displayName = 'generateFormValidationErrors';

  const errorMessages = {
    email: 'Please enter a valid email address',
    password: 'Password must be at least 8 characters',
    username: 'Username can only contain letters, numbers, and underscores',
    name: 'Name is required',
    description: 'Description is too long (max 500 characters)',
    url: 'Please enter a valid URL',
    date: 'Please enter a valid date',
    number: 'Please enter a valid number',
  };
  
  const hasErrors = Object.values(fields).some(hasError => hasError);
  const errors = {};
  
  Object.entries(fields).forEach(([field, hasError]) => {
    if (hasError) {
      errors[field] = errorMessages[field] || `Invalid value for ${field}`;
    }
  });
  
  return {
    isValid: !hasErrors,
    errors,
    fields: Object.keys(fields),
    touched: Object.keys(fields).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {}),
  };
};

/**
 * Generate a toast notification
 * @param {string} type Toast type ('info', 'success', 'warning', 'error')
 * @param {string|null} message Custom message or null for default
 * @returns {Object} Toast notification
 */
export const generateToast = (type = 'info', message = null) => {
  // Added display name
  generateToast.displayName = 'generateToast';

  // Added display name
  generateToast.displayName = 'generateToast';

  // Added display name
  generateToast.displayName = 'generateToast';

  // Added display name
  generateToast.displayName = 'generateToast';

  const messages = {
    info: 'Information notification',
    success: 'Operation completed successfully',
    warning: 'Warning: Please review this information',
    error: 'Error: An issue has occurred'
  };
  
  return {
    id: generateId(),
    type,
    message: message || messages[type] || messages.info,
    title: type.charAt(0).toUpperCase() + type.slice(1),
    duration: 5000,
    createdAt: new Date().toISOString()
  };
};

/**
 * Generate a list of toast notifications
 * @param {number} count Number of toasts to generate
 * @returns {Array} Array of toast notifications
 */
export const generateToastList = (count = 3) => {
  // Added display name
  generateToastList.displayName = 'generateToastList';

  // Added display name
  generateToastList.displayName = 'generateToastList';

  // Added display name
  generateToastList.displayName = 'generateToastList';

  // Added display name
  generateToastList.displayName = 'generateToastList';

  const types = ['info', 'success', 'warning', 'error'];
  const toasts = [];
  
  for (let i = 0; i < count; i++) {
    toasts.push(generateToast(types[i % types.length]));
  }
  
  return toasts;
};

/**
 * Generate a list of notifications
 * @param {string} type Notification type
 * @param {number} count Number of notifications to generate
 * @returns {Array} Array of notifications
 */
export const generateNotifications = (type = 'info', count = 1) => {
  // Added display name
  generateNotifications.displayName = 'generateNotifications';

  // Added display name
  generateNotifications.displayName = 'generateNotifications';

  // Added display name
  generateNotifications.displayName = 'generateNotifications';

  // Added display name
  generateNotifications.displayName = 'generateNotifications';

  const notificationTypes = {
    info: {
      title: 'Information Update',
      message: 'This is an informational notification'
    },
    success: {
      title: 'Success',
      message: 'The operation completed successfully'
    },
    warning: {
      title: 'Warning',
      message: 'Please review this information carefully'
    },
    error: {
      title: 'Error',
      message: 'An error has occurred'
    }
  };
  
  const notifications = [];
  const { title, message } = notificationTypes[type] || notificationTypes.info;
  
  for (let i = 0; i < count; i++) {
    // Stagger the timestamps so that notifications appear in a logical order
    const timestamp = new Date(Date.now() - (i * 1000 * 60 * 5)); // 5 minutes apart
    
    notifications.push({
      id: `notification-${generateId()}`,
      title: `${title} ${i + 1}`,
      message: `${message} ${i + 1}`,
      type,
      timestamp: timestamp.toISOString(),
      read: false,
      actions: [],
      source: 'system',
      metadata: {}
    });
  }
  
  return notifications;
};

/**
 * Generate loading state for components
 * @param {Array} components Components to include in loading state
 * @returns {Object} Loading state
 */
export const generateLoadingState = (components = ['table', 'form', 'dashboard']) => {
  // Added display name
  generateLoadingState.displayName = 'generateLoadingState';

  // Added display name
  generateLoadingState.displayName = 'generateLoadingState';

  // Added display name
  generateLoadingState.displayName = 'generateLoadingState';

  // Added display name
  generateLoadingState.displayName = 'generateLoadingState';

  const loadingState = {
    isLoading: false,
    componentLoading: {},
    errors: {}
  };
  
  components.forEach((component, index) => {
    // Alternate loading state to create a mix of loading and loaded components
    loadingState.componentLoading[component] = index % 2 === 0;
    if (loadingState.componentLoading[component]) {
      loadingState.isLoading = true;
    }
  });
  
  return loadingState;
};

/**
 * Generate pagination state
 * @param {number} totalItems Total number of items
 * @param {number} itemsPerPage Items per page
 * @param {number} currentPage Current page
 * @returns {Object} Pagination state
 */
export const generatePaginationState = (totalItems = 100, itemsPerPage = 10, currentPage = 1) => {
  // Added display name
  generatePaginationState.displayName = 'generatePaginationState';

  // Added display name
  generatePaginationState.displayName = 'generatePaginationState';

  // Added display name
  generatePaginationState.displayName = 'generatePaginationState';

  // Added display name
  generatePaginationState.displayName = 'generatePaginationState';

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);
  
  return {
    totalItems,
    itemsPerPage,
    currentPage,
    totalPages,
    startItem,
    endItem,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
};

/**
 * Generate sort state
 * @param {string} column Column to sort by
 * @param {string} direction Sort direction ('asc' or 'desc')
 * @returns {Object} Sort state
 */
export const generateSortState = (column = 'name', direction = 'asc') => ({
  column,
  direction,
  previousColumn: null,
  isDirty: false
});

/**
 * Generate filter state
 * @param {Object} filters Filter values
 * @returns {Object} Filter state
 */
export const generateFilterState = (filters = {}) => ({
  filters,
  isActive: Object.keys(filters).length > 0,
  previousFilters: {},
  activeFilters: Object.keys(filters)
});

/**
 * Generate navigation state
 * @param {string} activeItem Active navigation item
 * @param {boolean} isCollapsed Whether navigation is collapsed
 * @returns {Object} Navigation state
 */
export const generateNavigationState = (activeItem = 'dashboard', isCollapsed = false) => ({
  activeItem,
  isCollapsed,
  previousItem: null,
  history: [activeItem]
});

/**
 * Generate form state
 * @param {Object} values Form values
 * @returns {Object} Form state
 */
export const generateFormState = (values = {}) => ({
  values,
  errors: {},
  touched: {},
  isSubmitting: false,
  isValid: true,
  isDirty: false,
  submitCount: 0
});

/**
 * Generate dialog state
 * @param {string} type Dialog type
 * @param {boolean} isOpen Whether dialog is open
 * @returns {Object} Dialog state
 */
export const generateDialogState = (type = 'confirmation', isOpen = false) => ({
  type,
  isOpen,
  title: `${type.charAt(0).toUpperCase()}${type.slice(1)} Dialog`,
  content: `This is a ${type} dialog message.`,
  data: {},
  onConfirm: () => {},
  onCancel: () => {}
});

/**
 * Generate theme state
 * @param {string} mode Theme mode ('light' or 'dark')
 * @param {boolean} highContrast Whether high contrast mode is enabled
 * @returns {Object} Theme state
 */
export const generateThemeState = (mode = 'light', highContrast = false) => ({
  mode,
  highContrast,
  fontSize: 'medium',
  animations: true,
  customColors: {}
});

/**
 * Generate dashboard state
 * @returns {Object} Dashboard state
 */
export const generateDashboardState = () => ({
  widgets: [
    { id: 'widget-1', type: 'chart', title: 'Performance', position: { x: 0, y: 0, w: 2, h: 2 } },
    { id: 'widget-2', type: 'stats', title: 'Statistics', position: { x: 2, y: 0, w: 1, h: 1 } },
    { id: 'widget-3', type: 'table', title: 'Recent Activities', position: { x: 0, y: 2, w: 3, h: 2 } }
  ],
  layout: 'grid',
  refreshInterval: 60000,
  dateRange: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() }
});