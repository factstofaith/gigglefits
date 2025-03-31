/**
 * useNotification Hook
 * 
 * Custom hook for showing notifications using the NotificationContext.
 * 
 * @module hooks/useNotification
 */

import { useCallback } from 'react';
import { useNotification as useNotificationContext } from '../contexts/NotificationContext';

/**
 * Types of notifications
 * @typedef {'success' | 'error' | 'warning' | 'info'} NotificationType
 */

/**
 * Hook for managing notifications
 * 
 * @returns {Object} Methods for managing notifications
 */
function useNotification() {
  const { addNotification, removeNotification, clearNotifications } = useNotificationContext();
  
  /**
   * Show a success notification
   * 
   * @param {string} message - The notification message
   * @param {Object} [options] - Additional options
   * @param {number} [options.duration=5000] - Duration in ms
   * @param {string} [options.title='Success'] - Title of the notification
   * @param {boolean} [options.dismissible=true] - Whether notification can be dismissed
   * @returns {string} ID of the created notification
   */
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      title: options.title || 'Success',
      duration: options.duration ?? 5000,
      dismissible: options.dismissible ?? true,
      ...options,
    });
  }, [addNotification]);
  
  /**
   * Show an error notification
   * 
   * @param {string} message - The notification message
   * @param {Object} [options] - Additional options
   * @param {number} [options.duration=null] - Duration in ms (null = no auto-dismiss)
   * @param {string} [options.title='Error'] - Title of the notification
   * @param {boolean} [options.dismissible=true] - Whether notification can be dismissed
   * @returns {string} ID of the created notification
   */
  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      title: options.title || 'Error',
      duration: options.duration ?? null, // Errors don't auto-dismiss by default
      dismissible: options.dismissible ?? true,
      ...options,
    });
  }, [addNotification]);
  
  /**
   * Show a warning notification
   * 
   * @param {string} message - The notification message
   * @param {Object} [options] - Additional options
   * @param {number} [options.duration=7000] - Duration in ms
   * @param {string} [options.title='Warning'] - Title of the notification
   * @param {boolean} [options.dismissible=true] - Whether notification can be dismissed
   * @returns {string} ID of the created notification
   */
  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      title: options.title || 'Warning',
      duration: options.duration ?? 7000,
      dismissible: options.dismissible ?? true,
      ...options,
    });
  }, [addNotification]);
  
  /**
   * Show an info notification
   * 
   * @param {string} message - The notification message
   * @param {Object} [options] - Additional options
   * @param {number} [options.duration=5000] - Duration in ms
   * @param {string} [options.title='Information'] - Title of the notification
   * @param {boolean} [options.dismissible=true] - Whether notification can be dismissed
   * @returns {string} ID of the created notification
   */
  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      title: options.title || 'Information',
      duration: options.duration ?? 5000,
      dismissible: options.dismissible ?? true,
      ...options,
    });
  }, [addNotification]);
  
  /**
   * Show a custom notification
   * 
   * @param {Object} notification - Notification configuration
   * @param {NotificationType} notification.type - Type of notification
   * @param {string} notification.message - Notification message
   * @param {string} [notification.title] - Title of the notification
   * @param {number} [notification.duration] - Duration in ms
   * @param {boolean} [notification.dismissible] - Whether notification can be dismissed
   * @param {Object} [notification.action] - Action button configuration
   * @param {string} notification.action.label - Action button label
   * @param {Function} notification.action.onClick - Action button click handler
   * @returns {string} ID of the created notification
   */
  const showCustom = useCallback((notification) => {
    return addNotification(notification);
  }, [addNotification]);
  
  /**
   * Dismiss a specific notification
   * 
   * @param {string} id - ID of the notification to dismiss
   */
  const dismiss = useCallback((id) => {
    removeNotification(id);
  }, [removeNotification]);
  
  /**
   * Dismiss all notifications
   */
  const dismissAll = useCallback(() => {
    clearNotifications();
  }, [clearNotifications]);
  
  /**
   * Create a promise notification that updates based on promise resolution
   * 
   * @param {Promise} promise - The promise to track
   * @param {Object} messages - Messages for different states
   * @param {string} messages.pending - Message while pending
   * @param {string|Function} messages.success - Message or function when resolved
   * @param {string|Function} messages.error - Message or function when rejected
   * @param {Object} [options] - Additional options
   * @returns {Promise} The original promise
   */
  const promise = useCallback((promise, messages, options = {}) => {
    if (!promise || typeof promise.then !== 'function') {
      throw new Error('First argument must be a promise');
    }
    
    const id = addNotification({
      type: 'info',
      message: messages.pending,
      title: options.title || 'Loading',
      dismissible: false,
      ...options,
      duration: null, // Don't auto-dismiss while pending
    });
    
    promise.then(
      (result) => {
        // Handle success
        const successMessage = typeof messages.success === 'function'
          ? messages.success(result)
          : messages.success;
          
        removeNotification(id);
        showSuccess(successMessage, {
          title: options.successTitle || 'Success',
          ...options,
        });
        
        return result;
      },
      (error) => {
        // Handle error
        const errorMessage = typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error || error.message || 'An error occurred';
          
        removeNotification(id);
        showError(errorMessage, {
          title: options.errorTitle || 'Error',
          ...options,
        });
        
        throw error;
      }
    );
    
    return promise;
  }, [addNotification, removeNotification, showSuccess, showError]);
  
  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom,
    dismiss,
    dismissAll,
    promise,
  };
}

export default useNotification;