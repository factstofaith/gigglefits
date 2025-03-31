/**
 * UI State Generators
 * 
 * This module provides functions for generating test data related to UI state,
 * including form state, validation state, notifications, and other UI-specific data.
 */

/**
 * Generate form validation errors
 * @param {Object} fields Object with field names as keys and validation state as values
 * @returns {Object} Form validation error state
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

  const defaultFields = {
    name: true,
    email: false,
    password: false,
    confirmPassword: false
  };
  
  const mergedFields = { ...defaultFields, ...fields };
  const errors = {};
  
  // Generate error messages for each field marked as invalid
  Object.entries(mergedFields).forEach(([field, hasError]) => {
    if (hasError) {
      switch (field) {
        case 'name':
          errors[field] = 'Name is required';
          break;
        case 'email':
          errors[field] = 'Please enter a valid email address';
          break;
        case 'password':
          errors[field] = 'Password must be at least 8 characters';
          break;
        case 'confirmPassword':
          errors[field] = 'Passwords do not match';
          break;
        default:
          errors[field] = `Invalid ${field}`;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    touched: Object.keys(mergedFields).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {})
  };
};

/**
 * Generate notification state
 * @param {string} type Notification type ('success', 'error', 'info', 'warning')
 * @param {number} count Number of notifications to generate
 * @returns {Object} Notification state
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

  const notifications = [];
  
  for (let i = 0; i < count; i++) {
    let message, title;
    
    switch (type) {
      case 'success':
        title = 'Success';
        message = 'Operation completed successfully';
        break;
      case 'error':
        title = 'Error';
        message = 'An error occurred while processing your request';
        break;
      case 'warning':
        title = 'Warning';
        message = 'Please review before proceeding';
        break;
      case 'info':
      default:
        title = 'Information';
        message = 'Please note this important information';
    }
    
    notifications.push({
      id: `notification-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: count > 1 ? `${title} ${i + 1}` : title,
      message: count > 1 ? `${message} ${i + 1}` : message,
      timestamp: new Date().toISOString(),
      read: false,
      dismissible: true
    });
  }
  
  return {
    notifications,
    unreadCount: notifications.length,
    showNotificationCenter: false
  };
};

/**
 * Generate loading state for UI components
 * @param {Array} components Array of component names to set loading state for
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

  const loadingState = {};
  
  components.forEach(component => {
    loadingState[component] = Math.random() > 0.7; // 30% chance of being in loading state
  });
  
  return {
    isLoading: Object.values(loadingState).some(state => state),
    componentLoading: loadingState
  };
};

/**
 * Generate pagination state
 * @param {number} totalItems Total number of items
 * @param {number} itemsPerPage Number of items per page
 * @param {number} currentPage Current page number
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
  
  return {
    totalItems,
    itemsPerPage,
    currentPage: Math.min(currentPage, totalPages),
    totalPages,
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
export const generateSortState = (column = 'name', direction = 'asc') => {
  // Added display name
  generateSortState.displayName = 'generateSortState';

  // Added display name
  generateSortState.displayName = 'generateSortState';

  // Added display name
  generateSortState.displayName = 'generateSortState';

  // Added display name
  generateSortState.displayName = 'generateSortState';

  return {
    sortBy: column,
    sortDirection: direction,
    previousSort: null
  };
};

/**
 * Generate filter state
 * @param {Object} filters Object with filter names as keys and filter values as values
 * @returns {Object} Filter state
 */
export const generateFilterState = (filters = {}) => {
  // Added display name
  generateFilterState.displayName = 'generateFilterState';

  // Added display name
  generateFilterState.displayName = 'generateFilterState';

  // Added display name
  generateFilterState.displayName = 'generateFilterState';

  // Added display name
  generateFilterState.displayName = 'generateFilterState';

  const defaultFilters = {
    status: 'active',
    type: 'all',
    dateRange: {
      start: null,
      end: null
    }
  };
  
  return {
    filters: { ...defaultFilters, ...filters },
    activeFilters: Object.keys(filters).length,
    isFilterVisible: false
  };
};

/**
 * Generate sidebar navigation state
 * @param {string} activeItem Currently active navigation item
 * @param {boolean} isCollapsed Whether sidebar is collapsed
 * @returns {Object} Navigation state
 */
export const generateNavigationState = (activeItem = 'dashboard', isCollapsed = false) => {
  // Added display name
  generateNavigationState.displayName = 'generateNavigationState';

  // Added display name
  generateNavigationState.displayName = 'generateNavigationState';

  // Added display name
  generateNavigationState.displayName = 'generateNavigationState';

  // Added display name
  generateNavigationState.displayName = 'generateNavigationState';

  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'integrations', label: 'Integrations', icon: 'integration' },
    { id: 'applications', label: 'Applications', icon: 'apps' },
    { id: 'datasets', label: 'Datasets', icon: 'database' },
    { id: 'users', label: 'Users', icon: 'people' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];
  
  return {
    items,
    activeItem,
    isCollapsed,
    history: ['dashboard', activeItem]
  };
};

/**
 * Generate form input state
 * @param {Object} values Form field values
 * @returns {Object} Form state
 */
export const generateFormState = (values = {}) => {
  // Added display name
  generateFormState.displayName = 'generateFormState';

  // Added display name
  generateFormState.displayName = 'generateFormState';

  // Added display name
  generateFormState.displayName = 'generateFormState';

  // Added display name
  generateFormState.displayName = 'generateFormState';

  const defaultValues = {
    name: '',
    description: '',
    status: 'active',
    type: 'standard'
  };
  
  const mergedValues = { ...defaultValues, ...values };
  
  return {
    values: mergedValues,
    initialValues: { ...defaultValues },
    dirty: JSON.stringify(defaultValues) !== JSON.stringify(mergedValues),
    touched: Object.keys(values).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {}),
    submitCount: 0
  };
};

