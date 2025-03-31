/**
 * NotificationContext.jsx
 * -----------------------------------------------------------------------------
 * Context provider for managing notifications across the application.
 * Provides a centralized system for toast notifications, persistent notifications,
 * and user notification preferences.
 * 
 * @module contexts/NotificationContext
 */

import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initNotificationHelper } from '@utils/notificationHelper';

/**
 * Initial state for the notification context
 * @type {Object}
 */
const initialState = {
  // Array of persistent notifications
  notifications: [],

  // Transient toast notifications
  toasts: [],

  // User preferences
  preferences: {
    desktopNotifications: false,
    emailNotifications: false,
    notificationSound: true,
  },

  // Notification center state
  notificationCenter: {
    unreadCount: 0,
    isOpen: false,
  },
};

/**
 * Action types for the notification reducer
 * @type {Object}
 */
const ACTION_TYPES = {
  SHOW_TOAST: 'SHOW_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_ALL_READ: 'MARK_ALL_READ',
  CLEAR_ALL: 'CLEAR_ALL',
  TOGGLE_NOTIFICATION_CENTER: 'TOGGLE_NOTIFICATION_CENTER',
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
};

/**
 * Reducer function to handle notification state updates
 * 
 * @function
 * @param {Object} state - Current notification state
 * @param {Object} action - Dispatched action object
 * @param {string} action.type - Action type from ACTION_TYPES
 * @param {*} action.payload - Action payload
 * @returns {Object} Updated notification state
 */
const notificationReducer = (state, action) => {
  // Added display name
  notificationReducer.displayName = 'notificationReducer';

  // Added display name
  notificationReducer.displayName = 'notificationReducer';

  // Added display name
  notificationReducer.displayName = 'notificationReducer';

  // Added display name
  notificationReducer.displayName = 'notificationReducer';

  // Added display name
  notificationReducer.displayName = 'notificationReducer';


  switch (action.type) {
    // Add a new toast notification
    case ACTION_TYPES.SHOW_TOAST:
      const newToast = {
        id: action.payload.id || uuidv4(),
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 5000,
        title: action.payload.title || '',
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        toasts: [...state.toasts, newToast],
      };

    // Remove a toast by ID
    case ACTION_TYPES.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload),
      };

    // Add a persistent notification
    case ACTION_TYPES.ADD_NOTIFICATION:
      const unreadCountIncrease = action.payload.read ? 0 : 1;
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        notificationCenter: {
          ...state.notificationCenter,
          unreadCount: state.notificationCenter.unreadCount + unreadCountIncrease,
        },
      };

    // Update an existing notification
    case ACTION_TYPES.UPDATE_NOTIFICATION:
      const { id, updates } = action.payload;
      let unreadChange = 0;

      const updatedNotifications = state.notifications.map(notification => {
        if (notification.id === id) {
          // If the notification was previously unread and is now marked as read
          if (!notification.read && updates.read) {
            unreadChange = -1;
          }
          // If the notification was previously read and is now marked as unread
          else if (notification.read && updates.read === false) {
            unreadChange = 1;
          }

          return { ...notification, ...updates };
        }
        return notification;
      });

      return {
        ...state,
        notifications: updatedNotifications,
        notificationCenter: {
          ...state.notificationCenter,
          unreadCount: Math.max(0, state.notificationCenter.unreadCount + unreadChange),
        },
      };

    // Remove a notification by ID
    case ACTION_TYPES.REMOVE_NOTIFICATION:
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      const unreadDecrease = notificationToRemove && !notificationToRemove.read ? 1 : 0;

      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        notificationCenter: {
          ...state.notificationCenter,
          unreadCount: Math.max(0, state.notificationCenter.unreadCount - unreadDecrease),
        },
      };

    // Mark all notifications as read
    case ACTION_TYPES.MARK_ALL_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true,
        })),
        notificationCenter: {
          ...state.notificationCenter,
          unreadCount: 0,
        },
      };

    // Clear all notifications
    case ACTION_TYPES.CLEAR_ALL:
      return {
        ...state,
        notifications: [],
        notificationCenter: {
          ...state.notificationCenter,
          unreadCount: 0,
        },
      };

    // Toggle notification center visibility
    case ACTION_TYPES.TOGGLE_NOTIFICATION_CENTER:
      return {
        ...state,
        notificationCenter: {
          ...state.notificationCenter,
          isOpen: action.payload !== undefined ? action.payload : !state.notificationCenter.isOpen,
        },
      };

    // Update notification preferences
    case ACTION_TYPES.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
      };

    default:
      return state;
  }
};

