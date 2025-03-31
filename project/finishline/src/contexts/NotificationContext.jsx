/**
 * NotificationContext
 * 
 * Context provider for application-wide notifications.
 * 
 * @module contexts/NotificationContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

// Unique ID generator for notifications
const generateId = () => `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Create the context
const NotificationContext = createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearAllNotifications: () => {},
});

/**
 * Notification Provider Component
 * 
 * @param {Object} props - Component props
 * @param {node} props.children - Child components
 * @param {number} [props.maxNotifications=5] - Maximum number of notifications to show at once
 * @param {number} [props.autoHideDuration=5000] - Default auto-hide duration in milliseconds
 * @returns {JSX.Element} Notification provider
 */
export function NotificationProvider({ 
  children, 
  maxNotifications = 5, 
  autoHideDuration = 5000 
}) {
  // State for notifications
  const [notifications, setNotifications] = useState([]);
  
  // Add a new notification
  const addNotification = useCallback((notification) => {
    const id = notification.id || generateId();
    const autoHide = notification.autoHide !== false;
    const duration = notification.duration || autoHideDuration;
    
    setNotifications(prevNotifications => {
      // Create new notification with defaults
      const newNotification = {
        id,
        message: notification.message || '',
        type: notification.type || 'info',
        autoHide,
        duration,
        createdAt: Date.now(),
        ...notification,
      };
      
      // Add to existing notifications, limiting to maxNotifications
      return [...prevNotifications, newNotification].slice(-maxNotifications);
    });
    
    // Return the notification ID for potential manual removal
    return id;
  }, [autoHideDuration, maxNotifications]);
  
  // Remove a notification by ID
  const removeNotification = useCallback((id) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Auto-hide notifications after their duration
  useEffect(() => {
    const timers = [];
    
    notifications.forEach(notification => {
      if (notification.autoHide) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        
        timers.push(timer);
      }
    });
    
    // Clean up timers on unmount or when notifications change
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);
  
  // Value object for the context
  const contextValue = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  }), [notifications, addNotification, removeNotification, clearAllNotifications]);
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 * 
 * @returns {Object} Notification context value
 */
export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  // Helper functions for common notification types
  const notify = {
    success: (message, options = {}) => context.addNotification({ message, type: 'success', ...options }),
    error: (message, options = {}) => context.addNotification({ message, type: 'error', ...options }),
    warning: (message, options = {}) => context.addNotification({ message, type: 'warning', ...options }),
    info: (message, options = {}) => context.addNotification({ message, type: 'info', ...options }),
  };
  
  return {
    ...context,
    notify,
  };
}

NotificationProvider.propTypes = {
  /** Child components */
  children: PropTypes.node.isRequired,
  
  /** Maximum number of notifications to show at once */
  maxNotifications: PropTypes.number,
  
  /** Default auto-hide duration in milliseconds */
  autoHideDuration: PropTypes.number,
};

export default NotificationContext;