/**
 * Generate modal dialog state
 * @param {string} type Dialog type ('confirmation', 'form', 'alert', 'custom')
 * @param {boolean} isOpen Whether dialog is open
 * @returns {Object} Dialog state
 */
export const generateDialogState = (type = 'confirmation', isOpen = false) => {
  // Added display name
  generateDialogState.displayName = 'generateDialogState';

  // Added display name
  generateDialogState.displayName = 'generateDialogState';

  // Added display name
  generateDialogState.displayName = 'generateDialogState';

  // Added display name
  generateDialogState.displayName = 'generateDialogState';

  let title, content, actions;
  
  switch (type) {
    case 'confirmation':
      title = 'Confirm Action';
      content = 'Are you sure you want to perform this action?';
      actions = [
        { label: 'Cancel', action: 'cancel', variant: 'secondary' },
        { label: 'Confirm', action: 'confirm', variant: 'primary' }
      ];
      break;
    case 'form':
      title = 'Edit Item';
      content = 'form';
      actions = [
        { label: 'Cancel', action: 'cancel', variant: 'secondary' },
        { label: 'Save', action: 'save', variant: 'primary' }
      ];
      break;
    case 'alert':
      title = 'Alert';
      content = 'Important information that requires your attention.';
      actions = [
        { label: 'OK', action: 'ok', variant: 'primary' }
      ];
      break;
    case 'custom':
    default:
      title = 'Custom Dialog';
      content = 'custom';
      actions = [
        { label: 'Close', action: 'close', variant: 'secondary' }
      ];
  }
  
  return {
    isOpen,
    type,
    title,
    content,
    actions,
    data: {},
    dismissible: true
  };
};

/**
 * Generate toast notification
 * @param {string} type Toast type ('success', 'error', 'info', 'warning')
 * @param {string} message Toast message
 * @returns {Object} Toast notification object
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

  const defaultMessages = {
    success: 'Operation completed successfully',
    error: 'An error occurred while processing your request',
    warning: 'Please review this warning',
    info: 'This is an informational message'
  };
  
  return {
    id: `toast-${Math.random().toString(36).substr(2, 9)}`,
    type,
    message: message || defaultMessages[type],
    autoClose: type !== 'error',
    duration: type === 'error' ? 8000 : 5000,
    timestamp: new Date().toISOString()
  };
};

/**
 * Generate list of toast notifications
 * @param {number} count Number of toasts to generate
 * @returns {Array} Array of toast notification objects
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

  const types = ['success', 'error', 'info', 'warning'];
  const toasts = [];
  
  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    toasts.push(generateToast(type, `Test ${type} notification ${i + 1}`));
  }
  
  return toasts;
};

/**
 * Generate theme configuration for testing
 * @param {string} mode Theme mode ('light' or 'dark')
 * @param {boolean} highContrast Whether high contrast mode is enabled
 * @returns {Object} Theme state
 */
export const generateThemeState = (mode = 'light', highContrast = false) => {
  // Added display name
  generateThemeState.displayName = 'generateThemeState';

  // Added display name
  generateThemeState.displayName = 'generateThemeState';

  // Added display name
  generateThemeState.displayName = 'generateThemeState';

  // Added display name
  generateThemeState.displayName = 'generateThemeState';

  return {
    mode,
    highContrast,
    fontSize: 'medium',
    animation: 'enabled',
    customColors: {},
    systemPreference: 'light'
  };
};

/**
 * Generate dashboard state for testing
 * @returns {Object} Dashboard state with widgets and metrics
 */
export const generateDashboardState = () => {
  // Added display name
  generateDashboardState.displayName = 'generateDashboardState';

  // Added display name
  generateDashboardState.displayName = 'generateDashboardState';

  // Added display name
  generateDashboardState.displayName = 'generateDashboardState';

  // Added display name
  generateDashboardState.displayName = 'generateDashboardState';

  return {
    widgets: [
      {
        id: 'widget-1',
        type: 'chart',
        title: 'Integration Executions',
        data: {
          type: 'line',
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [
            {
              label: 'Successful',
              data: [65, 78, 90, 81, 86],
              backgroundColor: '#4CAF50'
            },
            {
              label: 'Failed',
              data: [12, 8, 5, 7, 3],
              backgroundColor: '#F44336'
            }
          ]
        },
        position: { x: 0, y: 0, w: 6, h: 2 }
      },
      {
        id: 'widget-2',
        type: 'metric',
        title: 'Active Integrations',
        value: 24,
        change: 2,
        changeType: 'increase',
        position: { x: 6, y: 0, w: 3, h: 1 }
      },
      {
        id: 'widget-3',
        type: 'metric',
        title: 'Connected Applications',
        value: 15,
        change: 0,
        changeType: 'neutral',
        position: { x: 9, y: 0, w: 3, h: 1 }
      },
      {
        id: 'widget-4',
        type: 'table',
        title: 'Recent Executions',
        data: {
          headers: ['Integration', 'Status', 'Duration', 'Time'],
          rows: [
            ['Sales Data Sync', 'Success', '45s', '5 mins ago'],
            ['Customer Import', 'Failed', '12s', '10 mins ago'],
            ['Inventory Update', 'Success', '120s', '25 mins ago']
          ]
        },
        position: { x: 6, y: 1, w: 6, h: 2 }
      }
    ],
    metrics: {
      integrationSuccess: 92,
      dataProcessed: '2.4 GB',
      activeUsers: 18,
      apiCalls: 12045
    },
    layout: 'grid',
    isCustomizing: false
  };
};