/**
 * NotificationContext for sharing notification state across components
 * @type {React.Context}
 */
export const NotificationContext = createContext();

/**
 * NotificationProvider component for managing notification state
 * This provides a centralized system for toast notifications, persistent
 * notifications, and notification preferences throughout the application.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 * 
 * @example
 * // Usage in application root
 * function App() {
  // Added display name
  App.displayName = 'App';

 *   return (
 *     <NotificationProvider>
 *       <Router>
 *         <AppRoutes />
 *       </Router>
 *       <ToastContainer /> // Component to display toast notifications
 *       <NotificationCenter /> // Component to display persistent notifications
 *     </NotificationProvider>
 *   );
 * }
 */
export const NotificationProvider = ({ children }) => {
  // Added display name
  NotificationProvider.displayName = 'NotificationProvider';

  // Added display name
  NotificationProvider.displayName = 'NotificationProvider';

  // Added display name
  NotificationProvider.displayName = 'NotificationProvider';

  // Added display name
  NotificationProvider.displayName = 'NotificationProvider';

  // Added display name
  NotificationProvider.displayName = 'NotificationProvider';


  const [state, dispatch] = useReducer(notificationReducer, initialState);

  /**
   * Show a toast notification
   * 
   * @function
   * @param {string} message - Notification message
   * @param {string} [type='info'] - Notification type ('info', 'success', 'warning', 'error')
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.title] - Toast title
   * @param {number} [options.duration=5000] - Duration in milliseconds
   * @param {Function} [options.onClose] - Callback when toast is closed
   * @returns {string} Toast ID
   */
  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = uuidv4();

    dispatch({
      type: ACTION_TYPES.SHOW_TOAST,
      payload: {
        id,
        message,
        type,
        ...options,
      },
    });

    // Automatically remove the toast after duration
    const duration = options.duration || 5000;
    setTimeout(() => {
      dispatch({
        type: ACTION_TYPES.REMOVE_TOAST,
        payload: id,
      });
    }, duration);

    return id;
  }, []);

  /**
   * Remove a toast notification
   * 
   * @function
   * @param {string} id - Toast ID to remove
   */
  const removeToast = useCallback(id => {
  // Added display name
  removeToast.displayName = 'removeToast';

    dispatch({
      type: ACTION_TYPES.REMOVE_TOAST,
      payload: id,
    });
  }, []);

  /**
   * Add a persistent notification to the notification center
   * 
   * @function
   * @param {Object} notification - Notification object
   * @param {string} [notification.id] - Notification ID (auto-generated if not provided)
   * @param {string} [notification.title] - Notification title
   * @param {string} notification.message - Notification message
   * @param {string} [notification.type='info'] - Notification type ('info', 'success', 'warning', 'error')
   * @param {string} [notification.timestamp] - ISO timestamp (current time if not provided)
   * @param {boolean} [notification.read=false] - Whether the notification has been read
   * @param {string} [notification.actionLabel] - Label for the action button
   * @param {Function} [notification.onActionClick] - Callback when action button is clicked
   * @returns {string} Notification ID
   */
  const addNotification = useCallback(
    notification => {
  // Added display name
  addNotification.displayName = 'addNotification';

      const id = notification.id || uuidv4();

      dispatch({
        type: ACTION_TYPES.ADD_NOTIFICATION,
        payload: {
          id,
          title: notification.title || '',
          message: notification.message || '',
          type: notification.type || 'info',
          timestamp: notification.timestamp || new Date().toISOString(),
          read: notification.read || false,
          actionLabel: notification.actionLabel || null,
          onActionClick: notification.onActionClick || null,
          ...notification,
        },
      });

      // If desktop notifications are enabled and notification is not read, show a desktop notification
      if (
        state.preferences.desktopNotifications &&
        Notification.permission === 'granted' &&
        !notification.read
      ) {
        try {
          // eslint-disable-next-line no-new
          new Notification(notification.title || 'New Notification', {
            body: notification.message || '',
            icon: '/favicon.ico',
          });
        } catch (error) {
          console.error('Failed to show desktop notification:', error);
        }
      }

      return id;
    },
    [state.preferences.desktopNotifications]
  );

  /**
   * Update an existing notification
   * 
   * @function
   * @param {string} id - Notification ID
   * @param {Object} updates - Properties to update
   */
  const updateNotification = useCallback((id, updates) => {
  // Added display name
  updateNotification.displayName = 'updateNotification';

    dispatch({
      type: ACTION_TYPES.UPDATE_NOTIFICATION,
      payload: {
        id,
        updates,
      },
    });
  }, []);

  /**
   * Remove a notification
   * 
   * @function
   * @param {string} id - Notification ID
   */
  const removeNotification = useCallback(id => {
  // Added display name
  removeNotification.displayName = 'removeNotification';

    dispatch({
      type: ACTION_TYPES.REMOVE_NOTIFICATION,
      payload: id,
    });
  }, []);

  /**
   * Mark all notifications as read
   * 
   * @function
   */
  const markAllAsRead = useCallback(() => {
  // Added display name
  markAllAsRead.displayName = 'markAllAsRead';

    dispatch({
      type: ACTION_TYPES.MARK_ALL_READ,
    });
  }, []);

  /**
   * Clear all notifications
   * 
   * @function
   */
  const clearAllNotifications = useCallback(() => {
  // Added display name
  clearAllNotifications.displayName = 'clearAllNotifications';

    dispatch({
      type: ACTION_TYPES.CLEAR_ALL,
    });
  }, []);

  /**
   * Toggle notification center visibility
   * 
   * @function
   * @param {boolean} [isOpen] - Explicitly set open state (toggles if not provided)
   */
  const toggleNotificationCenter = useCallback(isOpen => {
  // Added display name
  toggleNotificationCenter.displayName = 'toggleNotificationCenter';

    dispatch({
      type: ACTION_TYPES.TOGGLE_NOTIFICATION_CENTER,
      payload: isOpen,
    });
  }, []);

  /**
   * Update notification preferences
   * 
   * @function
   * @param {Object} preferences - Updated preferences
   * @param {boolean} [preferences.desktopNotifications] - Enable desktop notifications
   * @param {boolean} [preferences.emailNotifications] - Enable email notifications
   * @param {boolean} [preferences.notificationSound] - Enable notification sounds
   */
  const updatePreferences = useCallback(preferences => {
  // Added display name
  updatePreferences.displayName = 'updatePreferences';

    dispatch({
      type: ACTION_TYPES.UPDATE_PREFERENCES,
      payload: preferences,
    });

    // If enabling desktop notifications, request permission
    if (
      preferences.desktopNotifications &&
      Notification.permission !== 'granted' &&
      Notification.permission !== 'denied'
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Initialize the notification helper singleton with the context methods
  useEffect(() => {
    initNotificationHelper({
      showToast,
      addNotification,
      updateNotification,
      removeNotification,
      markAllAsRead,
      clearAllNotifications,
    });
  }, [
    showToast,
    addNotification,
    updateNotification,
    removeNotification,
    markAllAsRead,
    clearAllNotifications,
  ]);

  /**
   * Context value provided to consumers
   * @type {Object}
   */
  const contextValue = {
    // State
    notifications: state.notifications,
    toasts: state.toasts,
    preferences: state.preferences,
    notificationCenter: state.notificationCenter,

    // Methods
    showToast,
    removeToast,
    addNotification,
    updateNotification,
    removeNotification,
    markAllAsRead,
    clearAllNotifications,
    toggleNotificationCenter,
    updatePreferences,
  };

  return (
    <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>
  );
};

// Export the context as default - the useNotification hook imports this context directly
export default NotificationContext;