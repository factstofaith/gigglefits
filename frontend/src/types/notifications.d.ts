/**
 * Type definitions for the notification system
 */

/**
 * Notification types
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Base notification properties
 */
export interface BaseNotification {
  /**
   * Unique identifier for the notification
   */
  id?: string;
  
  /**
   * Notification title (optional for toasts)
   */
  title?: string;
  
  /**
   * Primary notification message
   */
  message: string;
  
  /**
   * Type of notification for styling and icon selection
   */
  type: NotificationType;
  
  /**
   * ISO timestamp of when the notification was created
   */
  timestamp?: string;
  
  /**
   * Whether the notification has been read (only for persistent notifications)
   */
  read?: boolean;
}

/**
 * Toast notification properties
 */
export interface ToastNotification extends BaseNotification {
  /**
   * Whether this is a temporary toast notification
   */
  temporary: true;
  
  /**
   * Duration in milliseconds before auto-dismissing (default: 5000)
   */
  duration?: number;
  
  /**
   * Optional action component to display in the toast
   */
  action?: React.ReactNode;
}

/**
 * Persistent notification properties
 */
export interface PersistentNotification extends BaseNotification {
  /**
   * Label for the action button
   */
  actionLabel?: string;
  
  /**
   * Function to call when the action button is clicked
   */
  onActionClick?: () => void;
}

/**
 * Union type for all notification types
 */
export type Notification = ToastNotification | PersistentNotification;

/**
 * Toast notification options
 */
export interface ToastOptions {
  /**
   * Optional title for the toast
   */
  title?: string;
  
  /**
   * Duration in milliseconds before auto-dismissing (default: 5000)
   */
  duration?: number;
  
  /**
   * Optional action component to display in the toast
   */
  action?: React.ReactNode;
}

/**
 * Notification context value type
 */
export interface NotificationContextValue {
  /**
   * All persistent notifications
   */
  notifications: PersistentNotification[];
  
  /**
   * Currently displayed toast notifications
   */
  toasts: ToastNotification[];
  
  /**
   * Count of unread notifications
   */
  unreadCount: number;
  
  /**
   * Add a notification (toast or persistent)
   */
  addNotification: (notification: Partial<Notification>) => string | null;
  
  /**
   * Show a toast notification
   */
  showToast: (message: string, type?: NotificationType, options?: ToastOptions) => string | null;
  
  /**
   * Remove a notification by ID
   */
  removeNotification: (id: string, isToast?: boolean) => void;
  
  /**
   * Mark a notification as read
   */
  markAsRead: (id: string) => void;
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => void;
  
  /**
   * Clear all notifications
   */
  clearAll: () => void;
}