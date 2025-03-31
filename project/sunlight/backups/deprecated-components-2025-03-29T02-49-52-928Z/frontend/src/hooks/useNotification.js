/**
 * useNotification.js
 * -----------------------------------------------------------------------------
 * Custom React hook for accessing the notification context throughout the application.
 * Provides methods for creating, managing, and displaying notifications and toasts.
 * 
 * @module hooks/useNotification
 */

import { useContext } from 'react';
import NotificationContext from '@contexts/NotificationContext';

/**
 * Custom hook that provides access to notification functionality
 * This hook connects to the NotificationContext and provides a convenient
 * interface for displaying toast notifications and managing persistent notifications.
 * 
 * @function
 * @returns {Object} Notification context methods and state
 * @property {Function} showToast - Function to show a temporary toast notification
 * @property {Function} addNotification - Function to add a persistent notification
 * @property {Function} updateNotification - Function to update an existing notification
 * @property {Function} removeNotification - Function to remove a notification
 * @property {Function} markAllAsRead - Function to mark all notifications as read
 * @property {Function} clearAllNotifications - Function to clear all notifications
 * @property {Function} toggleNotificationCenter - Function to toggle the notification center visibility
 * @property {Array} notifications - Array of current persistent notifications
 * @property {Array} toasts - Array of current toast notifications
 * 
 * @example
 * // Basic usage
 * import { useNotification } from './/useNotification';
 * 
 * function MyComponent() {
  // Added display name
  MyComponent.displayName = 'MyComponent';

 *   const { showToast, addNotification } = useNotification();
 *   
 *   const handleSuccess = () => {
  // Added display name
  handleSuccess.displayName = 'handleSuccess';

  // Added display name
  handleSuccess.displayName = 'handleSuccess';

  // Added display name
  handleSuccess.displayName = 'handleSuccess';

  // Added display name
  handleSuccess.displayName = 'handleSuccess';

  // Added display name
  handleSuccess.displayName = 'handleSuccess';


 *     showToast('Operation completed successfully', 'success');
 *   };
 *   
 *   const handleError = () => {
  // Added display name
  handleError.displayName = 'handleError';

  // Added display name
  handleError.displayName = 'handleError';

  // Added display name
  handleError.displayName = 'handleError';

  // Added display name
  handleError.displayName = 'handleError';

  // Added display name
  handleError.displayName = 'handleError';


 *     showToast('An error occurred', 'error', { 
 *       duration: 5000,
 *       title: 'Error'
 *     });
 *   };
 *   
 *   const createPersistentNotification = () => {
  // Added display name
  createPersistentNotification.displayName = 'createPersistentNotification';

  // Added display name
  createPersistentNotification.displayName = 'createPersistentNotification';

  // Added display name
  createPersistentNotification.displayName = 'createPersistentNotification';

  // Added display name
  createPersistentNotification.displayName = 'createPersistentNotification';

  // Added display name
  createPersistentNotification.displayName = 'createPersistentNotification';


 *     addNotification({
 *       title: 'New Message',
 *       message: 'You have a new message from John',
 *       type: 'info',
 *       actionLabel: 'View',
 *       onActionClick: () => navigate('/messages')
 *     });
 *   };
 *   
 *   return (
 *     <div>
 *       <button onClick={handleSuccess}>Show Success</button>
 *       <button onClick={handleError}>Show Error</button>
 *       <button onClick={createPersistentNotification}>Add Notification</button>
 *     </div>
 *   );
 * }
 */
export const useNotification = () => {
  // Added display name
  useNotification.displayName = 'useNotification';

  // Added display name
  useNotification.displayName = 'useNotification';

  // Added display name
  useNotification.displayName = 'useNotification';

  // Added display name
  useNotification.displayName = 'useNotification';

  // Added display name
  useNotification.displayName = 'useNotification';


  const context = useContext(NotificationContext);

  if (!context) {
    console.warn('useNotification: NotificationContext not found in React context');
    // Return stub methods to avoid errors
    return {
      /**
       * Show a toast notification (stub)
       * @param {string} message - Notification message
       * @param {string} type - Notification type
       * @param {Object} options - Additional options
       */
      showToast: () => {},
      
      /**
       * Add a persistent notification (stub)
       * @param {Object} notification - Notification details
       * @returns {string|undefined} Notification ID
       */
      addNotification: () => {},
      
      /**
       * Update an existing notification (stub)
       * @param {string} id - Notification ID
       * @param {Object} updates - Properties to update
       */
      updateNotification: () => {},
      
      /**
       * Remove a notification (stub)
       * @param {string} id - Notification ID
       */
      removeNotification: () => {},
      
      /**
       * Mark all notifications as read (stub)
       */
      markAllAsRead: () => {},
      
      /**
       * Clear all notifications (stub)
       */
      clearAllNotifications: () => {},
      
      /**
       * Toggle notification center visibility (stub)
       */
      toggleNotificationCenter: () => {},
      
      /** @type {Array} Empty notifications array */
      notifications: [],
      
      /** @type {Array} Empty toasts array */
      toasts: [],
    };
  }

  return context;
};

// Only export once to avoid duplication
export default useNotification;