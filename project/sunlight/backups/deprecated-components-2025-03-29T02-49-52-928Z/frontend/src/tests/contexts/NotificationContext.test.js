/**
 * NotificationContext.test.js - Tests for the notification context provider
 * Using the MockFactory pattern for test data consistency.
 * 
 * @author TAP Integration Platform Team
 */

import React, { useContext } from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { NotificationProvider, NotificationContext } from '@contexts/NotificationContext';
import { initNotificationHelper, createNotificationManager } from '@utils/notificationHelper';
import mockFactory from '../utils/mockFactory';

// Mock UUID for consistent IDs in tests
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

// Mock notification helper
jest.mock('../../utils/notificationHelper', () => ({
  initNotificationHelper: jest.fn(),
  createNotificationManager: jest.fn().mockReturnValue({
    showToast: jest.fn(),
    addNotification: jest.fn(),
    updateNotification: jest.fn(),
    removeNotification: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    clearAllNotifications: jest.fn(),
  }),
}));

// Mock Notification API
global.Notification = jest.fn();
global.Notification.permission = 'granted';
global.Notification.requestPermission = jest.fn(() => Promise.resolve('granted'));

// Enhanced test component that provides more visibility into context state
const EnhancedTestComponent = () => {
  // Added display name
  EnhancedTestComponent.displayName = 'EnhancedTestComponent';

  // Added display name
  EnhancedTestComponent.displayName = 'EnhancedTestComponent';

  // Added display name
  EnhancedTestComponent.displayName = 'EnhancedTestComponent';

  // Added display name
  EnhancedTestComponent.displayName = 'EnhancedTestComponent';

  EnhancedTestComponent.displayName = 'EnhancedTestComponent';

  const context = useContext(NotificationContext);
  const {
    showToast,
    addNotification,
    updateNotification,
    removeNotification,
    markAllAsRead,
    clearAllNotifications,
    toggleNotificationCenter,
    updatePreferences,
    notifications,
    toasts,
    preferences,
    notificationCenter,
  } = context;

  return (
    <div>
      {/* State indicators */}
      <div data-testid="notification-count">{notifications.length}</div>
      <div data-testid="toast-count">{toasts.length}</div>
      <div data-testid="unread-count">{notificationCenter.unreadCount}</div>
      <div data-testid="nc-open">{notificationCenter.isOpen.toString()}</div>
      <div data-testid="desktop-notifications">{preferences.desktopNotifications.toString()}</div>
      <div data-testid="email-notifications">{preferences.emailNotifications.toString()}</div>
      <div data-testid="notification-sound">{preferences.notificationSound.toString()}</div>
      
      {/* Actions */}
      <button 
        data-testid="show-toast" 
        onClick={() => {
          const toastData = mockFactory.createToast('info', 'Test toast');
          showToast(toastData.message, toastData.type);
        }}>
        Show Toast
      </button>
      <button 
        data-testid="show-custom-toast" 
        onClick={() => {
          const toastData = mockFactory.createToast('success', 'Custom toast');
          showToast(toastData.message, toastData.type, { duration: 1000, title: 'Custom Title' });
        }}>
        Show Custom Toast
      </button>
      <button
        data-testid="add-notification"
        onClick={() => {
          const notification = mockFactory.createNotifications('info', 1)[0];
          addNotification({
            title: notification.title,
            message: notification.message,
            type: notification.type,
          });
        }}
      >
        Add Notification
      </button>
      <button
        data-testid="add-read-notification"
        onClick={() => {
          const notification = mockFactory.createNotifications('info', 1)[0];
          addNotification({
            title: 'Read notification',
            message: notification.message,
            type: notification.type,
            read: true,
          });
        }}
      >
        Add Read Notification
      </button>
      <button
        data-testid="update-notification"
        onClick={() => {
          if (notifications.length > 0) {
            updateNotification(notifications[0].id, { read: true });
          }
        }}
      >
        Mark First As Read
      </button>
      <button
        data-testid="update-notification-unread"
        onClick={() => {
          if (notifications.length > 0) {
            updateNotification(notifications[0].id, { read: false });
          }
        }}
      >
        Mark First As Unread
      </button>
      <button
        data-testid="remove-notification"
        onClick={() => {
          if (notifications.length > 0) {
            removeNotification(notifications[0].id);
          }
        }}
      >
        Remove First
      </button>
      <button data-testid="mark-all-read" onClick={markAllAsRead}>
        Mark All Read
      </button>
      <button data-testid="clear-all" onClick={clearAllNotifications}>
        Clear All
      </button>
      <button data-testid="toggle-nc" onClick={() => toggleNotificationCenter()}>
        Toggle Notification Center
      </button>
      <button data-testid="open-nc" onClick={() => toggleNotificationCenter(true)}>
        Open Notification Center
      </button>
      <button data-testid="close-nc" onClick={() => toggleNotificationCenter(false)}>
        Close Notification Center
      </button>
      <button 
        data-testid="enable-desktop" 
        onClick={() => updatePreferences({ desktopNotifications: true })}>
        Enable Desktop Notifications
      </button>
      <button 
        data-testid="disable-sound" 
        onClick={() => updatePreferences({ notificationSound: false })}>
        Disable Sound
      </button>
      <button 
        data-testid="update-all-prefs" 
        onClick={() => {
          const prefData = mockFactory.createSettingsContext().preferences;
          updatePreferences({ 
            desktopNotifications: true,
            emailNotifications: true,
            notificationSound: false
          });
        }}>
        Update All Preferences
      </button>
      
      {/* Display contents for debugging */}
      <div data-testid="notifications-json">
        {JSON.stringify(notifications.map(n => ({ id: n.id, title: n.title, read: n.read })))}
      </div>
      <div data-testid="toasts-json">
        {JSON.stringify(toasts.map(t => ({ id: t.id, message: t.message, type: t.type })))}
      </div>
      <div data-testid="all-read">
        {notifications.length > 0 && notifications.every(n => n.read).toString()}
      </div>
    </div>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    // Clear mocks and timeouts between tests
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset Notification mock
    // Set permission to prompt to ensure requestPermission is called
    global.Notification = jest.fn();
    global.Notification.permission = 'prompt';
    global.Notification.requestPermission = jest.fn(() => Promise.resolve('granted'));
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('initializes with the correct default state', () => {
    // Use mock factory to create expected initial state
    const defaultContext = mockFactory.createNotificationContext({
      notifications: [],
      toasts: [],
      preferences: {
        desktopNotifications: false,
        emailNotifications: false,
        notificationSound: true,
      },
      notificationCenter: {
        isOpen: false,
        unreadCount: 0,
      }
    });
    
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );

    // Verify initial state matches expected defaults
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    expect(screen.getByTestId('nc-open')).toHaveTextContent('false');
    expect(screen.getByTestId('desktop-notifications')).toHaveTextContent('false');
    expect(screen.getByTestId('email-notifications')).toHaveTextContent('false');
    expect(screen.getByTestId('notification-sound')).toHaveTextContent('true');
  });

  it('shows and auto-removes toast notifications', () => {
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );

    // Initially no toasts
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');

    // Add a toast using mock factory data
    fireEvent.click(screen.getByTestId('show-toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    
    // Verify toast properties
    const toastsData = JSON.parse(screen.getByTestId('toasts-json').textContent);
    expect(toastsData[0].message).toBe('Test toast');
    expect(toastsData[0].type).toBe('info');

    // Toast should auto-dismiss after default timeout (5000ms)
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });
  
  it('respects custom toast duration', () => {
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );

    // Add a custom toast with 1000ms duration using mock factory data
    fireEvent.click(screen.getByTestId('show-custom-toast'));
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    
    // Toast should not be dismissed after only 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.getByTestId('toast-count')).toHaveTextContent('1');
    
    // Toast should be dismissed after 1000ms
    act(() => {
      jest.advanceTimersByTime(500); // Additional 500ms to make 1000ms total
    });
    expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
  });

  it('adds persistent notifications with unread tracking', () => {
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );

    // Initially no notifications and unread count is 0
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');

    // Add a notification using mock factory data (default is unread)
    fireEvent.click(screen.getByTestId('add-notification'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    
    // Add a notification that's already read
    fireEvent.click(screen.getByTestId('add-read-notification'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
    // Unread count should still be 1
    expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    
    // Verify notification properties
    const notificationsData = JSON.parse(screen.getByTestId('notifications-json').textContent);
    // Most recent notification should be first (index 0)
    expect(notificationsData[0].title).toBe('Read notification');
    expect(notificationsData[0].read).toBe(true);
    expect(notificationsData[1].read).toBe(false);
  });

  it('updates notifications and tracks read status correctly', () => {
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );

    // Add an unread notification using mock factory data
    fireEvent.click(screen.getByTestId('add-notification'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('1');

    // Mark as read
    fireEvent.click(screen.getByTestId('update-notification'));
    
    // Notification count should still be 1, but unread count should be 0
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    
    // Verify read status
    const notificationsData = JSON.parse(screen.getByTestId('notifications-json').textContent);
    expect(notificationsData[0].read).toBe(true);
    
    // Now mark as unread again
    fireEvent.click(screen.getByTestId('update-notification-unread'));
    
    // Unread count should be 1 again
    expect(screen.getByTestId('unread-count')).toHaveTextContent('1');
    
    // Verify read status
    const updatedData = JSON.parse(screen.getByTestId('notifications-json').textContent);
    expect(updatedData[0].read).toBe(false);
  });

  it('removes notifications with correct unread count tracking', () => {
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );

    // Add an unread notification using mock factory data
    fireEvent.click(screen.getByTestId('add-notification'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('1');

    // Remove it
    fireEvent.click(screen.getByTestId('remove-notification'));
    
    // Both counts should be 0
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    
    // Now add a read notification and remove it
    fireEvent.click(screen.getByTestId('add-read-notification'));
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0'); // Already read
    
    fireEvent.click(screen.getByTestId('remove-notification'));
    
    // Both counts should remain 0
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
  });

  it('marks all notifications as read correctly', () => {
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );

    // Add 3 unread notifications using mock factory data
    fireEvent.click(screen.getByTestId('add-notification'));
    fireEvent.click(screen.getByTestId('add-notification'));
    fireEvent.click(screen.getByTestId('add-notification'));
    
    expect(screen.getByTestId('notification-count')).toHaveTextContent('3');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
    expect(screen.getByTestId('all-read')).toHaveTextContent('false');

    // Mark all as read
    fireEvent.click(screen.getByTestId('mark-all-read'));

    // Notification count should still be 3, but unread count should be 0
    expect(screen.getByTestId('notification-count')).toHaveTextContent('3');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    expect(screen.getByTestId('all-read')).toHaveTextContent('true');
    
    // Verify all notifications are read
    const notificationsData = JSON.parse(screen.getByTestId('notifications-json').textContent);
    expect(notificationsData.every(n => n.read)).toBe(true);
  });

  it('clears all notifications correctly', () => {
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );

    // Add multiple notifications using mock factory data
    fireEvent.click(screen.getByTestId('add-notification'));
    fireEvent.click(screen.getByTestId('add-notification'));
    fireEvent.click(screen.getByTestId('add-notification'));
    
    expect(screen.getByTestId('notification-count')).toHaveTextContent('3');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('3');

    // Clear all
    fireEvent.click(screen.getByTestId('clear-all'));
    
    // Both counts should be 0
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
  });
  
  it('toggles notification center visibility', () => {
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );
    
    // Initially closed
    expect(screen.getByTestId('nc-open')).toHaveTextContent('false');
    
    // Open notification center
    fireEvent.click(screen.getByTestId('open-nc'));
    expect(screen.getByTestId('nc-open')).toHaveTextContent('true');
    
    // Close notification center
    fireEvent.click(screen.getByTestId('close-nc'));
    expect(screen.getByTestId('nc-open')).toHaveTextContent('false');
    
    // Toggle notification center
    fireEvent.click(screen.getByTestId('toggle-nc'));
    expect(screen.getByTestId('nc-open')).toHaveTextContent('true');
    
    // Toggle again
    fireEvent.click(screen.getByTestId('toggle-nc'));
    expect(screen.getByTestId('nc-open')).toHaveTextContent('false');
  });
  
  it('updates notification preferences', () => {
    // Use mock factory to create preferences data
    const prefData = mockFactory.createSettingsContext().preferences;
    
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );
    
    // Initial preferences
    expect(screen.getByTestId('desktop-notifications')).toHaveTextContent('false');
    expect(screen.getByTestId('email-notifications')).toHaveTextContent('false');
    expect(screen.getByTestId('notification-sound')).toHaveTextContent('true');
    
    // Update desktop notifications
    fireEvent.click(screen.getByTestId('enable-desktop'));
    expect(screen.getByTestId('desktop-notifications')).toHaveTextContent('true');
    expect(screen.getByTestId('notification-sound')).toHaveTextContent('true'); // Unchanged
    
    // Verify permission was requested
    expect(Notification.requestPermission).toHaveBeenCalled();
    
    // Update notification sound
    fireEvent.click(screen.getByTestId('disable-sound'));
    expect(screen.getByTestId('desktop-notifications')).toHaveTextContent('true'); // Unchanged
    expect(screen.getByTestId('notification-sound')).toHaveTextContent('false');
    
    // Update all preferences
    fireEvent.click(screen.getByTestId('update-all-prefs'));
    expect(screen.getByTestId('desktop-notifications')).toHaveTextContent('true');
    expect(screen.getByTestId('email-notifications')).toHaveTextContent('true');
    expect(screen.getByTestId('notification-sound')).toHaveTextContent('false');
  });
  
  it('shows desktop notifications when enabled', () => {
    // Reset the Notification constructor mock
    global.Notification = jest.fn();
    global.Notification.permission = 'granted';
    global.Notification.requestPermission = jest.fn(() => Promise.resolve('granted'));
    
    render(
      <NotificationProvider>
        <EnhancedTestComponent />
      </NotificationProvider>
    );
    
    // Enable desktop notifications
    fireEvent.click(screen.getByTestId('enable-desktop'));
    
    // Add a notification - this should trigger a desktop notification
    fireEvent.click(screen.getByTestId('add-notification'));
    
    // Verify desktop notification was shown
    expect(global.Notification).toHaveBeenCalledTimes(1);
    expect(global.Notification.mock.calls[0][0]).toBeDefined(); // Title was provided
    expect(global.Notification.mock.calls[0][1]).toHaveProperty('body');
    expect(global.Notification.mock.calls[0][1]).toHaveProperty('icon', '/favicon.ico');
    
    // Add a notification that's already read
    fireEvent.click(screen.getByTestId('add-read-notification'));
    
    // No new desktop notification for read notifications
    expect(global.Notification).toHaveBeenCalledTimes(1);
  });
  
  it('integrates with notificationHelper', () => {
    // Clear previous init calls
    const initHelperMock = require('../../utils/notificationHelper').initNotificationHelper;
    initHelperMock.mockClear();
    
    render(
      <NotificationProvider>
        <div>Test</div>
      </NotificationProvider>
    );
    
    // Verify notification helper was initialized
    expect(initHelperMock).toHaveBeenCalledTimes(1);
    expect(initHelperMock).toHaveBeenCalledWith(expect.objectContaining({
      showToast: expect.any(Function),
      addNotification: expect.any(Function),
      updateNotification: expect.any(Function),
      removeNotification: expect.any(Function),
      markAllAsRead: expect.any(Function),
      clearAllNotifications: expect.any(Function),
    }));
  });
});