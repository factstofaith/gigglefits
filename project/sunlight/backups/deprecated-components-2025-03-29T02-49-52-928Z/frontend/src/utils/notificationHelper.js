/**
 * notificationHelper.js
 * -----------------------------------------------------------------------------
 * Utilities for managing notifications throughout the application from any context.
 * This module provides a global notification system accessible outside of React
 * components, such as in service or utility functions.
 * 
 * @module utils/notificationHelper
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Global notification store singleton that maintains a reference to the 
 * notification context and provides methods to interact with it
 * 
 * @type {Object}
 * @property {Object|null} contextRef - Reference to the notification context
 */
let notificationStore = {
  // Reference to the context - set during initialization
  contextRef: null,

  /**
   * Initialize the store with the notification context
   * 
   * @param {Object} context - The NotificationContext instance
   * @returns {Object} The notification store instance for chaining
   */
  init(context) {
    this.contextRef = context;
    return this;
  },

  /**
   * Get access to the context functions
   * 
   * @returns {Object|null} The notification context or null if not initialized
   */
  getContext() {
    if (!this.contextRef) {
      console.error('NotificationHelper: context not initialized');
      return null;
    }
    return this.contextRef;
  },

  /**
   * Show a toast notification
   * 
   * @param {string} message - The notification message
   * @param {string} [type='info'] - The notification type ('info', 'success', 'warning', 'error')
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.title] - Notification title
   * @param {number} [options.duration] - Duration in milliseconds
   * @param {Function} [options.onClose] - Callback when the toast is closed
   */
  showToast(message, type = 'info', options = {}) {
    const context = this.getContext();
    if (!context) return;

    context.showToast(message, type, options);
  },

  /**
   * Add a persistent notification to the notification center
   * 
   * @param {Object} notification - The notification object
   * @param {string} [notification.id] - Unique identifier (auto-generated if not provided)
   * @param {string} [notification.title] - Notification title
   * @param {string} notification.message - Notification message
   * @param {string} [notification.type='info'] - Notification type ('info', 'success', 'warning', 'error')
   * @param {string} [notification.timestamp] - ISO timestamp (current time if not provided)
   * @param {boolean} [notification.read=false] - Whether the notification has been read
   * @param {string} [notification.actionLabel] - Label for the action button
   * @param {Function} [notification.onActionClick] - Callback when action button is clicked
   * @returns {string} The notification ID
   */
  addNotification(notification) {
    const context = this.getContext();
    if (!context) return;

    // Create a complete notification object
    const completeNotification = {
      id: notification.id || uuidv4(),
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'info',
      timestamp: notification.timestamp || new Date().toISOString(),
      read: notification.read || false,
      actionLabel: notification.actionLabel || null,
      onActionClick: notification.onActionClick || null,
      ...notification,
    };

    context.addNotification(completeNotification);
    return completeNotification.id;
  },

  /**
   * Update an existing notification
   * 
   * @param {string} id - The notification ID
   * @param {Object} updates - The properties to update
   */
  updateNotification(id, updates) {
    const context = this.getContext();
    if (!context) return;

    context.updateNotification(id, updates);
  },

  /**
   * Remove a notification
   * 
   * @param {string} id - The notification ID
   */
  removeNotification(id) {
    const context = this.getContext();
    if (!context) return;

    context.removeNotification(id);
  },

  /**
   * Mark a notification as read
   * 
   * @param {string} id - The notification ID
   */
  markAsRead(id) {
    const context = this.getContext();
    if (!context) return;

    context.updateNotification(id, { read: true });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    const context = this.getContext();
    if (!context) return;

    context.markAllAsRead();
  },

  /**
   * Clear all notifications
   */
  clearAllNotifications() {
    const context = this.getContext();
    if (!context) return;

    context.clearAllNotifications();
  },
};

/**
 * Creates a notification manager instance with access to the global notification store
 * This allows clean access to notification functions from any part of the application
 * 
 * @function
 * @returns {Object} Notification manager instance
 */
export const createNotificationManager = () => {
  // Added display name
  createNotificationManager.displayName = 'createNotificationManager';

  // Added display name
  createNotificationManager.displayName = 'createNotificationManager';

  // Added display name
  createNotificationManager.displayName = 'createNotificationManager';

  // Added display name
  createNotificationManager.displayName = 'createNotificationManager';

  // Added display name
  createNotificationManager.displayName = 'createNotificationManager';


  return {
    /**
     * Show a toast notification
     * 
     * @param {string} message - The notification message
     * @param {string} [type='info'] - The notification type ('info', 'success', 'warning', 'error')
     * @param {Object} [options={}] - Additional options
     * @param {string} [options.title] - Notification title
     * @param {number} [options.duration] - Duration in milliseconds
     * @param {Function} [options.onClose] - Callback when the toast is closed
     */
    showToast(message, type = 'info', options = {}) {
      notificationStore.showToast(message, type, options);
    },

    /**
     * Add a persistent notification to the notification center
     * 
     * @param {Object} notification - The notification object
     * @param {string} [notification.id] - Unique identifier (auto-generated if not provided)
     * @param {string} [notification.title] - Notification title
     * @param {string} notification.message - Notification message
     * @param {string} [notification.type='info'] - Notification type ('info', 'success', 'warning', 'error')
     * @param {string} [notification.timestamp] - ISO timestamp (current time if not provided)
     * @param {boolean} [notification.read=false] - Whether the notification has been read
     * @param {string} [notification.actionLabel] - Label for the action button
     * @param {Function} [notification.onActionClick] - Callback when action button is clicked
     * @returns {string} The notification ID
     */
    addNotification(notification) {
      return notificationStore.addNotification(notification);
    },

    /**
     * Update an existing notification
     * 
     * @param {string} id - The notification ID
     * @param {Object} updates - The properties to update
     */
    updateNotification(id, updates) {
      notificationStore.updateNotification(id, updates);
    },

    /**
     * Remove a notification
     * 
     * @param {string} id - The notification ID
     */
    removeNotification(id) {
      notificationStore.removeNotification(id);
    },

    /**
     * Mark a notification as read
     * 
     * @param {string} id - The notification ID
     */
    markAsRead(id) {
      notificationStore.markAsRead(id);
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead() {
      notificationStore.markAllAsRead();
    },

    /**
     * Clear all notifications
     */
    clearAllNotifications() {
      notificationStore.clearAllNotifications();
    },
  };
};

/**
 * Initialize the notification helper with the notification context
 * This should be called when the NotificationContext is mounted
 * 
 * @function
 * @param {Object} context - The NotificationContext instance
 */
export const initNotificationHelper = context => {
  notificationStore.init(context);
};

export default notificationStore;