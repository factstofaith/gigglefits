/**
 * Configuration for the notification system
 */

export const NOTIFICATION_CONFIG = {
  // Toast notifications
  toast: {
    // Default duration in milliseconds
    defaultDuration: 5000,

    // Maximum number of toasts to show at once
    maxCount: 3,

    // Toast position
    position: {
      vertical: 'top',
      horizontal: 'right',
    },

    // Toast z-index
    zIndex: 2000,

    // Animation duration in milliseconds
    animationDuration: 300,
  },

  // Notification center
  notificationCenter: {
    // Maximum number of notifications to show in the list
    maxVisibleCount: 10,

    // Maximum number of notifications to store in memory
    maxStoredCount: 50,

    // Whether to persist notifications to localStorage
    persistNotifications: true,

    // Local storage key for persisted notifications
    storageKey: 'tap_platform_notifications',

    // Whether to group similar notifications
    groupSimilar: true,

    // Maximum age of notifications in days (older notifications will be removed)
    maxAge: 30,
  },

  // Web notifications (browser notifications)
  webNotifications: {
    // Whether to enable web notifications
    enabled: true,

    // Application name for web notifications
    appName: 'TAP Integration Platform',

    // Default icon for web notifications
    defaultIcon: '/favicon.ico',

    // Types of notifications to show as web notifications
    typesToShow: ['error', 'warning'],
  },

  // Analytics
  analytics: {
    // Whether to track notification interactions
    trackInteractions: true,

    // Types of events to track
    eventsToTrack: ['show', 'click', 'dismiss', 'action'],
  },

  // Email notifications
  email: {
    // Whether to enable email fallback for critical notifications
    enabled: false,

    // Types of notifications to send via email
    typesToSend: ['error'],

    // Minimum severity level for email notifications (1-5)
    minimumSeverity: 3,
  },
};
